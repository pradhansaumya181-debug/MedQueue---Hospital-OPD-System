// src/routes/doctor.routes.js
const express = require('express');
const router = express.Router();

const {
  getDoctorProfile,
  getTodayAppointments,
  getAppointmentsByDate,
  generateSlots,
  callNextPatient,
  updateAppointmentStatus,
  updateDoctorSelfProfile,
} = require('../controllers/doctor.controller');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Saari routes par doctor authentication
router.get('/profile', authenticate, authorize('doctor'), getDoctorProfile);
router.get('/appointments/today', authenticate, authorize('doctor'), getTodayAppointments);
router.get('/appointments', authenticate, authorize('doctor'), getAppointmentsByDate);
router.put('/profile', authenticate, authorize('doctor'), updateDoctorSelfProfile);
router.post('/slots/generate', authenticate, authorize('doctor'), generateSlots);
router.post('/queue/next', authenticate, authorize('doctor'), callNextPatient);
router.patch('/appointments/:id/status', authenticate, authorize('doctor'), updateAppointmentStatus);

module.exports = router;
