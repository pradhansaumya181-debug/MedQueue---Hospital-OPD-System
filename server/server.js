// server/server.js
require('dotenv').config()

const connectDB = require('./src/config/db')
const app       = require('./src/app')

const PORT = process.env.PORT || 10000

const startServer = async () => {
  try {
    await connectDB()
    console.log('✅ MongoDB Connected')

    try {
      require('./src/config/firebase-admin')
    } catch (e) {
      console.warn('⚠️ Firebase:', e.message)
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MedQueue Server running on port ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    })

  } catch (error) {
    console.error('❌ Failed to start:', error.message)
    process.exit(1)
  }
}

startServer()
