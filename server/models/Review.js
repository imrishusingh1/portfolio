import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true, default: 'Client' },
  text: { type: String, required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  avatar: { type: String },
  googleId: { type: String, required: true },
  approved: { type: Boolean, default: true }, // Auto-approve for portfolio purposes
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema);
