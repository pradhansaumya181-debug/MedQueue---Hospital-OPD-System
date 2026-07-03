// src/pages/doctor/DoctorDashboard.jsx
// Doctor ka main dashboard — aaj ki summary + quick stats

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import useAuth from '@/hooks/useAuth'
import useDoctorStore from '@/store/doctorStore'
import { formatTime, getTodayString } from '@/utils/formatDate'

// Stat card
const StatCard = ({ label, value, icon, color, bg, onClick }) => (
  <div
    className="mq-card"
    onClick={onClick}
    style={{
      padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'translateY(0)' }}
  >
    <div style={{
      width: 50, height: 50, borderRadius: 'var(--radius-md)',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 24, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{label}</p>
    </div>
  </div>
)

const statusConfig = {
  confirmed:  { label: 'Confirmed',  color: '#10b981', bg: '#ecfdf5' },
  pending:    { label: 'Pending',    color: '#f59e0b', bg: '#fffbeb' },
  cancelled:  { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
  completed:  { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' },
  no_show:    { label: 'No Show',   color: '#8b5cf6', bg: '#f5f3ff' },
}

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    todayAppointments, doctorProfile,
    fetchTodayAppointments, fetchDoctorProfile,
    callNextPatient, updateAppointmentStatus,
    isLoading,
  } = useDoctorStore()

  useEffect(() => {
    fetchTodayAppointments()
    fetchDoctorProfile()
  }, [])

  const confirmed  = todayAppointments.filter(a => a.status === 'confirmed')
  const completed  = todayAppointments.filter(a => a.status === 'completed')
  const cancelled  = todayAppointments.filter(a => a.status === 'cancelled')
  const serving    = todayAppointments.find(a => a.status === 'confirmed' && a.tokenNumber)

  const handleNext = async () => {
    const result = await callNextPatient()
    if (!result.success) alert('No more patients in queue')
  }

  const handleStatus = async (id, status) => {
    await updateAppointmentStatus(id, status)
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const docName  = doctorProfile?.userId?.name || user?.name || 'Doctor'

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {greeting},{' '}
              <span style={{ color: 'var(--brand-accent)' }}>
                {docName.startsWith('Dr') ? docName : `Dr. ${docName.split(' ')[0]}`}
              </span> 👨‍⚕️
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Next patient button */}
          <button
            className="mq-btn-primary"
            onClick={handleNext}
            style={{ width: 'auto', padding: '12px 24px', fontSize: 14 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v6M8 10v4M2 8h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Call Next Patient
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          <StatCard label="Today's Total" value={todayAppointments.length} icon="📋" bg="#eff6ff" onClick={() => navigate('/doctor/queue')} />
          <StatCard label="Confirmed" value={confirmed.length} icon="✅" bg="#ecfdf5" />
          <StatCard label="Completed" value={completed.length} icon="🏁" bg="#f5f3ff" />
          <StatCard label="Cancelled" value={cancelled.length} icon="❌" bg="#fef2f2" />
        </div>

        {/* Profile card */}
        {doctorProfile && (
          <div className="mq-card" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-mid))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: 'var(--brand-accent)',
              flexShrink: 0,
            }}>
              {doctorProfile.userId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'DR'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {doctorProfile.userId?.name?.startsWith('Dr') ? doctorProfile.userId.name : `Dr. ${doctorProfile.userId?.name}`}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--brand-accent)', margin: '0 0 4px', fontWeight: 500 }}>
                {doctorProfile.specialization}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {doctorProfile.workingHours?.start} – {doctorProfile.workingHours?.end} •{' '}
                ₹{doctorProfile.consultationFee} per visit
              </p>
            </div>
            <button
              className="mq-btn-secondary"
              onClick={() => navigate('/doctor/slots')}
              style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
            >
              Manage Slots
            </button>
          </div>
        )}

        {/* Today's queue list */}
        <div className="mq-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Today's Queue
            </h2>
            <button
              onClick={() => navigate('/doctor/queue')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--brand-accent)', fontWeight: 500 }}
            >
              Full view →
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 68, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', animation: 'mq-shimmer 1.4s ease infinite' }} />
              ))}
            </div>
          ) : todayAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ fontSize: 36, margin: '0 0 10px' }}>🏖️</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                No appointments today
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Enjoy your free day!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayAppointments.slice(0, 6).map(apt => {
                const sc = statusConfig[apt.status] || statusConfig.pending
                const patientName = apt.patientId?.name || 'Patient'
                return (
                  <div
                    key={apt._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Token badge */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                      background: 'var(--brand-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'var(--brand-accent)',
                      flexShrink: 0,
                    }}>
                      {apt.tokenNumber || '–'}
                    </div>

                    {/* Patient info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {patientName}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
                        {apt.reason && ` • "${apt.reason}"`}
                      </p>
                    </div>

                    {/* Status */}
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 9px',
                      borderRadius: 99, color: sc.color, background: sc.bg,
                      flexShrink: 0,
                    }}>
                      {sc.label}
                    </span>

                    {/* Actions */}
                    {apt.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => handleStatus(apt._id, 'completed')}
                          style={{
                            padding: '5px 10px', borderRadius: 6,
                            border: '1px solid #10b981', background: 'none',
                            color: '#10b981', fontSize: 11, fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          Done
                        </button>
                        <button
                          onClick={() => handleStatus(apt._id, 'no_show')}
                          style={{
                            padding: '5px 10px', borderRadius: 6,
                            border: '1px solid var(--border)', background: 'none',
                            color: 'var(--text-muted)', fontSize: 11, fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          No Show
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DoctorDashboard
