import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiArrowRightCircle } from 'react-icons/fi'
import { useSectionData } from '../context/SectionDataContext'
import './Blog.css'

const fallback = [
  { title: 'Building a Custom SMTP Server from Scratch in C++', excerpt: 'A deep dive into socket programming and email protocols.', date: 'Mar 2026', tag: 'Systems', url: '#', bg: '#f0ffdb' },
  { title: 'How I Solved 500+ LeetCode Problems in 6 Months', excerpt: 'Pattern recognition, spaced repetition, and deliberate practice.', date: 'Jan 2026', tag: 'DSA', url: '#', bg: '#ffe3f5' },
  { title: 'WebRTC Demystified: Real-Time Communication', excerpt: 'Understanding peer connections and building a video call app.', date: 'Nov 2025', tag: 'WebRTC', url: '#', bg: '#ffebe3' },
]

export default function Blog() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useSectionData('blog')
  const posts = data?.items || fallback

  return (
    <section className="section blog-section" id="blog" ref={ref}>
      <div className="container">
        <div className="blog-inner">
          <div className="blog-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="section-tag" style={{ margin: '0 auto 24px' }}>✳ BLOG</div>
            <h2 className="section-title-center">
              Technical writing &<br />knowledge sharing.
            </h2>
          </div>

          <div className="blog-grid">
            {posts.map(({ title, excerpt, date, tag, url, bg }, i) => (
              <motion.a
                key={title + i}
                href={url}
                className="blog-card"
                style={{ borderTop: `6px solid ${bg}` }}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="blog-card-top">
                  <span className="blog-tag">{tag}</span>
                  <span className="blog-date">{date}</span>
                </div>
                <h3 className="blog-title">{title}</h3>
                <p className="blog-excerpt">{excerpt}</p>
                <span className="blog-read-more">
                  Read Article <FiArrowRightCircle size={18} />
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
