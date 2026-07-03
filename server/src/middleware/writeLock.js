// src/middleware/writeLock.js
// Ye middleware slot booking mein race condition rokta hai
//
// Problem kya hai?
// Agar 2 patients ek saath same slot book karne ki koshish karein:
// Patient A: slot check karo → available hai → book karo
// Patient B: slot check karo → available hai → book karo  ← PROBLEM!
// Dono ko success milega but slot sirf ek ke liye thi!
//
// Solution: Write Lock (Mutex)
// Jab Patient A booking kar raha hai, Patient B ko wait karaya jata hai
// Patient A ka kaam khatam hone ke baad Patient B ka process hoga
// Tab Patient B dekhega: slot already booked → conflict error
//
// Ye in-memory lock hai — single server ke liye perfect
// Multiple servers ke liye Redis-based distributed lock use karte hain

const { sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

// Active locks store karne ke liye Map
// Key: "doctorId_date_slotId" (unique combination)
// Value: true (lock active hai)
const activeLocks = new Map();

/**
 * Lock acquire karne ki koshish karo
 * @param {string} lockKey - Unique identifier for the resource
 * @param {number} timeout - Kitni milliseconds wait karna (default 5 seconds)
 * @returns {Promise<boolean>} true = lock mila, false = timeout
 */
const acquireLock = (lockKey, timeout = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const tryLock = () => {
      // Lock available hai?
      if (!activeLocks.has(lockKey)) {
        // Lock le lo
        activeLocks.set(lockKey, true);
        resolve(true);
        return;
      }

      // Timeout check karo
      if (Date.now() - startTime >= timeout) {
        // 5 second baad bhi lock nahi mila — fail
        resolve(false);
        return;
      }

      // 50ms baad phir try karo
      setTimeout(tryLock, 50);
    };

    tryLock();
  });
};

/**
 * Lock release karo
 * @param {string} lockKey
 */
const releaseLock = (lockKey) => {
  activeLocks.delete(lockKey);
};

/**
 * Express middleware — booking route ke liye
 * req.body mein doctorId, date, slotId hone chahiye
 */
const writeLock = async (req, res, next) => {
  const { doctorId, date, slotId } = req.body;

  // Lock key banao — ye combination unique hai
  const lockKey = `booking_${doctorId}_${date}_${slotId}`;

  // Lock acquire karne ki koshish karo
  const lockAcquired = await acquireLock(lockKey);

  if (!lockAcquired) {
    // 5 second wait ke baad bhi lock nahi mila
    // Matlab bahut zyada traffic hai ya koi issue hai
    return sendError(
      res,
      HTTP_STATUS.CONFLICT,
      'Server is busy processing another booking for this slot. Please try again.'
    );
  }

  // Lock mil gaya — lock key req mein save karo taaki baad mein release kar sakein
  req.lockKey = lockKey;

  // Response finish hone par lock release karo
  // res.on('finish') - response successfully bhej diya
  // res.on('close') - connection close ho gaya (error case)
  const releaseLockOnFinish = () => releaseLock(lockKey);
  res.on('finish', releaseLockOnFinish);
  res.on('close', releaseLockOnFinish);

  next();
};

module.exports = { writeLock, acquireLock, releaseLock };
