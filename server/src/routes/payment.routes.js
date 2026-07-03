// server/src/routes/payment.routes.js
const express    = require('express')
const router     = express.Router()
const { createOrder, verifyAndBook, refundPayment, getMyPayments } = require('../controllers/payment.controller')
const authenticate = require('../middleware/authenticate')
const authorize    = require('../middleware/authorize')
const { writeLock } = require('../middleware/writeLock')

router.post('/create-order', authenticate, authorize('patient'), createOrder)
router.post('/verify',       authenticate, authorize('patient'), writeLock, verifyAndBook)
router.post('/refund/:appointmentId', authenticate, authorize('patient'), refundPayment)
router.get('/my-payments',   authenticate, authorize('patient'), getMyPayments)

module.exports = router
