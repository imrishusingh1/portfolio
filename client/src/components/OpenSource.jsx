import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import { FaGithub, FaStar } from 'react-icons/fa'
import { useSectionData } from '../context/SectionDataContext'
import './OpenSource.css'

const fallback = [
  { repo: 'freeCodeCamp/freeCodeCamp', desc: 'Contributed bug fixes and curriculum improvements.', stars: '395k', prs: 3, url: 'https://github.com/freeCodeCamp/freeCodeCamp', bg: '#f0ffdb' },
  { repo: 'facebook/react', desc: 'Submitted documentation enhancements.', stars: '225k', prs: 2, url: 'https://github.com/facebook/react', bg: '#ffe3f5' },
  { repo: 'Personal / open-mail-server', desc: 'Built a custom SMTP server in C++.', stars: '12', prs: '—', url: '#', bg: '#ffebe3' },
]

export default function OpenSource() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('opensource')
  const contributions = data?.items || fallback

  return (
    <section className="section opensource-section" id="opensource" ref={ref}>
      <div className="container">
        <div className="os-inner">
          <div className="os-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="section-tag" style={{ margin: '0 auto 24px' }}>✳ OPEN SOURCE</div>
            <h2 className="section-title-center">
              Open-source contributions<br />& community projects.
            </h2>
          </div>

          <div className="os-grid">
            {contributions.map(({ repo, desc, stars, prs, url, bg }, i) => (
              <motion.div
                key={repo + i}
                className="os-card"
                style={{ background: bg }}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="os-card-top">
                  <FaGithub size={28} />
                  <a href={url} target="_blank" rel="noreferrer" className="os-ext-link">
                    <FiExternalLink size={18} />
                  </a>
                </div>
                <h3 className="os-repo">{repo}</h3>
                <p className="os-desc">{desc}</p>
                <div className="os-meta">
                  <span className="os-stars"><FaStar size={14} /> {stars}</span>
                  <span className="os-prs">PRs: {prs}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
