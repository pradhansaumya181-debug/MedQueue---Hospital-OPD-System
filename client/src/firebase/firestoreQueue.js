// src/firebase/firestoreQueue.js
// Real-time queue listener — Firestore onSnapshot use karta hai
// require() nahi chalega browser mein — seedha import use karo

import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

/**
 * Ek doctor ke ek din ki queue real-time listen karo
 * @param {string} doctorId - Doctor ka MongoDB ID
 * @param {string} date - "YYYY-MM-DD"
 * @param {Function} onUpdate - Queue update hone par callback
 * @param {Function} onError - Error hone par callback
 * @returns {Function} unsubscribe function
 */
export const listenToQueue = (doctorId, date, onUpdate, onError) => {
  // Firestore path: queues/{doctorId}_{date}
  // Backend ne same path par data save kiya tha queueService.js mein
  const docRef = doc(db, 'queues', `${doctorId}_${date}`)

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data())
      } else {
        // Queue abhi start nahi hui
        onUpdate({
          currentlyServing: 0,
          totalTokens: 0,
          updatedAt: null,
        })
      }
    },
    (error) => {
      console.error('Firestore queue listener error:', error)
      if (onError) onError(error)
    }
  )

  return unsubscribe
}

/**
 * Patient notifications real-time listen karo
 * Backend notificationService.js se Firestore mein push hoti hain
 * @param {string} userId - Patient ka MongoDB User ID
 * @param {Function} onNotification - Naya notification aane par
 * @returns {Function} unsubscribe
 */
export const listenToNotifications = (userId, onNotification) => {
  const q = query(
    collection(db, 'notifications', userId, 'items'),
    orderBy('createdAt', 'desc'),
    limit(10)
  )

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onNotification({
          id: change.doc.id,
          ...change.doc.data(),
        })
      }
    })
  })
}
