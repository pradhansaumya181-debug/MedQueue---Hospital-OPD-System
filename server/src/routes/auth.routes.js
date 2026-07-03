// src/routes/auth.routes.js — UPDATED with validation
const express = require('express');
const router = express.Router();
const { registerStaff, loginStaff, loginWithFirebase, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const { schemas } = require('../middleware/validate');

// schemas.register validation pehle chalega, phir controller
router.post('/register', schemas.register, registerStaff);
router.post('/login', schemas.login, loginStaff);
router.post('/firebase', loginWithFirebase);
router.get('/me', authenticate, getMe);

module.exports = router;
