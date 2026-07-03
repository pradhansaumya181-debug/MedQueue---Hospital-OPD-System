// src/services/queueService.js
// Queue token manage karna
//
// $inc kya hai?
// MongoDB ka atomic increment operator
// findOneAndUpdate + $inc = ek hi operation mein find + increment
// Race condition impossible — MongoDB internally lock karta hai
//
// Firestore sync:
// Token assign hone ke baad Firestore mein bhi update karo
// Frontend Firestore ko real-time listen karta hai
// Patient waiting room mein live token number dekhta hai

const QueueToken = require('../models/QueueToken');
const Appointment = require('../models/Appointment');
const { db } = require('../config/firebase-admin');
const { notifyTurnNearby } = require('./notificationService');

/**
 * Naya queue token assign karo aur Firestore sync karo
 * @param {string} doctorId
 * @param {string} date - "YYYY-MM-DD"
 * @param {string} appointmentId - Naya appointment ka ID
 * @returns {Promise<number>} Assigned token number
 */
const assignQueueToken = async (doctorId, date, appointmentId) => {
  // findOneAndUpdate + $inc = ATOMIC OPERATION
  // Ek hi MongoDB operation mein:
  // 1. doctorId + date ke liye record dhundo (ya banao — upsert: true)
  // 2. currentCounter aur totalTokens ko 1 se badhao
  // 3. Updated document return karo (new: true)
  const tokenDoc = await QueueToken.findOneAndUpdate(
    { doctorId, date },           // Kaunsa document
    {
      $inc: {
        currentCounter: 1,        // +1 karo atomically
        totalTokens: 1,
      }
    },
    {
      upsert: true,               // Nahi mila to create karo
      new: true,                  // Updated document return karo
      setDefaultsOnInsert: true,  // Schema defaults apply karo naye document par
    }
  );

  const tokenNumber = tokenDoc.currentCounter;

  // Firestore mein bhi update karo — real-time queue display ke liye
  // Ye async hai — await karte hain taaki error catch ho sake
  try {
    // Firestore document path: queues/{doctorId}_{date}
    const firestoreDocId = `${doctorId}_${date}`;
    await db.collection('queues').doc(firestoreDocId).set(
      {
        doctorId: doctorId.toString(),
        date,
        totalTokens: tokenDoc.totalTokens,
        currentlyServing: tokenDoc.currentlyServing,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }  // Existing fields ko overwrite mat karo — sirf update karo
    );
  } catch (firestoreError) {
    // Firestore fail hone par booking fail mat karo
    // Booking already MongoDB mein ho gayi — sirf real-time display affect hoga
    console.error('⚠️ Firestore sync failed (non-critical):', firestoreError.message);
  }

  return tokenNumber;
};

/**
 * Doctor next patient ko serve karna shuru kare
 * "Currently serving token X" update karo
 * @param {string} doctorId
 * @param {string} date
 * @returns {Promise<Object>} Updated queue info
 */
const updateCurrentlyServing = async (doctorId, date) => {
  const tokenDoc = await QueueToken.findOneAndUpdate(
    { doctorId, date },
    { $inc: { currentlyServing: 1 } },
    { new: true }
  );

  if (!tokenDoc) throw new Error('Queue not found for this doctor and date');

  // Firestore sync
  try {
    const firestoreDocId = `${doctorId}_${date}`;
    await db.collection('queues').doc(firestoreDocId).update({
      currentlyServing: tokenDoc.currentlyServing,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('⚠️ Firestore sync failed:', err.message);
  }

  const nearbyAppointments = await Appointment.find({
  doctorId,
  date,
  tokenNumber: {
    $in: [tokenDoc.currentlyServing + 1, tokenDoc.currentlyServing + 2]
  },
  status: 'confirmed',
});

nearbyAppointments.forEach(apt => {
  notifyTurnNearby(apt.patientId, {
    tokenNumber: apt.tokenNumber,
    currentlyServing: tokenDoc.currentlyServing,
  }).catch(err => console.error('Notification error:', err.message));
});

  return tokenDoc;
};

/**
 * Ek date ke queue ki info fetch karo
 * @param {string} doctorId
 * @param {string} date
 */
const getQueueInfo = async (doctorId, date) => {
  const tokenDoc = await QueueToken.findOne({ doctorId, date });
  return tokenDoc || { currentCounter: 0, currentlyServing: 0, totalTokens: 0 };
};

module.exports = { assignQueueToken, updateCurrentlyServing, getQueueInfo };
