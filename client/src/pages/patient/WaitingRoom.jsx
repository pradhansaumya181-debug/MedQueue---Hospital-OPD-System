// src/pages/patient/WaitingRoom.jsx
// Real-time queue display — Firestore onSnapshot se live update
// Patient apna token number aur kitne log aage hain dekh sakta hai

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import useAuth from '@/hooks/useAuth'
import useQueue from '@/hooks/useQueue'
import useAppointmentStore from '@/store/appointmentStore'
import { getTodayString, formatTime } from '@/utils/formatDate'

// Animated ring component — queue token display ke liye
const TokenRing = ({ token, currentlyServing, total }) => {
  const ahead = Math.max(0, token - currentlyServing)
  const isNext = ahead === 1
  const isNow  = ahead === 0

  // Progress arc calculate karo
  const progress = total > 0 ? ((total - ahead) / total) * 100 : 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const statusColor = isNow ? '#10b981' : isNext ? '#f59e0b' : 'var(--brand-accent)'
  const statusBg    = isNow ? '#ecfdf5' : isNext ? '#fffbeb' : 'rgba(0,180,216,0.08)'

  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      {/* SVG Ring */}
      <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={statusColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 500, letterSpacing: '0.08em' }}>
          YOUR TOKEN
        </p>
        <p style={{
          fontSize: 52, fontWeight: 800,
          color: statusColor,
          margin: 0, lineHeight: 1,
          transition: 'color 0.4s',
        }}>
          {token}
        </p>
        {isNow && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: '#10b981', background: '#ecfdf5',
            padding: '2px 10px', borderRadius: 99,
            marginTop: 4,
          }}>
            YOUR TURN!
          </span>
        )}
        {isNext && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: '#f59e0b', background: '#fffbeb',
            padding: '2px 10px', borderRadius: 99,
            marginTop: 4,
          }}>
            UP NEXT
          </span>
        )}
      </div>
    </div>
  )
}

const WaitingRoom = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { appointments, fetchMyAppointments } = useAppointmentStore()

  const today = getTodayString()

  // Aaj ka confirmed appointment dhundo
  const todayAppointment = appointments.find(
    a => a.date === today && a.status === 'confirmed'
  )

  const doctorId = todayAppointment?.doctorId?._id
  const { queueData, isConnected } = useQueue(doctorId, today)

  useEffect(() => {
    fetchMyAppointments('confirmed')
  }, [])

  const myToken         = todayAppointment?.tokenNumber || 0
  const currentlyServing = queueData?.currentlyServing || 0
  const totalTokens     = queueData?.totalTokens || 0
  const ahead           = Math.max(0, myToken - currentlyServing)
  const estimatedMins   = ahead * 15

  // Agar koi appointment nahi hai aaj
  if (!todayAppointment) {
    return (
      <DashboardLayout>
        <div className="mq-fadein" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--surface-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 36,
          }}>
            🕐
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            No appointment today
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>
            You don't have any confirmed appointments for today.
          </p>
          <button
            className="mq-btn-primary"
            onClick={() => navigate('/patient/search')}
            style={{ width: 'auto', padding: '10px 28px', margin: '0 auto', fontSize: 13 }}
          >
            Book an Appointment
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const doctorUser = todayAppointment?.doctorId?.userId
  const doctorName = doctorUser?.name?.startsWith('Dr')
    ? doctorUser.name
    : `Dr. ${doctorUser?.name || 'Unknown'}`

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Waiting Room
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isConnected ? '#10b981' : '#f59e0b',
              animation: isConnected ? 'mq-pulse 2s ease infinite' : 'none',
            }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {isConnected ? 'Live updates active' : 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Doctor info */}
        <div className="mq-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--brand-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'var(--brand-accent)',
            flexShrink: 0,
          }}>
            {doctorUser?.name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'DR'}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {doctorName}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {todayAppointment.doctorId?.specialization} •{' '}
              {formatTime(todayAppointment.startTime)}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-accent)', margin: 0 }}>
              #{myToken}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Your token
            </p>
          </div>
        </div>

        {/* Main token ring card */}
        <div className="mq-card" style={{ padding: '36px 24px', marginBottom: 20, textAlign: 'center' }}>
          <TokenRing
            token={myToken}
            currentlyServing={currentlyServing}
            total={totalTokens}
          />

          {/* Status message */}
          <div style={{ marginTop: 28 }}>
            {ahead === 0 ? (
              <div style={{
                padding: '16px',
                background: '#ecfdf5',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #10b981',
              }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#065f46', margin: 0 }}>
                  🎉 It's your turn! Please proceed to the doctor.
                </p>
              </div>
            ) : ahead === 1 ? (
              <div style={{
                padding: '16px',
                background: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #f59e0b',
              }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#78350f', margin: 0 }}>
                  ⚡ You're next! Please be ready.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {ahead} ahead
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                  ~{estimatedMins} min estimated wait
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Queue stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Currently Serving', value: currentlyServing, color: '#10b981' },
            { label: 'People Ahead',      value: ahead,            color: ahead > 3 ? '#ef4444' : '#f59e0b' },
            { label: 'Total Today',       value: totalTokens,      color: 'var(--brand-accent)' },
          ].map(stat => (
            <div
              key={stat.label}
              className="mq-card"
              style={{ padding: '16px 12px', textAlign: 'center' }}
            >
              <p style={{ fontSize: 26, fontWeight: 800, color: stat.color, margin: '0 0 4px', lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tip box */}
        <div style={{
          padding: '14px 16px',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          display: 'flex', gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            This page updates automatically. You'll be notified when your turn is near.
            Please stay within the hospital premises.
          </p>
        </div>

        <style>{`
          @keyframes mq-pulse {
            0%,100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}

export default WaitingRoom
