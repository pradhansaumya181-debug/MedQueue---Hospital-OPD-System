// server/src/routes/review.routes.js
const express    = require('express')
const router     = express.Router()
const { submitReview, getDoctorReviews, checkReviewed } = require('../controllers/review.controller')
const authenticate = require('../middleware/authenticate')
const authorize    = require('../middleware/authorize')

router.post('/',                       authenticate, authorize('patient'), submitReview)
router.get('/doctor/:doctorId',        getDoctorReviews)
router.get('/check/:appointmentId',    authenticate, authorize('patient'), checkReviewed)

module.exports = router
