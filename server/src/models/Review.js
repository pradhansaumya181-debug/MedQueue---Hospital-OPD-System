// server/src/models/Review.js
// Patient doctor ko rate karta hai — appointment complete hone ke baad

const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,  // Ek appointment ke liye sirf ek review
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true, versionKey: false }
)

reviewSchema.index({ doctorId: 1 })
reviewSchema.index({ patientId: 1 })
reviewSchema.index({ appointmentId: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
