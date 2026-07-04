// server/server.js — FINAL CLEAN VERSION
require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const mongoose   = require('mongoose')

const app  = express()
const PORT = process.env.PORT || 10000

// ── 1. CORS — sabse pehle ──
app.use(cors({
  origin: '*',   // Sabhi origins allow — production working ke liye
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,  // * ke saath credentials false hona chahiye
}))
app.options('*', cors())

// ── 2. Security + Parsing ──
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ── 3. Rate Limiting ──
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}))

// ── 4. Health Check ──
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MedQueue API is running',
    environment: process.env.NODE_ENV,
  })
})

// ── 5. Routes ──
app.use('/api/auth',          require('./src/routes/auth.routes'))
app.use('/api/patients',      require('./src/routes/patient.routes'))
app.use('/api/doctors',       require('./src/routes/doctor.routes'))
app.use('/api/admin',         require('./src/routes/admin.routes'))

// Optional routes — exist karte hain to load karo
try { app.use('/api/reviews',       require('./src/routes/review.routes')) } catch(e) {}
try { app.use('/api/payments',      require('./src/routes/payment.routes')) } catch(e) {}
try { app.use('/api/prescriptions', require('./src/routes/prescription.routes')) } catch(e) {}

// ── 6. 404 ──
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` })
})

// ── 7. Error Handler ──
app.use(require('./src/middleware/errorHandler'))

// ── 8. Start ──
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB Connected')

    try {
      require('./src/config/firebase-admin')
    } catch (e) {
      console.warn('⚠️ Firebase:', e.message)
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MedQueue Server running on port ${PORT}`)
    })

  } catch (error) {
    console.error('❌ Failed to start:', error.message)
    process.exit(1)
  }
}

startServer()
