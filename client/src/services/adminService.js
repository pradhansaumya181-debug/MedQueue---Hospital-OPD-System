// src/services/adminService.js
import api from './api'

export const createDoctorProfile = (data) => api.post('/admin/doctors', data)

export const updateDoctorProfile = (id, data) =>
  api.put(`/admin/doctors/${id}`, data)

export const deleteDoctorProfile = (id) =>
  api.delete(`/admin/doctors/${id}`)

export const bulkCancelAppointments = (data) =>
  api.post('/admin/appointments/bulk-cancel', data)

export const getAllUsers = (params) =>
  api.get('/admin/users', { params })

export const toggleUserBlock = (id) =>
  api.patch(`/admin/users/${id}/toggle-block`)

export const getHospitalStats = () => api.get('/admin/stats')
