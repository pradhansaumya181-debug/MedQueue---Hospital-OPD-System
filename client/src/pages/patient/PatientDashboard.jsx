// src/pages/patient/PatientDashboard.jsx
// Patient ka main dashboard
// Stats, upcoming appointments, quick actions

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import useAuth from '@/hooks/useAuth'
import useAppointmentStore from '@/store/appointmentStore'
import { formatRelativeDate, formatTime, getTodayString } from '@/utils/formatDate'

// Stat card component
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="mq-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 48, height: 48, borderRadius: 'var(--radius-md)',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div>
      <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{label}</p>
    </div>
  </div>
)

// Status badge
const StatusBadge = ({ status }) => {
  const config = {
    confirmed:  { label: 'Confirmed',  color: '#10b981', bg: '#ecfdf5' },
    pending:    { label: 'Pending',    color: '#f59e0b', bg: '#fffbeb' },
    cancelled:  { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
    completed:  { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' },
    no_show:    { label: 'No Show',   color: '#8b5cf6', bg: '#f5f3ff' },
  }
  const c = config[status] || config.pending
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 9px',
      borderRadius: 99, color: c.color, background: c.bg,
    }}>
      {c.label}
    </span>
  )
}

const PatientDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { appointments, fetchMyAppointments, isLoading } = useAppointmentStore()

  useEffect(() => {
    fetchMyAppointments()
  }, [])

  // Stats calculate karo
  const today = getTodayString()
  const upcoming = appointments.filter(a =>
    a.date >= today && a.status === 'confirmed'
  )
  const completed = appointments.filter(a => a.status === 'completed')
  const todayApts = appointments.filter(a => a.date === today && a.status === 'confirmed')

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'var(--brand-accent)' }}>
              {user?.name?.split(' ')[0]}
            </span> 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Here's your health summary for today
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          <StatCard label="Upcoming" value={upcoming.length} icon="📅" color="#3b82f6" bg="#eff6ff" />
          <StatCard label="Today's Visits" value={todayApts.length} icon="🏥" color="#10b981" bg="#ecfdf5" />
          <StatCard label="Completed" value={completed.length} icon="✅" color="#8b5cf6" bg="#f5f3ff" />
          <StatCard label="Total Booked" value={appointments.length} icon="📋" color="#f59e0b" bg="#fffbeb" />
        </div>

        {/* Quick Actions */}
        <div className="mq-card" style={{ padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="mq-btn-primary"
              onClick={() => navigate('/patient/search')}
              style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.6"/>
                <path d="M11 11l3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Find a Doctor
            </button>
            <button
              className="mq-btn-secondary"
              onClick={() => navigate('/patient/appointments')}
              style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M5 1v4M10 1v4M1 7h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              View Appointments
            </button>
            <button
              className="mq-btn-secondary"
              onClick={() => navigate('/patient/waiting-room')}
              style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M7.5 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Live Queue
            </button>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="mq-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Recent Appointments
            </h2>
            <button
              onClick={() => navigate('/patient/appointments')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--brand-accent)', fontWeight: 500,
              }}
            >
              View all →
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 72, borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-2)',
                  animation: 'mq-shimmer 1.4s ease infinite',
                }} />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                No appointments yet
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                Book your first appointment with a doctor
              </p>
              <button
                className="mq-btn-primary"
                onClick={() => navigate('/patient/search')}
                style={{ width: 'auto', padding: '10px 24px', margin: '0 auto', fontSize: 13 }}
              >
                Find a Doctor
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appointments.slice(0, 5).map((apt) => {
                const doctor = apt.doctorId
                const doctorUser = doctor?.userId
                return (
                  <div
                    key={apt._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Doctor avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--brand-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600, color: 'var(--brand-accent)',
                      flexShrink: 0,
                    }}>
                      {doctorUser?.name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'DR'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Dr. {doctorUser?.name || 'Unknown'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {formatRelativeDate(apt.date)} • {formatTime(apt.startTime)}
                        {apt.tokenNumber && ` • Token #${apt.tokenNumber}`}
                      </p>
                    </div>

                    <StatusBadge status={apt.status} />
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

export default PatientDashboard
