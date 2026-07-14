// src/models/Doctor.js
// Doctor ka extended profile
// User model mein sirf basic info hai
// Yahan doctor-specific details hain: specialization, fees, slots etc.

const mongoose = require('mongoose');

// Ek single time slot ka structure
// Example: { startTime: "09:00", endTime: "09:15", isBooked: false }
const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,           // "09:00" format (HH:MM)
      required: true,
    },
    endTime: {
      type: String,           // "09:15" format
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,         // By default slot available hai
    },
    // Agar booked hai to kis appointment ke liye
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
  },
  { _id: true }               // Har slot ka apna unique ID hoga
);

const doctorSchema = new mongoose.Schema(
  {
    // User model se link — Doctor ek User bhi hai
    // populate() se doctor ka naam, email etc. fetch kar sakte hain
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,           // Ek user ka sirf ek doctor profile
    },

    // --- Professional Info ---
    specialization: {
      type: String,
      trim: true,
      // Example: "Cardiologist", "Dermatologist", "General Physician"
    },

    qualification: {
      type: String,
      // Example: "MBBS, MD (Cardiology)"
    },

    experience: {
      type: Number,           // Years mein
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },

    registrationNumber: {
      type: String,
      unique: true,           // Medical council registration number unique hoti hai
      sparse: true,
      trim: true,
    },

    // --- Consultation Details ---
    consultationFee: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },

    // Kis hospital/clinic mein practice karta hai
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',            // Admin user ka ID (hospital admin)
      required: true,
    },

    // --- Availability ---
    // Kaun se din available hai: [1,2,3,4,5] = Mon-Fri
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    availableDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
      validate: {
        validator: (days) => days.every(d => d >= 0 && d <= 6),
        message: 'Days must be 0-6 (Sun-Sat)',
      },
    },

    // Daily working hours
    workingHours: {
      start: { type: String, default: '09:00' },  // "09:00"
      end: { type: String, default: '17:00' },    // "17:00"
    },

    // Slots — har date ke liye alag slots
    // Map<date_string, timeSlots[]>
    // Example: { "2024-01-15": [{startTime: "09:00", ...}, ...] }
    slots: {
      type: Map,
      of: [timeSlotSchema],
      default: new Map(),
    },

    // Active/inactive — inactive doctor ko patients nahi dhundh sakte
    isActive: {
      type: Boolean,
      default: true,
    },

    // Average rating (0-5)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

// --- Compound Index ---
// Ye wahi index hai jo resume mein mention hai!
// doctorId + date combination — slot queries fast hongi
// Example: "Doctor 123 ke 15-Jan ke slots dhundo"
doctorSchema.index({ userId: 1, 'slots': 1 });
doctorSchema.index({ specialization: 1, isActive: 1 }); // Search ke liye
doctorSchema.index({ hospitalId: 1 });                  // Hospital ke sab doctors

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
