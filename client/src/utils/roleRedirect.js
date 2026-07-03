// src/utils/roleRedirect.js
// Login ke baad user ko sahi dashboard par bhejo
// Patient → /patient/dashboard
// Doctor → /doctor/dashboard
// Admin → /admin/dashboard

export const getDashboardPath = (role) => {
  const paths = {
    patient: '/patient/dashboard',
    doctor: '/doctor/dashboard',
    admin: '/admin/dashboard',
  }
  // Role nahi mila to login par wapas
  return paths[role] || '/login'
}

/**
 * Unauthorized access par redirect karo
 * User galat role ki page par jaane ki koshish kare
 */
export const getUnauthorizedRedirect = (userRole) => {
  return getDashboardPath(userRole)
}
