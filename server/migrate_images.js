import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'

// Load environment variables
dotenv.config()

// Connect to MongoDB Atlas
const MONGO_URI = 'mongodb+srv://imrishusigh1:%40Hanuman2002@cluster0.srsmwai.mongodb.net/portfolio?appName=Cluster0'
mongoose.connect(MONGO_URI)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadsDir = path.join(process.cwd(), 'uploads')
const files = fs.readdirSync(uploadsDir)

import Setting from './models/Setting.js'
import Section from './models/Section.js'

async function migrate() {
  console.log('🚀 Starting Cloudinary migration...\n')

  for (const file of files) {
    const filePath = path.join(uploadsDir, file)
    console.log(`Uploading: ${file}...`)

    try {
      if (file.startsWith('profile.')) {
        const res = await cloudinary.uploader.upload(filePath, { folder: 'portfolio', public_id: 'profile', overwrite: true })
        await Setting.findOneAndUpdate({ key: 'profile_pic_url' }, { value: res.secure_url }, { upsert: true, new: true })
        console.log(`✅ Saved profile pic: ${res.secure_url}`)
      } 
      else if (file.startsWith('logo.')) {
        const res = await cloudinary.uploader.upload(filePath, { folder: 'portfolio', public_id: 'logo', overwrite: true })
        await Setting.findOneAndUpdate({ key: 'logo_url' }, { value: res.secure_url }, { upsert: true, new: true })
        console.log(`✅ Saved logo: ${res.secure_url}`)
      } 
      else if (file === 'resume.pdf') {
        const res = await cloudinary.uploader.upload(filePath, { folder: 'portfolio', public_id: 'resume', overwrite: true, resource_type: 'raw', format: 'pdf' })
        await Setting.findOneAndUpdate({ key: 'resume_url' }, { value: res.secure_url }, { upsert: true, new: true })
        console.log(`✅ Saved resume: ${res.secure_url}`)
      } 
      else if (file.startsWith('img-')) {
        const res = await cloudinary.uploader.upload(filePath, { folder: 'portfolio/images', public_id: file.split('.')[0] })
        const oldUrl = `/uploads/${file}`
        const newUrl = res.secure_url
        
        // Find any section that contains this image URL and replace it
        const sections = await Section.find({ 'data': { $regex: file } })
        for (let sec of sections) {
          let strData = JSON.stringify(sec.data)
          strData = strData.split(oldUrl).join(newUrl) // String replacement
          sec.data = JSON.parse(strData)
          await sec.save()
        }
        console.log(`✅ Uploaded & updated references for: ${file}`)
      }
    } catch (e) {
      console.error(`❌ Failed to upload ${file}:`, e.message)
    }
  }

  console.log('\n🎉 All uploads finished! Migrating complete.')
  process.exit(0)
}

migrate()
