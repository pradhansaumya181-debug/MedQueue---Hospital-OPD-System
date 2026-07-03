// src/routes/admin.routes.js — UPDATED with validation + missing routes
const express = require('express');
const router = express.Router();
const {
  createDoctorProfile, bulkCancelAppointments,
  getAllUsers, toggleUserBlock, getHospitalStats,
  updateDoctorProfile, deleteDoctorProfile,
} = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { schemas } = require('../middleware/validate');

const adminOnly = [authenticate, authorize('admin')];

router.post('/doctors', ...adminOnly, schemas.createDoctorProfile, createDoctorProfile);
router.put('/doctors/:id', ...adminOnly, updateDoctorProfile);       // UPDATE
router.delete('/doctors/:id', ...adminOnly, deleteDoctorProfile);    // DELETE
router.post('/appointments/bulk-cancel', ...adminOnly, schemas.bulkCancel, bulkCancelAppointments);
router.get('/users', ...adminOnly, getAllUsers);
router.patch('/users/:id/toggle-block', ...adminOnly, toggleUserBlock);
router.get('/stats', ...adminOnly, getHospitalStats);

module.exports = router;
