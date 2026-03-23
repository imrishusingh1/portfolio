import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-scroll'
import './Pricing.css'

const plans = [
  {
    price: '$500',
    badge: 'STARTER',
    badgeColor: '#f0ffdb', // Light green
    desc: 'You may want to add some details here for clarification.',
    features: ['Up to 5 Pages', 'Standard API Access', 'Basic Design Setup', 'Email Support', 'Single Language'],
    cta: 'Choose Plan',
  },
  {
    price: "Let's Talk",
    badge: 'STARTER',
    badgeColor: '#ffe3f5', // Light pink
    desc: 'You may want to add some details here for clarification.',
    features: ['Unlimited Pages', 'Extended API Access', 'Custom Design Setup', 'Priority Support', 'Multilingual Ready'],
    cta: 'Choose Plan',
  },
]

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section pricing-section" id="pricing" ref={ref}>
      <div className="container">
        <div className="pricing-inner">
          <div className="pricing-header" style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Left Star SVG */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', left: '10%', top: '30%' }}>
              <path d="M 50 10 L 56 40 L 90 35 L 65 58 L 75 90 L 50 70 L 25 90 L 35 58 L 10 35 L 44 40 Z" stroke="#1d1d1d" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            
            {/* Right Hash SVG */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: '10%', top: '5%' }}>
              <path d="M 35 15 L 20 85 M 75 15 L 60 85 M 10 35 L 85 20 M 10 65 L 85 50" stroke="#1d1d1d" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div className="section-tag" style={{ margin: "0 auto 24px" }}>✳ MY PLANS</div>
            <h2 className="section-title-center">
              Choose a plan that’s built<br/>
              for your workflow.
            </h2>
          </div>
          <div className="pricing-grid">
          {plans.map(({ price, badge, badgeColor, desc, features, cta }, i) => (
            <motion.div
              key={i}
              className="pricing-card"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div className="plan-badge-top" style={{ background: badgeColor }}>{badge}</div>
              <h3 className="plan-price">{price}</h3>
              <p className="plan-desc">{desc}</p>
              <ul className="plan-features">
                {features.map(f => (
                  <li key={f}><span className="check-icon">✓</span> {f}</li>
                ))}
              </ul>
              <button className="plan-choose-btn">{cta}</button>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
