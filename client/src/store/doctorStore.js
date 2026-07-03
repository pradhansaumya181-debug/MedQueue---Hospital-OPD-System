// src/store/doctorStore.js — COMPLETE UPDATED VERSION
import { create } from 'zustand'
import api from '@/services/api'

const useDoctorStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────
  todayAppointments: [],
  doctorProfile: null,
  queueInfo: { currentlyServing: 0, totalTokens: 0 },
  isLoading: false,
  error: null,

  // ── Actions ────────────────────────────────────────

  // Aaj ki appointments load karo
  fetchTodayAppointments: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/doctors/appointments/today')
      set({
        todayAppointments: response.data.appointments || [],
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // Doctor profile load karo
  fetchDoctorProfile: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/doctors/profile')
      set({ doctorProfile: response.data.doctor, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // Next patient call karo — $inc queue counter
  callNextPatient: async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.post('/doctors/queue/next', { date: today })

      set((state) => ({
        queueInfo: {
          ...state.queueInfo,
          currentlyServing: response.data.currentlyServing,
          totalTokens: response.data.totalTokens,
        },
      }))

      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Appointment status update — completed / no_show
  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    try {
      await api.patch(`/doctors/appointments/${appointmentId}/status`, {
        status,
        notes,
      })

      // Local state update — API call nahi
      set((state) => ({
        todayAppointments: state.todayAppointments.map((apt) =>
          apt._id === appointmentId ? { ...apt, status } : apt
        ),
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Queue info manually set karo (Firestore se)
  setQueueInfo: (info) => set({ queueInfo: info }),

  clearError: () => set({ error: null }),
}))

export default useDoctorStore
