import { useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''

const SOCIAL_LABELS = new Set(['github', 'linkedin', 'x', 'twitter', 'facebook', 'instagram'])

/**
 * Tracks:
 *  - Time spent per section (IntersectionObserver)
 *  - Navbar + Footer nav link clicks (text links)
 *  - Social media icon clicks from Navbar AND Footer (via aria-label)
 * Sends data ONCE via sendBeacon when the tab goes hidden.
 */
export default function useSessionTracker() {
  const sectionRef     = useRef({})
  const navClicksRef   = useRef([])
  const socialClicksRef = useRef([])
  const sessionStart   = useRef(Date.now())
  const flushed        = useRef(false)

  useEffect(() => {
    // ── 1. IntersectionObserver — time per section ────────────────────
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

    // ── 2. Click tracker — nav links + social icons (whole document) ──
    function handleClick(e) {
      const anchor = e.target.closest('a')
      if (!anchor) return

      const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })

      // Social media icons — detected by aria-label on the <a> tag
      const label = anchor.getAttribute('aria-label')
      if (label && SOCIAL_LABELS.has(label.toLowerCase())) {
        const source = anchor.closest('footer') ? 'Footer' : 'Navbar'
        socialClicksRef.current.push(`${label} (${source}) @ ${time}`)
        return
      }

      // Nav / footer text links — only short text labels, not email/logo etc.
      const text = anchor.textContent?.trim()
      if (text && text.length < 25 && !text.includes('@') && !anchor.href?.includes('mailto')) {
        const source = anchor.closest('footer') ? 'Footer' : 'Navbar'
        navClicksRef.current.push(`${text} (${source}) @ ${time}`)
      }
    }

    document.addEventListener('click', handleClick)

    // ── 3. Flush ONCE when tab goes hidden ────────────────────────────
    function flushSession() {
      if (flushed.current) return
      if (document.visibilityState !== 'hidden') return
      flushed.current = true

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

      if (sections.length === 0 && navClicksRef.current.length === 0 && socialClicksRef.current.length === 0) return

      const payload = JSON.stringify({
        sections,
        navClicks: navClicksRef.current,
        socialClicks: socialClicksRef.current,
        totalSeconds: Math.round((Date.now() - sessionStart.current) / 1000),
        referrer: document.referrer || '',
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API}/api/track-session`, new Blob([payload], { type: 'application/json' }))
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
      document.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', flushSession)
    }
  }, [])
}
