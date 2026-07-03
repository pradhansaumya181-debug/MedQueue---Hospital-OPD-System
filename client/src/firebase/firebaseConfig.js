// src/firebase/firebaseConfig.js
// Firebase app initialize karna — sirf ek baar hota hai
// Baaki saari Firebase files is config ko import karengi
//
// Kya hota hai yahan?
// Firebase ko batao ki kaunsi project se connect karna hai
// .env se saari keys aati hain — directly code mein mat likhna kabhi

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration — saari values .env file se
// import.meta.env = Vite ka tarika environment variables padhne ka
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase app initialize karo
// initializeApp ek baar call hona chahiye poori app mein
const app = initializeApp(firebaseConfig)

// Auth service — patient login/logout ke liye
export const auth = getAuth(app)

// Firestore database — real-time queue display ke liye
// Patient waiting room mein live token number yahan se aata hai
export const db = getFirestore(app)

export default app
