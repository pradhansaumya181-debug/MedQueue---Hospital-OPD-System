// src/hooks/useQueue.js
// Firestore real-time queue hook
// WaitingRoom aur DoctorDashboard mein use hoga

import { useEffect, useState, useRef } from 'react'
import { listenToQueue } from '@/firebase/firestoreQueue'

const useQueue = (doctorId, date) => {
  const [queueData, setQueueData] = useState({
    currentlyServing: 0,
    totalTokens: 0,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    // doctorId aur date dono zaroori hain
    if (!doctorId || !date) return

    setIsConnected(false)
    setError(null)

    // Pehle purana listener band karo
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // Naya Firestore listener start karo
    const unsubscribe = listenToQueue(
      doctorId,
      date,
      (data) => {
        setQueueData(data)
        setIsConnected(true)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setIsConnected(false)
      }
    )

    unsubscribeRef.current = unsubscribe

    // Component unmount hone par listener band karo
    // Memory leak aur unnecessary Firestore reads rokne ke liye
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [doctorId, date])

  return { queueData, isConnected, error }
}

export default useQueue
