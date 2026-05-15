import { Router } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import auth from '../middleware/auth.js'
import Setting from '../models/Setting.js'

const router = Router()

// ── Configure Cloudinary ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Helper: upload a base64 data URI to Cloudinary ───────────────
async function uploadBase64(dataUri, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(dataUri, options, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

// ── Profile Picture (base64 JSON) ────────────────────────────────
router.post('/profile', auth, async (req, res) => {
  try {
    const { data } = req.body   // data = "data:image/...;base64,..."
    if (!data) return res.status(400).json({ error: 'No file data provided' })
    const result = await uploadBase64(data, {
      folder: 'portfolio', public_id: 'profile', overwrite: true, resource_type: 'image',
    })
    const url = result.secure_url
    await Setting.findOneAndUpdate({ key: 'profile_pic_url' }, { value: url }, { upsert: true, new: true })
    res.json({ success: true, path: url })
  } catch (err) {
    console.error('Profile upload error:', err)
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
})

router.get('/profile-pic', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'profile_pic_url' })
    if (s?.value) return res.redirect(s.value)
    res.status(404).send('Not found')
  } catch { res.status(404).send('Not found') }
})

// ── Site Logo (base64 JSON) ───────────────────────────────────────
router.post('/logo', auth, async (req, res) => {
  try {
    const { data } = req.body
    if (!data) return res.status(400).json({ error: 'No file data provided' })
    const result = await uploadBase64(data, {
      folder: 'portfolio', public_id: 'logo', overwrite: true, resource_type: 'image',
    })
    const url = result.secure_url
    await Setting.findOneAndUpdate({ key: 'logo_url' }, { value: url }, { upsert: true, new: true })
    res.json({ success: true, path: url })
  } catch (err) {
    console.error('Logo upload error:', err)
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
})

router.get('/logo-pic', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'logo_url' })
    if (s?.value) return res.redirect(s.value)
    res.status(404).send('Not found')
  } catch { res.status(404).send('Not found') }
})

// ── Resume PDF (base64 JSON) ──────────────────────────────────────
// Vercel serverless can't handle multer multipart — we accept base64 instead.
router.post('/resume', auth, async (req, res) => {
  try {
    const { data } = req.body   // data = "data:application/pdf;base64,..."
    if (!data) return res.status(400).json({ error: 'No file data provided' })
    const result = await uploadBase64(data, {
      folder: 'portfolio',
      public_id: 'resume',
      overwrite: true,
      resource_type: 'raw',
      format: 'pdf',
    })
    const url = result.secure_url
    await Setting.findOneAndUpdate({ key: 'resume_url' }, { value: url }, { upsert: true, new: true })
    res.json({ success: true, path: url })
  } catch (err) {
    console.error('Resume upload error:', err)
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
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
    if (!s?.value) return res.status(404).send('Resume not found. Please upload from Admin Dashboard.')

    // Force browser download by fetching from Cloudinary and streaming with proper headers
    let url = s.value
    // Add fl_attachment to Cloudinary URL so it returns Content-Disposition: attachment
    if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
      url = url.replace('/upload/', '/upload/fl_attachment/')
    }

    const response = await fetch(url)
    if (!response.ok) return res.status(404).send('Resume file unavailable')

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="Rishu_Resume.pdf"')
    res.setHeader('Content-Length', response.headers.get('content-length') || '')

    // Stream the PDF bytes directly to the client
    const reader = response.body.getReader()
    const pump = async () => {
      const { done, value } = await reader.read()
      if (done) return res.end()
      res.write(Buffer.from(value))
      return pump()
    }
    await pump()
  } catch (err) {
    console.error('Resume download error:', err)
    res.status(500).send('Download error')
  }
})

// ── Video CV ─────────────────────────────────────────────────────

// Step 1: Get a signed upload signature (browser will upload directly to Cloudinary)
router.get('/video-cv-signature', auth, (req, res) => {
  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    folder: 'portfolio',
    public_id: 'video_cv',
    overwrite: 'true',
    timestamp,
  }
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)
  res.json({
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    folder: 'portfolio',
    public_id: 'video_cv',
  })
})

// Step 2: After browser uploads to Cloudinary, save the URL
router.post('/video-cv-confirm', auth, async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'No URL provided' })
  await Setting.findOneAndUpdate({ key: 'video_cv_url' }, { value: url }, { upsert: true, new: true })
  res.json({ success: true })
})

router.delete('/video-cv', auth, async (req, res) => {
  await Setting.findOneAndUpdate({ key: 'video_cv_url' }, { value: null }, { upsert: true, new: true })
  res.json({ success: true })
})

router.get('/video-cv-url', async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'video_cv_url' })
    res.json({ url: s?.value || null })
  } catch {
    res.json({ url: null })
  }
})

// ── Generic Image (base64 JSON) ──────────────────────────────────
router.post('/image', auth, async (req, res) => {
  try {
    const { data } = req.body
    if (!data) return res.status(400).json({ error: 'No file data provided' })
    const result = await uploadBase64(data, {
      folder: 'portfolio/images',
      resource_type: 'image',
      public_id: `img-${Date.now()}`,
    })
    res.json({ success: true, path: result.secure_url })
  } catch (err) {
    console.error('Image upload error:', err)
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
})

export default router
