// src/middleware/errorHandler.js
// Global error handling middleware
// Ye poore app ka last middleware hota hai
// Koi bhi unhandled error yahan aa jata hai
//
// Express mein error middleware ki pehchaan hai: (err, req, res, next)
// 4 parameters hone se Express samajhta hai ki ye error handler hai

const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  // Console mein full error print karo (server logs ke liye)
  console.error('🔴 Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // --- Mongoose Specific Errors ---

  // Unique field duplicate karne ki koshish (email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];  // Kaun sa field duplicate hai
    return sendError(res, 409, `${field} already exists. Please use a different one.`);
  }

  // Mongoose validation error (required fields missing, format wrong)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return sendError(res, 400, 'Validation failed', messages);
  }

  // Invalid MongoDB ObjectId (e.g. /users/invalid-id)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // --- JWT Errors (agar middleware mein catch nahi hua) ---
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired. Please login again.');
  }

  // --- Custom App Errors ---
  // Agar error mein statusCode set hai (hamne khud throw kiya)
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message);
  }

  // --- Default: 500 Internal Server Error ---
  // Production mein internal details mat bhejo (security)
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Something went wrong on the server. Please try again.';

  return sendError(res, 500, message);
};

module.exports = errorHandler;
