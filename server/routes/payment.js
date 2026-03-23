import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const router = express.Router()

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay keys not configured in .env')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

// POST /api/payment/create-order
// Body: { amount: number (in INR), planName: string, currency?: string }
router.post('/create-order', async (req, res) => {
  try {
    const razorpay = getRazorpay()
    const { amount, planName, currency = 'INR' } = req.body
    if (!amount || !planName) return res.status(400).json({ error: 'amount and planName are required' })

    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { plan: planName },
    }
    const order = await razorpay.orders.create(options)
    res.json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Payment order error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to create payment order' })
  }
})

// POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generated === razorpay_signature) {
      console.log(`✅ Payment verified: ${razorpay_payment_id}`)
      res.json({ success: true, paymentId: razorpay_payment_id })
    } else {
      console.warn('❌ Payment signature mismatch')
      res.status(400).json({ success: false, error: 'Invalid payment signature' })
    }
  } catch (err) {
    console.error('Verify error:', err.message)
    res.status(500).json({ error: 'Verification failed' })
  }
})

export default router
