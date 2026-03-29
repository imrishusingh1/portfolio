import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Section from './models/Section.js'
import Setting from './models/Setting.js'

dotenv.config()

mongoose.connect('mongodb+srv://imrishusigh1:%40Hanuman2002@cluster0.srsmwai.mongodb.net/portfolio?appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB')
    
    // Get the Cloudinary URL for logo and profile pic
    const logoSetting = await Setting.findOne({ key: 'logo_url' })
    const logoUrl = logoSetting?.value || ''
    
    const profileSetting = await Setting.findOne({ key: 'profile_pic_url' })
    const profileUrl = profileSetting?.value || ''
    
    const sections = await Section.find()
    
    for (let sec of sections) {
        let strData = JSON.stringify(sec.data)
        let changed = false
        
        // Update old logo references
        if (strData.includes('/uploads/logo.png') && logoUrl) {
            strData = strData.split('/uploads/logo.png').join(logoUrl)
            changed = true
        }
        
        // Update old profile references (just in case they were used elsewhere)
        if (strData.includes('/uploads/profile.jpg') && profileUrl) {
            strData = strData.split('/uploads/profile.jpg').join(profileUrl)
            changed = true
        }
        
        // Final regex catch for any leftover img- files if they didn't match the string perfectly
        if (changed) {
            sec.data = JSON.parse(strData)
            await sec.save()
            console.log(`✅ Updated ${sec.identifier}`)
        }
    }
    
    console.log('\n🎉 Overwrites applied.')
    process.exit(0)
  })
