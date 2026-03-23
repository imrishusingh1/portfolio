import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiArrowRightCircle } from 'react-icons/fi'
import { useSectionData, useAPI } from '../context/SectionDataContext'
import './Portfolio.css'

const fallbackProjects = [
  { title: 'TempMail Pro', description: 'A temporary email service built for privacy.', color: '#e3e3ff', emoji: '📧' },
  { title: 'DevConnect Social Network', description: 'A platform connecting developers globally.', color: '#d4f5c4', emoji: '🌐' },
  { title: 'TaskFlow AI Assistant', description: 'Intelligent task management using AI.', color: '#f5d4e8', emoji: '🤖' },
  { title: 'EcomEase Storefront', description: 'High-conversion headless e-commerce.', color: '#d4e8f5', emoji: '🛒' },
  { title: 'LeetCode Automation Solver', description: 'Automation script for algorithm solutions.', color: '#fff5d4', emoji: '⚡' },
  { title: 'Creative Portfolio Engine', description: 'Open-source React portfolio template.', color: '#f5e3ff', emoji: '🎨' },
]

export default function Portfolio() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('portfolio')
  const API = useAPI()
  const projects = data?.items || fallbackProjects

  return (
    <section className="section portfolio-section" id="portfolio" ref={ref}>
      <div className="container">
        <div className="portfolio-inner">
          <div className="portfolio-header" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', left: '-5%', top: '10%' }}>
              <path d="M 25 75 C 25 95, 45 90, 50 65 C 55 40, 40 30, 30 50 C 20 70, 35 90, 55 80 C 70 75, 80 50, 85 20" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <svg width="50" height="50" viewBox="0 0 100 100" style={{ position: 'absolute', right: '0%', top: '-25%' }}>
              <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" fill="#FFE1E8" stroke="#1d1d1d" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <div className="section-tag" style={{ margin: "0 auto 24px" }}>✳ MY WORKS</div>
            <h2 className="section-title-center portfolio-title" style={{ maxWidth: "800px" }}>
              Check out some of our awesome<br />
              projects with creative ideas.
            </h2>
          </div>

          <div className="portfolio-grid">
            {projects.map(({ title, description, color, emoji, image }, i) => (
              <motion.a
                key={title + i}
                href="#"
                className="project-card"
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="project-image-box" style={{ background: color, overflow: 'hidden' }}>
                  {image ? (
                    <img src={`${API}${image}`} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="project-emoji">{emoji}</span>
                  )}
                </div>
                <div className="project-info">
                  <h3 className="project-name">{title}</h3>
                  <p className="project-desc">{description}</p>
                  <span className="project-link">View Case Study <FiArrowRightCircle size={18} /></span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
