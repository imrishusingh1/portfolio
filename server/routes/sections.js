import { Router } from 'express'
import Section from '../models/Section.js'
import auth from '../middleware/auth.js'

const router = Router()

/* ───── PUBLIC ───── */

// Get all enabled sections
router.get('/', async (_req, res) => {
  const sections = await Section.find({ enabled: true })
  const map = {}
  sections.forEach(s => { map[s.sectionKey] = s.data })
  res.json(map)
})

// Get single section
router.get('/:key', async (req, res) => {
  const sec = await Section.findOne({ sectionKey: req.params.key })
  if (!sec) return res.status(404).json({ error: 'Section not found' })
  if (!sec.enabled) return res.status(404).json({ error: 'Section disabled' })
  res.json(sec.data)
})

/* ───── ADMIN ───── */

// Get ALL sections (including disabled)
router.get('/admin/all', auth, async (_req, res) => {
  const sections = await Section.find().sort({ sectionKey: 1 })
  res.json(sections)
})

// Update section data
router.put('/admin/:key', auth, async (req, res) => {
  const { data } = req.body
  const sec = await Section.findOneAndUpdate(
    { sectionKey: req.params.key },
    { data, updatedAt: new Date() },
    { new: true, upsert: true }
  )
  res.json(sec)
})

// Toggle section enabled/disabled
router.patch('/admin/:key/toggle', auth, async (req, res) => {
  const sec = await Section.findOne({ sectionKey: req.params.key })
  if (!sec) return res.status(404).json({ error: 'Section not found' })
  sec.enabled = !sec.enabled
  sec.updatedAt = new Date()
  await sec.save()
  res.json({ sectionKey: sec.sectionKey, enabled: sec.enabled })
})

export default router
