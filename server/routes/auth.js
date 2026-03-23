import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import auth, { getJWTSecret } from '../middleware/auth.js'

const router = Router()

// One-time admin setup — blocked after first admin exists
router.post('/setup', async (req, res) => {
  const exists = await Admin.countDocuments()
  if (exists > 0) return res.status(403).json({ error: 'Admin already exists' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await Admin.create({ email, passwordHash })

  const token = jwt.sign({ id: admin._id }, getJWTSecret(), { expiresIn: '7d' })
  res.status(201).json({ token, email: admin.email })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const admin = await Admin.findOne({ email: email?.toLowerCase() })
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, admin.passwordHash)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: admin._id }, getJWTSecret(), { expiresIn: '7d' })
  res.json({ token, email: admin.email })
})

// Check if admin exists (for showing setup vs login form)
router.get('/status', async (_req, res) => {
  const count = await Admin.countDocuments()
  res.json({ adminExists: count > 0 })
})

// Verify token
router.get('/check', auth, (_req, res) => {
  res.json({ valid: true })
})

export default router
