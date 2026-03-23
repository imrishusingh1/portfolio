import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import sectionRoutes from './routes/sections.js'
import uploadRoutes from './routes/upload.js'
import Section from './models/Section.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ──
app.use('/api/auth', authRoutes)
app.use('/api/sections', sectionRoutes)
app.use('/api/upload', uploadRoutes)

// ── Contact messages (kept from original) ──
const messageSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})
const Message = mongoose.model('Message', messageSchema)

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' })
  try {
    const doc = await Message.create({ name, email, message })
    console.log('📨 New message from:', name, email)
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

// ── Seed default sections ──
const defaultSections = {
  hero: {
    headline: "I'm Rishu Singh,",
    subhead: "a product designer.",
    description: "I'm a freelance product designer based in London.\nI'm very passionate about the work that I do.",
    btnText: 'See My Works',
  },
  services: {
    items: [
      { title: 'Strategy & Planning', desc: 'Streamline your campaigns with tools that improve engagement, boost visibility, and help you reach your marketing goals.', bg: 'var(--lavender-bg)' },
      { title: 'User Research', desc: 'Simplify project workflows with organized tools and strategies designed to keep your team aligned and productive.', bg: 'var(--green-pastel)' },
      { title: 'Web Design', desc: 'Gain valuable insights into user behavior, website performance, and key business metrics to optimize your digital presence.', bg: 'var(--pink-pastel)' },
      { title: 'Brand Design', desc: 'Understand your market with precise data analysis and deep customer insights that guide your decision-making processes.', bg: 'var(--blue-pastel)' },
    ],
  },
  about: {
    title: 'More about me',
    bio: "I'm Rishu Singh, a product designer based in London.\nI'm very passionate about the work that I do every day.",
    bioExtended: "My journey in this dynamic and ever-evolving field has been a testament to my passion for crafting meaningful user experiences, leveraging technologies, and fearlessly pushing the boundaries of digital creativity.",
    experiences: [
      { period: 'NOV 2017 – PRESENT', role: 'Creative Director at Malory House', desc: 'Led a talented team in crafting compelling brand experiences.', dot: '#f5a0d0' },
      { period: 'SEP 2015 – APR 2017', role: 'Senior Developer at Longwave Studio', desc: 'Collaborated with cross-functional teams to optimize performance.', dot: '#a0d0a0' },
      { period: 'MAY 2015 – SEP 2015', role: 'Junior Developer at Webpaint Media', desc: 'Assisted in front-end development and UI enhancements.', dot: '#a0c0f5' },
    ],
  },
  portfolio: {
    items: [
      { title: 'Flavor Finder', description: 'A culinary discovery platform that helps users find recipes based on available ingredients.', emoji: '🍽️' },
      { title: 'EcoTrack', description: 'Environmental tracking dashboard visualizing carbon footprint data in real-time.', emoji: '🌿' },
      { title: 'SoundScape', description: 'An ambient soundscape generator that creates immersive audio environments.', emoji: '🎧' },
    ],
  },
  certifications: {
    items: [
      { title: 'Full Stack Web Development', issuer: 'Udemy', date: '2024', badge: '🎓', bg: '#f0ffdb' },
      { title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', badge: '☁️', bg: '#ffe3f5' },
      { title: 'React – The Complete Guide', issuer: 'Coursera', date: '2023', badge: '⚛️', bg: '#ffebe3' },
      { title: 'Data Structures & Algorithms', issuer: 'GeeksforGeeks', date: '2023', badge: '🧮', bg: '#e0f0ff' },
      { title: 'MongoDB for Developers', issuer: 'MongoDB University', date: '2023', badge: '🍃', bg: '#f0ffdb' },
      { title: 'System Design Fundamentals', issuer: 'Educative', date: '2022', badge: '🏗️', bg: '#ffe3f5' },
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

async function seedSections() {
  for (const [key, data] of Object.entries(defaultSections)) {
    const exists = await Section.findOne({ sectionKey: key })
    if (!exists) {
      await Section.create({ sectionKey: key, enabled: true, data })
      console.log(`  🌱 Seeded section: ${key}`)
    }
  }
}

// ── Connect & Start ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio'
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected')
    await seedSections()
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.log('⚠️  MongoDB not connected:', err.message)
    // Start server anyway for dev
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT} (no DB)`))
  })
