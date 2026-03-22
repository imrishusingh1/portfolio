import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import './About.css'

const experiences = [
  {
    period: 'NOV 2017 – PRESENT',
    role: 'Creative Director at Malory House',
    desc: 'Led a talented team in crafting compelling brand experiences. Focused on innovation, creative direction, and delivering impactful digital solutions.',
    dot: '#f5a0d0',
  },
  {
    period: 'SEP 2015 – APR 2017',
    role: 'Senior Developer at Longwave Studio',
    desc: 'Collaborated with cross-functional teams to optimize performance and enhance user experience.',
    dot: '#a0d0a0',
  },
  {
    period: 'MAY 2015 – SEP 2015',
    role: 'Junior Developer at Webpaint Media',
    desc: 'Assisted in front-end development and UI enhancements. Contributed to coding, debugging and refining interactive website elements.',
    dot: '#a0c0f5',
  },
]

export default function About() {
  const [burstCount, setBurstCount] = useState(0)
  const ref = useRef(null)
  const refExp = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const inViewExp = useInView(refExp, { once: true, margin: '-80px' })

  return (
    <>
      {/* ── ABOUT BLOCK (lavender bg, circle photo) ── */}
      <section className="about-section" id="about" ref={ref}>
        {/* Decorative hearts */}
        <div className="hearts-deco">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M22 18 Q22 10 30 16 Q38 10 38 18 Q38 28 30 34 Q22 28 22 18Z" stroke="#1d1d1d" strokeWidth="1.5" fill="none" />
          </svg>
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <path d="M22 18 Q22 10 30 16 Q38 10 38 18 Q38 28 30 34 Q22 28 22 18Z" stroke="#1d1d1d" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="container about-inner">
          {/* LEFT: circle photo */}
          <motion.div
            className="about-photo-wrap"
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="circle-photo-outer">
              {/* Air/Wave decoration */}
              <svg className="wave-deco" width="110" height="80" viewBox="0 0 110 80" fill="none">
                <path d="M 5 20 Q 15 30 25 20 T 45 20 T 65 20 T 85 20 T 105 20" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 5 40 Q 15 50 25 40 T 45 40 T 65 40 T 85 40 T 105 40" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 5 60 Q 15 70 25 60 T 45 60 T 65 60 T 85 60 T 105 60" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="circle-photo">
                <img src="/profile.png" alt="Rishu Singh" />
              </div>
              {/* Rotating badge */}
              <div
                className="exp-badge"
                onMouseEnter={() => setBurstCount(c => c + 1)}
                onMouseLeave={() => setBurstCount(c => c - 1)}
                onClick={() => setBurstCount(c => c + 1)}
              >
                <div className="exp-badge-ring">
                  <div
                    className="badge-burst"
                    style={{
                      transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: `rotate(${burstCount * 360}deg)`,
                      position: 'absolute', inset: 0
                    }}
                  >
                    <div className="badge-continuous">
                      <svg viewBox="0 0 130 130" width="130" height="130">
                        <defs>
                          <path id="expCircle" d="M 65,65 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" />
                        </defs>
                        <text fontSize="10" fontWeight="700" fill="#1d1d1d" letterSpacing="2.5" fontFamily="Cabinet Grotesk, sans-serif">
                          <textPath href="#expCircle">
                            ✦ 10+ YEARS OF ✦ WORK EXPERIENCE ✦&nbsp;
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                  <div className="badge-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: text */}
          <motion.div
            className="about-text"
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="section-tag">✳ ABOUT</div>
            <h2 className="section-title">More about me</h2>
            <p>
              I'm Rishu Singh, a product designer based in London.
              I'm very passionate about the work that I do every day.
            </p>
            <p>
              My journey in this dynamic and ever-evolving field has been a testament to my passion for crafting meaningful user experiences, leveraging technologies, and fearlessly pushing the boundaries of digital creativity. I thrive on transforming ideas into intuitive and impactful designs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── EXPERIENCE TIMELINE ── */}
      <section className="experience-section" id="experience" ref={refExp}>
        {/* Squiggle decoration */}
        <svg className="exp-squiggle" width="80" height="120" viewBox="0 0 80 120" fill="none">
          <path d="M40 5 Q60 30 40 50 Q20 70 40 90 Q60 110 40 115" stroke="#1d1d1d" strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round" />
          <path d="M40 115 L34 105 M40 115 L46 105" stroke="#1d1d1d" strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round" />
        </svg>

        <div className="container exp-inner">
          {/* LEFT */}
          <motion.div
            className="exp-left"
            initial={{ opacity: 0, y: 24 }}
            animate={inViewExp ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">My experiences</h2>
            <p>
              I have had the pleasure to work with companies across a variety of industries. I'm always interested in new, exciting and challenging adventures.
            </p>
            <button className="btn btn-outline">More About Me</button>
          </motion.div>

          {/* RIGHT – vertical timeline */}
          <div className="timeline">
            {experiences.map(({ period, role, desc, dot }, i) => (
              <motion.div
                key={role}
                className="timeline-item"
                initial={{ opacity: 0, x: 28 }}
                animate={inViewExp ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.55 }}
              >
                <div className="timeline-period">{period}</div>
                <div className="timeline-divider">
                  <div className="timeline-dot" style={{ background: dot }} />
                </div>
                <div className="timeline-content">
                  <h3 className="timeline-role">{role}</h3>
                  <p className="timeline-desc">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
