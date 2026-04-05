import { useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''

const SOCIAL_LABELS = new Set(['github', 'linkedin', 'x', 'twitter', 'facebook', 'instagram'])

/** Find the meaningful source label (which section/area the click came from) */
function getSource(el) {
  if (el.closest('header') || el.closest('.navbar')) return 'Navbar'
  if (el.closest('footer')) return 'Footer'
  const section = el.closest('section[id]')
  if (section) {
    const id = section.id
    return id.charAt(0).toUpperCase() + id.slice(1)
  }
  return 'Page'
}

/** Classify the click and return a structured record, or null to ignore */
function classifyClick(el, time) {
  const source = getSource(el)

  // ── Anchor tags ──────────────────────────────────────────────────
  const anchor = el.closest('a')
  if (anchor) {
    const label = anchor.getAttribute('aria-label')
    const href  = anchor.getAttribute('href') || ''
    const text  = anchor.textContent?.trim()

    // Social icon (has aria-label matching a platform)
    if (label && SOCIAL_LABELS.has(label.toLowerCase())) {
      return { type: 'social', label: `${label} (${source})`, time }
    }

    // Email link
    if (href.startsWith('mailto:')) {
      return { type: 'email', label: `Email: ${href.replace('mailto:', '')} (${source})`, time }
    }

    // External link
    if (href.startsWith('http') && !href.includes('rishurajput.com')) {
      const display = text?.slice(0, 40) || label || href.split('/')[2] || 'External link'
      return { type: 'link', label: `↗ ${display} (${source})`, time }
    }

    // Internal nav / scroll link
    if (text && text.length < 30 && !text.includes('@')) {
      return { type: 'nav', label: `${text} (${source})`, time }
    }

    return null
  }

  // ── Buttons ───────────────────────────────────────────────────────
  const button = el.closest('button, [role="button"]')
  if (button) {
    const text  = button.textContent?.trim().slice(0, 50)
    const label = button.getAttribute('aria-label')
    const display = text || label || 'Button'
    // Skip hamburger / toggle / close buttons with icon-only content
    if (display.length < 2) return null
    return { type: 'button', label: `${display} (${source})`, time }
  }

  return null
}

/**
 * Universal click + section-time tracker.
 * Tracks: nav links, social icons, CTA buttons, external links, emails — from anywhere on the page.
 * Sends data ONCE via sendBeacon when the tab goes hidden.
 */
export default function useSessionTracker() {
  const sectionRef  = useRef({})
  const clicksRef   = useRef([])
  const sessionStart = useRef(Date.now())
  const flushed     = useRef(false)

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

    // ── 2. Universal click tracker ────────────────────────────────────
    function handleClick(e) {
      const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
      const record = classifyClick(e.target, time)
      if (record) clicksRef.current.push(record)
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

      if (sections.length === 0 && clicksRef.current.length === 0) return

      const payload = JSON.stringify({
        sections,
        clicks: clicksRef.current,
        // keep legacy fields empty (old sessions still show their data from DB)
        navClicks: [],
        socialClicks: [],
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
