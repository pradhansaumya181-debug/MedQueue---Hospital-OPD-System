// src/pages/patient/MyAppointments.jsx
// UPDATED — Custom ConfirmModal added, window.confirm() removed
import RatingModal from '@/components/patient/RatingModal'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import useAppointmentStore from '@/store/appointmentStore'
import useToast from '@/hooks/useToast'
import { formatFullDate, formatTime } from '@/utils/formatDate'
import ConfirmModal from '@/components/common/ConfirmModal'  // ← naya import

const tabs = [
  { key: '', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]


const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#10b981', bg: '#ecfdf5' },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
  completed: { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' },
  no_show:   { label: 'No Show',   color: '#8b5cf6', bg: '#f5f3ff' },
}

const MyAppointments = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { appointments, fetchMyAppointments, cancelAppointment, isLoading } = useAppointmentStore()

  const [activeTab, setActiveTab]       = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const [ratingModal, setRatingModal] = useState({ open: false, appointment: null })

  // ── Modal state ──────────────────────────────
  const [modalOpen, setModalOpen]           = useState(false)
  const [cancelTargetId, setCancelTargetId] = useState(null)
  // ─────────────────────────────────────────────

  useEffect(() => {
    fetchMyAppointments(activeTab)
  }, [activeTab])

  // Cancel button click → modal kholo
  const handleCancelClick = (id) => {
    setCancelTargetId(id)
    setModalOpen(true)
  }

  // Modal ke "Yes, Cancel" button → actual cancel
  const handleConfirmCancel = async () => {
    setCancellingId(cancelTargetId)
    const result = await cancelAppointment(cancelTargetId, 'Cancelled by patient')
    setModalOpen(false)
    setCancelTargetId(null)
    setCancellingId(null)
    if (result.success) {
      toast.success('Appointment cancelled successfully', 'Done')
    } else {
      toast.error(result.error || 'Failed to cancel')
    }
  }

  // Modal ka "Keep it" button
  const handleModalClose = () => {
    setModalOpen(false)
    setCancelTargetId(null)
  }

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            My Appointments
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            View and manage your appointments
          </p>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          borderBottom: '1px solid var(--border)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? 'var(--brand-accent)' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab.key ? 'var(--brand-accent)' : 'transparent'}`,
                marginBottom: -1, transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {isLoading ? (
          // Skeleton loader
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: 100,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                animation: 'mq-shimmer 1.4s ease infinite',
              }} />
            ))}
          </div>

        ) : appointments.length === 0 ? (
          // Empty state
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              No appointments found
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
              {activeTab ? `No ${activeTab} appointments` : 'Book your first appointment'}
            </p>
            <button
              className="mq-btn-primary"
              onClick={() => navigate('/patient/search')}
              style={{ width: 'auto', padding: '10px 24px', margin: '0 auto', fontSize: 13 }}
            >
              Book an Appointment
            </button>
          </div>

        ) : (
          // Appointment cards
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map(apt => {
              const sc         = statusConfig[apt.status] || statusConfig.pending
              const doctorUser = apt.doctorId?.userId
              const canCancel  = apt.status === 'confirmed' || apt.status === 'pending'
              const isCancelling = cancellingId === apt._id

              {apt.status === 'completed' && (
  <button
    onClick={() => setRatingModal({ open: true, appointment: apt })}
    style={{
      padding: '7px 14px',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid #f59e0b',
      background: 'none', color: '#f59e0b',
      fontSize: 12, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'var(--font-sans)',
      display: 'flex', alignItems: 'center', gap: 5,
      transition: 'all 0.15s', flexShrink: 0,
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
  >
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1l1.545 3.13 3.455.502-2.5 2.437.59 3.44L6.5 8.885 3.91 10.51l.59-3.441L2 4.632l3.455-.503L6.5 1z"
        fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.5"/>
        </svg>
    Rate
  </button>
)}

              // Doctor naam — "Dr." double nahi aayega
              const doctorName = doctorUser?.name
                ? doctorUser.name.startsWith('Dr')
                  ? doctorUser.name
                  : `Dr. ${doctorUser.name}`
                : 'Unknown'

              // Avatar initials
              const initials = doctorUser?.name
                ? doctorUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : 'DR'

              return (
                <div
                  key={apt._id}
                  className="mq-card"
                  style={{
                    padding: '18px 20px',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

                    {/* ── Avatar ── */}
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-mid))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: 'var(--brand-accent)',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {doctorUser?.profilePicture
                        ? <img src={doctorUser.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials
                      }
                    </div>

                    {/* ── Info ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Name + Status badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{
                          fontSize: 15, fontWeight: 600,
                          color: 'var(--text-primary)', margin: 0,
                        }}>
                          {doctorName}
                        </h3>
                        <span style={{
                          fontSize: 11, fontWeight: 500,
                          padding: '2px 9px', borderRadius: 99,
                          color: sc.color, background: sc.bg,
                          border: `1px solid ${sc.color}25`,
                        }}>
                          {sc.label}
                        </span>
                      </div>

                      {/* Date + Time + Token */}
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 12, color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          {formatFullDate(apt.date)}
                        </span>

                        <span style={{
                          fontSize: 12, color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          {formatTime(apt.startTime)}
                        </span>

                        {apt.tokenNumber && (
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: 'var(--brand-accent)',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            Token #{apt.tokenNumber}
                          </span>
                        )}
                      </div>

                      {/* Reason */}
                      {apt.reason && (
                        <p style={{
                          fontSize: 12, color: 'var(--text-muted)',
                          margin: '7px 0 0', fontStyle: 'italic',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          "{apt.reason}"
                        </p>
                      )}
                    </div>

                    {/* ── Cancel Button ── */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(apt._id)}
                        disabled={isCancelling}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--error)',
                          background: 'none',
                          color: 'var(--error)',
                          fontSize: 12, fontWeight: 500,
                          cursor: isCancelling ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                          fontFamily: 'var(--font-sans)',
                          opacity: isCancelling ? 0.5 : 1,
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                        onMouseEnter={e => {
                          if (!isCancelling) {
                            e.currentTarget.style.background = 'var(--error-bg)'
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'none'
                        }}
                      >
                        {isCancelling ? (
                          <>
                            <div style={{
                              width: 12, height: 12,
                              border: '2px solid var(--error)',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'mq-spin 0.7s linear infinite',
                            }} />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                            Cancel
                          </>
                        )}
                      </button>
                    )}

                    {/* View Receipt Button */}
                    <button
                      onClick={() => navigate(`/patient/appointments/${apt._id}`)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        background: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: 12, fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 0.15s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--brand-accent)'
                        e.currentTarget.style.color = 'var(--brand-accent)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }}
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Confirm Cancel Modal ── */}
        <ConfirmModal
          isOpen={modalOpen}
          onCancel={handleModalClose}
          onConfirm={handleConfirmCancel}
          isLoading={cancellingId === cancelTargetId && cancellingId !== null}
          title="Cancel Appointment?"
          message="This appointment will be cancelled and the time slot will be freed for others. This action cannot be undone."
          confirmLabel="Yes, Cancel it"
          cancelLabel="Keep it"
          type="danger"
        />
        <RatingModal
  isOpen={ratingModal.open}
  appointment={ratingModal.appointment}
  onClose={() => setRatingModal({ open: false, appointment: null })}
  onSuccess={() => fetchMyAppointments(activeTab)}
/>

      </div>
    </DashboardLayout>
  )
}

export default MyAppointments
