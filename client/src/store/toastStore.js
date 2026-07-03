// src/store/toastStore.js
// Zomato-style toast notifications ka state
//
// Toast kya hota hai?
// Screen ke corner mein pop-up message
// "Appointment booked!" — green
// "Slot not available" — red
// Kuch second baad automatically gayab ho jata hai
//
// Firestore se real-time notifications bhi yahan aati hain

import { create } from 'zustand'

// Har toast ka unique ID generate karna
let toastCounter = 0
const generateId = () => `toast_${++toastCounter}_${Date.now()}`

const useToastStore = create((set, get) => ({
  // =====================
  // STATE
  // =====================
  toasts: [],   // [ { id, title, message, type, duration } ]

  // =====================
  // ACTIONS
  // =====================

  /**
   * Naya toast add karo
   * @param {string} message - Main message
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {string} title - Optional title
   * @param {number} duration - Kitne ms baad gayab ho (default 4000)
   */
  addToast: (message, type = 'info', title = '', duration = 4000) => {
    const id = generateId()

    set((state) => ({
      toasts: [
        ...state.toasts,
        { id, message, type, title, duration },
      ],
    }))

    // Auto-remove after duration
    setTimeout(() => {
      get().removeToast(id)
    }, duration)

    return id
  },

  // Toast remove karo by ID
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  // Saare toasts clear karo
  clearAll: () => set({ toasts: [] }),

  // =====================
  // SHORTHAND HELPERS
  // =====================
  // toastStore.success("Done!") — bar bar type likhne ki zaroorat nahi

  success: (message, title = 'Success') => {
    return get().addToast(message, 'success', title)
  },

  error: (message, title = 'Error') => {
    return get().addToast(message, 'error', title, 5000)  // Error thoda zyada time
  },

  warning: (message, title = 'Warning') => {
    return get().addToast(message, 'warning', title)
  },

  info: (message, title = 'Info') => {
    return get().addToast(message, 'info', title)
  },
}))

export default useToastStore
