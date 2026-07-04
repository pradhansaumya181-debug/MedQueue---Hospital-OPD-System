// src/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "https://med-queue-hospital-opd-system-gur9.vercel.app",
];

// server/server.js mein CORS section dhundo aur replace karo:

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://med-queue-hospital-opd-system.vercel.app',
    'https://med-queue-hospital-opd-system-gur9.vercel.app',
    'https://med-queue-hospital-opd-system-gur9-41x27m1oq.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// ========================================
// RATE LIMITING
// ========================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use(limiter);

// ========================================
// BODY PARSER
// ========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========================================
// LOGGER
// ========================================

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MedQueue API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// API ROUTES
// ========================================

app.use('/api', routes);

// ========================================
// 404 HANDLER
// ========================================
// Express 5 compatible

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(errorHandler);

module.exports = app;
