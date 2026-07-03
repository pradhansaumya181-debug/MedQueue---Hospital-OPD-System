// src/pages/admin/AdminDashboard.jsx
// Hospital admin ka main dashboard — overall stats

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import useAuth from '@/hooks/useAuth'
import { getHospitalStats } from '@/services/adminService'

const StatCard = ({ label, value, icon, color, bg, onClick, sub }) => (
  <div
    className="mq-card"
    onClick={onClick}
    style={{
      padding: '22px 24px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      borderLeft: `4px solid ${color}`,
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: color, margin: '6px 0 0', fontWeight: 500 }}>{sub}</p>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22,
      }}>
        {icon}
      </div>
    </div>
  </div>
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getHospitalStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // Parse stats
  const patients      = stats?.users?.patients || 0
  const doctors       = stats?.users?.doctors || 0
  const activeDoctors = stats?.doctors?.active || 0

  const todayStats    = stats?.appointments?.today || []
  const overallStats  = stats?.appointments?.overall || []

  const getCount = (arr, status) => arr.find(s => s._id === status)?.count || 0
  const todayTotal     = todayStats.reduce((s, i) => s + i.count, 0)
  const todayConfirmed = getCount(todayStats, 'confirmed')
  const todayCancelled = getCount(todayStats, 'cancelled')
  const overallTotal   = overallStats.reduce((s, i) => s + i.count, 0)

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Hospital Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Welcome back, {user?.name} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: '+ Add Doctor', path: '/admin/doctors', primary: true },
            { label: 'Bulk Cancel', path: '/admin/cancel', primary: false },
            { label: 'View Patients', path: '/admin/patients', primary: false },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => navigate(btn.path)}
              className={btn.primary ? 'mq-btn-primary' : 'mq-btn-secondary'}
              style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 110, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', animation: 'mq-shimmer 1.4s ease infinite' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Main stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Patients" value={patients} icon="👥" color="#3b82f6" bg="#eff6ff" onClick={() => navigate('/admin/patients')} sub="Registered users" />
              <StatCard label="Total Doctors" value={doctors} icon="👨‍⚕️" color="#10b981" bg="#ecfdf5" onClick={() => navigate('/admin/doctors')} sub={`${activeDoctors} active`} />
              <StatCard label="Today's Appointments" value={todayTotal} icon="📅" color="#f59e0b" bg="#fffbeb" sub={`${todayConfirmed} confirmed`} />
              <StatCard label="All Appointments" value={overallTotal} icon="📋" color="#8b5cf6" bg="#f5f3ff" sub="All time" />
            </div>

            {/* Today breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

              {/* Today stats */}
              <div className="mq-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                  Today's Breakdown
                </h3>
                {todayStats.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No appointments today</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {todayStats.map(s => {
                      const colors = { confirmed: '#10b981', cancelled: '#ef4444', completed: '#6b7280', pending: '#f59e0b', no_show: '#8b5cf6' }
                      const color = colors[s._id] || 'var(--text-muted)'
                      const pct = todayTotal > 0 ? Math.round((s.count / todayTotal) * 100) : 0
                      return (
                        <div key={s._id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 500 }}>
                              {s._id.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color }}>
                              {s.count} ({pct}%)
                            </span>
                          </div>
                          <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 99 }}>
                            <div style={{
                              width: `${pct}%`, height: '100%',
                              background: color, borderRadius: 99,
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Overall stats */}
              <div className="mq-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                  Overall Breakdown
                </h3>
                {overallStats.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {overallStats.map(s => {
                      const colors = { confirmed: '#10b981', cancelled: '#ef4444', completed: '#6b7280', pending: '#f59e0b', no_show: '#8b5cf6' }
                      const color = colors[s._id] || 'var(--text-muted)'
                      const pct = overallTotal > 0 ? Math.round((s.count / overallTotal) * 100) : 0
                      return (
                        <div key={s._id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 500 }}>
                              {s._id.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color }}>
                              {s.count} ({pct}%)
                            </span>
                          </div>
                          <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 99 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
