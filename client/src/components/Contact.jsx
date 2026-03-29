import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import axios from 'axios'
import { FaXTwitter, FaInstagram, FaGithub, FaLinkedin, FaFacebookF } from 'react-icons/fa6'
import { useSectionData } from '../context/SectionDataContext'
import './Contact.css'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [animStage, setAnimStage] = useState('idle')

  const { data } = useSectionData('contact')
  const emailObj = data?.email || 'hello@rishu.com'
  const text = data?.text || "Have a project in mind? I'd love to hear about it.\nDrop me a message and I'll get back within 24 hours."

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    try {
      const API = import.meta.env.VITE_API_URL || ''
      await axios.post(`${API}/api/contact`, form)
      setStatus('animating')
      setAnimStage('folding')
      setTimeout(() => setAnimStage('closing'), 1200)
      setTimeout(() => setAnimStage('eagle'), 2000)
      setTimeout(() => setAnimStage('away'), 3000)
      setTimeout(() => {
        setAnimStage('done')
        setForm({ name: '', email: '', message: '' })
      }, 4200)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section contact-section" id="contact" ref={ref}>
      <svg className="cloud-deco" width="100" height="60" viewBox="0 0 100 60" fill="none">
        <path d="M10 40 Q20 20 30 40 Q40 60 50 40 Q60 20 70 40 Q80 60 90 40" stroke="#1d1d1d" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />
        <path d="M10 50 Q20 30 30 50 Q40 70 50 50 Q60 30 70 50" stroke="#1d1d1d" strokeWidth="2" fill="none" opacity="0.12" strokeLinecap="round" />
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
              <a href="https://github.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a>
              <a href="https://www.linkedin.com/in/imrishusingh1/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://x.com/imrishurajput1" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
              <a href="https://www.facebook.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://instagram.com/imrishusingh1" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          <div className="contact-form-container" style={{ position: 'relative', width: '100%', minHeight: '380px' }}>
            {status !== 'animating' && animStage !== 'done' && (
              <form className="contact-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                <div className="field-line">
                  <input id="name" name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="field-line">
                  <input id="email" name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
                </div>
                <div className="field-line" style={{ flexGrow: 1 }}>
                  <textarea id="message" name="message" placeholder="Your Message" rows={4} value={form.message} onChange={handleChange} required style={{ height: '100%' }} />
                </div>
                {status === 'error' && <p style={{ color: 'red', fontSize: '14px' }}>Something went wrong. Please try again.</p>}
                <button type="submit" className="contact-submit-btn" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            )}

            {status === 'animating' && animStage !== 'done' && (
              <div className="anim-scene" style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                {/* Floating Note */}
                <motion.div
                  initial={{ y: -60, opacity: 0, scale: 0.8 }}
                  animate={animStage === 'folding' ? { y: 20, opacity: 0, scale: 0.2 } : { opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ position: 'absolute', zIndex: 15, background: '#fff', border: '1px solid #ddd', padding: '12px 24px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>From: {form.email || 'Anonymous'}</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{form.name || 'Message Payload'}</div>
                </motion.div>

                {/* Envelope */}
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={
                    animStage === 'folding' || animStage === 'closing' ? { y: 20, opacity: 1 } :
                      animStage === 'eagle' ? { y: 20, opacity: 1 } :
                        animStage === 'away' ? { y: -260, x: -420, opacity: 1 } : {}
                  }
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', zIndex: 10 }}
                >
                  <div style={{ position: 'relative', width: 120, height: 80 }}>
                    <svg width="120" height="80" style={{ position: 'absolute', inset: 0 }}>
                      <rect x="0" y="0" width="120" height="80" fill="#fff" stroke="#111" strokeWidth="2" rx="4" />
                      <polygon points="0,0 60,40 0,80" fill="#fcfaf8" stroke="#111" strokeWidth="2" />
                      <polygon points="120,0 60,40 120,80" fill="#fcfaf8" stroke="#111" strokeWidth="2" />
                      <polygon points="0,80 60,40 120,80" fill="#f7f3ee" stroke="#111" strokeWidth="2" />
                    </svg>

                    <motion.div
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '40px',
                        transformOrigin: 'top', zIndex: 5
                      }}
                      initial={{ rotateX: 180 }}
                      animate={animStage === 'closing' || animStage === 'eagle' || animStage === 'away' ? { rotateX: 0 } : { rotateX: 180 }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg width="120" height="40">
                        <polygon points="0,0 60,40 120,0" fill="#e4d5ff" stroke="#111" strokeWidth="2" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Eagle */}
                <motion.div
                  initial={{ x: 400, y: -200 }}
                  animate={
                    animStage === 'eagle' ? { x: 20, y: -30 } :
                      animStage === 'away' ? { x: -400, y: -310 } :
                        { x: 400, y: -200 }
                  }
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', zIndex: 20, fontSize: '80px' }}
                >
                  🦅
                </motion.div>

              </div>
            )}

            {animStage === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <motion.svg width="64" height="64" viewBox="0 0 52 52" style={{ marginBottom: '16px' }}>
                  <motion.circle
                    cx="26" cy="26" r="25" fill="#22c55e"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  />
                  <motion.path
                    d="M16 26l7 7 15-15" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  />
                </motion.svg>
                <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-head)', marginBottom: '8px' }}>Dispatched!</h3>
                <p style={{ color: '#555', fontSize: '15px' }}>Your message is flying its way to me via Eagle.</p>
                <button
                  onClick={() => { setStatus(null); setAnimStage('idle'); }}
                  className="contact-submit-btn"
                  style={{ marginTop: '24px', width: 'auto', padding: '12px 32px' }}
                >
                  Send Another
                </button>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </section>
  )
}
