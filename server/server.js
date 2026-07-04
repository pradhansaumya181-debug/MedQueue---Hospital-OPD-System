// server/server.js
require('dotenv').config()

const express   = require('express')
const cors      = require('cors')
const app      = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 10000

// ── CORS — sabse pehle lagao ──
app.use(cors({
  origin: function (origin, callback) {
    // Allowed origins list
    const allowedOrigins = [
      'http://localhost:5173',
      'https://med-queue-hospital-opd-system.vercel.app',
      'https://med-queue-hospital-opd-system-gur9.vercel.app',
      'https://med-queue-hospital-opd-system-gur9-41x27m1oq.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean)

    // Origin undefined hone par allow karo (Postman, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      // Temporarily sab allow karo — baad mein restrict karna
      callback(null, true)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
}))

// OPTIONS preflight requests handle karo
app.options(/.*/, cors())

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MedQueue Server running on port ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
      console.log(`📋 Health check: http://localhost:${PORT}/health`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
