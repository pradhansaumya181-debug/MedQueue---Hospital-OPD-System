
// Saari APIs ek consistent format mein response deti hain

/**
 * Success response bhejne ka helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Success message
 * @param {any} data - Response mein bhejne wala data
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  // Agar data hai to response mein add karo
  // null nahi bhejte — agar data nahi hai to field hi nahi hogi
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response bhejne ka helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 404, etc.)
 * @param {string} message - Error message (user ko dikhane wala)
 * @param {any} errors - Validation errors ya extra details
 */
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  
  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
