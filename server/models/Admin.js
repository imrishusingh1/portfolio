import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  mobile:       { type: String, default: '' },
  otp:          { type: String },
  otpExpires:   { type: Date },
  createdAt:    { type: Date, default: Date.now },
})

export default mongoose.model('Admin', adminSchema)
