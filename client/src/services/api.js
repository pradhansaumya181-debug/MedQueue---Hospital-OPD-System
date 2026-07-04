// src/services/api.js
// Axios ka configured instance
// Ye file poori app ki API calls ka gateway hai
//
// Kya karta hai?
// 1. Base URL set karta hai — bar bar likhna nahi padta
// 2. Har request mein automatically JWT token add karta hai
// 3. 401 error par automatically logout karta hai
// 4. Errors ko standard format mein convert karta hai

import axios from 'axios'

// Axios instance banao custom config ke saath
const api = axios.create({
  // Base URL — VITE_API_URL = "http://localhost:5000/api"
  // Toh api.get('/auth/me') = "http://localhost:5000/api/auth/me"
  baseURL: import.meta.env.VITE_API_URL || 'https://medqueue-hospital-opd-system-8.onrender.com/api',

  // Har request ka timeout — 10 second baad automatically fail
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
})

// =============================================
// REQUEST INTERCEPTOR
// Har request bhejne se PEHLE ye run hota hai
// =============================================
api.interceptors.request.use(
  (config) => {
    // LocalStorage se token lo
    // authStore se directly nahi lete kyunki circular import hoga
    const token = localStorage.getItem('medqueue_token')

    if (token) {
      // Authorization header add karo
      // Backend authenticate.js middleware ye header padhta hai
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // Request banane mein hi error aaya (rare)
    return Promise.reject(error)
  }
)

// =============================================
// RESPONSE INTERCEPTOR
// Har response aane ke BAAD ye run hota hai
// =============================================
api.interceptors.response.use(
  (response) => {
    // Successful response — seedha data return karo
    // response.data = { success: true, message: "...", data: {...} }
    return response.data
  },
  (error) => {
    // Error response handle karo
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    // 401 = Token expire ho gaya ya invalid hai
    if (status === 401) {
      // Token clear karo
      localStorage.removeItem('medqueue_token')
      localStorage.removeItem('medqueue_user')

      // Login page par bhejo
      // window.location use karte hain kyunki React Router yahan available nahi
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Error object standardize karo
    // Poori app mein same format se error pakad sako
    return Promise.reject({
      message,
      status,
      errors: error.response?.data?.errors || null,
    })
  }
)

export default api
