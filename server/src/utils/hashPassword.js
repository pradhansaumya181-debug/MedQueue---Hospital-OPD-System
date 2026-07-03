// src/utils/hashPassword.js
// Bcrypt se password hash karna aur compare karna
//
// Bcrypt kya karta hai?
// Plain text password ko ek random salt ke saath mix karke
// ek unique hash banata hai. Same password ka har baar alag hash!
// "secret123" → "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lAhy"
// Database mein kabhi plain password save nahi karte

const bcrypt = require('bcryptjs');

// Salt rounds — jitna zyada, utna zyada secure aur slow
// 10 = industry standard (2^10 = 1024 iterations)
// Production mein 12 bhi use karte hain
const SALT_ROUNDS = 10;

/**
 * Password ko hash karna
 * @param {string} plainPassword - User ka plain text password
 * @returns {Promise<string>} Hashed password (database mein save karo ye)
 */
const hashPassword = async (plainPassword) => {
  // bcrypt.hash() automatically salt generate karta hai aur mix karta hai
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hashed;
};

/**
 * Plain password ko hash se compare karna (login ke waqt)
 * @param {string} plainPassword - User ne jo enter kiya
 * @param {string} hashedPassword - Database mein stored hash
 * @returns {Promise<boolean>} true = match, false = wrong password
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
};

module.exports = { hashPassword, comparePassword };
