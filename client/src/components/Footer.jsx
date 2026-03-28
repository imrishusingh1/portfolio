import { FaXTwitter, FaFacebookF, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa6'
import { Link } from 'react-scroll'
import './Footer.css'

const navLinks = ['Home', 'Services', 'About', 'Portfolio', 'Achievements', 'Blog', 'Pricing', 'Contact']

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
            <a href="https://github.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://www.linkedin.com/in/imrishusingh1/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://x.com/imrishurajput1" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
            <a href="https://facebook.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://instagram.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
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
