import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import { useSectionData } from '../context/SectionDataContext'
import './Research.css'

const fallback = [
  { title: 'AI-Powered Resume Screening: A Machine Learning Approach', venue: 'IEEE International Conference', year: '2025', type: 'Conference Paper', doi: '#', bg: '#ffe3f5' },
  { title: 'Optimizing Real-Time Data Pipelines', venue: 'Journal of Systems Engineering', year: '2024', type: 'Journal Article', doi: '#', bg: '#f0ffdb' },
  { title: 'Method for Distributed Email Routing', venue: 'Indian Patent Office', year: '2024', type: 'Patent (Filed)', doi: '#', bg: '#ffebe3' },
]

export default function Research() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('research')
  const publications = data?.items || fallback

  return (
    <section className="section research-section" id="research" ref={ref}>
      <div className="container">
        <div className="research-inner">
          <div className="research-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="section-tag" style={{ margin: '0 auto 24px' }}>✳ RESEARCH</div>
            <h2 className="section-title-center">
              Publications, patents &<br />research work.
            </h2>
          </div>

          <div className="research-list">
            {publications.map(({ title, venue, year, type, doi, bg }, i) => (
              <motion.div
                key={title + i}
                className="research-card"
                style={{ background: bg }}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="research-card-left">
                  <span className="research-type">{type}</span>
                  <h3 className="research-title">{title}</h3>
                  <p className="research-venue">{venue} · {year}</p>
                </div>
                <a href={doi} target="_blank" rel="noreferrer" className="research-link">
                  <FiExternalLink size={20} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
