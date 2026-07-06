// client/src/services/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
  || 'https://medqueue-hospital-opd-system-8.onrender.com/api'

console.log('API URL:', API_URL) // Debug ke liye

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medqueue_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    if (status === 401) {
      localStorage.removeItem('medqueue_token')
      localStorage.removeItem('medqueue_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject({ message, status, errors: error.response?.data?.errors || null })
  }
)

export default api
