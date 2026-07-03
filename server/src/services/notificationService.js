// src/services/notificationService.js
// Zomato-style toast notifications patients ko push karna
//
// Kaise kaam karta hai?
// Jab appointment status change ho (confirmed/cancelled/completed)
// Firestore mein patient ke notifications collection mein document add karo
// Frontend Firestore real-time listener se instantly ye notification pakad leta hai
// Wahan toast show hota hai

const { db } = require('../config/firebase-admin');

/**
 * Patient ko notification push karo (Firestore ke through)
 * @param {string} patientId - Patient ka MongoDB User ID
 * @param {Object} notification
 * @param {string} notification.title - Toast ka title
 * @param {string} notification.message - Toast ka message
 * @param {string} notification.type - 'success' | 'error' | 'info' | 'warning'
 * @param {Object} notification.data - Extra data (appointmentId, doctorName etc.)
 */
const pushNotification = async (patientId, { title, message, type = 'info', data = {} }) => {
  try {
    // Firestore path: notifications/{patientId}/items/{auto-id}
    await db
      .collection('notifications')
      .doc(patientId.toString())
      .collection('items')
      .add({
        title,
        message,
        type,
        data,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

    console.log(`📬 Notification pushed to patient ${patientId}: ${title}`);
  } catch (error) {
    // Notification fail hone par booking fail nahi karni
    // Sirf log karo
    console.error('⚠️ Notification push failed:', error.message);
  }
};

/**
 * Appointment book hone par patient ko notify karo
 */
const notifyAppointmentBooked = async (patientId, { doctorName, date, startTime, tokenNumber }) => {
  await pushNotification(patientId, {
    title: 'Appointment Confirmed!',
    message: `Your appointment with ${doctorName} on ${date} at ${startTime} is confirmed. Token: ${tokenNumber}`,
    type: 'success',
    data: { doctorName, date, startTime, tokenNumber },
  });
};

/**
 * Appointment cancel hone par notify karo
 */
const notifyAppointmentCancelled = async (patientId, { doctorName, date, reason }) => {
  await pushNotification(patientId, {
    title: 'Appointment Cancelled',
    message: `Your appointment with ${doctorName} on ${date} has been cancelled. Reason: ${reason || 'No reason provided'}`,
    type: 'error',
    data: { doctorName, date, reason },
  });
};

/**
 * Queue mein turn aane par notify karo
 * Doctor "Next" call karta hai tab patient ko milega
 */
const notifyTurnNearby = async (patientId, { tokenNumber, currentlyServing }) => {
  const tokensAway = tokenNumber - currentlyServing;

  if (tokensAway <= 2 && tokensAway > 0) {
    await pushNotification(patientId, {
      title: 'Your Turn is Near!',
      message: `${tokensAway} patient(s) ahead of you. Please be ready. Your token: ${tokenNumber}`,
      type: 'warning',
      data: { tokenNumber, currentlyServing, tokensAway },
    });
  }
};

/**
 * Appointment complete hone par notify karo
 */
const notifyAppointmentCompleted = async (patientId, { doctorName }) => {
  await pushNotification(patientId, {
    title: 'Consultation Complete',
    message: `Your consultation with ${doctorName} is complete. We hope you feel better soon!`,
    type: 'success',
    data: { doctorName },
  });
};

module.exports = {
  pushNotification,
  notifyAppointmentBooked,
  notifyAppointmentCancelled,
  notifyTurnNearby,
  notifyAppointmentCompleted,
};
