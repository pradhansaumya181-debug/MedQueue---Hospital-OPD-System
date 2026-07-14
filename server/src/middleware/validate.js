// src/middleware/validate.js
// Har API request ka input yahan validate hota hai
// Controller tak sirf clean data pahuchna chahiye
//
// Real projects mein "joi" ya "express-validator" use karte hain
// Hum lightweight custom validators banate hain — same concept

const { sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Validation rules ka collection
 * Har function ek field validate karta hai
 * true = valid, string = error message
 */
const rules = {
  // Email format check
  isEmail: (val) => {
    if (!val) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(val)) return 'Enter a valid email address';
    return true;
  },

  // Password strength
  isStrongPassword: (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return true;
  },

  // Date format YYYY-MM-DD
  isDate: (val) => {
    if (!val) return 'Date is required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return 'Date must be in YYYY-MM-DD format';
    if (isNaN(new Date(val).getTime())) return 'Invalid date';
    return true;
  },

  // MongoDB ObjectId — 24 hex characters
  isObjectId: (val, fieldName = 'ID') => {
    if (!val) return `${fieldName} is required`;
    if (!/^[a-fA-F0-9]{24}$/.test(val)) return `Invalid ${fieldName} format`;
    return true;
  },

  // Required string
  isRequired: (val, fieldName = 'Field') => {
    if (!val || String(val).trim() === '') return `${fieldName} is required`;
    return true;
  },

  // Number range
  isNumber: (val, fieldName = 'Value', min = 0, max = Infinity) => {
    const num = Number(val);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (num > max) return `${fieldName} must be at most ${max}`;
    return true;
  },

  // Indian phone number
  isPhone: (val) => {
    if (!val) return true; // Optional field
    if (!/^[6-9]\d{9}$/.test(val)) return 'Enter valid 10-digit Indian mobile number';
    return true;
  },
};

/**
 * Validation middleware factory
 * @param {Object} schema - { fieldName: [rule1, rule2, ...] }
 * @param {string} source - 'body' | 'query' | 'params'
 *
 * Usage:
 * validate({ email: ['isEmail'], password: ['isStrongPassword'] })
 *
 * Custom rule with args:
 * validate({ age: [(val) => rules.isNumber(val, 'Age', 0, 120)] })
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source]; // req.body ya req.query ya req.params
    const errors = [];

    for (const [field, fieldRules] of Object.entries(schema)) {
      const value = data[field];

      for (const rule of fieldRules) {
        let result;

        if (typeof rule === 'function') {
          // Custom function rule
          result = rule(value);
        } else if (typeof rule === 'string' && rules[rule]) {
          // Named rule string
          result = rules[rule](value, field);
        } else {
          continue;
        }

        // result !== true matlab error hai
        if (result !== true) {
          errors.push({ field, message: result });
          break; // Ek field ke liye ek error enough hai
        }
      }
    }

    if (errors.length > 0) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Validation failed. Please check your input.',
        errors
      );
    }

    next();
  };
};

// Pre-built validation schemas — routes mein directly use karo
const schemas = {
  register: validate({
    name: ['isRequired'],
    email: ['isEmail'],
    password: ['isStrongPassword'],
    role: [(val) => {
      if (!val) return 'Role is required';
      if (!['doctor', 'admin'].includes(val)) return 'Role must be doctor or admin';
      return true;
    }],
    phone: ['isPhone'],
  }),

  login: validate({
    email: ['isEmail'],
    password: ['isRequired'],
  }),

  bookAppointment: validate({
    doctorId: [(val) => rules.isObjectId(val, 'Doctor ID')],
    date: ['isDate'],
    slotId: [(val) => rules.isObjectId(val, 'Slot ID')],
  }),

  generateSlots: validate({
    date: ['isDate'],
  }),

  bulkCancel: validate({
    reason: ['isRequired'],
  }),

  createDoctorProfile: validate({
    userId: [(val) => rules.isObjectId(val, 'User ID')],
  }),
};

module.exports = { validate, schemas, rules };
