// src/hooks/useAuth.js
// Auth store ka convenient wrapper hook
// Components mein seedha useAuthStore() use kar sakte hain
// Ya is hook se — cleaner syntax milta hai

import useAuthStore from '@/store/authStore'
import { getDashboardPath } from '@/utils/roleRedirect'
import { useNavigate } from 'react-router-dom'

const useAuth = () => {
  const navigate = useNavigate()
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    loginWithGoogle,
    loginWithEmailFirebase,
    loginStaff,
    registerStaff,
    logout,
    refreshUser,
    clearError,
  } = useAuthStore()

  // Login ke baad sahi dashboard par bhejo
  const loginAndRedirect = async (loginFn, ...args) => {
    const result = await loginFn(...args)
    if (result.success) {
      const path = getDashboardPath(result.user.role)
      navigate(path)
    }
    return result
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    role: user?.role || null,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',

    // Login helpers (redirect bhi karte hain)
    loginGoogle: () => loginAndRedirect(loginWithGoogle),
    loginEmail: (email, pass) =>
      loginAndRedirect(loginWithEmailFirebase, email, pass),
    loginStaff: (email, pass) =>
      loginAndRedirect(loginStaff, email, pass),
    registerStaff,

    logout: async () => {
      await logout()
      navigate('/login')
    },

    refreshUser,
    clearError,
  }
}

export default useAuth
