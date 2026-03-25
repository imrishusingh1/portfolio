import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import auth from '../middleware/auth.js'

const router = Router()

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `resume${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

// Upload resume (auth required)
router.post('/resume', auth, upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ success: true, path: `/uploads/${req.file.filename}` })
})

// Check if resume exists
router.get('/resume/status', (_req, res) => {
  const resumePath = path.join(uploadsDir, 'resume.pdf')
  res.json({ exists: fs.existsSync(resumePath) })
})

// Download resume
router.get('/download-resume', (req, res) => {
  const resumePath = path.join(uploadsDir, 'resume.pdf')
  if (fs.existsSync(resumePath)) {
    res.download(resumePath, 'resume.pdf')
  } else {
    res.status(404).send('Resume not found')
  }
})

// Configure multer for profile pictures
const storageProfile = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `profile${ext}`)
  },
})

const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// Upload profile picture (auth required)
router.post('/profile', auth, uploadProfile.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  // Remove old profile pics with different extensions to avoid duplicates
  const files = fs.readdirSync(uploadsDir)
  files.forEach(f => {
    if (f.startsWith('profile.') && f !== req.file.filename) {
      fs.unlinkSync(path.join(uploadsDir, f))
    }
  })
  res.json({ success: true, path: `/uploads/${req.file.filename}` })
})

// Configure multer for site logo
const storageLogo = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `logo${ext}`)
  },
})

const uploadLogo = multer({
  storage: storageLogo,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// Upload site logo (auth required)
router.post('/logo', auth, uploadLogo.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const files = fs.readdirSync(uploadsDir)
  files.forEach(f => {
    if (f.startsWith('logo.') && f !== req.file.filename) {
      fs.unlinkSync(path.join(uploadsDir, f))
    }
  })
  res.json({ success: true, path: `/uploads/${req.file.filename}` })
})

// Get current site logo
router.get('/logo-pic', (req, res) => {
  const files = fs.readdirSync(uploadsDir)
  const logoFile = files.find(f => f.startsWith('logo.'))
  if (logoFile) {
    res.sendFile(path.join(uploadsDir, logoFile))
  } else {
    res.status(404).send('Not found')
  }
})

// Configure multer for generic images (thumbnails, etc.)
const storageImage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `img-${Date.now()}${ext}`)
  },
})

const uploadImage = multer({
  storage: storageImage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// Generic image upload (auth required)
router.post('/image', auth, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ success: true, path: `/uploads/${req.file.filename}` })
})

// Get current profile picture
router.get('/profile-pic', (req, res) => {
  const files = fs.readdirSync(uploadsDir)
  const profileFile = files.find(f => f.startsWith('profile.'))
  if (profileFile) {
    res.sendFile(path.join(uploadsDir, profileFile))
  } else {
    res.status(404).send('Not found')
  }
})

export default router
