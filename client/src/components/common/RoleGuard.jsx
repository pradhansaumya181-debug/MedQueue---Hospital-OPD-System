// src/components/common/RoleGuard.jsx
// Role check — galat role ka user page nahi dekh sakta
// Example: patient doctor dashboard nahi dekh sakta
//
// Usage:
// <RoleGuard allowedRoles={['doctor', 'admin']}>
//   <DoctorDashboard />
// </RoleGuard>

import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { getDashboardPath } from '@/utils/roleRedirect'

const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />

  // User ka role allowed list mein hai?
  if (!allowedRoles.includes(user.role)) {
    // Uske apne dashboard par bhejo
    const redirectPath = getDashboardPath(user.role)
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default RoleGuard
