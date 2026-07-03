// src/middleware/authenticate.js
// Ye middleware check karta hai ki request valid JWT token ke saath aayi hai ya nahi
//
// Kaise kaam karta hai?
// 1. Request header se token nikalo: "Authorization: Bearer <token>"
// 2. Token verify karo JWT_SECRET se
// 3. Agar valid hai to user info req.user mein daal do aur next() call karo
// 4. Agar invalid/expired hai to 401 Unauthorized bhejo

const { verifyToken } = require('../utils/generateToken');
const { sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

const authenticate = (req, res, next) => {
  try {
    // Authorization header se token nikalo
    // Format: "Bearer eyJhbGciOiJIUzI1NiJ9..."
    const authHeader = req.headers.authorization;

    // Agar header hai hi nahi ya "Bearer " se start nahi hota
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Access token required. Please login.'
      );
    }

    // "Bearer " (7 characters) ke baad wala hissa token hai
    const token = authHeader.substring(7);

    // Token verify karo — agar expired ya tampered hai to exception throw hogi
    const decoded = verifyToken(token);

    // Decoded data req.user mein daal do taaki agle middleware/controller use kar sake
    // decoded mein: { id, role, email, iat, exp }
    req.user = decoded;

    // Next middleware ya controller ko call karo
    next();

  } catch (error) {
    // jwt.verify() ye errors throw karta hai:
    // TokenExpiredError — 15 minute baad
    // JsonWebTokenError — invalid/tampered token
    // NotBeforeError — token abhi valid nahi hua

    if (error.name === 'TokenExpiredError') {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Token expired. Please login again.'
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid token. Please login again.'
      );
    }

    // Koi aur unexpected error
    return sendError(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      'Authentication failed.'
    );
  }
};

module.exports = authenticate;
