// src/services/paymentService.js
import api from './api'

export const createOrder   = (data) => api.post('/payments/create-order', data)
export const verifyPayment = (data) => api.post('/payments/verify', data)
export const refundPayment = (appointmentId) => api.post(`/payments/refund/${appointmentId}`)
export const getMyPayments = () => api.get('/payments/my-payments')
