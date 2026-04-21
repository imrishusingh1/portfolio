import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-scroll'
import { FiX, FiMenu } from 'react-icons/fi'
import { FaXTwitter, FaFacebookF, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa6'
import { SectionDataCtx } from '../context/SectionDataContext'
import './Navbar.css'

const navLinks = ['Home', 'Services', 'About', 'Portfolio', 'Achievements', 'Education', 'Blog', 'Pricing', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { sections } = useContext(SectionDataCtx)
  const API = import.meta.env.VITE_API_URL || ''

  const navbarSettings = sections?.navbar || { useImage: true, logoImage: '', logoText: 'Rishu Singh' }
  const { useImage, logoImage, logoText } = navbarSettings

  const keyMap = {
    Home: 'hero',
    Services: 'services',
    About: 'experiences', // About and Experience are combined in About.jsx, we check experiences or about
    Portfolio: 'portfolio',
    Achievements: 'achievements',
    Education: 'education',
    Blog: 'blog',
    Pricing: 'pricing',
    Contact: 'contact'
  }

  const visibleLinks = navLinks.filter(link => {
    if (!sections) return true
    // the About section file contains both About and Experience blocks. 
    // We can show the link if EITHER about or experiences is enabled.
    if (link === 'About') return ('about' in sections || 'experiences' in sections)
    return keyMap[link] in sections
  })

  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 10)
      if (open) setOpen(false) // Auto-close menu when user scrolls
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [open])

  return (
    <header className="header-wrapper">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner container">
          {useImage && logoImage && !logoError ? (
            <a href="#" className="nav-logo" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={`${API}${logoImage}`}
                alt={logoText}
                onError={() => setLogoError(true)}
                onLoad={(e) => {
                  const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
                  link.type = 'image/png'
                  link.rel = 'icon'
                  link.href = e.target.src
                  document.head.appendChild(link)
                }}
                style={{ maxHeight: 48, objectFit: 'contain' }}
              />
            </a>
          ) : (
            <a href="#" className="nav-logo">{logoText}</a>
          )}

          <ul className={`nav-links ${open ? 'open' : ''}`}>
            {visibleLinks.map((link) => (
              <li key={link}>
                <Link
                  to={link.toLowerCase()}
                  smooth duration={600}
                  offset={-80}
                  spy
                  activeClass="active-link"
                  onClick={() => setOpen(false)}
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-socials">
            <a href="https://github.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://www.linkedin.com/in/imrishusingh1/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://x.com/imrishurajput1" target="_blank" rel="noreferrer" aria-label="X">
              <FaXTwitter />
            </a>
            <a href="https://www.facebook.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>

          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>
    </header>
  )
}
