import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSectionData, useAPI } from '../context/SectionDataContext'
import './Portfolio.css'

const fallbackProjects = [
  { title: 'TempMail Pro', description: 'A temporary email service built for privacy.', color: '#e3e3ff', emoji: '📧', url: '' },
  { title: 'DevConnect Social Network', description: 'A platform connecting developers globally.', color: '#d4f5c4', emoji: '🌐', url: '' },
  { title: 'TaskFlow AI Assistant', description: 'Intelligent task management using AI.', color: '#f5d4e8', emoji: '🤖', url: '' },
  { title: 'EcomEase Storefront', description: 'High-conversion headless e-commerce.', color: '#d4e8f5', emoji: '🛒', url: '' },
  { title: 'LeetCode Automation Solver', description: 'Automation script for algorithm solutions.', color: '#fff5d4', emoji: '⚡', url: '' },
  { title: 'Creative Portfolio Engine', description: 'Open-source React portfolio template.', color: '#f5e3ff', emoji: '🎨', url: '' },
]

const fallbackSkills = [
  { name: 'C Language', iconImage: '' },
  { name: 'C++', iconImage: '' },
  { name: 'Java', iconImage: '' },
  { name: 'Python', iconImage: '' },
  { name: 'TypeScript', iconImage: '' },
  { name: 'Express', iconImage: '' },
  { name: 'NodeJS', iconImage: '' },
  { name: 'Postman', iconImage: '' },
  { name: 'Docker', iconImage: '' },
  { name: 'HTML', iconImage: '' },
  { name: 'CSS', iconImage: '' },
  { name: 'Redux', iconImage: '' },
  { name: 'Javascript', iconImage: '' },
  { name: 'Tailwind CSS', iconImage: '' },
  { name: 'React', iconImage: '' },
  { name: 'MySQL', iconImage: '' },
  { name: 'Mongo DB', iconImage: '' },
  { name: 'Git', iconImage: '' },
  { name: 'Firebase', iconImage: '' },
]

const getSkillIconUrl = (name) => {
  const n = name.toLowerCase().trim();
  if (n.includes('c++')) return 'cpp';
  if (n.includes('c#')) return 'cs';
  if (n === 'c language' || n === 'c') return 'c';
  if (n.includes('node')) return 'nodejs';
  if (n.includes('javascript') || n === 'js') return 'js';
  if (n.includes('typescript') || n === 'ts') return 'ts';
  if (n.includes('tailwind')) return 'tailwind';
  if (n.includes('mongo')) return 'mongodb';
  if (n.includes('react')) return 'react';
  if (n.includes('py')) return 'python';
  if (n.includes('html')) return 'html';
  if (n.includes('css')) return 'css';
  if (n.includes('docker')) return 'docker';
  if (n.includes('aws')) return 'aws';
  if (n.includes('firebase')) return 'firebase';
  if (n.includes('postgres')) return 'postgres';
  if (n.includes('mysql')) return 'mysql';
  if (n.includes('git')) return 'git';
  if (n === 'java' || n.includes('java ')) return 'java';
  if (n.includes('spring')) return 'spring';
  if (n.includes('express')) return 'express';
  if (n.includes('redux')) return 'redux';
  if (n.includes('linux')) return 'linux';
  if (n.includes('php')) return 'php';
  if (n.includes('ruby')) return 'ruby';
  if (n.includes('rust')) return 'rust';
  if (n.includes('angular')) return 'angular';
  if (n.includes('vue')) return 'vue';
  if (n.includes('svelte')) return 'svelte';
  if (n.includes('next')) return 'nextjs';
  if (n.includes('nuxt')) return 'nuxtjs';
  if (n.includes('laravel')) return 'laravel';
  if (n.includes('django')) return 'django';
  if (n.includes('github')) return 'github';
  if (n.includes('vercel')) return 'vercel';
  if (n.includes('figma')) return 'figma';
  if (n.includes('postman')) return 'postman';

  // Smart fallback: try to guess the slug by removing spaces and specials
  const guessedSlug = n.replace(/[^a-z0-9]/g, '');
  return guessedSlug.length > 0 ? guessedSlug : null;
}

const SkillIcon = ({ name, uploadedIcon, API }) => {
  const [error, setError] = useState(false);

  // Reset error state if props change
  useEffect(() => setError(false), [name, uploadedIcon]);

  // 1. If manual upload exists, prioritize it
  if (uploadedIcon && !error) {
    return <img src={`${API}${uploadedIcon}`} alt={name} className="skill-icon" onError={() => setError(true)} />;
  }

  // 2. If no valid manual upload, try finding a web icon
  const autoSlug = getSkillIconUrl(name);
  if (autoSlug && !error) {
    return <img src={`https://skillicons.dev/icons?i=${autoSlug}`} alt={name} className="skill-icon" onError={() => setError(true)} />;
  }

  // 3. Last fallback: First letter placeholder
  return <div className="skill-icon-placeholder">{name.charAt(0)}</div>;
}

export default function Portfolio() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('portfolio')
  const API = useAPI()
  const projects = data?.items || fallbackProjects
  const skillsTitle = data?.skillsTitle || 'Technologies and Tools'
  const skillsDescription = data?.skillsDescription || 'Using a combination of cutting-edge technologies and reliable open-source software I build user-focused, performant apps and websites for smartphones, tablets, and desktops.'
  const skills = data?.skills || fallbackSkills

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
              {/* Check out some of our awesome<br />
              projects with creative ideas. */}
              Selected projects showcasing real-world problem solving and system design.

            </h2>
          </div>

          <div className="portfolio-grid">
            {projects.map(({ title, description, color, emoji, image, url }, i) => (
              <motion.a
                key={title + i}
                href={url || "#"}
                target={url ? "_blank" : "_self"}
                rel={url ? "noreferrer" : ""}
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
                </div>
              </motion.a>
            ))}
          </div>

          {/* Skills Section */}
          <div className="portfolio-skills" style={{ marginTop: "120px" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h2 className="skills-title">{skillsTitle}</h2>
              <p className="skills-desc">{skillsDescription}</p>
            </motion.div>

            <div className="skills-grid">
              {skills.map((skill, i) => (
                <motion.div
                  key={i}
                  className="skill-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <SkillIcon name={skill.name} uploadedIcon={skill.iconImage} API={API} />
                  <span className="skill-name">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
