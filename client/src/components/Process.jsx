import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './Process.css'

const tools = ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'WebRTC', 'Redis', 'Docker', 'AWS', 'Next.js']

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We begin with in-depth research to understand your vision, goals, audience, and the competitive landscape.',
    icon: '💡',
    bg: '#f0ffdb', // Light lime/yellow
  },
  {
    num: '02',
    title: 'Design',
    desc: 'Wireframes and high-fidelity prototypes are created and iterated on until you\'re fully satisfied.',
    icon: '💻',
    bg: '#ffe3f5', // Light pink
  },
  {
    num: '03',
    title: 'Development',
    desc: 'Clean, scalable code brought to life with smooth animations and full responsiveness across all devices.',
    icon: '🎨',
    bg: '#ffebe3', // Light peach
  },
]

export default function Process() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section process-section" id="process" ref={ref}>
      <div className="container">
        <div className="process-inner">
          <div className="process-header" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* Sparkle SVG */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: '10%', top: '0%' }}>
              <path d="M 50 10 Q 50 50, 90 50 Q 50 50, 50 90 Q 50 50, 10 50 Q 50 50, 50 10" stroke="#1d1d1d" strokeWidth="3" />
            </svg>
            
            <div className="section-tag" style={{ margin: "0 auto 24px" }}>✳ PROCESS</div>
            <h2 className="section-title-center">
              My workflow is centered around<br/>
              being highly productive.
            </h2>
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
              <div className="process-card-top">
                <div className="process-icon-circle">
                  <span>{icon}</span>
                </div>
                <div className="process-num-small">{num}.</div>
              </div>
              <h3 className="process-title">{title}</h3>
              <p className="process-desc">{desc}</p>
            </motion.div>
          ))}
          </div>

          {/* Infinite Marquee */}
          <div className="process-tools">
            <p className="process-tools-title">Tools that power my every day:</p>
            <div className="marquee-wrapper">
              <div className="marquee-content">
                {[...tools, ...tools].map((tech, i) => (
                  <div key={i} className="marquee-item">
                    <span>{tech}</span>
                    <span className="star">✳</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
