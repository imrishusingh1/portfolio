import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-scroll'
import './Pricing.css'

const plans = [
  {
    name: 'Starter',
    price: '$500',
    period: 'per project',
    badge: 'STARTER',
    desc: 'Great for personal sites and landing pages.',
    features: [
      'Up to 5 pages',
      'Responsive design',
      'SEO basics',
      'Contact form',
      '1 month support',
    ],
    cta: 'Get Started',
    dark: false,
    bg: 'var(--white)',
  },
  {
    name: "Let's Talk",
    price: 'Custom',
    period: 'tailored to you',
    badge: 'STUDIO',
    desc: 'For complex apps, MVPs, and enterprise-grade products.',
    features: [
      'Unlimited scope',
      'Full-stack MERN',
      'API + Auth + DB',
      'CI/CD deployment',
      'Dedicated support',
    ],
    cta: "Let's Talk →",
    dark: false,
    bg: 'var(--lavender-bg)',
  },
]

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section pricing-section" id="pricing" ref={ref}>
      <div className="container">
        <div className="pricing-inner">
          <div className="pricing-header">
            <div className="section-tag">✳ PRICING</div>
            <h2 className="section-title">Simple, transparent<br /><span className="underline-wave">pricing</span></h2>
          </div>
          <div className="pricing-grid">
          {plans.map(({ name, price, period, badge, desc, features, cta, bg }, i) => (
            <motion.div
              key={name}
              className="pricing-card"
              style={{ background: bg }}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
            >
              <div className="plan-badge-top">{badge}</div>
              <div className="plan-price-wrap">
                <span className="plan-price">{price}</span>
                <span className="plan-period">{period}</span>
              </div>
              <p className="plan-desc">{desc}</p>
              <ul className="plan-features">
                {features.map(f => (
                  <li key={f}><span className="check-icon">✓</span>{f}</li>
                ))}
              </ul>
              <Link to="contact" smooth offset={-80} duration={600}>
                <button className="btn btn-dark plan-cta">{cta}</button>
              </Link>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
