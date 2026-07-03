// server/src/controllers/payment.controller.js
// Razorpay payment flow:
// 1. Frontend: booking request bhejo
// 2. Backend: Razorpay order create karo → orderId return karo
// 3. Frontend: Razorpay checkout open karo (orderId se)
// 4. Patient pays → Razorpay callback aata hai
// 5. Frontend: payment details backend ko bhejo
// 6. Backend: signature verify karo → appointment confirm karo

const crypto    = require('crypto')
const razorpay  = require('../config/razorpay')
const Payment   = require('../models/Payment')
const Doctor    = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const { bookSlot }   = require('../services/bookingService')
const { sendSuccess, sendError } = require('../utils/apiResponse')
const { HTTP_STATUS, APPOINTMENT_STATUS } = require('../config/constants')

// ── Step 1: Create Razorpay Order ──
// Patient slot select karta hai → pehle order create hota hai
const createOrder = async (req, res, next) => {
  try {
    const { doctorId, date, slotId, reason } = req.body
    const patientId = req.user.id

    // Debug log — terminal mein dekho kya aa raha hai
    console.log('Create order request:', { doctorId, date, slotId, patientId })

    if (!doctorId || !date || !slotId) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST,
        `Missing fields: ${!doctorId ? 'doctorId ' : ''}${!date ? 'date ' : ''}${!slotId ? 'slotId' : ''}`
      )
    }

    // Doctor fetch karo — populate userId for name
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name')

    console.log('Doctor found:', doctor?._id, 'Fee:', doctor?.consultationFee)

    if (!doctor || !doctor.isActive) {
      return sendError(res, HTTP_STATUS.NOT_FOUND,
        `Doctor not found with id: ${doctorId}. Make sure you're using Doctor model ID, not User ID.`
      )
    }

    // ✅ Minimum 1 rupee check (Razorpay minimum = 100 paise = Rs. 1)
    const fee = Math.max(doctor.consultationFee || 0, 1)
    const amountInPaise = fee * 100

    // Razorpay keys check
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return sendError(res, HTTP_STATUS.INTERNAL_ERROR,
        'Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'
      )
    }

    const order = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `mq_${patientId}_${Date.now()}`.slice(0, 40),
      notes: {
        patientId: patientId.toString(),
        doctorId:  doctorId.toString(),
        date,
        slotId,
        reason: reason || '',
      },
    })

    console.log('Razorpay order created:', order.id)

    return sendSuccess(res, HTTP_STATUS.CREATED, 'Order created.', {
      orderId:         order.id,
      amount:          amountInPaise,
      currency:        'INR',
      keyId:           process.env.RAZORPAY_KEY_ID,
      doctorName:      doctor.userId?.name,
      consultationFee: fee,
    })

  } catch (error) {
    console.error('Create order error:', error)
    // Razorpay specific error
    if (error.error?.description) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, `Razorpay error: ${error.error.description}`)
    }
    next(error)
  }
}


// ── Step 2: Verify Payment + Book Slot ──
// Payment success hone ke baad frontend ye call karta hai
const verifyAndBook = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      doctorId, date, slotId, reason,
    } = req.body

    const patientId = req.user.id

    // Signature verify karo — tamper proof check
    // HMAC-SHA256(orderId + "|" + paymentId, secret)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return sendError(
        res, HTTP_STATUS.BAD_REQUEST,
        'Payment verification failed. Invalid signature.'
      )
    }

    // Razorpay se payment details fetch karo
    const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId)

    if (paymentDetails.status !== 'captured') {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Payment not captured yet.')
    }

    // Slot book karo (atomic booking)
    const appointment = await bookSlot({ patientId, doctorId, date, slotId, reason })

    // Payment record save karo
    await Payment.create({
      appointmentId:   appointment._id,
      patientId,
      doctorId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount:  paymentDetails.amount,
      currency: paymentDetails.currency,
      status:  'paid',
    })

    return sendSuccess(res, HTTP_STATUS.CREATED, 'Payment verified and appointment booked!', {
      appointment,
      payment: { razorpayPaymentId, amount: paymentDetails.amount / 100 },
    })

  } catch (error) {
    if (error.statusCode === 409) {
      return sendError(res, HTTP_STATUS.CONFLICT, error.message)
    }
    next(error)
  }
}

// ── Refund on Cancellation ──
const refundPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params

    const payment = await Payment.findOne({ appointmentId, status: 'paid' })
    if (!payment) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'No paid payment found for this appointment.')
    }

    // Razorpay refund
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount,  // Full refund
      notes: { reason: 'Appointment cancelled by patient' },
    })

    payment.status      = 'refunded'
    payment.refundId    = refund.id
    payment.refundAmount = refund.amount / 100
    payment.refundedAt  = new Date()
    await payment.save()

    return sendSuccess(res, HTTP_STATUS.OK, 'Refund initiated successfully.', {
      refundId: refund.id,
      amount:   refund.amount / 100,
    })

  } catch (error) {
    next(error)
  }
}

// ── Patient ke payments fetch ──
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ patientId: req.user.id })
      .populate('appointmentId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 })

    return sendSuccess(res, HTTP_STATUS.OK, 'Payments fetched.', { payments })
  } catch (error) {
    next(error)
  }
}

module.exports = { createOrder, verifyAndBook, refundPayment, getMyPayments }
