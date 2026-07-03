// server/src/models/Payment.js
// Payment record — har booking ke saath payment track hoga

const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },

    // Razorpay IDs
    razorpayOrderId:   { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    // Amount paise mein (INR * 100)
    // Rs. 500 = 50000 paise
    amount:   { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    // Payment status
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },

    // Refund info
    refundId:     { type: String, default: null },
    refundAmount: { type: Number, default: null },
    refundedAt:   { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
)

paymentSchema.index({ appointmentId: 1 })
paymentSchema.index({ patientId: 1 })
paymentSchema.index({ razorpayOrderId: 1 })

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment
