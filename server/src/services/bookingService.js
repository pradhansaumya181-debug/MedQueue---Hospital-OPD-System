// src/services/bookingService.js
// SABSE IMPORTANT SERVICE — Atomic slot booking
//
// Resume mein mention hai:
// "findOne with $and and a write lock"
//
// Yahan exactly wahi hota hai:
// 1. writeLock middleware pehle lock le chuka hai
// 2. findOne + $and se check karo slot available hai
// 3. Agar available hai to book karo (slot update + appointment create)
// 4. Ye sab ek transaction mein hota hai
// 5. Lock release hota hai (middleware handle karta hai)

const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { assignQueueToken } = require('./queueService');
const { APPOINTMENT_STATUS } = require('../config/constants');
const {
notifyAppointmentBooked,
notifyAppointmentCancelled,
} = require('./notificationService');

/**
 * Atomic slot booking
 * Write lock pehle se active hai (writeLock middleware ne liya)
 *
 * @param {Object} bookingData
 * @param {string} bookingData.patientId - Patient ka User ID
 * @param {string} bookingData.doctorId - Doctor ka Doctor model ID
 * @param {string} bookingData.date - "YYYY-MM-DD"
 * @param {string} bookingData.slotId - Slot ka _id (Doctor.slots ke andar)
 * @param {string} bookingData.reason - Consultation ka reason
 * @returns {Promise<Object>} Created appointment
 */
const bookSlot = async ({ patientId, doctorId, date, slotId, reason }) => {
  // MongoDB session start karo — transaction ke liye
  // Transaction matlab: ya sab kuch hoga ya kuch bhi nahi
  // Agar beech mein error aaya to sab rollback ho jayega
  const session = await mongoose.startSession();

  try {
    let appointment;

    await session.withTransaction(async () => {
      // --- STEP 1: findOne + $and se slot check karo ---
      // Ye wahi "findOne with $and" hai jo resume mein mention hai
      // Ek query mein check karo:
      // - Doctor exist karta hai (doctorId match)
      // - Us date ke slots hain
      // - Woh specific slot exist karta hai (slotId match)
      // - Slot abhi booked nahi hai (isBooked: false)
      const doctor = await Doctor.findOne(
        {
          $and: [
            { _id: doctorId },                              // Sahi doctor
            { [`slots.${date}`]: { $exists: true } },       // Us date ke slots hain
            {
              [`slots.${date}`]: {
                $elemMatch: {
                  _id: new mongoose.Types.ObjectId(slotId), // Sahi slot
                  isBooked: false,                          // Abhi booked nahi hai
                }
              }
            }
          ]
        },
        null,
        { session }  // Transaction session use karo
      );

      // Agar doctor nahi mila ya slot already booked hai
      if (!doctor) {
        const error = new Error('Slot is no longer available. Please choose another slot.');
        error.statusCode = 409;  // Conflict
        throw error;
      }

      // --- STEP 2: Slot dhundo ---
      const dateSlots = doctor.slots.get(date);
      const slotIndex = dateSlots.findIndex(
        s => s._id.toString() === slotId.toString()
      );

      if (slotIndex === -1) {
        const error = new Error('Slot not found.');
        error.statusCode = 404;
        throw error;
      }

      const slot = dateSlots[slotIndex];

      // --- STEP 3: Appointment create karo ---
      // Pehle appointment create karo (ID chahiye slot mein save karne ke liye)
      const [newAppointment] = await Appointment.create(
        [
          {
            patientId,
            doctorId,
            date,
            slotId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            reason,
            status: APPOINTMENT_STATUS.CONFIRMED,
          }
        ],
        { session }
      );

      // --- STEP 4: Slot ko booked mark karo ---
      // Directly array index update karo Map ke andar
      doctor.slots.get(date)[slotIndex].isBooked = true;
      doctor.slots.get(date)[slotIndex].appointmentId = newAppointment._id;

      // Mongoose Map changes detect karne ke liye markModified zaroori hai
      doctor.markModified(`slots.${date}`);
      await doctor.save({ session });

      appointment = newAppointment;
    });

    // --- STEP 5: Queue token assign karo (transaction ke bahar) ---
    // Token assignment Firestore sync karta hai
    // Transaction ke bahar isliye ki Firestore transaction mein nahi aata
    const tokenNumber = await assignQueueToken(
      doctorId,
      date,
      appointment._id
    );

    // Appointment mein token number update karo
    appointment.tokenNumber = tokenNumber;
    await appointment.save();

    // Populated appointment return karo (patient aur doctor info ke saath)
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

      const doctorUser = populatedAppointment.doctorId?.userId;

if (doctorUser) {
notifyAppointmentBooked(patientId, {
doctorName: doctorUser.name,
date,
startTime: populatedAppointment.startTime,
tokenNumber,
}).catch(err =>
console.error('Notification error:', err.message)
);
}

    return populatedAppointment;

  } finally {
    // Session hamesha end karo — error aaye ya na aaye
    await session.endSession();
  }
};

/**
 * Appointment cancel karna
 * @param {string} appointmentId
 * @param {string} cancelledBy - User ID jo cancel kar raha hai
 * @param {string} reason - Cancel karne ka reason
 */
const cancelAppointment = async (appointmentId, cancelledBy, reason) => {
  const session = await mongoose.startSession();

  try {
    let updatedAppointment;

    await session.withTransaction(async () => {
      // Appointment dhundo
      const appointment = await Appointment.findById(appointmentId).session(session);

      if (!appointment) {
        const error = new Error('Appointment not found.');
        error.statusCode = 404;
        throw error;
      }

      // Already cancelled ya completed hai?
      if (['cancelled', 'completed'].includes(appointment.status)) {
        const error = new Error(`Cannot cancel an appointment with status: ${appointment.status}`);
        error.statusCode = 400;
        throw error;
      }

      // Appointment cancel karo
      appointment.status = APPOINTMENT_STATUS.CANCELLED;
      appointment.statusNote = reason || 'Cancelled by user';
      await appointment.save({ session });

      // Doctor ke slot ko free karo
      const doctor = await Doctor.findById(appointment.doctorId).session(session);
      if (doctor) {
        const dateSlots = doctor.slots.get(appointment.date);
        if (dateSlots) {
          const slotIndex = dateSlots.findIndex(
            s => s._id.toString() === appointment.slotId.toString()
          );
          if (slotIndex !== -1) {
            doctor.slots.get(appointment.date)[slotIndex].isBooked = false;
            doctor.slots.get(appointment.date)[slotIndex].appointmentId = null;
            doctor.markModified(`slots.${appointment.date}`);
            await doctor.save({ session });
          }
        }
      }

      updatedAppointment = appointment;
    });

    const doctor = await Doctor.findById(updatedAppointment.doctorId)
.populate('userId', 'name');

const doctorName = doctor?.userId?.name || 'Your doctor';

notifyAppointmentCancelled(updatedAppointment.patientId, {
doctorName,
date: updatedAppointment.date,
reason,
}).catch(err =>
console.error('Notification error:', err.message)
);

    return updatedAppointment;

  } finally {
    await session.endSession();
  }
};

module.exports = { bookSlot, cancelAppointment };
