// src/pages/doctor/TodayQueue.jsx
// Full queue view — doctor apna queue manage karta hai

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import useDoctorStore from '@/store/doctorStore'
import useToast from '@/hooks/useToast'
import { formatTime, getTodayString } from '@/utils/formatDate'
import ConfirmModal from '@/components/common/ConfirmModal'
import api from '@/services/api'

const statusConfig = {
  confirmed:  { label: 'Confirmed',  color: '#10b981', bg: '#ecfdf5' },
  completed:  { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' },
  cancelled:  { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
  no_show:    { label: 'No Show',   color: '#8b5cf6', bg: '#f5f3ff' },
}

const TodayQueue = () => {
  const toast = useToast()
  const {
    todayAppointments, fetchTodayAppointments,
    callNextPatient, updateAppointmentStatus,
    queueInfo, isLoading,
  } = useDoctorStore()

  const [callingNext, setCallingNext]   = useState(false)
  const [filter, setFilter]             = useState('all')
  const [modalOpen, setModalOpen]       = useState(false)
  const [modalConfig, setModalConfig]   = useState({})
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTodayAppointments()
  }, [])

  const handleCallNext = async () => {
    setCallingNext(true)
    const result = await callNextPatient()
    setCallingNext(false)
    if (result.success) {
      toast.success(`Now serving token #${result.data.currentlyServing}`, 'Next Patient Called')
      fetchTodayAppointments()
    } else {
      toast.warning('No more confirmed patients in queue')
    }
  }

  const openModal = (config) => {
    setModalConfig(config)
    setModalOpen(true)
  }

  const handleMarkDone = (apt) => {
    openModal({
      title: 'Mark as Completed?',
      message: `Mark ${apt.patientId?.name || 'this patient'}'s appointment as completed?`,
      confirmLabel: 'Mark Done',
      type: 'info',
      onConfirm: async () => {
        setActionLoading(true)
        await updateAppointmentStatus(apt._id, 'completed')
        setActionLoading(false)
        setModalOpen(false)
        toast.success('Appointment marked as completed')
      },
    })
  }

  const handleNoShow = (apt) => {
    openModal({
      title: 'Mark as No Show?',
      message: `${apt.patientId?.name || 'This patient'} did not show up?`,
      confirmLabel: 'Yes, No Show',
      type: 'warning',
      onConfirm: async () => {
        setActionLoading(true)
        await updateAppointmentStatus(apt._id, 'no_show')
        setActionLoading(false)
        setModalOpen(false)
        toast.info('Marked as no show')
      },
    })
  }

  const filtered = filter === 'all'
    ? todayAppointments
    : todayAppointments.filter(a => a.status === filter)

  const confirmed  = todayAppointments.filter(a => a.status === 'confirmed').length
  const completed  = todayAppointments.filter(a => a.status === 'completed').length

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* Header + Next button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Today's Queue
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              {getTodayString()} • {confirmed} waiting • {completed} done
            </p>
          </div>
          <button
            className="mq-btn-primary"
            onClick={handleCallNext}
            disabled={callingNext || confirmed === 0}
            style={{ width: 'auto', padding: '12px 24px', fontSize: 14 }}
          >
            {callingNext ? (
              <><div className="mq-spinner" /> Calling...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8l6 6 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Call Next
              </>
            )}
          </button>
        </div>

        {/* Currently serving banner */}
        {queueInfo.currentlyServing > 0 && (
          <div style={{
            padding: '16px 20px', marginBottom: 20,
            background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-mid))',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: 'rgba(0,180,216,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 22 }}>🔔</span>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 2px', letterSpacing: '0.05em' }}>
                NOW SERVING
              </p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1 }}>
                Token #{queueInfo.currentlyServing}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 2px' }}>Remaining</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--brand-accent)', margin: 0 }}>{confirmed}</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
          {['all', 'confirmed', 'completed', 'cancelled', 'no_show'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13,
                fontWeight: filter === f ? 600 : 400,
                color: filter === f ? 'var(--brand-accent)' : 'var(--text-muted)',
                borderBottom: `2px solid ${filter === f ? 'var(--brand-accent)' : 'transparent'}`,
                marginBottom: -1, transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
              }}
            >
              {f === 'no_show' ? 'No Show' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Queue list */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 80, borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', animation: 'mq-shimmer 1.4s ease infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 16px' }}>
            <p style={{ fontSize: 36, margin: '0 0 12px' }}>📭</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              No {filter === 'all' ? '' : filter} appointments
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((apt, idx) => {
              const sc = statusConfig[apt.status] || statusConfig.confirmed
              const patient = apt.patientId
              const isServing = apt.tokenNumber === queueInfo.currentlyServing && apt.status === 'confirmed'

              return (
                <div
                  key={apt._id}
                  className="mq-card"
                  style={{
                    padding: '16px 20px',
                    border: isServing ? '2px solid var(--brand-accent)' : '1px solid var(--border)',
                    background: isServing ? 'rgba(0,180,216,0.03)' : 'var(--surface)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Token */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-md)',
                      background: isServing ? 'var(--brand-accent)' : 'var(--brand-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800,
                      color: isServing ? '#fff' : 'var(--brand-accent)',
                      flexShrink: 0,
                      transition: 'all 0.3s',
                    }}>
                      {apt.tokenNumber || idx+1}
                    </div>

                    {/* Patient info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          {patient?.name || 'Patient'}
                        </p>
                        {isServing && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px',
                            borderRadius: 99, background: 'var(--brand-accent)',
                            color: '#fff', letterSpacing: '0.05em',
                          }}>
                            SERVING NOW
                          </span>
                        )}
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: '2px 8px',
                          borderRadius: 99, color: sc.color, background: sc.bg,
                        }}>
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        {patient?.phone && `${patient.phone} • `}
                        {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
                        {apt.reason && ` • "${apt.reason}"`}
                      </p>
                    </div>

                    {/* Actions */}
                    {apt.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => handleMarkDone(apt)}
                          style={{
                            padding: '7px 14px', borderRadius: 'var(--radius-md)',
                            border: '1.5px solid #10b981', background: 'none',
                            color: '#10b981', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ecfdf5' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                        >
                          ✓ Done
                        </button>
                        <button
                          onClick={() => handleNoShow(apt)}
                          style={{
                            padding: '7px 14px', borderRadius: 'var(--radius-md)',
                            border: '1.5px solid var(--border)', background: 'none',
                            color: 'var(--text-muted)', fontSize: 12, fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                        >
                          No Show
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Confirm modal */}
        <ConfirmModal
          isOpen={modalOpen}
          onCancel={() => setModalOpen(false)}
          onConfirm={modalConfig.onConfirm}
          isLoading={actionLoading}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          type={modalConfig.type || 'info'}
        />
      </div>
    </DashboardLayout>
  )
}

export default TodayQueue
