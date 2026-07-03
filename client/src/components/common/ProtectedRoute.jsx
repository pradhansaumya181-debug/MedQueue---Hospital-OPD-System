// src/components/common/ProtectedRoute.jsx
// Login check karo — nahi hai to /login par bhejo
// Authenticated pages ke liye wrap karo

import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import Loader from './Loader'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore()
  const location = useLocation()

  // Token hai to show karo
  if (isAuthenticated && token) {
    return children
  }

  // Nahi hai to login par bhejo
  // state mein current path save karo — login ke baad wapas aayenge
  return <Navigate to="/login" state={{ from: location }} replace />
}

export default ProtectedRoute
