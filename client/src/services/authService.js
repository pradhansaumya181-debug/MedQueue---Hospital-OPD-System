// src/services/authService.js
// Auth related API calls — directly api.js use karta hai
// Controllers se alag — ye sirf API calls hain, state nahi sambhalte
// Zustand stores in functions ko use karte hain

import api from './api'

// Current logged in user ki info lao
export const getCurrentUser = () => api.get('/auth/me')

// Staff profile update
export const updateProfile = (data) => api.put('/patients/profile', data)
