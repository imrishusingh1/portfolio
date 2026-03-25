import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-scroll'
import { useSectionData, useAPI } from '../context/SectionDataContext'
import './Hero.css'

export default function Hero() {
  const [burstCount, setBurstCount] = useState(0)
  const { data } = useSectionData('hero')
  const headline = data?.headline || "I'm Rishu Singh,"
  const subhead = data?.subhead || 'a product designer.'
  const description = data?.description || "I'm a freelance product designer based in London.\nI'm very passionate about the work that I do."
  const btnText = data?.btnText || 'See My Works'
  const API = useAPI()

  const SparkleSVG = ({ size = 40, className = '' }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
      <path d="M20 0 Q20 20 40 20 Q20 20 20 40 Q20 20 0 20 Q20 20 20 0Z" fill="currentColor"/>
    </svg>
  )

  return (
    <section className="hero" id="home">
      {/* Squiggle bottom right */}
      <svg className="squiggle-deco" width="80" height="60" viewBox="0 0 80 60" fill="none">
        <path d="M10 50 Q20 10 30 30 Q40 50 50 20 Q60 -10 70 10" stroke="#1d1d1d" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35"/>
      </svg>

      <div className="container hero-inner">
        {/* LEFT TEXT */}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="hero-hello-large">
            <SparkleSVG size={50} className="sparkle-left" />
            HELLO !
            <div className="sparkle-right-group">
              <SparkleSVG size={32} className="sparkle-right-top" />
              <SparkleSVG size={18} className="sparkle-right-bot" />
            </div>
          </div>
          <h1 className="hero-headline">
            {headline}
            <br />
            a{' '}
            <span className="wavy-word">
              {subhead}
              <svg className="wavy-svg" viewBox="0 0 260 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M 5,6 Q 120,3 235,5 L 90,13 Q 180,15 250,15" stroke="#908aee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </span>
          </h1>
          <p className="hero-sub">
            {description.split('\n').map((line, i) => <span key={i}>{line}{i < description.split('\n').length - 1 && <br />}</span>)}
          </p>
          <div className="hero-btns">
            <Link to="portfolio" smooth offset={-80} duration={600}>
              <button className="btn btn-outline hero-btn">{btnText}</button>
            </Link>
            <a href={`${API}/api/upload/download-resume`} download className="btn btn-outline hero-btn">Download Resume ↓</a>
          </div>
        </motion.div>

        {/* RIGHT PHOTO */}
        <motion.div
          className="hero-photo-wrap"
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="hero-arch-container">
            {/* Rotating badge */}
            <div 
              className="rotating-badge-wrap"
              onMouseEnter={() => setBurstCount(c => c + 1)}
              onMouseLeave={() => setBurstCount(c => c - 1)}
              onClick={() => setBurstCount(c => c + 1)}
            >
              <div className="rotating-badge">
                <div 
                  className="badge-burst"
                  style={{
                    transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: `rotate(${burstCount * 360}deg)`,
                    position: 'absolute', inset: 0
                  }}
                >
                  <div className="badge-continuous">
                    <svg viewBox="0 0 140 140" width="140" height="140">
                      <defs>
                        <path id="circlePath" d="M 70,70 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0" />
                      </defs>
                      <text fontSize="12.5" fontWeight="800" fill="#1d1d1d" fontFamily="Cabinet Grotesk, sans-serif" letterSpacing="1">
                        <textPath href="#circlePath" textLength="301.5" startOffset="0%">
                          ✦ FOR FREELANCE ✦ I AM AVAILABLE
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

            {/* Arch photo */}
            <div className="hero-arch">
              <img 
                src={`${API}/api/upload/profile-pic`} 
                onError={(e) => { e.target.src = '/profile.png' }} 
                alt="Rishu Singh – Product Designer" 
                className="hero-photo" 
              />
            </div>

            {/* Air / Wind decoration overlapping right edge */}
            <svg className="hero-wind" viewBox="0 0 120 70" fill="none">
              <path d="M0 20 Q 30 5 60 20 T 120 20" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M20 40 Q 50 25 80 40 T 140 40" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M15 60 Q 45 45 75 60 T 135 60" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
