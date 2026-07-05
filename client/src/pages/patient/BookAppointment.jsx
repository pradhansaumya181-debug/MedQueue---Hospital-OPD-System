// src/pages/patient/BookAppointment.jsx
// Doctor select → Date select → Slot select → Book

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import PaymentModal from '@/components/patient/PaymentModal'
import SlotPicker from '@/components/patient/SlotPicker'
import useAppointmentStore from '@/store/appointmentStore'
import useToast from '@/hooks/useToast'
import { formatFullDate, getTodayString } from '@/utils/formatDate'
import { getDoctorSlots } from '@/services/appointmentService'
import api from '@/services/api'

// Date picker helper — agle 14 din ke buttons
const DateSelector = ({ selectedDate, onSelect }) => {
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
      {dates.map(date => {
        const d = new Date(date)
        const isSelected = date === selectedDate
        const isToday = date === getTodayString()
        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            style={{
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isSelected ? 'var(--brand-accent)' : 'var(--border)'}`,
              background: isSelected ? 'var(--brand-accent)' : 'var(--surface)',
              color: isSelected ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'var(--font-sans)',
              minWidth: 60,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, opacity: isSelected ? 0.85 : 0.6 }}>
              {isToday ? 'Today' : dayNames[d.getDay()]}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
              {d.getDate()}
            </span>
            <span style={{ fontSize: 11, opacity: isSelected ? 0.85 : 0.6 }}>
              {monthNames[d.getMonth()]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const BookAppointment = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { bookingLoading, bookAppointment, selectedSlot, setSelectedSlot } = useAppointmentStore()

  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('online') // 'online' | 'counter'

  const [doctor, setDoctor] = useState(null)
  const [doctorLoading, setDoctorLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [step, setStep] = useState(1) // 1=date/slot, 2=confirm

  // Doctor info fetch
  // BookAppointment.jsx mein doctor fetch useEffect:
useEffect(() => {
  const fetchDoctor = async () => {
    try {
      const res = await api.get(`/patients/doctors/${doctorId}/slots?date=${selectedDate}`)
      console.log('Doctor response:', res.data) // debug
      setDoctor(res.data.doctor)
    } catch {
      toast.error('Doctor not found')
      navigate('/patient/search')
    } finally {
      setDoctorLoading(false)
    }
  }
  fetchDoctor()
}, [doctorId])

  // Slots fetch when date changes
  useEffect(() => {
    if (!doctorId || !selectedDate) return
    const fetchSlots = async () => {
      setSlotsLoading(true)
      setSelectedSlot(null)
      try {
        const res = await getDoctorSlots(doctorId, selectedDate)
        setSlots(res.data.availableSlots || [])
      } catch {
        setSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }
    fetchSlots()
  }, [doctorId, selectedDate])

  const handleBook = async () => {
    if (!selectedSlot) return
    const result = await bookAppointment(doctorId, selectedDate, selectedSlot._id, reason)
    if (result.success) {
      toast.success(
        `Appointment confirmed! Token #${result.appointment?.tokenNumber}`,
        'Booking Successful 🎉'
      )
      navigate('/patient/appointments')
    } else {
      toast.error(result.error || 'Booking failed. Please try again.')
    }
  }

  if (doctorLoading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div className="mq-spinner mq-spinner-dark" style={{ width: 32, height: 32 }} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 680 }}>

        {/* Back */}
        <button
          onClick={() => step === 2 ? setStep(1) : navigate('/patient/search')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 13, padding: 0, marginBottom: 24,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {step === 2 ? 'Back to slots' : 'Back to search'}
        </button>

        {/* Doctor info card */}
        <div className="mq-card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--brand-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'var(--brand-accent)',
            flexShrink: 0,
          }}>
            {doctor?.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'DR'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 3px', color: 'var(--text-primary)' }}>
              {doctor?.name?.startsWith('Dr') ? doctor.name : `Dr. ${doctor?.name}`}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--brand-accent)', margin: '0 0 4px', fontWeight: 500 }}>
              {doctor?.specialization}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {doctor?.workingHours?.start} – {doctor?.workingHours?.end}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              ₹{doctor?.consultationFee}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>per visit</p>
          </div>
        </div>

        {step === 1 && (
          <>
            {/* Date selector */}
            <div className="mq-card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>
                Select Date
              </h3>
              <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 0' }}>
                {formatFullDate(selectedDate)}
              </p>
            </div>

            {/* Slot picker */}
            <div className="mq-card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Available Slots
                </h3>
                {!slotsLoading && (
                  <span style={{
                    fontSize: 12, fontWeight: 500, padding: '2px 10px',
                    background: 'var(--success-bg)', color: 'var(--success)',
                    borderRadius: 99,
                  }}>
                    {slots.length} available
                  </span>
                )}
              </div>
              <SlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
                isLoading={slotsLoading}
              />
            </div>

            {/* Continue button */}
            <button
              className="mq-btn-primary"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
            >
              Continue to Confirm
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Confirmation summary */}
            <div className="mq-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>
                Confirm Appointment
              </h3>

              {/* Summary rows */}
              {[
               { label: 'Doctor', value: doctor?.name?.startsWith('Dr') ? doctor.name : `Dr. ${doctor?.name}` },
                { label: 'Date', value: formatFullDate(selectedDate) },
                { label: 'Time', value: `${selectedSlot?.startTime} – ${selectedSlot?.endTime}` },
                { label: 'Consultation Fee', value: `₹${doctor?.consultationFee}` },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}

              {/* Reason input */}
              <div style={{ marginTop: 16 }}>
                <label className="mq-label">Reason for visit (optional)</label>
                <textarea
                  className="mq-input"
                  placeholder="Describe your symptoms or reason..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: 14 }}
                />
              </div>
            </div>

            {/* Payment Method selector */}
            <div className="mq-card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>
                Select Payment Method
              </h3>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px',
                  border: `1.5px solid ${paymentMethod === 'online' ? 'var(--brand-accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: paymentMethod === 'online' ? 'var(--brand-light)' : 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    style={{ accentColor: 'var(--brand-accent)', cursor: 'pointer' }}
                  />
                  Pay Online (Razorpay)
                </label>
                
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px',
                  border: `1.5px solid ${paymentMethod === 'counter' ? 'var(--brand-accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: paymentMethod === 'counter' ? 'var(--brand-light)' : 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="counter"
                    checked={paymentMethod === 'counter'}
                    onChange={() => setPaymentMethod('counter')}
                    style={{ accentColor: 'var(--brand-accent)', cursor: 'pointer' }}
                  />
                  Pay Cash at Counter
                </label>
              </div>
            </div>

            {/* Confirm button */}
            <button
              className="mq-btn-primary"
              onClick={paymentMethod === 'online' ? () => setPaymentModal(true) : handleBook}
              disabled={!selectedSlot || bookingLoading}
            >
              {bookingLoading ? (
                <div className="mq-spinner" style={{ width: 16, height: 16 }} />
              ) : paymentMethod === 'online' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="4" width="14" height="10" rx="2" stroke="white" strokeWidth="1.6"/>
                    <path d="M1 8h14" stroke="white" strokeWidth="1.6"/>
                  </svg>
                  Proceed to Payment — ₹{doctor?.consultationFee}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4l-7 7-3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Confirm & Book (Pay at Counter)
                </>
              )}
            </button>

          </>
        )}
      </div>

      <PaymentModal
  isOpen={paymentModal}
  onClose={() => setPaymentModal(false)}
  bookingData={{
    doctorId,
    date: selectedDate,
    slotId:     selectedSlot?._id,
    reason,
    doctorName: doctor?.name,
    fee:        doctor?.consultationFee || 0,
    startTime:  selectedSlot?.startTime,
  }}
  onSuccess={(data) => {
    navigate('/patient/appointments')
  }}
/>
    </DashboardLayout>

  )
}

export default BookAppointment
