// src/firebase/firebaseAuth.js
// Patient authentication ke liye Firebase functions
//
// Flow kya hai?
// 1. Patient Google/Email se Firebase mein login karta hai
// 2. Firebase ek idToken deta hai (short-lived)
// 3. Ye token hamare backend ko bhejte hain
// 4. Backend verify karta hai aur apna JWT deta hai
// 5. Aage ke saare API calls mein backend ka JWT use hota hai

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebaseConfig'

// Google login provider setup
const googleProvider = new GoogleAuthProvider()
// Google se naam aur email lene ki permission maango
googleProvider.addScope('profile')
googleProvider.addScope('email')

/**
 * Google Popup se patient login
 * Patient "Login with Google" button dabata hai
 * @returns {Promise<string>} Firebase idToken — backend ko bhejna hai ye
 */
export const loginWithGoogle = async () => {
  // Popup khulega → patient Google account select kare
  const result = await signInWithPopup(auth, googleProvider)

  // Firebase se idToken lo — ye backend verify karta hai
  // forceRefresh: false = cached token (valid hai to dobara fetch nahi)
  const idToken = await result.user.getIdToken()

  return {
    idToken,
    user: result.user,
  }
}

/**
 * Email/Password se patient login (Firebase)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} Firebase idToken
 */
export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await result.user.getIdToken()
  return { idToken, user: result.user }
}

/**
 * Naya patient register (Firebase Email/Password)
 * @param {string} email
 * @param {string} password
 */
export const registerWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  const idToken = await result.user.getIdToken()
  return { idToken, user: result.user }
}

/**
 * Logout — Firebase se bhi aur hamare JWT ko bhi clear karna padega
 * authStore.logout() bhi call karna mat bhoolna
 */
export const logoutFirebase = async () => {
  await signOut(auth)
}

/**
 * Firebase auth state listener
 * App open hone par check karo — user pehle se logged in hai?
 * @param {Function} callback - (user) => {} -- user = null means logged out
 */
export const onFirebaseAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
