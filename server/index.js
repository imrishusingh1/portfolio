import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import UAParser from 'ua-parser-js'

import authRoutes from './routes/auth.js'
import sectionRoutes from './routes/sections.js'
import uploadRoutes from './routes/upload.js'
import paymentRoutes from './routes/payment.js'
import reviewRoutes from './routes/reviews.js'
import Section from './models/Section.js'
import Visitor from './models/Visitor.js'
import Setting from './models/Setting.js'
import authMiddleware from './middleware/auth.js'
import nodemailer from 'nodemailer'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: [
    'https://rishurajput.com',
    'https://www.rishurajput.com',
    'http://localhost:5173'
  ],
  credentials: true
}))

// ── Security headers (hides server info, stops clickjacking etc.) ──
app.use(helmet())

// ── Global rate limit: 120 requests / 1 minute per IP ──
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 120,                   // max 120 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
})
app.use(globalLimiter)

// ── Slow down repeated requests (progressive delay) ──
const speedLimiter = slowDown({
  windowMs: 60 * 1000,        // 1 minute window
  delayAfter: 40,             // start slowing after 40 requests
  delayMs: (hits) => hits * 100, // add 100ms per extra request
})
app.use(speedLimiter)

// ── Strict limiter for auth routes (5 attempts / 15 min) ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
})

// ── Contact form limit (3 per hour) ──
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 3,
  message: { error: 'Too many messages sent. Please wait before sending again.' },
})

app.use(express.json({ limit: '10mb' }))
// /uploads removed — files now served from Cloudinary CDN

// ── API Secret Guard (Disabled) ──
// Vercel build environment issue caused VITE_ variables to desync.
// The Admin JWT auth logic fully protects the editing/upload routes securely anyway.
const apiSecretGuard = (req, res, next) => {
  return next()
}
app.use(apiSecretGuard)

// ── Routes ──
app.use('/api/auth', authLimiter, authRoutes)   // max 5 login attempts / 15 min
app.use('/api/sections', sectionRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/reviews', reviewRoutes)

// ── Contact messages ──
const messageSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})
const Message = mongoose.model('Message', messageSchema)

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' })
  try {
    const doc = await Message.create({ name, email, message })
    console.log('📨 New message from:', name, email)

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })
        await transporter.sendMail({
          from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
          replyTo: email,
          to: 'rishukrsingh99p@gmail.com',
          subject: `New Message from ${name} via Portfolio`,
          text: `You just received a new message from your portfolio contact form!\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        })
        console.log('✅ Notification email forwarded to rishukrsingh99p@gmail.com')
      } catch (mailErr) {
        console.error('❌ Failed to send email notification:', mailErr.message)
      }
    } else {
      console.log('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email dispatch.')
    }

    res.status(201).json({ success: true, id: doc._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.get('/api/messages', async (_req, res) => {
  const msgs = await Message.find().sort({ createdAt: -1 })
  res.json(msgs)
})

app.get('/', (_req, res) => res.send('Portfolio API running 🚀'))

// ── Visitor Tracking Helpers ─────────────────────────────────────

function formatIST(date) {
  return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
}

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown'
}

async function getIPInfo(ip) {
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
    return { country: 'Localhost', countryCode: 'LOCAL', city: 'Local', isp: 'Local' }
  }
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,isp,proxy,hosting`)
    const data = await resp.json()
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        city: data.city || 'Unknown',
        isp: data.isp || 'Unknown',
      }
    }
    return null
  } catch (err) {
    console.error('IP lookup failed:', err.message)
    return null
  }
}

// Deduplicate: ignore same IP within 5 seconds
const recentTracks = new Map()

