import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSectionData } from '../context/SectionDataContext'
import './Certifications.css'

const fallback = [
  { title: 'Full Stack Web Development', issuer: 'Udemy', date: '2024', badge: '🎓', bg: '#f0ffdb' },
  { title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', badge: '☁️', bg: '#ffe3f5' },
  { title: 'React – The Complete Guide', issuer: 'Coursera', date: '2023', badge: '⚛️', bg: '#ffebe3' },
  { title: 'Data Structures & Algorithms', issuer: 'GeeksforGeeks', date: '2023', badge: '🧮', bg: '#e0f0ff' },
  { title: 'MongoDB for Developers', issuer: 'MongoDB University', date: '2023', badge: '🍃', bg: '#f0ffdb' },
  { title: 'System Design Fundamentals', issuer: 'Educative', date: '2022', badge: '🏗️', bg: '#ffe3f5' },
]

export default function Certifications() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('certifications')
  const certifications = data?.items || fallback

  return (
    <section className="section certifications-section" id="certifications" ref={ref}>
      <div className="container">
        <div className="certs-inner">
          <div className="certs-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="section-tag" style={{ margin: '0 auto 24px' }}>✳ CERTIFICATIONS</div>
            <h2 className="section-title-center">
              Courses & certifications<br />I've completed.
            </h2>
          </div>

          <div className="certs-grid">
            {certifications.map(({ title, issuer, date, badge, bg }, i) => (
              <motion.div
                key={title + i}
                className="cert-card"
                style={{ borderTop: `6px solid ${bg}` }}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="cert-card-top">
                  <span className="cert-badge">{badge}</span>
                  <span className="cert-date">{date}</span>
                </div>
                <h3 className="cert-title">{title}</h3>
                <p className="cert-issuer">{issuer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
