import { useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''

/**
 * Tracks which sections the visitor viewed and for how long (via IntersectionObserver),
 * plus which navbar links they clicked.
 * Sends the session data to /api/track-session on page hide/unload using sendBeacon.
 */
export default function useSessionTracker() {
  // section name → { enterTime: Date.now(), totalMs: number }
  const sectionRef    = useRef({})
  // list of navbar link names clicked in order
  const navClicksRef  = useRef([])
  // session start timestamp
  const sessionStart  = useRef(Date.now())

  useEffect(() => {
    // ── 1. IntersectionObserver for all sections ──────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id
          if (!id) return

          if (entry.isIntersecting) {
            // Section entered viewport — record enter time
            if (!sectionRef.current[id]) {
              sectionRef.current[id] = { totalMs: 0 }
            }
            sectionRef.current[id].enterTime = Date.now()
          } else {
            // Section left viewport — accumulate time
            const data = sectionRef.current[id]
            if (data && data.enterTime) {
              data.totalMs += Date.now() - data.enterTime
              delete data.enterTime
            }
          }
        })
      },
      { threshold: 0.2 } // section counts as "viewed" when 20% visible
    )

    // Observe all sections with an id attribute
    const sections = document.querySelectorAll('section[id]')
    sections.forEach((el) => observer.observe(el))

    // ── 2. Navbar click tracking ──────────────────────────────────────────
    // react-scroll fires a custom scroll-to event we can intercept via click
    function handleNavClick(e) {
      const link = e.target.closest('a, button, li')
      if (!link) return
      const text = link.textContent?.trim()
      if (text && text.length < 30) {
        navClicksRef.current.push(`${text} @ ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`)
      }
    }

    // Listen on the nav element for clicks
    const nav = document.querySelector('nav')
    if (nav) nav.addEventListener('click', handleNavClick)

    // ── 3. Send beacon on page hide / tab switch / unload ─────────────────
    function flushSession() {
      // Accrue time for any still-visible sections
      const now = Date.now()
      Object.entries(sectionRef.current).forEach(([id, data]) => {
        if (data.enterTime) {
          data.totalMs += now - data.enterTime
          data.enterTime = now // reset for potential future tracking
        }
      })

      const sections = Object.entries(sectionRef.current)
        .filter(([, d]) => d.totalMs > 500) // ignore < 0.5s blips
        .map(([name, d]) => ({ name, seconds: Math.round(d.totalMs / 1000) }))
        .sort((a, b) => b.seconds - a.seconds)

      if (sections.length === 0 && navClicksRef.current.length === 0) return

      const payload = JSON.stringify({
        sections,
        navClicks: navClicksRef.current,
        totalSeconds: Math.round((Date.now() - sessionStart.current) / 1000),
        referrer: document.referrer || '',
      })

      // sendBeacon works even during page unload
      navigator.sendBeacon
        ? navigator.sendBeacon(`${API}/api/track-session`, new Blob([payload], { type: 'application/json' }))
        : fetch(`${API}/api/track-session`, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
    }

    document.addEventListener('visibilitychange', flushSession)
    window.addEventListener('beforeunload', flushSession)

    return () => {
      observer.disconnect()
      if (nav) nav.removeEventListener('click', handleNavClick)
      document.removeEventListener('visibilitychange', flushSession)
      window.removeEventListener('beforeunload', flushSession)
    }
  }, [])
}