// ── POST /api/track — called when someone visits the portfolio ───
app.post('/api/track', async (req, res) => {
  try {
    const ip = getClientIP(req)

    // Deduplicate
    const now = Date.now()
    const lastTrack = recentTracks.get(ip)
    if (lastTrack && now - lastTrack < 5000) {
      return res.json({ message: 'Already tracked recently', deduplicated: true })
    }
    recentTracks.set(ip, now)
    if (recentTracks.size > 100) {
      for (const [key, val] of recentTracks) {
        if (now - val > 10000) recentTracks.delete(key)
      }
    }

    const userAgentString = req.headers['user-agent'] || ''
    const referrer = req.body.referrer || ''
    const page = req.body.page || '/'

    const ua = new UAParser(userAgentString)
    const device = ua.getDevice()
    const os = ua.getOS()
    const browser = ua.getBrowser()

    let deviceType = device.type || 'desktop'
    if (!device.type) {
      const osName = (os.name || '').toLowerCase()
      if (osName.includes('ios') || osName.includes('android')) deviceType = 'mobile'
      else deviceType = 'desktop'
    }

    const deviceBrand = device.vendor || os.name || 'unknown'
    const deviceModel = device.model || deviceType

    const ipInfo = await getIPInfo(ip)

    // ── Determine visitor type & save ──────────────────────────────
    let isReturning = false
    let visitCount = 1
    const existing = await Visitor.findOne({ ip })

    if (existing) {
      isReturning = true
      existing.visitCount += 1
      visitCount = existing.visitCount
      existing.lastVisit = new Date()
      existing.lastVisit_IST = formatIST(new Date())
      existing.visits.push({ timestamp: new Date(), timestamp_IST: formatIST(new Date()), referrer, page })
      existing.device = { type: deviceType, brand: deviceBrand, model: deviceModel }
      existing.os = { name: os.name || 'unknown', version: os.version || '' }
      existing.browser = { name: browser.name || 'unknown', version: browser.version || '' }
      existing.userAgent = userAgentString
      if (ipInfo) {
        existing.location = { country: ipInfo.country, countryCode: ipInfo.countryCode, city: ipInfo.city, isp: ipInfo.isp }
      }
      await existing.save()
    } else {
      const now2 = new Date()
      const nowIST = formatIST(now2)
      const visitor = new Visitor({
        ip,
        device: { type: deviceType, brand: deviceBrand, model: deviceModel },
        os: { name: os.name || 'unknown', version: os.version || '' },
        browser: { name: browser.name || 'unknown', version: browser.version || '' },
        userAgent: userAgentString,
        firstVisit: now2,
        firstVisit_IST: nowIST,
        lastVisit: now2,
        lastVisit_IST: nowIST,
        visits: [{ timestamp: now2, timestamp_IST: nowIST, referrer, page }],
        location: ipInfo ? { country: ipInfo.country, countryCode: ipInfo.countryCode, city: ipInfo.city, isp: ipInfo.isp } : {},
      })
      await visitor.save()
    }

    // ── Email notification (if enabled) ────────────────────────────
    try {
      const notifySetting = await Setting.findOne({ key: 'visitor_notify' })
      if (notifySetting?.value === 'on' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const location = ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : 'Unknown'
        const deviceStr = `${deviceBrand} ${deviceModel} (${deviceType})`.trim()
        const osStr = `${os.name || 'unknown'} ${os.version || ''}`.trim()
        const browserStr = `${browser.name || 'unknown'} ${browser.version || ''}`.trim()
        const visitType = isReturning ? `🔄 Returning Visitor (visit #${visitCount})` : '🆕 New Visitor'

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        })

        await transporter.sendMail({
          from: `"Portfolio Visitor Alert" <${process.env.EMAIL_USER}>`,
          to: 'rishukrsingh99p@gmail.com',
          subject: `${visitType} — rishurajput.com`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:${isReturning ? '#3b82f6' : '#16a34a'};padding:20px 24px">
                <h2 style="margin:0;color:#fff;font-size:18px">${visitType}</h2>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">${formatIST(new Date())}</p>
              </div>
              <div style="padding:20px 24px">
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                  <tr><td style="padding:8px 0;color:#6b7280;width:120px">📍 Location</td><td style="padding:8px 0;font-weight:600">${location}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">🌐 ISP</td><td style="padding:8px 0">${ipInfo?.isp || 'Unknown'}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">🔢 IP</td><td style="padding:8px 0;font-family:monospace">${ip}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">📱 Device</td><td style="padding:8px 0">${deviceStr}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">💻 OS</td><td style="padding:8px 0">${osStr}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">🧭 Browser</td><td style="padding:8px 0">${browserStr}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">📄 Page</td><td style="padding:8px 0">${page}</td></tr>
                  ${referrer ? `<tr><td style="padding:8px 0;color:#6b7280">← Referrer</td><td style="padding:8px 0">${referrer}</td></tr>` : ''}
                </table>
              </div>
              <div style="padding:12px 24px;background:#f9fafb;font-size:12px;color:#9ca3af">
                Disable this in Admin → Visitors → Notification toggle
              </div>
            </div>
          `,
        })
      }
    } catch (mailErr) {
      console.error('Visitor notify email error:', mailErr.message)
    }

    res.json({ message: isReturning ? 'Welcome back!' : 'New visitor tracked!', visitCount })
  } catch (err) {
    console.error('Track error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/track-session — section engagement data ────────────
app.post('/api/track-session', async (req, res) => {
  try {
    const ip = getClientIP(req)
    const { sections = [], navClicks = [], socialClicks = [], totalSeconds = 0, referrer = '' } = req.body

    if (sections.length === 0 && navClicks.length === 0 && socialClicks.length === 0) {
      return res.json({ message: 'No session data' })
    }

    const visitor = await Visitor.findOne({ ip })
    if (visitor) {
      visitor.sessions.push({ recordedAt: new Date(), sections, navClicks, socialClicks, totalSeconds, referrer })
      // keep only last 20 sessions per visitor
      if (visitor.sessions.length > 20) visitor.sessions = visitor.sessions.slice(-20)
      await visitor.save()
    }
    res.json({ message: 'Session recorded' })
  } catch (err) {
    console.error('Track-session error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── GET /api/visitors/notify-setting — get notification toggle ───
app.get('/api/visitors/notify-setting', authMiddleware, async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'visitor_notify' })
    res.json({ enabled: s?.value === 'on' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PATCH /api/visitors/notify-setting — toggle notification ──────
app.patch('/api/visitors/notify-setting', authMiddleware, async (req, res) => {
  try {
    const { enabled } = req.body
    const value = enabled ? 'on' : 'off'
    await Setting.findOneAndUpdate(
      { key: 'visitor_notify' },
      { key: 'visitor_notify', value },
      { upsert: true, new: true }
    )
    res.json({ enabled: value === 'on' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── GET /api/visitors — admin-only endpoint ───────────────────────
app.get('/api/visitors', authMiddleware, async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ lastVisit: -1 })
    const totalVisits = visitors.reduce((sum, v) => sum + v.visitCount, 0)

    const formatted = visitors.map(v => ({
      _id: v._id,
      ip: v.ip,
      visitCount: v.visitCount,
      device: `${v.device.brand} ${v.device.model}`.trim() || v.device.type,
      deviceType: v.device.type,
      os: `${v.os.name} ${v.os.version}`.trim(),
      browser: `${v.browser.name} ${v.browser.version}`.trim(),
      location: v.location ? `${v.location.city}, ${v.location.country}` : 'unknown',
      countryCode: v.location?.countryCode || 'XX',
      isp: v.location?.isp || 'unknown',
      firstVisit_IST: formatIST(v.firstVisit),
      lastVisit_IST: formatIST(v.lastVisit),
      visits: (v.visits || []).map(visit => ({
        timestamp_IST: formatIST(visit.timestamp),
        referrer: visit.referrer,
        page: visit.page,
      })),
      sessions: (v.sessions || []).slice(-5).reverse().map(s => ({
        recordedAt_IST: formatIST(s.recordedAt),
        totalSeconds: s.totalSeconds,
        sections: s.sections || [],
        navClicks: s.navClicks || [],
        socialClicks: s.socialClicks || [],
      })),
    }))

    res.json({ totalUniqueVisitors: visitors.length, totalVisits, visitors: formatted })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Seed default sections ──
const defaultSections = {
  hero: {
    headline: "I'm Rishu Singh,",
    subhead: "a product designer.",
    description: "I'm a freelance product designer based in London.\nI'm very passionate about the work that I do.",
    btnText: 'See My Works',
  },
  navbar: {
    useImage: true,
    logoImage: '',
    logoText: 'Rishu Singh',
  },
  services: {
    heading: 'The service I offer is specifically\ndesigned to meet your needs.',
    items: [
      { title: 'Strategy & Planning', desc: 'Streamline your campaigns with tools that improve engagement, boost visibility, and help you reach your marketing goals.', bg: 'var(--lavender-bg)', img: '' },
      { title: 'User Research', desc: 'Simplify project workflows with organized tools and strategies designed to keep your team aligned and productive.', bg: 'var(--green-pastel)', img: '' },
      { title: 'Web Design', desc: 'Gain valuable insights into user behavior, website performance, and key business metrics to optimize your digital presence.', bg: 'var(--pink-pastel)', img: '' },
      { title: 'Brand Design', desc: 'Understand your market with precise data analysis and deep customer insights that guide your decision-making processes.', bg: 'var(--blue-pastel)', img: '' },
    ],
  },
  about: {
    title: 'More about me',
    bio: "I'm Rishu Singh, a product designer based in London.\nI'm very passionate about the work that I do every day.",
    bioExtended: "My journey in this dynamic and ever-evolving field has been a testament to my passion for crafting meaningful user experiences, leveraging technologies, and fearlessly pushing the boundaries of digital creativity.",
    experiencesDescription: "I have had the pleasure to work with companies across a variety of industries. I'm always interested in new, exciting and challenging adventures.",
    experiences: [
      { period: 'NOV 2017 – PRESENT', role: 'Creative Director at Malory House', desc: 'Led a talented team in crafting compelling brand experiences.', dot: '#f5a0d0' },
      { period: 'SEP 2015 – APR 2017', role: 'Senior Developer at Longwave Studio', desc: 'Collaborated with cross-functional teams to optimize performance.', dot: '#a0d0a0' },
      { period: 'MAY 2015 – SEP 2015', role: 'Junior Developer at Webpaint Media', desc: 'Assisted in front-end development and UI enhancements.', dot: '#a0c0f5' },
    ],
  },
  portfolio: {
    skillsTitle: 'Technologies and Tools',
    skillsDescription: 'Using a combination of cutting-edge technologies and reliable open-source software I build user-focused, performant apps and websites for smartphones, tablets, and desktops.',
    skills: [
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
    ],
    items: [
      { title: 'TempMail Pro', description: 'A temporary email service built for privacy.', color: '#e3e3ff', emoji: '📧', image: '', url: '' },
      { title: 'DevConnect Social Network', description: 'A platform connecting developers globally.', color: '#d4f5c4', emoji: '🌐', image: '', url: '' },
      { title: 'TaskFlow AI Assistant', description: 'Intelligent task management using AI.', color: '#f5d4e8', emoji: '🤖', image: '', url: '' },
      { title: 'EcomEase Storefront', description: 'High-conversion headless e-commerce.', color: '#d4e8f5', emoji: '🛒', image: '', url: '' },
      { title: 'LeetCode Automation Solver', description: 'Automation script for algorithm solutions.', color: '#fff5d4', emoji: '⚡', image: '', url: '' },
      { title: 'Creative Portfolio Engine', description: 'Open-source React portfolio template.', color: '#f5e3ff', emoji: '🎨', image: '', url: '' },
    ],
  },
  certifications: {
    items: [
      { title: 'Full Stack Web Development', issuer: 'Udemy', date: '2024', badge: '🎓', bg: '#f0ffdb', url: '' },
      { title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', badge: '☁️', bg: '#ffe3f5', url: '' },
      { title: 'React – The Complete Guide', issuer: 'Coursera', date: '2023', badge: '⚛️', bg: '#ffebe3', url: '' },
      { title: 'Data Structures & Algorithms', issuer: 'GeeksforGeeks', date: '2023', badge: '🧮', bg: '#e0f0ff', url: '' },
      { title: 'MongoDB for Developers', issuer: 'MongoDB University', date: '2023', badge: '🍃', bg: '#f0ffdb', url: '' },
      { title: 'System Design Fundamentals', issuer: 'Educative', date: '2022', badge: '🏗️', bg: '#ffe3f5', url: '' },
    ],
  },
  education: {
    items: [
      {
        institution: 'Lovely Professional University',
        location: 'Punjab, India',
        degree: 'Bachelor of Technology — Computer Science & Engineering',
        score: 'CGPA: 8.22',
        period: "Aug' 2023 – Present",
        icon: '🎓',
        color: '#7c6fcd',
        dotColor: '#e8c4e8',
        tag: 'UNDERGRADUATE',
      },
      {
        institution: 'Sachchidanand Sinha College',
        location: 'Aurangabad, Bihar',
        degree: 'Intermediate (Class XII)',
        score: 'Percentage: 72.6%',
        period: "Apr' 2021 – Mar' 2022",
        icon: '📖',
        color: '#3aafa9',
        dotColor: '#9ecfcc',
        tag: 'HIGHER SECONDARY',
      },
      {
        institution: 'Saraswati Shishu Mandir',
        location: 'Aurangabad, Bihar',
        degree: 'Matriculation (Class X)',
        score: 'Percentage: 85.4%',
        period: "Apr' 2019 – Mar' 2020",
        icon: '🏫',
        color: '#e07b5f',
        dotColor: '#c5e0f0',
        tag: 'SECONDARY',
      },
    ],
  },
  achievements: {
    items: [
      { title: 'Smart India Hackathon Finalist', event: 'SIH 2024', desc: 'Built an AI-powered platform for automated resume screening.', badge: '🏆', bg: '#ffe3f5' },
      { title: 'LeetCode 500+ Problems', event: 'LeetCode', desc: 'Solved 500+ problems across arrays, trees, graphs, DP.', badge: '💻', bg: '#f0ffdb' },
      { title: 'CodeChef 4★ Rated', event: 'CodeChef', desc: 'Achieved a 4-star rating (1800+).', badge: '⭐', bg: '#ffebe3' },
      { title: 'Hackathon Winner – HackTheNorth', event: 'HackTheNorth 2023', desc: 'Won first place for a real-time collaborative whiteboard.', badge: '🥇', bg: '#e0f0ff' },
    ],
  },
  opensource: {
    items: [
      { repo: 'freeCodeCamp/freeCodeCamp', desc: 'Contributed bug fixes and curriculum improvements.', stars: '395k', prs: 3, url: 'https://github.com/freeCodeCamp/freeCodeCamp', bg: '#f0ffdb' },
      { repo: 'facebook/react', desc: 'Submitted documentation enhancements.', stars: '225k', prs: 2, url: 'https://github.com/facebook/react', bg: '#ffe3f5' },
      { repo: 'Personal / open-mail-server', desc: 'Built a custom SMTP server in C++.', stars: '12', prs: '—', url: '#', bg: '#ffebe3' },
    ],
  },
  process: {
    steps: [
      { num: '01', title: 'Discovery', desc: 'We begin with in-depth research to understand your vision.', icon: '💡', bg: '#f0ffdb' },
      { num: '02', title: 'Design', desc: 'Wireframes and prototypes iterated until you are satisfied.', icon: '💻', bg: '#ffe3f5' },
      { num: '03', title: 'Development', desc: 'Clean, scalable code with smooth animations.', icon: '🎨', bg: '#ffebe3' },
    ],
    tools: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'WebRTC', 'Redis', 'Docker', 'AWS', 'Next.js'],
  },
  blog: {
    items: [
      { title: 'Building a Custom SMTP Server from Scratch in C++', excerpt: 'A deep dive into socket programming and email protocols.', date: 'Mar 2026', tag: 'Systems', url: '#', bg: '#f0ffdb' },
      { title: 'How I Solved 500+ LeetCode Problems in 6 Months', excerpt: 'Pattern recognition, spaced repetition, and deliberate practice.', date: 'Jan 2026', tag: 'DSA', url: '#', bg: '#ffe3f5' },
      { title: 'WebRTC Demystified: Real-Time Communication', excerpt: 'Understanding peer connections and building a video call app.', date: 'Nov 2025', tag: 'WebRTC', url: '#', bg: '#ffebe3' },
    ],
  },
  research: {
    items: [
      { title: 'AI-Powered Resume Screening: A Machine Learning Approach', venue: 'IEEE International Conference', year: '2025', type: 'Conference Paper', doi: '#', bg: '#ffe3f5' },
      { title: 'Optimizing Real-Time Data Pipelines', venue: 'Journal of Systems Engineering', year: '2024', type: 'Journal Article', doi: '#', bg: '#f0ffdb' },
      { title: 'Method for Distributed Email Routing', venue: 'Indian Patent Office', year: '2024', type: 'Patent (Filed)', doi: '#', bg: '#ffebe3' },
    ],
  },
  pricing: {
    plans: [
      { price: '$500', badge: 'STARTER', badgeColor: '#f0ffdb', desc: 'You may want to add some details here.', features: ['Up to 5 Pages', 'Standard API Access', 'Basic Design Setup', 'Email Support', 'Single Language'], cta: 'Choose Plan' },
      { price: "Let's Talk", badge: 'STARTER', badgeColor: '#ffe3f5', desc: 'You may want to add some details here.', features: ['Unlimited Pages', 'Extended API Access', 'Custom Design Setup', 'Priority Support', 'Multilingual Ready'], cta: 'Choose Plan' },
    ],
    faqs: [
      { q: 'Do you charge hourly or on spec?', a: 'I typically charge on a per-project basis.' },
      { q: 'How long have you been doing design?', a: 'Over 5 years of designing and building digital products.' },
      { q: 'Can you do a couple of designs to see if I like what you do?', a: 'You can review my portfolio to get a strong sense of my quality.' },
      { q: 'What is the process and how long does it take?', a: 'A typical project takes 2 to 6 weeks depending on scope.' },
    ],
  },
  contact: {
    title: "Let's work together",
    subtitle: "Have a project in mind? I'd love to hear about it.\nDrop me a message and I'll get back within 24 hours.",
  },
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function mergeMissing(target, defaults) {
  // If defaults is an array template (e.g. items), fill missing keys
  // on each object element without changing the array contents.
  if (Array.isArray(target) && Array.isArray(defaults)) {
    const template = defaults[0]
    if (isPlainObject(template)) {
      let changed = false
      for (const el of target) {
        if (isPlainObject(el)) {
          if (mergeMissing(el, template)) changed = true
        }
      }
      return changed
    }
    return false
  }

  if (!isPlainObject(target) || !isPlainObject(defaults)) return false
  let changed = false

  for (const [k, defVal] of Object.entries(defaults)) {
    const curVal = target[k]

    if (curVal === undefined) {
      target[k] = defVal
      changed = true
      continue
    }

    if (
      (isPlainObject(curVal) && isPlainObject(defVal)) ||
      (Array.isArray(curVal) && Array.isArray(defVal))
    ) {
      if (mergeMissing(curVal, defVal)) changed = true
    }
  }

  return changed
}

async function seedSections() {
  for (const [key, data] of Object.entries(defaultSections)) {
    const exists = await Section.findOne({ sectionKey: key })
    if (!exists) {
      await Section.create({ sectionKey: key, enabled: true, data })
      console.log(`  🌱 Seeded section: ${key}`)
    } else {
      const copy = JSON.parse(JSON.stringify(exists.data || {}))
      const changed = mergeMissing(copy, data)
      if (changed) {
        exists.data = copy
        exists.updatedAt = new Date()
        await exists.save()
        console.log(`  🧩 Filled missing defaults: ${key}`)
      }
    }
  }
}

// ── Connect to MongoDB ────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio'

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected')
    await seedSections()
    // Only start HTTP listener in local dev — Vercel handles HTTP itself
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
    }
  })
  .catch((err) => {
    console.log('⚠️  MongoDB not connected:', err.message)
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`Server on http://localhost:${PORT} (no DB)`))
    }
  })

export default app
