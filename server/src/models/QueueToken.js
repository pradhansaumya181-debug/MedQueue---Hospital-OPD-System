// src/models/QueueToken.js
// Queue token counter per doctor per date
// $inc se atomically badhta hai — race condition nahi hogi
// Firestore se sync hota hai real-time display ke liye

const mongoose = require('mongoose');

const queueTokenSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },

    date: {
      type: String,           // "YYYY-MM-DD"
      required: true,
    },

    // Current token counter — $inc se badhta hai
    // Jab naya appointment book hota hai, ye +1 ho jata hai
    // findOneAndUpdate + $inc = atomic operation (race condition safe)
    currentCounter: {
      type: Number,
      default: 0,
    },

    // Abhi kaun sa token serve ho raha hai (doctor update karta hai)
    currentlyServing: {
      type: Number,
      default: 0,
    },

    // Total tokens issued aaj ke din
    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

// Ek doctor + ek date = ek unique counter record
queueTokenSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const QueueToken = mongoose.model('QueueToken', queueTokenSchema);
module.exports = QueueToken;
