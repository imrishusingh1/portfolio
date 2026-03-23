import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema({
  sectionKey: { type: String, required: true, unique: true },
  enabled:    { type: Boolean, default: true },
  data:       { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt:  { type: Date, default: Date.now },
})

sectionSchema.pre('save', function () { this.updatedAt = new Date() })

export default mongoose.model('Section', sectionSchema)
