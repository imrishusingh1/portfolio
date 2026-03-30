import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import auth, { getJWTSecret } from '../middleware/auth.js'
import nodemailer from 'nodemailer'

const router = Router()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

// One-time admin setup — blocked after first admin exists
router.post('/setup', async (req, res) => {
  const exists = await Admin.countDocuments()
  if (exists > 0) return res.status(403).json({ error: 'Admin already exists' })

  const { email, password, mobile } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await Admin.create({ email, passwordHash, mobile: mobile || '' })

  const token = jwt.sign({ id: admin._id }, getJWTSecret(), { expiresIn: '7d' })
  res.status(201).json({ token, email: admin.email })
})

// Login - Phase 1: Sends OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const admin = await Admin.findOne({ email: email?.toLowerCase() })
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, admin.passwordHash)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  admin.otp = otp
  admin.otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  await admin.save()

  // Send OTP
  try {
    await transporter.sendMail({
      from: `"Portfolio Security" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: `Your Admin Login Code is ${otp}`,
      text: `Your one-time password to log into the Admin Dashboard is: ${otp}\nThis code will expire in 5 minutes.`,
      html: `<h2>Admin Dashboard Login</h2><p>Your one-time password is: <strong style="font-size:24px; color:#5865F2;">${otp}</strong></p><p>This code expires in 5 minutes.</p>`,
    })
  } catch (err) {
    console.error('OTP Send Error:', err)
  }

  res.json({ otpRequired: true, email: admin.email })
})

// Login - Phase 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  const admin = await Admin.findOne({ email: email?.toLowerCase() })
  if (!admin) return res.status(401).json({ error: 'Admin not found' })

  if (!admin.otp || admin.otp !== otp) {
    return res.status(401).json({ error: 'Invalid or incorrect code' })
  }
  
  if (new Date() > admin.otpExpires) {
    return res.status(401).json({ error: 'Code has expired. Please log in again.' })
  }

  // Clear OTP
  admin.otp = undefined
  admin.otpExpires = undefined
  await admin.save()

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
