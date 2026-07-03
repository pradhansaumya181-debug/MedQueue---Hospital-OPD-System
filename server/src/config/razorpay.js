// server/src/config/razorpay.js
// Razorpay instance — payment gateway
// Test mode mein rzp_test_ prefix hota hai
// Production mein rzp_live_ prefix

const Razorpay = require('razorpay')

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

module.exports = razorpay
