import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SectionDataProvider, useSectionData } from './context/SectionDataContext'
import './index.css'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Testimonials from './components/Testimonials'
import Certifications from './components/Certifications'
import Education from './components/Education'
import Achievements from './components/Achievements'
import OpenSource from './components/OpenSource'
import Process from './components/Process'
import Blog from './components/Blog'
import Research from './components/Research'
import Pricing from './components/Pricing'
import Contact from './components/Contact'
import Footer from './components/Footer'

import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import useSessionTracker from './hooks/useSessionTracker'

// ── Visitor tracking ──────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || ''

function useVisitorTracking() {
  useEffect(() => {
    // Only track once per browser session
    if (sessionStorage.getItem('_tracked')) return
    sessionStorage.setItem('_tracked', '1')
    fetch(`${API}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: document.referrer || '',
        page: window.location.pathname,
      }),
    }).catch(() => {}) // silent fail — never block the UI
  }, [])
}

/* Wrapper that hides a section when it's disabled in the admin panel */
function Section({ sectionKey, children }) {
  const { enabled } = useSectionData(sectionKey)
  if (!enabled) return null
  return children
}

function PublicSite() {
  useSessionTracker()
  return (
    <SectionDataProvider>
      <Navbar />
      <main>
        <Section sectionKey="hero"><Hero /></Section>
        <Section sectionKey="services"><Services /></Section>
        <About />
        <Section sectionKey="about"><Testimonials /></Section>
        <Section sectionKey="portfolio"><Portfolio /></Section>
        <Section sectionKey="certifications"><Certifications /></Section>
        <Section sectionKey="achievements"><Achievements /></Section>
        <Section sectionKey="opensource"><OpenSource /></Section>
        <Section sectionKey="process"><Process /></Section>
        <Section sectionKey="blog"><Blog /></Section>
        <Section sectionKey="research"><Research /></Section>
        <Section sectionKey="education"><Education /></Section>
        <Section sectionKey="pricing"><Pricing /></Section>
        <Section sectionKey="contact"><Contact /></Section>
      </main>
      <Footer />
    </SectionDataProvider>
  )
}

function App() {
  useVisitorTracking()
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<PublicSite />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
