import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './Stats.css'

const stats = [
  { num: '98%', label: 'Satisfied customers' },
  { num: '15',  label: 'Years of work experience' },
  { num: '100+', label: 'Successful projects' },
  { num: '30', label: 'Design awards' },
]

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="stats-band" id="about-stats" ref={ref}>
      <div className="container stats-inner">
        {stats.map(({ num, label }, i) => (
          <motion.div
            key={label}
            className="stat-item"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <span className="stat-num">{num}</span>
            <span className="stat-label">{label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
