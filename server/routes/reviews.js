import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Initialize Google OAuth Client with a placeholder if not set
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const client = new OAuth2Client(CLIENT_ID);

// ── PUBLIC ENDPOINTS ──

// Fetch all approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).select('-googleId -email').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Fetch user's own review by Google token
router.post('/me', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });
  try {
    let payload;
    if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } else {
      const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
      payload = ticket.getPayload();
    }
    const { sub: googleId } = payload;
    const review = await Review.findOne({ googleId });
    res.json({ review });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Submit or Update a review using a Google ID token
router.post('/', async (req, res) => {
  const { token, role, text, stars } = req.body;

  if (!token || !text) {
    return res.status(400).json({ error: 'Token and text are required' });
  }

  try {
    // Verify the Google token
    let payload;
    
    if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        // Fallback for missing Client ID during testing
        payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } else {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
        });
        payload = ticket.getPayload();
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    // UPSERT LOGIC: Check if the user already submitted a review
    const existingReview = await Review.findOne({ googleId });
    
    let review;
    let isNewReview = false;

    if (existingReview) {
      // Update existing
      existingReview.text = text;
      existingReview.role = role || 'Client';
      existingReview.stars = Number(stars) || 5;
      existingReview.avatar = avatar;
      existingReview.name = name;
      review = await existingReview.save();
    } else {
      // Create new
      isNewReview = true;
      review = await Review.create({
        googleId,
        name,
        email,
        avatar,
        role: role || 'Client',
        text,
        stars: Number(stars) || 5,
        approved: true // Auto-approved for now
      });

      // Send Email Notification for NEW review
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
          await transporter.sendMail({
            from: `"Portfolio Reviews" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: 'rishukrsingh99p@gmail.com', // Primary notification receiver
            subject: `New Portfolio Review from ${name}`,
            text: `You just received a new review on your portfolio!\n\nName: ${name}\nEmail: ${email}\nStars: ${stars}\n\nReview:\n${text}`,
          });
          console.log('✅ Review notification email sent to rishukrsingh99p@gmail.com');
        } catch (mailErr) {
          console.error('❌ Failed to send review notification:', mailErr.message);
        }
      }
    }

    res.status(200).json({ success: true, review, isNew: isNewReview });
  } catch (error) {
    console.error('Error verifying Google token or saving review:', error);
    res.status(401).json({ error: 'Invalid token or server error' });
  }
});


// ── ADMIN ENDPOINTS ──

// Fetch all reviews (including pending/rejected if any)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching admin reviews' });
  }
});

// Update a review 
router.put('/admin/:id', auth, async (req, res) => {
  const { text, role, stars, approved } = req.body;
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (text !== undefined) review.text = text;
    if (role !== undefined) review.role = role;
    if (stars !== undefined) review.stars = stars;
    if (approved !== undefined) review.approved = approved;

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating review' });
  }
});

// Delete a review
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting review' });
  }
});

export default router;
