// src/models/Appointment.js
// Appointment model — booking ka core
// Yahan doctorId + date par compound index hai
// Write lock aur atomic booking ke liye ye model use hota hai

const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../config/constants');

const appointmentSchema = new mongoose.Schema(
  {
    // --- Parties Involved ---
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID required'],
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID required'],
    },

    // --- Appointment Details ---
    date: {
      type: String,           // "YYYY-MM-DD" format mein store
      required: [true, 'Date required'],
      // Example: "2024-01-15"
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,  // Doctor.slots ke andar slot ka _id
      required: true,
    },

    startTime: {
      type: String,           // "09:00"
      required: true,
    },

    endTime: {
      type: String,           // "09:15"
      required: true,
    },

    // --- Queue Token ---
    // $inc se automatically badhta hai (resume mein mention)
    // Waiting room mein "Your token: 5" dikhane ke liye
    tokenNumber: {
      type: Number,
      default: null,
    },

    // --- Status ---
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.CONFIRMED,
    },

    // Status change ka reason (cancellation reason etc.)
    statusNote: {
      type: String,
      default: null,
    },

    // --- Medical Notes ---
    // Doctor appointment ke baad notes add kar sakta hai
    notes: {
      type: String,
      default: null,
    },

    // Patient ne kya problem likhi hai (booking ke waqt)
    reason: {
      type: String,
      trim: true,
    },

    // --- Firestore Sync ---
    // Real-time queue ke liye Firestore document ID
    firestoreDocId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// --- Yahi woh famous Compound Index hai (resume mein mention) ---
// doctorId + date = "Doctor X ke aaj ke sab appointments"
// Ye query bahut zyada hogi isliye index zaroori hai
// Bina index ke MongoDB poora collection scan karta hai (slow)
// Index ke saath directly jump karta hai (fast)
appointmentSchema.index({ doctorId: 1, date: 1 });

// Patient ke appointments dhundhne ke liye
appointmentSchema.index({ patientId: 1, date: -1 }); // -1 = newest first

// Status filter ke saath queries ke liye
appointmentSchema.index({ doctorId: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });   // Bulk cancel ke liye (admin)

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
