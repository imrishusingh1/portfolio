import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSectionData, useAPI } from '../context/SectionDataContext'
import './Achievements.css'

const fallback = [
  { title: 'Smart India Hackathon Finalist', event: 'SIH 2024', desc: 'Built an AI-powered platform for automated resume screening.', badge: '🏆', bg: '#ffe3f5' },
  { title: 'LeetCode 500+ Problems', event: 'LeetCode', desc: 'Solved 500+ problems across arrays, trees, graphs, DP.', badge: '💻', bg: '#f0ffdb' },
  { title: 'CodeChef 4★ Rated', event: 'CodeChef', desc: 'Achieved a 4-star rating (1800+).', badge: '⭐', bg: '#ffebe3' },
  { title: 'Hackathon Winner – HackTheNorth', event: 'HackTheNorth 2023', desc: 'Won first place for a real-time collaborative whiteboard.', badge: '🥇', bg: '#e0f0ff' },
]

export default function Achievements() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('achievements')
  const API = useAPI()
  const achievements = data?.items || fallback

  return (
    <section className="section achievements-section" id="achievements" ref={ref}>
      <div className="container">
        <div className="achieve-inner">
          <div className="achieve-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="section-tag" style={{ margin: '0 auto 24px' }}>✳ ACHIEVEMENTS</div>
            <h2 className="section-title-center">
              Competitive programming<br />& hackathon highlights.
            </h2>
          </div>

          <div className="achieve-grid">
            {achievements.map(({ title, event, desc, badge, bg, image }, i) => (
              <motion.div
                key={title + i}
                className="achieve-card"
                style={{ borderTop: `6px solid ${bg}` }}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="achieve-card-top">
                  {image ? (
                    <img src={`${API}${image}`} alt={title} className="achieve-image" />
                  ) : (
                    <span className="achieve-badge">{badge}</span>
                  )}
                  <span className="achieve-event">{event}</span>
                </div>
                <h3 className="achieve-title">{title}</h3>
                <p className="achieve-desc">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
