// src/routes/patient.routes.js — UPDATED with validation
const express = require('express');
const router = express.Router();
const {
  searchDoctors, getDoctorSlots, bookAppointment,
  getMyAppointments, cancelMyAppointment, getQueueStatus, updateProfile,
  rescheduleAppointment
} = require('../controllers/patient.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { writeLock } = require('../middleware/writeLock');
const { schemas } = require('../middleware/validate');

router.get('/doctors/search', authenticate, authorize('patient'), searchDoctors);
router.get('/doctors/:doctorId/slots', authenticate, authorize('patient'), getDoctorSlots);

// Validation → lock → booking
router.post(
  '/appointments/book',
  authenticate,
  authorize('patient'),
  schemas.bookAppointment,  // Input validate karo pehle
  writeLock,                // Phir lock lo
  bookAppointment
);

router.get('/appointments', authenticate, authorize('patient'), getMyAppointments);

router.put('/profile', authenticate, authorize('patient'), updateProfile);

router.patch('/appointments/:id/reschedule', authenticate, authorize('patient'), rescheduleAppointment);
router.patch('/appointments/:id/cancel', authenticate, authorize('patient'), cancelMyAppointment);
router.get('/queue/:doctorId', authenticate, authorize('patient'), getQueueStatus);

module.exports = router;
