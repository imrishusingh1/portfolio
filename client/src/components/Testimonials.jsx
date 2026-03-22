import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import './Testimonials.css'

const testimonials = [
  {
    text: 'Working with Jonathan was an absolute pleasure. He delivered a world-class design system that our entire team now relies on. The attention to detail and communication throughout the project was exceptional.',
    name: 'Arjun Sharma',
    role: 'CEO, TechStartup',
    stars: 5,
  },
  {
    text: 'Jonathan turned our complex product vision into a clean, user-friendly interface. Deliveries were always on time and the quality was beyond what we expected. Would highly recommend.',
    name: 'Priya Nair',
    role: 'Founder, DesignCo',
    stars: 5,
  },
  {
    text: 'The best designer I\'ve worked with remotely. Jonathan deeply understands user psychology and applies it to every decision. Our user retention increased by 35% after the redesign.',
    name: 'Mike Johnson',
    role: 'Product Manager, SaasCorp',
    stars: 5,
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const prev = () => setActive(p => (p - 1 + testimonials.length) % testimonials.length)
  const next = () => setActive(p => (p + 1) % testimonials.length)

  return (
    <section className="section testimonials-section" ref={ref}>
      <div className="container">
        <div className="testimonials-wrap">
          <motion.div
            className="testimonials-inner"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
          {/* Floating Nav Buttons */}
          <button className="nav-btn nav-prev" onClick={prev} aria-label="Previous"><FiArrowLeft /></button>
          <button className="nav-btn nav-next" onClick={next} aria-label="Next"><FiArrowRight /></button>

          {/* Stars */}
          <div className="stars-row">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="star">☆</span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="testimonial-quote"
            >
              "{testimonials[active].text}"
            </motion.blockquote>
          </AnimatePresence>

          <div className="testimonial-author">
            <span className="author-name">{testimonials[active].name}</span>
            <span className="author-role">{testimonials[active].role}</span>
          </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
