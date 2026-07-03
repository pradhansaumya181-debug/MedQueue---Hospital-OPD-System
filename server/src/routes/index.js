// src/routes/index.js — UPDATED
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const adminRoutes = require('./admin.routes');
const reviewRoutes = require('./review.routes')
const paymentRoutes = require('./payment.routes')

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes)
router.use('/payments', paymentRoutes)

module.exports = router;
