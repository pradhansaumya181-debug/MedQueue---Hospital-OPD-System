// src/utils/generateToken.js
// JWT (JSON Web Token) banana ka utility


const jwt = require('jsonwebtoken');

/**
 * Access Token banana — 15 minute expiry
 * Ye token patient/doctor/admin login ke baad milta hai
 * Har protected API call mein ye token bhejni padti hai
 *
 * @param {Object} payload - Token mein store karne wala data
 * @param {string} payload.id - User ka MongoDB _id
 * @param {string} payload.role - 'patient' | 'doctor' | 'admin'
 * @param {string} payload.email - User ka email
 * @returns {string} Signed JWT token string
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,                          // Ye data token mein store hoga (encrypted)
    process.env.JWT_SECRET,           // Secret key — koi nahi jaanta except server
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',  // 15 minute baad expire
      issuer: 'medqueue-api',         // Token kisne banaya
      audience: 'medqueue-client',    // Token kiske liye hai
    }
  );
};

/**
 * Token verify karna
 * @param {string} token - Verify karne wala JWT string
 * @returns {Object} Decoded payload ya throw karta hai error
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'medqueue-api',
    audience: 'medqueue-client',
  });
};

module.exports = { generateAccessToken, verifyToken };
