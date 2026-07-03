// src/middleware/authorize.js
// Role-based authorization middleware
// authenticate.js ke BAAD use karna — req.user already set hona chahiye
//
// Example use:
// router.delete('/users/:id', authenticate, authorize('admin'), deleteUser)
// Sirf admin delete kar sakta hai

const { sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Role check karne wala middleware factory
 * @param {...string} allowedRoles - Allowed roles ('patient', 'doctor', 'admin')
 * @returns Express middleware function
 *
 * Usage:
 * authorize('admin')              — sirf admin
 * authorize('doctor', 'admin')    — doctor ya admin dono
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user authenticate.js ne set kiya tha
    // Agar kisi ne galti se authorize pehle call kiya
    if (!req.user) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required before authorization.'
      );
    }

    const userRole = req.user.role;

    // User ka role allowed list mein hai?
    if (!allowedRoles.includes(userRole)) {
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        // User ko bata do ki unhe permission nahi
        `Access denied. This action requires: ${allowedRoles.join(' or ')} role. Your role: ${userRole}`
      );
    }

    // Role valid hai, aage badho
    next();
  };
};

module.exports = authorize;
