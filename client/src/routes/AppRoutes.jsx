// src/routes/AppRoutes.jsx
// FINAL — Sab routes, error boundary, lazy loading

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import ErrorBoundary from '@/components/common/ErrorBoundary'
import PageLoader from '@/components/common/PageLoader'
import ToastContainer from '@/components/common/Toast'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import RoleGuard from '@/components/common/RoleGuard'

// Auth pages — eager load (fast hona chahiye)
import RoleSelect from '@/pages/auth/RoleSelect'
import Login      from '@/pages/auth/Login'
import Register   from '@/pages/auth/Register'
import NotFound   from '@/pages/NotFound'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import AdminLogin from '@/pages/auth/AdminLogin'



// Patient pages — lazy load
const PatientDashboard = lazy(() => import('@/pages/patient/PatientDashboard'))
const SearchDoctors    = lazy(() => import('@/pages/patient/SearchDoctors'))
const BookAppointment  = lazy(() => import('@/pages/patient/BookAppointment'))
const MyAppointments   = lazy(() => import('@/pages/patient/MyAppointments'))
const WaitingRoom      = lazy(() => import('@/pages/patient/WaitingRoom'))
const Profile           = lazy(() => import('@/pages/patient/Profile'))
const AppointmentReceipt = lazy(() => import('@/pages/patient/AppointmentReceipt'))

// Doctor pages — lazy load
const DoctorDashboard  = lazy(() => import('@/pages/doctor/DoctorDashboard'))
const TodayQueue       = lazy(() => import('@/pages/doctor/TodayQueue'))
const ManageSlots      = lazy(() => import('@/pages/doctor/ManageSlots'))
const DoctorProfile     = lazy(() => import('@/pages/doctor/DoctorProfile'))


// Admin pages — lazy load
const AdminDashboard   = lazy(() => import('@/pages/admin/AdminDashboard'))
const ManageDoctors    = lazy(() => import('@/pages/admin/ManageDoctors'))
const ManagePatients   = lazy(() => import('@/pages/admin/ManagePatients'))
const BulkCancel       = lazy(() => import('@/pages/admin/BulkCancel'))
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'))

const AppRoutes = () => {
  return (
    <BrowserRouter>
      {/* Toast — poori app ke upar fixed position */}
      <ToastContainer />

      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/"         element={<RoleSelect />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminLogin />} />
        
        {/* ── PATIENT ── */}
        <Route
          path="/patient/*"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <RoleGuard allowedRoles={['patient']}>
                  <Suspense fallback={<PageLoader message="Loading patient portal..." />}>
                    <Routes>
                      <Route index                      element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard"           element={<PatientDashboard />} />
                      <Route path="search"              element={<SearchDoctors />} />
                      <Route path="book/:doctorId"      element={<BookAppointment />} />
                      <Route path="appointments"        element={<MyAppointments />} />
                      <Route path="waiting-room"        element={<WaitingRoom />} />
                      <Route path="profile"              element={<Profile />} />
<Route path="appointments/:id"     element={<AppointmentReceipt />} />

                    </Routes>
                  </Suspense>
                </RoleGuard>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* ── DOCTOR ── */}
        <Route
          path="/doctor/*"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <RoleGuard allowedRoles={['doctor']}>
                  <Suspense fallback={<PageLoader message="Loading doctor portal..." />}>
                    <Routes>
                      <Route index            element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<DoctorDashboard />} />
                      <Route path="queue"     element={<TodayQueue />} />
                      <Route path="slots"     element={<ManageSlots />} />
                      <Route path="profile"              element={<DoctorProfile />} />
                    </Routes>
                  </Suspense>
                </RoleGuard>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* ── ADMIN ── */}
        <Route
          path="/admin/*"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <Suspense fallback={<PageLoader message="Loading admin portal..." />}>
                    <Routes>
                      <Route index             element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard"  element={<AdminDashboard />} />
                      <Route path="doctors"    element={<ManageDoctors />} />
                      <Route path="patients"   element={<ManagePatients />} />
                      <Route path="cancel"     element={<BulkCancel />} />
                      <Route path="profile"    element={<AdminProfile />} />
                    </Routes>
                  </Suspense>
                </RoleGuard>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
