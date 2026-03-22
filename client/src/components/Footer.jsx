import { FaXTwitter, FaDribbble, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa6'
import { Link } from 'react-scroll'
import './Footer.css'

const navLinks = ['Home', 'Services', 'About', 'Portfolio', 'Process', 'Pricing', 'Contact']

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-top">
          <a href="#" className="footer-logo">Rishu Singh</a>
          <nav className="footer-nav">
            {navLinks.map(link => (
              <Link key={link} to={link.toLowerCase()} smooth offset={-80} duration={600} className="footer-link">
                {link}
              </Link>
            ))}
          </nav>
          <div className="footer-socials">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
            <a href="https://dribbble.com" target="_blank" rel="noreferrer" aria-label="Dribbble"><FaDribbble /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Rishu Singh. All rights reserved.</span>
          <a href="mailto:hello@rishusingh.com" className="footer-email">hello@rishusingh.com</a>
        </div>
      </div>
    </footer>
  )
}
