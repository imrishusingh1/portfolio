import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSectionData } from '../context/SectionDataContext'
import './Education.css'

const educationData = [
  {
    institution: 'Lovely Professional University',
    location: 'Punjab, India',
    degree: 'Bachelor of Technology — Computer Science & Engineering',
    score: 'CGPA: 8.22',
    period: "Aug' 2023 – Present",
    icon: '🎓',
    color: '#7c6fcd',
    dotColor: '#e8c4e8',
    tag: 'UNDERGRADUATE',
  },
  {
    institution: 'Sachchidanand Sinha College',
    location: 'Aurangabad, Bihar',
    degree: 'Intermediate (Class XII)',
    score: 'Percentage: 72.6%',
    period: "Apr' 2021 – Mar' 2022",
    icon: '📖',
    color: '#3aafa9',
    dotColor: '#9ecfcc',
    tag: 'HIGHER SECONDARY',
  },
  {
    institution: 'Saraswati Shishu Mandir',
    location: 'Aurangabad, Bihar',
    degree: 'Matriculation (Class X)',
    score: 'Percentage: 85.4%',
    period: "Apr' 2019 – Mar' 2020",
    icon: '🏫',
    color: '#e07b5f',
    dotColor: '#c5e0f0',
    tag: 'SECONDARY',
  },
]

export default function Education() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('education')
  const educationItems = data?.items || educationData

  return (
    <section className="section education-section" id="education" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div
          className="education-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag" style={{ margin: '0 auto 24px' }}>✳ EDUCATION</div>
          <h2 className="section-title-center">
            Academic &amp;<br />Learning Journey
          </h2>
          <p className="education-subtitle">
            A foundation built on structured learning, curiosity, and consistent performance.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="edu-timeline">

          {/* Single continuous 3D vertical line */}
          <motion.div
            className="edu-timeline-line"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
            style={{ transformOrigin: 'top center' }}
          />

          {/* Cards — each has a dot absolutely centered on the line */}
          {educationItems.map((edu, i) => (
            <motion.div
              key={i}
              className={`edu-row ${i % 2 === 0 ? 'edu-row-right' : 'edu-row-left'}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? 60 : -60 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.2, duration: 0.6, ease: 'easeOut' }}
            >
              {/* Dot ON the line */}
              <motion.div
                className="edu-dot-wrap"
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.2, type: 'spring', stiffness: 220 }}
              >
                <div
                  className="edu-dot-outer"
                  style={{
                    background: edu.dotColor || '#ddd',
                    boxShadow: `0 0 0 3px white, 0 0 0 6px ${edu.dotColor || '#ddd'}`,
                  }}
                />
                <div className="edu-dot-inner" style={{ background: edu.color }} />
              </motion.div>

              {/* Card */}
              <div className="edu-card" style={{ borderColor: `${edu.color}55` }}>
                <div className="edu-tag" style={{ background: edu.color }}>
                  {edu.tag}
                </div>

                <div className="edu-card-top">
                  <div
                    className="edu-icon-circle"
                    style={{
                      background: `${edu.color}18`,
                      border: `2px solid ${edu.color}44`,
                    }}
                  >
                    <span>{edu.icon}</span>
                  </div>
                  <div>
                    <h3 className="edu-institution" style={{ color: edu.color }}>
                      {edu.institution}
                    </h3>
                    <p className="edu-location">📍 {edu.location}</p>
                  </div>
                </div>

                <p className="edu-degree">{edu.degree}</p>

                <div className="edu-footer">
                  <span className="edu-score" style={{ color: edu.color }}>
                    🏆 {edu.score}
                  </span>
                  <span className="edu-period">🗓 {edu.period}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
