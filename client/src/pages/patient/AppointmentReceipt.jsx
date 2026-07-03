// src/pages/patient/AppointmentReceipt.jsx
// Appointment ka detail page + print slip

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import useToast from '@/hooks/useToast'
import api from '@/services/api'
import { formatFullDate, formatTime } from '@/utils/formatDate'

const AppointmentReceipt = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [appointment, setAppointment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        // Single appointment fetch — appointments list se filter karte hain
        const res = await api.get('/patients/appointments')
        const apt = res.data.appointments?.find((a) => a._id === id)
        if (!apt) throw new Error('Not found')
        setAppointment(apt)
      } catch {
        toast.error('Appointment not found')
        navigate('/patient/appointments')
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <div
            className="mq-spinner mq-spinner-dark"
            style={{ width: 32, height: 32 }}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (!appointment) return null

  const doctor = appointment.doctorId
  const doctorUser = doctor?.userId
  const doctorName = doctorUser?.name?.startsWith('Dr')
    ? doctorUser.name
    : `Dr. ${doctorUser?.name || 'Unknown'}`

  const statusColors = {
    confirmed: { color: '#10b981', bg: '#ecfdf5' },
    completed: { color: '#6b7280', bg: '#f3f4f6' },
    cancelled: { color: '#ef4444', bg: '#fef2f2' },
  }
  const sc = statusColors[appointment.status] || statusColors.confirmed

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 560 }}>

        {/* Back */}
        <button
          onClick={() => navigate('/patient/appointments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 13,
            padding: 0,
            marginBottom: 24,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to appointments
        </button>

        {/* Receipt card */}
        <div
          className="mq-card"
          id="print-receipt"
          style={{ overflow: 'hidden' }}
        >
          {/* Header band */}
          <div
            style={{
              background: 'var(--brand-dark)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--brand-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="8" y="2" width="6" height="18" rx="2" fill="white" />
                  <rect x="2" y="8" width="18" height="6" rx="2" fill="white" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  MedQueue
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    margin: 0,
                  }}
                >
                  Appointment Receipt
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 99,
                color: sc.color,
                background: sc.bg,
              }}
            >
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </span>
          </div>

          {/* Token number highlight */}
          {appointment.tokenNumber && (
            <div
              style={{
                padding: '20px 24px',
                background: 'rgba(0,180,216,0.06)',
                borderBottom: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  margin: '0 0 4px',
                  letterSpacing: '0.08em',
                  fontWeight: 500,
                }}
              >
                QUEUE TOKEN NUMBER
              </p>
              <p
                style={{
                  fontSize: 52,
                  fontWeight: 800,
                  color: 'var(--brand-accent)',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                #{appointment.tokenNumber}
              </p>
            </div>
          )}

          {/* Details */}
          <div style={{ padding: '24px' }}>
            {[
              { label: 'Doctor', value: doctorName },
              { label: 'Specialization', value: doctor?.specialization || '—' },
              {
                label: 'Date',
                value: formatFullDate(appointment.date),
              },
              {
                label: 'Time',
                value: `${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`,
              },
              {
                label: 'Consultation Fee',
                value: `₹${doctor?.consultationFee || '—'}`,
              },
              {
                label: 'Reason',
                value: appointment.reason || 'Not specified',
              },
              {
                label: 'Appointment ID',
                value: appointment._id,
                mono: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textAlign: 'right',
                    fontFamily: row.mono ? 'monospace' : 'inherit',
                    fontSize: row.mono ? 11 : 13,
                    wordBreak: row.mono ? 'break-all' : 'normal',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {/* Doctor notes */}
            {appointment.notes && (
              <div style={{ marginTop: 16 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    margin: '0 0 8px',
                    letterSpacing: '0.05em',
                  }}
                >
                  DOCTOR'S NOTES
                </p>
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  "{appointment.notes}"
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 24px',
              background: 'var(--surface-2)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <p
              style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}
            >
              Generated by MedQueue •{' '}
              {new Date().toLocaleDateString('en-IN')}
            </p>
            <button
              onClick={handlePrint}
              className="mq-btn-secondary"
              style={{ width: 'auto', padding: '7px 16px', fontSize: 12 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 5V2h8v3M3 10H1V5h12v5h-2M3 8h8v4H3V8z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Print Slip
            </button>
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body > *:not(#print-receipt) { display: none; }
            #print-receipt { box-shadow: none; border: 1px solid #ddd; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}

export default AppointmentReceipt
