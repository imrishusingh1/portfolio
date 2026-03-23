import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-scroll'
import { useSectionData } from '../context/SectionDataContext'
import cloudGif from '../assets/cloud.gif'
import nodeGif from '../assets/node.gif'
import sysGif from '../assets/sys.gif'
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

const defaultIcons = [nodeGif, cloudGif, sysGif]

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
              <div className="service-icon-wrap">
                <img
                  src={defaultIcons[i % defaultIcons.length]}
                  alt={`${title} icon`}
                  className="service-icon-gif"
                />
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
