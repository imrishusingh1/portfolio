import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './Process.css'

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We begin with in-depth research to understand your vision, goals, audience, and the competitive landscape.',
    icon: '🔍',
    bg: 'var(--lavender-bg)',
  },
  {
    num: '02',
    title: 'Design',
    desc: 'Wireframes and high-fidelity prototypes are created and iterated on until you\'re fully satisfied.',
    icon: '✏️',
    bg: 'var(--green-pastel)',
  },
  {
    num: '03',
    title: 'Development',
    desc: 'Clean, scalable code brought to life with smooth animations and full responsiveness across all devices.',
    icon: '⚙️',
    bg: 'var(--pink-pastel)',
  },
]

export default function Process() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section process-section" id="process" ref={ref}>
      <div className="container">
        <div className="process-inner">
          <div className="process-header">
            <div className="section-tag">✳ PROCESS</div>
            <h2 className="section-title">How I Work</h2>
          </div>
          <div className="process-grid">
          {steps.map(({ num, title, desc, icon, bg }, i) => (
            <motion.div
              key={num}
              className="process-card"
              style={{ background: bg }}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
            >
              <div className="process-num">{num}</div>
              <div className="process-icon-circle">
                <span>{icon}</span>
              </div>
              <h3 className="process-title">{title}</h3>
              <p className="process-desc">{desc}</p>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
