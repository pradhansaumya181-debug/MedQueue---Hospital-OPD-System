// src/store/authStore.js
// Authentication state — poori app ka sabse important store
//
// Zustand kya hai?
// Redux ka simple alternative
// Koi Provider nahi chahiye — seedha import karke use karo
// set() se state update hoti hai
// get() se current state padhte hain
//
// Yahan kya store hota hai?
// - user object (naam, email, role)
// - accessToken (JWT — 15 min expiry)
// - isAuthenticated (login hai ya nahi)
// - isLoading (login process chal raha hai)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginWithGoogle, loginWithEmail, logoutFirebase } from '@/firebase/firebaseAuth'
import api from '@/services/api'

// persist middleware — state browser refresh ke baad bhi rahegi
// localStorage mein save hoti hai automatically
const useAuthStore = create(
  persist(
    (set, get) => ({
      // =====================
      // STATE
      // =====================
      user: null,           // { _id, name, email, role, profilePicture }
      token: null,          // JWT access token
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // =====================
      // ACTIONS
      // =====================

      // --- Patient: Google se Login ---
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          // Step 1: Firebase se Google login
          const { idToken } = await loginWithGoogle()

          // Step 2: Hamare backend ko Firebase token bhejo
          // Backend verify karta hai aur apna JWT deta hai
          const response = await api.post('/auth/firebase', { idToken })

          const { user, token } = response.data

          // Step 3: State update karo
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // LocalStorage mein bhi save karo (api.js interceptor ke liye)
          localStorage.setItem('medqueue_token', token)

          return { success: true, user }

        } catch (error) {
          set({ isLoading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // --- Patient: Email se Login ---
      loginWithEmailFirebase: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { idToken } = await loginWithEmail(email, password)
          const response = await api.post('/auth/firebase', { idToken })
          const { user, token } = response.data

          set({ user, token, isAuthenticated: true, isLoading: false })
          localStorage.setItem('medqueue_token', token)
          return { success: true, user }

        } catch (error) {
          set({ isLoading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // --- Staff (Doctor/Admin): Email+Password Login ---
      loginStaff: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          // Staff Firebase use nahi karta — seedha hamare backend se login
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data

          set({ user, token, isAuthenticated: true, isLoading: false })
          localStorage.setItem('medqueue_token', token)
          return { success: true, user }

        } catch (error) {
          set({ isLoading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // --- Staff Register ---
      registerStaff: async (name, email, phone, password, role) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', {
            name, email, phone, password, role,
          })
          const { user, token } = response.data

          set({ user, token, isAuthenticated: true, isLoading: false })
          localStorage.setItem('medqueue_token', token)
          return { success: true, user }

        } catch (error) {
          set({ isLoading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // --- Logout ---
      logout: async () => {
        try {
          // Firebase logout bhi karo (patient ke liye)
          await logoutFirebase()
        } catch {
          // Firebase logout fail hone par bhi hamara logout hona chahiye
        }

        // State clear karo
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })

        // LocalStorage clear karo
        localStorage.removeItem('medqueue_token')
        localStorage.removeItem('medqueue_user')
      },

      // --- Current User Refresh ---
      // Token valid hai to server se fresh user data lo
      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me')
          set({ user: response.data.user })
        } catch {
          // Token expire ho gaya — logout
          get().logout()
        }
      },

      // Error clear karo (form reset ke waqt)
      clearError: () => set({ error: null }),
    }),

    {
      // persist config
      name: 'medqueue_auth',       // localStorage key
      // Sirf ye fields save karo — baaki skip
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
