import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-scroll'
import { useSectionData } from '../context/SectionDataContext'
import './Services.css'

const defaultIcons = [
  <svg key="0" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="15" height="15" rx="2"/><rect x="27" y="6" width="15" height="15" rx="2"/><rect x="6" y="27" width="15" height="15" rx="2"/><rect x="27" y="27" width="15" height="15" rx="2"/></svg>,
  <svg key="1" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="18" r="10"/><circle cx="24" cy="18" r="5"/><path d="M14 40 Q24 30 34 40"/><circle cx="24" cy="18" r="1.5" fill="currentColor"/></svg>,
  <svg key="2" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="40" height="28" rx="3"/><path d="M16 38 l-4 6 M32 38 l4 6 M12 44 h24"/><path d="M4 16 h40"/><circle cx="9" cy="13" r="1.2" fill="currentColor"/><circle cx="13" cy="13" r="1.2" fill="currentColor"/></svg>,
  <svg key="3" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="10" r="5"/><circle cx="10" cy="36" r="5"/><circle cx="38" cy="36" r="5"/><line x1="24" y1="15" x2="10" y2="31"/><line x1="24" y1="15" x2="38" y2="31"/><line x1="15" y1="36" x2="33" y2="36"/></svg>,
]

const fallbackServices = [
  { title: 'Strategy & Planning', desc: 'Streamline your campaigns with tools that improve engagement.', bg: 'var(--lavender-bg)' },
  { title: 'User Research', desc: 'Simplify project workflows with organized tools and strategies.', bg: 'var(--green-pastel)' },
  { title: 'Web Design', desc: 'Gain valuable insights into user behavior and website performance.', bg: 'var(--pink-pastel)' },
  { title: 'Brand Design', desc: 'Understand your market with precise data analysis.', bg: 'var(--blue-pastel)' },
]

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('services')
  const services = data?.items || fallbackServices

  return (
    <section className="section services-section" id="services" ref={ref}>
      <span className="lightning-deco">⚡</span>
      <span className="sparkle-deco s1">✦</span>
      <span className="sparkle-deco s2">✦</span>

      <div className="container">
        <div className="section-tag services-tag">✳ MY SERVICES</div>
        <h2 className="section-title-center">
          The service I offer is specifically<br />designed to meet your needs.
        </h2>

        <div className="services-grid">
          {services.map(({ title, desc, bg }, i) => (
            <motion.div
              key={title + i}
              className="service-card"
              style={{ background: bg }}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
            >
              <div className="service-icon-wrap">{defaultIcons[i % defaultIcons.length]}</div>
              <div className="service-text">
                <h3 className="service-title">{title}</h3>
                <p className="service-desc">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="services-cta">
          <Link to="portfolio" smooth offset={-80} duration={600}>
            <button className="btn btn-outline">Check Portfolio</button>
          </Link>
        </div>
      </div>
    </section>
  )
}
