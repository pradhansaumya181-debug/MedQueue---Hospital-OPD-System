// server/src/controllers/review.controller.js
const Review    = require('../models/Review')
const Doctor    = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const { sendSuccess, sendError } = require('../utils/apiResponse')
const { HTTP_STATUS } = require('../config/constants')

// ── Review Submit ──
const submitReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body
    const patientId = req.user.id

    if (!appointmentId || !rating) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'appointmentId and rating are required.')
    }
    if (rating < 1 || rating > 5) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Rating must be between 1 and 5.')
    }

    // Appointment verify karo
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
      status: 'completed',
    })
    if (!appointment) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Completed appointment not found.')
    }

    // Already reviewed?
    const existing = await Review.findOne({ appointmentId })
    if (existing) {
      return sendError(res, HTTP_STATUS.CONFLICT, 'You have already reviewed this appointment.')
    }

    // Review create karo
    const review = await Review.create({
      patientId,
      doctorId: appointment.doctorId,
      appointmentId,
      rating,
      comment,
    })

    // Doctor ka average rating update karo
    const allReviews = await Review.find({ doctorId: appointment.doctorId })
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      rating:       Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    })

    return sendSuccess(res, HTTP_STATUS.CREATED, 'Review submitted successfully!', { review })

  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, HTTP_STATUS.CONFLICT, 'Already reviewed this appointment.')
    }
    next(error)
  }
}

// ── Doctor ke Reviews Fetch ──
const getDoctorReviews = async (req, res, next) => {
  try {
    const { doctorId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Review.countDocuments({ doctorId })

    return sendSuccess(res, HTTP_STATUS.OK, 'Reviews fetched.', {
      reviews,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    })
  } catch (error) {
    next(error)
  }
}

// ── Check if already reviewed ──
const checkReviewed = async (req, res, next) => {
  try {
    const { appointmentId } = req.params
    const existing = await Review.findOne({ appointmentId, patientId: req.user.id })
    return sendSuccess(res, HTTP_STATUS.OK, 'Check complete.', { reviewed: !!existing, review: existing })
  } catch (error) {
    next(error)
  }
}

module.exports = { submitReview, getDoctorReviews, checkReviewed }
