import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import auth from '../middleware/auth.js'
import Setting from '../models/Setting.js'

const router = Router()

// ── Configure Cloudinary ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Cloudinary Storages ──────────────────────────────────────────
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'portfolio', public_id: 'profile', overwrite: true, resource_type: 'image' },
})

const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'portfolio', public_id: 'logo', overwrite: true, resource_type: 'image' },
})

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'portfolio', public_id: 'resume', overwrite: true, resource_type: 'raw', format: 'pdf' },
})

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'portfolio/images',
    resource_type: 'image',
    public_id: `img-${Date.now()}`,
  }),
})

const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 10 * 1024 * 1024 } })
const uploadLogo    = multer({ storage: logoStorage,    limits: { fileSize: 10 * 1024 * 1024 } })
const uploadResume  = multer({ storage: resumeStorage,  limits: { fileSize: 10 * 1024 * 1024 } })
const uploadImage   = multer({ storage: imageStorage,   limits: { fileSize: 10 * 1024 * 1024 } })

// ── Profile Picture ──────────────────────────────────────────────
router.post('/profile', auth, uploadProfile.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = req.file.path
  await Setting.findOneAndUpdate({ key: 'profile_pic_url' }, { value: url }, { upsert: true, new: true })
  res.json({ success: true, path: url })
})

router.get('/profile-pic', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'profile_pic_url' })
    if (s?.value) return res.redirect(s.value)
    res.status(404).send('Not found')
  } catch { res.status(404).send('Not found') }
})

// ── Site Logo ────────────────────────────────────────────────────
router.post('/logo', auth, uploadLogo.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = req.file.path
  await Setting.findOneAndUpdate({ key: 'logo_url' }, { value: url }, { upsert: true, new: true })
  res.json({ success: true, path: url })
})

router.get('/logo-pic', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'logo_url' })
    if (s?.value) return res.redirect(s.value)
    res.status(404).send('Not found')
  } catch { res.status(404).send('Not found') }
})

// ── Resume (PDF) ─────────────────────────────────────────────────
router.post('/resume', auth, uploadResume.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = req.file.path
  await Setting.findOneAndUpdate({ key: 'resume_url' }, { value: url }, { upsert: true, new: true })
  res.json({ success: true, path: url })
})

router.get('/resume/status', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'resume_url' })
    res.json({ exists: !!s?.value })
  } catch { res.json({ exists: false }) }
})

router.get('/download-resume', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'resume_url' })
    if (s?.value) return res.redirect(s.value)
    res.status(404).send('Resume not found')
  } catch { res.status(404).send('Resume not found') }
})

// ── Generic Image ────────────────────────────────────────────────
router.post('/image', auth, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ success: true, path: req.file.path })
})

export default router
