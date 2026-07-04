// server/src/app.js
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const morgan       = require('morgan')
const rateLimit    = require('express-rate-limit')
const routes       = require('./routes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// ── CORS — SABSE PEHLE ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}))
app.options('*', cors())

// Security
app.use(helmet({ crossOriginResourcePolicy: false }))

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MedQueue API is running',
    environment: process.env.NODE_ENV || 'development',
  })
})

// Routes
app.use('/api', routes)

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// Error handler
app.use(errorHandler)

module.exports = app
