import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-scroll'
import { useSectionData } from '../context/SectionDataContext'
import './Services.css'

const flowDefs = (
  <defs>
    <linearGradient id="flowGrad" x1="0%" y1="0%" x2="200%" y2="0%">
      <stop offset="0%" stopColor="#00b8ff" />
      <stop offset="25%" stopColor="#1dc2a4" />
      <stop offset="50%" stopColor="#00b8ff" />
      <stop offset="75%" stopColor="#1dc2a4" />
      <stop offset="100%" stopColor="#00b8ff" />
      <animate attributeName="x1" from="0%" to="-200%" dur="3s" repeatCount="indefinite" />
      <animate attributeName="x2" from="200%" to="0%" dur="3s" repeatCount="indefinite" />
    </linearGradient>
  </defs>
)

const defaultIcons = [
  <svg key="0" width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="25" y="32" width="50" height="35" rx="4" fill="#fff" />
    <path d="M40 67 L35 82 M60 67 L65 82 M25 82 L75 82" stroke="currentColor" />
    <rect x="35" y="12" width="30" height="20" rx="3" fill="#fff" />
    <g className="frame-1">
      <text x="50" y="26" fontSize="12" textAnchor="middle" stroke="none" fill="#00b8ff" fontWeight="bold" letterSpacing="1">XXX</text>
      <path d="M38 45 Q42 50 46 45" stroke="#00b8ff" />
      <path d="M54 45 Q58 50 62 45" stroke="#00b8ff" />
      <path d="M45 55 Q50 62 55 55" stroke="#00b8ff" />
    </g>
    <g className="frame-2">
      <text x="50" y="27" fontSize="13" textAnchor="middle" stroke="none" fill="#00b8ff" fontWeight="bold" letterSpacing="1">404</text>
      <path d="M40 43 L44 47 M44 43 L40 47" stroke="#00b8ff" />
      <path d="M56 43 L60 47 M60 43 L56 47" stroke="#00b8ff" />
      <path d="M45 58 Q50 52 55 58" stroke="#00b8ff" />
    </g>
  </svg>,
  <svg key="1" width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M25 55 Q20 55 20 43 Q20 33 30 33 Q35 15 50 15 Q65 15 70 33 Q80 33 80 43 Q80 55 75 55 Z" fill="#fff" />
    <text x="50" y="45" fontSize="22" textAnchor="middle" stroke="none" fill="#00b8ff" fontWeight="900" fontFamily="sans-serif">API</text>
    <g className="frame-1">
      <path d="M35 55 L35 70" stroke="#00b8ff" strokeDasharray="4 4" className="flow-down" />
      <path d="M50 55 L50 80" stroke="#00b8ff" strokeDasharray="4 4" className="flow-down" />
      <path d="M65 55 L65 65" stroke="#00b8ff" strokeDasharray="4 4" className="flow-down" />
      <path d="M25 55 L15 65" stroke="#00b8ff" strokeDasharray="3 3" />
      <path d="M75 55 L85 65" stroke="#00b8ff" strokeDasharray="3 3" />
    </g>
    <g className="frame-2">
      <path d="M35 55 L35 73" />
      <circle cx="35" cy="77" r="4" fill="#00b8ff" stroke="none" />
      <path d="M50 55 L50 83" />
      <circle cx="50" cy="87" r="4" fill="#00b8ff" stroke="none" />
      <path d="M65 55 L65 68" />
      <circle cx="65" cy="72" r="4" fill="#00b8ff" stroke="none" />
      <path d="M25 55 L20 65" />
      <circle cx="17" cy="68" r="3" fill="#00b8ff" stroke="none" />
      <path d="M75 55 L80 65" />
      <circle cx="83" cy="68" r="3" fill="#00b8ff" stroke="none" />
    </g>
  </svg>,
  <svg key="2" width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <g className="frame-1" style={{ transform: 'translate(0, 10px)' }}>
      <path d="M25 35 L50 20 L75 35 L50 50 Z" fill="#fff" />
      <path d="M25 45 L50 60 L75 45" stroke="#00b8ff" strokeWidth="4" />
      <path d="M25 55 L50 70 L75 55" stroke="#00b8ff" strokeWidth="4" />
      <path d="M25 65 L50 80 L75 65" stroke="#00b8ff" strokeWidth="4" />
    </g>
    <g className="frame-2">
      <path d="M50 20 L80 35 L80 70 L50 85 L20 70 L20 35 Z" fill="#fff" />
      <path d="M20 35 L50 50 L80 35" />
      <path d="M50 50 L50 85" />
      <path d="M50 60 L80 45" stroke="#00b8ff" strokeWidth="4" />
      <path d="M50 70 L80 55" stroke="#00b8ff" strokeWidth="4" />
      <path d="M50 80 L80 65" stroke="#00b8ff" strokeWidth="4" />
    </g>
  </svg>,
]

const fallbackServices = [
  { title: 'Distributed Systems & Scalability', desc: 'Scalable architectures handling concurrent connections. Optimized system availability using microservices and event-driven patterns.', bg: '#ffffff' },
  { title: 'AWS Infrastructure & Automation', desc: 'Architected AWS-based server infrastructure using EC2 and S3, leveraging Elastic Load Balancers and Target Groups.', bg: '#ffffff' },
  { title: 'High-Performance REST APIs', desc: 'Robust Node.js server-side logic and optimized MongoDB schemas, reducing data retrieval latency by 35% across production apps.', bg: '#ffffff' },
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
              <div className="service-text">
                <h3 className="service-title">{title}</h3>
                <p className="service-desc">{desc}</p>
              </div>
              <div className="service-icon-wrap">{defaultIcons[i % defaultIcons.length]}</div>
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
