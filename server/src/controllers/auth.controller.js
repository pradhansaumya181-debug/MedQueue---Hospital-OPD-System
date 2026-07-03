// src/controllers/auth.controller.js
// Authentication ke liye saare handlers
//
// Kya kya handle karta hai:
// POST /api/auth/register  — Staff (doctor/admin) register
// POST /api/auth/login     — Staff login (email + password + bcrypt)
// POST /api/auth/firebase  — Patient login (Firebase token verify)
// GET  /api/auth/me        — Current logged in user ki info

const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateAccessToken } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { HTTP_STATUS, ROLES } = require('../config/constants');
const { auth } = require('../config/firebase-admin');

// ========================================
// STAFF REGISTER (Doctor / Admin)
// POST /api/auth/register
// Body: { name, email, phone, password, role }
// Note: 'patient' role register nahi kar sakta yahan
//       Patient sirf Firebase se login karta hai
// ========================================
const registerStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // --- Validation ---
    if (!name || !email || !password || !role) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Name, email, password, and role are required.');
    }

    // Patient yahan register nahi kar sakta
    if (role === ROLES.PATIENT) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Patients register via the app using Firebase.');
    }

    // Sirf doctor aur admin allowed
    if (![ROLES.DOCTOR, ROLES.ADMIN].includes(role)) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid role. Must be doctor or admin.');
    }

    // Check karo email already registered hai ya nahi
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, HTTP_STATUS.CONFLICT, 'Email already registered. Please login.');
    }

    // Password hash karo — kabhi plain text save nahi karte!
    const hashedPassword = await hashPassword(password);

    // User create karo database mein
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,  // Hashed version save ho raha hai
      role,
    });

    // JWT token banao — role claims ke saath
    const token = generateAccessToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    // Response bhejo — password nahi bhejte (toJSON() handle karta hai)
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Account created successfully.', {
      user,     // toJSON() se password automatically remove ho jayega
      token,
    });

  } catch (error) {
    // next(error) se error global errorHandler tak pahuchta hai
    next(error);
  }
};

// ========================================
// STAFF LOGIN
// POST /api/auth/login
// Body: { email, password }
// ========================================
const loginStaff = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Email and password are required.');
    }

    // User dhundo — password bhi chahiye (select: false hai model mein)
    // +password se explicitly include karo
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // User nahi mila ya blocked hai
    if (!user || !user.isActive || user.isBlocked) {
      // Security: "wrong email or password" — exact reason mat batao
      // Agar "email nahi hai" bolenge to attacker email guess kar sakta hai
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password.');
    }

    // Patient Firebase se login karta hai — yahan nahi
    if (user.role === ROLES.PATIENT) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Patients must login via the app.');
    }

    // Password match karo
    if (!user.password) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid login method for this account.');
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password.');
    }

    // JWT token banao
    const token = generateAccessToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    return sendSuccess(res, HTTP_STATUS.OK, 'Login successful.', {
      user,   // password auto-remove via toJSON()
      token,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// PATIENT FIREBASE LOGIN
// POST /api/auth/firebase
// Body: { idToken } — Firebase se mila token
//
// Flow:
// 1. Frontend: Firebase signInWithPopup/signInWithEmailAndPassword
// 2. Frontend: user.getIdToken() se token lo
// 3. Frontend: ye token hamare server ko bhejo
// 4. Server: Firebase Admin se verify karo
// 5. Server: Hamara JWT banao aur bhejo
// ========================================
const loginWithFirebase = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Firebase ID token is required.');
    }

    // Firebase Admin SDK se token verify karo
    // Ye Firebase ke servers se verify hota hai
    let decodedFirebaseToken;
    try {
      decodedFirebaseToken = await auth.verifyIdToken(idToken);
    } catch (firebaseError) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired Firebase token. Please login again.');
    }

    const { uid, email, name, picture } = decodedFirebaseToken;

    // User already hamari DB mein hai ya nahi (Firebase UID se check)
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Pehli baar login kar raha hai — user create karo
      // Email se bhi check karo (email/password se pehle register kiya ho to)
      user = await User.findOne({ email: email?.toLowerCase() });

      if (user) {
        // Existing user ka Firebase UID update karo
        user.firebaseUid = uid;
        if (!user.profilePicture && picture) user.profilePicture = picture;
        await user.save();
      } else {
        // Brand new patient
        user = await User.create({
          name: name || email?.split('@')[0] || 'Patient',
          email: email?.toLowerCase(),
          role: ROLES.PATIENT,
          firebaseUid: uid,
          profilePicture: picture || null,
        });
      }
    }

    // Blocked check
    if (!user.isActive || user.isBlocked) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, 'Your account has been suspended. Contact support.');
    }

    // Hamara apna JWT banao (15 min)
    const token = generateAccessToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    return sendSuccess(res, HTTP_STATUS.OK, 'Login successful.', { user, token });

  } catch (error) {
    next(error);
  }
};

// ========================================
// GET CURRENT USER
// GET /api/auth/me
// Header: Authorization: Bearer <token>
// ========================================
const getMe = async (req, res, next) => {
  try {
    // req.user authenticate middleware ne set kiya hai
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found.');
    }

    return sendSuccess(res, HTTP_STATUS.OK, 'User fetched successfully.', { user });

  } catch (error) {
    next(error);
  }
};

module.exports = { registerStaff, loginStaff, loginWithFirebase, getMe };
