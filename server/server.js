// src/server.js
// Entry point — server start karne wala file
// app.js se Express app import karo, database connect karo, server start karo
// server/server.js

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Server start karne ka function
const startServer = async () => {
  try {
    // Pehle database connect karo
    await connectDB();

    // Phir server start karo
    app.listen(PORT, () => {
      console.log(`🚀 MedQueue Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
