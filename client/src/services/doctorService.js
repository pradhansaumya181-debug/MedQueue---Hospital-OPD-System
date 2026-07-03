// src/services/doctorService.js
import api from './api'

export const getDoctorProfile = () => api.get('/doctors/profile')

export const updateDoctorProfile = (data) => api.put('/doctors/profile', data)

export const getTodayAppointments = () =>
  api.get('/doctors/appointments/today')

export const getAppointmentsByDate = (date) =>
  api.get('/doctors/appointments', { params: { date } })

export const generateSlots = (date) =>
  api.post('/doctors/slots/generate', { date })

export const callNextPatient = (date) =>
  api.post('/doctors/queue/next', { date })

export const updateAppointmentStatus = (id, status, notes) =>
  api.patch(`/doctors/appointments/${id}/status`, { status, notes })
