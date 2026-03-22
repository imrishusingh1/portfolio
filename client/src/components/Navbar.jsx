import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { FiX, FiMenu } from 'react-icons/fi'
import { FaXTwitter, FaDribbble, FaInstagram } from 'react-icons/fa6'
import './Navbar.css'

const navLinks = ['Home', 'Services', 'About', 'Portfolio', 'Process', 'Pricing', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className="header-wrapper">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner container">
          <a href="#" className="nav-logo">Rishu Singh</a>

          <ul className={`nav-links ${open ? 'open' : ''}`}>
            {navLinks.map((link) => (
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
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X">
            <FaXTwitter />
          </a>
          <a href="https://dribbble.com" target="_blank" rel="noreferrer" aria-label="Dribbble">
            <FaDribbble />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
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
