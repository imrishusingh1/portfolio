import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useSectionData, useAPI } from '../context/SectionDataContext'
import './Pricing.css'

const fallbackPlans = [
  { price: '$500', badge: 'STARTER', badgeColor: '#f0ffdb', desc: 'You may want to add some details here for clarification.', features: ['Up to 5 Pages', 'Standard API Access', 'Basic Design Setup', 'Email Support', 'Single Language'], cta: 'Choose Plan', amount: 500 },
  { price: "Let's Talk", badge: 'PRO', badgeColor: '#ffe3f5', desc: 'You may want to add some details here for clarification.', features: ['Unlimited Pages', 'Extended API Access', 'Custom Design Setup', 'Priority Support', 'Multilingual Ready'], cta: 'Choose Plan', amount: null },
]

const fallbackFaqs = [
  { q: 'Do you charge hourly or on spec?', a: "I typically charge on a per-project basis so you know exactly what you're paying upfront. However, I'm open to hourly arrangements for ongoing maintenance or consulting work." },
  { q: 'How long have you been doing design?', a: "I have been designing and building digital products for over 5 years, working with startups and established brands to deliver high-quality, scalable solutions." },
  { q: 'Can you do a couple of designs to see if I like what you do?', a: "I don't offer spec work as my process requires deep discovery and research first. However, you can review my extensive portfolio to get a strong sense of my style and quality." },
  { q: 'What is the process and how long does it take?', a: "A typical project takes 2 to 6 weeks depending on scope. We go through discovery, wireframing, high-fidelity design, development, and finally launch and hand-off." },
]

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [openFaq, setOpenFaq] = useState(null)
  const [paymentState, setPaymentState] = useState({}) // { [planIndex]: 'loading' | 'success' | 'error' }
  const { data } = useSectionData('pricing')
  const API = useAPI()
  
  const plans = data?.plans || fallbackPlans
  const faqs = data?.faqs || fallbackFaqs

  const toggleFaq = (index) => { setOpenFaq(openFaq === index ? null : index) }

  const handleChoosePlan = async (plan, index) => {
    // Derive amount from price string if not explicitly set (e.g. "$500" → 500)
    const rawAmount = plan.amount ?? (
      plan.price && /[\d,.]+/.test(plan.price)
        ? parseFloat(plan.price.replace(/[^0-9.]/g, ''))
        : null
    )

    // No numeric price → scroll to contact
    if (!rawAmount) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setPaymentState(s => ({ ...s, [index]: 'loading' }))
    try {
      const { data: order } = await axios.post(`${API}/api/payment/create-order`, {
        amount: rawAmount,
        planName: `${plan.badge} Plan`,
      })
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Rishu Singh – Portfolio',
        description: `${plan.badge} Plan`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const { data: verify } = await axios.post(`${API}/api/payment/verify`, response)
            if (verify.success) {
              setPaymentState(s => ({ ...s, [index]: 'success' }))
              setTimeout(() => setPaymentState(s => ({ ...s, [index]: undefined })), 5000)
            } else {
              setPaymentState(s => ({ ...s, [index]: 'error' }))
            }
          } catch { setPaymentState(s => ({ ...s, [index]: 'error' })) }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#6c47ff' },
        modal: {
          ondismiss: () => setPaymentState(s => ({ ...s, [index]: undefined }))
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
      setPaymentState(s => ({ ...s, [index]: undefined }))
    } catch (err) {
      console.error(err)
      setPaymentState(s => ({ ...s, [index]: 'error' }))
    }
  }

  return (
    <section className="section pricing-section" id="pricing" ref={ref}>
      <div className="container">
        <div className="pricing-inner">
          <div className="pricing-header" style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', left: '10%', top: '30%' }}>
              <path d="M 50 10 L 56 40 L 90 35 L 65 58 L 75 90 L 50 70 L 25 90 L 35 58 L 10 35 L 44 40 Z" stroke="#1d1d1d" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
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
          {plans.map((plan, i) => {
            const { price, badge, badgeColor, desc, features, cta } = plan
            const pstate = paymentState[i]
            return (
            <motion.div
              key={i}
              className="pricing-card"
              style={{ borderTop: `6px solid ${badgeColor}` }}
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

              {pstate === 'success' ? (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <motion.svg width="48" height="48" viewBox="0 0 52 52">
                    <motion.circle cx="26" cy="26" r="25" fill="#22c55e" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} />
                    <motion.path d="M16 26l7 7 15-15" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3 }} />
                  </motion.svg>
                  <span style={{ fontWeight: 700, color: '#22c55e' }}>Payment Successful! 🎉</span>
                </motion.div>
              ) : (
                <button 
                  className="plan-choose-btn"
                  disabled={pstate === 'loading'}
                  onClick={() => handleChoosePlan(plan, i)}
                >
                  {pstate === 'loading' ? '⏳ Processing...' : (plan.amount ?? (/[\d,.]+/.test(plan.price || ''))) ? `Pay ${price}` : "Let's Talk →"}
                </button>
              )}
              {pstate === 'error' && <p style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>Payment failed. Please try again.</p>}
            </motion.div>
          )})}
          </div>

          <div className="faq-section">
            <h2 className="faq-title">Have questions?</h2>
            <p className="faq-subtitle">
              I've gathered common questions and their answers to make your experience<br/>
              smoother. If you can't find what you're looking for, feel free to reach out to me.
            </p>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`faq-item ${openFaq === index ? 'open' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-q-row">
                    <h4 className="faq-q">{faq.q}</h4>
                    <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                  </div>
                  <div className="faq-a-wrap">
                    <p className="faq-a">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
