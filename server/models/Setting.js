import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema({
  key:   { type: String, unique: true, required: true },
  value: { type: String, required: true },
})

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema)
