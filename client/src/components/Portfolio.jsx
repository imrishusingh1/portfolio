import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiArrowRightCircle } from 'react-icons/fi'
import './Portfolio.css'

const projects = [
  {
    title: 'TempMail Pro',
    description: 'A sleek, reliable temporary email service built for privacy and spam protection. Features a clean UI and automated inbox clearing.',
    color: '#e3e3ff',
    emoji: '📧',
  },
  {
    title: 'DevConnect Social Network',
    description: 'A modern platform connecting developers globally, built with a scalable real-time messaging architecture and clean minimalist UI.',
    color: '#d4f5c4',
    emoji: '🌐',
  },
  {
    title: 'TaskFlow AI Assistant',
    description: 'An intelligent task management SaaS that uses AI to prioritize daily workflows and automate recurring scheduling conflicts.',
    color: '#f5d4e8',
    emoji: '🤖',
  },
  {
    title: 'EcomEase Storefront',
    description: 'A high-conversion headless e-commerce storefront designed for fast page loads, effortless checkout, and seamless inventory syncing.',
    color: '#d4e8f5',
    emoji: '🛒',
  },
  {
    title: 'LeetCode Automation Solver',
    description: 'A robust automation script capable of fetching, analyzing, and self-submitting optimal algorithm solutions using localized AI models.',
    color: '#fff5d4',
    emoji: '⚡',
  },
  {
    title: 'Creative Portfolio Engine',
    description: 'An open-source, highly customizable React portfolio template focusing on neo-brutalist aesthetics and buttery smooth Framer Motion animations.',
    color: '#f5e3ff',
    emoji: '🎨',
  },
]

export default function Portfolio() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section portfolio-section" id="portfolio" ref={ref}>
      <div className="container">
        <div className="portfolio-inner">
          <div className="portfolio-header" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* Loop Decoration */}
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', left: '-5%', top: '10%' }}>
              <path d="M 25 75 C 25 95, 45 90, 50 65 C 55 40, 40 30, 30 50 C 20 70, 35 90, 55 80 C 70 75, 80 50, 85 20" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" />
            </svg>
            
            {/* Star Decoration */}
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
          {projects.map(({ title, description, color, emoji }, i) => (
            <motion.a
              key={title}
              href="#"
              className="project-card"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="project-image-box" style={{ background: color }}>
                <span className="project-emoji">{emoji}</span>
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
