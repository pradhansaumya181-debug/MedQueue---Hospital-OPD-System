// src/utils/tokenHelper.js
// JWT token se information nikalna
// Backend se milne wala token ek encoded string hai
// Isko decode karke user info nikal sakte hain

/**
 * JWT token decode karo (verify nahi — sirf read)
 * Token structure: header.payload.signature
 * Payload mein user info hoti hai
 */
export const decodeToken = (token) => {
  if (!token) return null
  try {
    // Token ke 3 parts mein se beech wala part (payload) lo
    const base64Payload = token.split('.')[1]
    // Base64 decode karo
    const payload = JSON.parse(atob(base64Payload))
    return payload
  } catch {
    return null
  }
}

/**
 * Token expire ho gaya hai?
 * JWT mein 'exp' field hoti hai — Unix timestamp
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true
  // exp milliseconds mein nahi, seconds mein hota hai
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Token se role nikalo
 */
export const getRoleFromToken = (token) => {
  const payload = decodeToken(token)
  return payload?.role || null
}

/**
 * Token se user ID nikalo
 */
export const getUserIdFromToken = (token) => {
  const payload = decodeToken(token)
  return payload?.id || null
}
