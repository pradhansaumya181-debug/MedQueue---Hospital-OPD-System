// src/store/appointmentStore.js
// Appointment related state
// Patient ke appointments, selected slot, booking status

import { create } from 'zustand'
import api from '@/services/api'

const useAppointmentStore = create((set, get) => ({
  // =====================
  // STATE
  // =====================
  appointments: [],          // Patient ki saari appointments
  selectedDoctor: null,      // Booking ke waqt selected doctor
  selectedDate: '',          // Booking ke liye selected date
  selectedSlot: null,        // Selected time slot
  availableSlots: [],        // Doctor ke available slots
  isLoading: false,
  bookingLoading: false,     // Sirf booking operation ke liye
  error: null,

  // =====================
  // ACTIONS
  // =====================

  // --- Patient ki Appointments Load Karo ---
  fetchMyAppointments: async (status = '') => {
    set({ isLoading: true, error: null })
    try {
      const params = status ? `?status=${status}` : ''
      const response = await api.get(`/patients/appointments${params}`)
      set({
        appointments: response.data.appointments,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // --- Doctor ke Available Slots Load Karo ---
  fetchAvailableSlots: async (doctorId, date) => {
    set({ isLoading: true, availableSlots: [], error: null })
    try {
      const response = await api.get(
        `/patients/doctors/${doctorId}/slots?date=${date}`
      )
      set({
        availableSlots: response.data.availableSlots,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // --- Appointment Book Karo ---
  bookAppointment: async (doctorId, date, slotId, reason) => {
    set({ bookingLoading: true, error: null })
    try {
      const response = await api.post('/patients/appointments/book', {
        doctorId,
        date,
        slotId,
        reason,
      })

      // Booking success — appointments list refresh karo
      await get().fetchMyAppointments()

      set({
        bookingLoading: false,
        selectedSlot: null,      // Selection reset karo
      })

      return { success: true, appointment: response.data.appointment }

    } catch (error) {
      set({ bookingLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // --- Appointment Cancel Karo ---
  cancelAppointment: async (appointmentId, reason) => {
    set({ isLoading: true })
    try {
      await api.patch(`/patients/appointments/${appointmentId}/cancel`, {
        reason,
      })

      // Local state mein bhi update karo (API call ke bina)
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === appointmentId
            ? { ...apt, status: 'cancelled' }
            : apt
        ),
        isLoading: false,
      }))

      return { success: true }

    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  // --- Selection Actions ---
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  // --- Reset Booking Flow ---
  resetBooking: () => set({
    selectedDoctor: null,
    selectedDate: '',
    selectedSlot: null,
    availableSlots: [],
    error: null,
  }),

  clearError: () => set({ error: null }),
}))

export default useAppointmentStore
