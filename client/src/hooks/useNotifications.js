// src/hooks/useNotifications.js
// Patient ke real-time notifications Firestore se
// ToastStore ke saath connect hota hai — auto toast dikhata hai

import { useEffect, useRef } from 'react'
import { listenToNotifications } from '@/firebase/firestoreQueue'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'

const useNotifications = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { success, error, warning, info } = useToastStore()
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    // Sirf authenticated patient ke liye
    if (!isAuthenticated || !user?._id || user?.role !== 'patient') return

    // Pehle purana listener band karo
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // Firestore notification listener
    const unsubscribe = listenToNotifications(user._id, (notification) => {
      // Notification type ke hisaab se toast show karo
      switch (notification.type) {
        case 'success':
          success(notification.message, notification.title)
          break
        case 'error':
          error(notification.message, notification.title)
          break
        case 'warning':
          warning(notification.message, notification.title)
          break
        default:
          info(notification.message, notification.title)
      }
    })

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [user?._id, isAuthenticated])
}

export default useNotifications
