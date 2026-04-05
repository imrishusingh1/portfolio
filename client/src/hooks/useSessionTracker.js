import { useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''

/**
 * Tracks which sections the visitor viewed and for how long (IntersectionObserver),
 * plus which navbar links they clicked.
 * Sends data ONCE via sendBeacon when the tab goes hidden — prevents duplicate sessions.
 */
export default function useSessionTracker() {
  const sectionRef   = useRef({})
  const navClicksRef = useRef([])
  const sessionStart = useRef(Date.now())
  const flushed      = useRef(false)  // prevents double-fire

  useEffect(() => {
    // ── 1. IntersectionObserver — track time per section ─────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id
          if (!id) return
          if (entry.isIntersecting) {
            if (!sectionRef.current[id]) sectionRef.current[id] = { totalMs: 0 }
            sectionRef.current[id].enterTime = Date.now()
          } else {
            const data = sectionRef.current[id]
            if (data?.enterTime) {
              data.totalMs += Date.now() - data.enterTime
              delete data.enterTime
            }
          }
        })
      },
      { threshold: 0.2 }
    )
    document.querySelectorAll('section[id]').forEach((el) => observer.observe(el))

    // ── 2. Navbar click tracking ──────────────────────────────────────
    function handleNavClick(e) {
      const link = e.target.closest('a, button, li')
      if (!link) return
      const text = link.textContent?.trim()
      if (text && text.length < 30) {
        navClicksRef.current.push(
          `${text} @ ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`
        )
      }
    }
    const nav = document.querySelector('nav')
    if (nav) nav.addEventListener('click', handleNavClick)

    // ── 3. Flush ONCE when tab goes hidden (close / switch / navigate) ─
    function flushSession() {
      if (flushed.current) return                        // already sent
      if (document.visibilityState !== 'hidden') return  // not leaving yet
      flushed.current = true

      // Accrue time for any sections still visible
      const now = Date.now()
      Object.values(sectionRef.current).forEach((data) => {
        if (data.enterTime) {
          data.totalMs += now - data.enterTime
          delete data.enterTime
        }
      })

      const sections = Object.entries(sectionRef.current)
        .filter(([, d]) => d.totalMs > 500)
        .map(([name, d]) => ({ name, seconds: Math.round(d.totalMs / 1000) }))
        .sort((a, b) => b.seconds - a.seconds)

      if (sections.length === 0 && navClicksRef.current.length === 0) return

      const payload = JSON.stringify({
        sections,
        navClicks: navClicksRef.current,
        totalSeconds: Math.round((Date.now() - sessionStart.current) / 1000),
        referrer: document.referrer || '',
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API}/api/track-session`,
          new Blob([payload], { type: 'application/json' })
        )
      } else {
        fetch(`${API}/api/track-session`, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', flushSession)

    return () => {
      observer.disconnect()
      if (nav) nav.removeEventListener('click', handleNavClick)
      document.removeEventListener('visibilitychange', flushSession)
    }
  }, [])
}
