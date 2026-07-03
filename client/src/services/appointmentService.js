// src/services/appointmentService.js
// Appointment related API calls
// React Query ke saath use hote hain ye functions

import api from './api'

// Doctors search karo
export const searchDoctors = (params) =>
  api.get('/patients/doctors/search', { params })

// Doctor ke slots fetch karo
export const getDoctorSlots = (doctorId, date) =>
  api.get(`/patients/doctors/${doctorId}/slots`, { params: { date } })

// Appointment book karo
export const bookAppointment = (data) =>
  api.post('/patients/appointments/book', data)

// Patient ki appointments
export const getMyAppointments = (params) =>
  api.get('/patients/appointments', { params })

// Cancel karo
export const cancelAppointment = (id, reason) =>
  api.patch(`/patients/appointments/${id}/cancel`, { reason })

// Reschedule
export const rescheduleAppointment = (id, data) =>
  api.patch(`/patients/appointments/${id}/reschedule`, data)

// Queue status
export const getQueueStatus = (doctorId, date) =>
  api.get(`/patients/queue/${doctorId}`, { params: { date } })
