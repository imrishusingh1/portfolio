import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-scroll'
import { useSectionData, useAPI } from '../context/SectionDataContext'
import './Services.css'

const webDevGif = 'https://media.tenor.com/jdSFsfznMaIAAAAC/services-webdevelopment.gif';
const backendGif = 'https://media.tenor.com/e2VK6sB1TX0AAAAC/online-server.gif';
const archGif = 'https://media.tenor.com/MmfoddcK1QAAAAAC/ace-data-cloud.gif';

const defaultIcons = [webDevGif, backendGif, archGif]

const fallbackServices = [
  { title: 'Distributed Systems & Scalability', desc: 'Scalable architectures handling concurrent connections. Optimized system availability using microservices and event-driven patterns.', bg: '#ffffff' },
  { title: 'AWS Infrastructure & Automation', desc: 'Architected AWS-based server infrastructure using EC2 and S3, leveraging Elastic Load Balancers and Target Groups.', bg: '#ffffff' },
  { title: 'High-Performance REST APIs', desc: 'Robust Node.js server-side logic and optimized MongoDB schemas, reducing data retrieval latency by 35% across production apps.', bg: '#ffffff' },
]

function pickDefaultIcon(title = '') {
  const t = String(title).toLowerCase()
  if (t.includes('aws') || t.includes('cloud') || t.includes('devops') || t.includes('infra')) return archGif
  if (t.includes('api') || t.includes('backend') || t.includes('node') || t.includes('server')) return backendGif
  if (t.includes('system') || t.includes('scal') || t.includes('arch')) return archGif
  return webDevGif
}

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('services')
  const services = data?.items || fallbackServices
  const API = useAPI()
  const heading =
    data?.heading ||
    'The service I offer is specifically\ndesigned to meet your needs.'

  return (
    <section className="section services-section" id="services" ref={ref}>
      <span className="lightning-deco">⚡</span>
      <span className="sparkle-deco s1">✦</span>
      <span className="sparkle-deco s2">✦</span>

      <div className="container">
        <div className="section-tag services-tag">✳ MY SERVICES</div>
        <h2 className="section-title-center">
          {heading.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < heading.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h2>

        <div className="services-grid">
          {services.map(({ title, desc, bg, img }, i) => {
            const iconSrc = img
              ? (img.startsWith('http') ? img : `${API}${img}`)
              : pickDefaultIcon(title)

            return (
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
                  src={iconSrc}
                  alt={`${title} icon`}
                  className="service-icon-gif"
                />
              </div>
            </motion.div>
            )
          })}
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
