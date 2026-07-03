

const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name too long'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,

      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    phone: {
      type: String,
      trim: true,

      match: [/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'],
    },

    // --- Role ---
    // Role determine karta hai ki user ko kya access milega
    role: {
      type: String,
      enum: Object.values(ROLES),    // Sirf 'patient', 'doctor', 'admin' allowed
      required: true,
      default: ROLES.PATIENT,
    },

    // --- Authentication ---
    // Password sirf doctor aur admin ke liye hai (staff login)
    // Patient Firebase se login karta hai
    password: {
      type: String,
      // select: false matlab ye field default queries mein nahi aayega
      // Security best practice — password kabhi response mein nahi bhejte
      select: false,
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // Firebase UID — patient ke liye (Firebase Auth se milta hai)
    firebaseUid: {
      type: String,
      sparse: true,                  // Sirf existing values par index (null ignore)
      unique: true,
    },

    // --- Account Status ---
    isActive: {
      type: Boolean,
      default: true,                 // Account active hai by default
    },

    // Admin ne manually block kiya?
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // Profile picture URL (optional)
    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    // Timestamps automatically createdAt aur updatedAt add karta hai
    timestamps: true,
    // toJSON mein __v field hide karo (version key)
    versionKey: false,
  }
);

// --- Indexes ---
// Email par unique index already hai (unique: true se)
// Role par index — "sab doctors dhundo" jaise queries fast ho jaati hain
userSchema.index({ role: 1 });


// --- Instance Method ---
// toJSON override karo taaki password kabhi response mein na jaaye
// Bhale hi koi galti se populate kar de
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;        // Password delete karo response se
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
