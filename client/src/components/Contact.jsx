import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import axios from 'axios'
import { FaXTwitter, FaDribbble, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa6'
import { useSectionData } from '../context/SectionDataContext'
import './Contact.css'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  
  const { data } = useSectionData('contact')
  const emailObj = data?.email || 'hello@rishu.com'
  const text = data?.text || "Have a project in mind? I'd love to hear about it.\nDrop me a message and I'll get back within 24 hours."

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    try {
      await axios.post('http://localhost:5000/api/contact', form)
      setStatus('ok')
      setForm({ name: '', email: '', message: '' })
    } catch { setStatus('error') }
  }

  return (
    <section className="section contact-section" id="contact" ref={ref}>
      <svg className="cloud-deco" width="100" height="60" viewBox="0 0 100 60" fill="none">
        <path d="M10 40 Q20 20 30 40 Q40 60 50 40 Q60 20 70 40 Q80 60 90 40" stroke="#1d1d1d" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round"/>
        <path d="M10 50 Q20 30 30 50 Q40 70 50 50 Q60 30 70 50" stroke="#1d1d1d" strokeWidth="2" fill="none" opacity="0.12" strokeLinecap="round"/>
      </svg>

      <div className="container">
        <motion.div
          className="contact-box"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="contact-mail-icon">✉</div>

          <div className="contact-left">
            <div className="section-tag">✳ CONTACT</div>
            <h2 className="section-title contact-title">
              Let's work<br /><span className="underline-wave">together</span>
            </h2>
            <p className="contact-sub">
              {text.split('\n').map((line, i) => <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>)}
            </p>
            <div className="contact-socials">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
              <a href="https://dribbble.com" target="_blank" rel="noreferrer" aria-label="Dribbble"><FaDribbble /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field-line">
              <input id="name" name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field-line">
              <input id="email" name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field-line">
              <textarea id="message" name="message" placeholder="Your Message" rows={4} value={form.message} onChange={handleChange} required />
            </div>
            <button type="submit" className="contact-submit-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message →'}
            </button>
            {status === 'ok' && <p className="feedback-ok">✅ Message sent! I'll reply shortly.</p>}
            {status === 'error' && <p className="feedback-err">⚠️ Error sending. Please email directly to {emailObj}.</p>}
          </form>
        </motion.div>
      </div>
    </section>
  )
}
