// src/pages/auth/RoleSelect.jsx
// Pehla screen — kon hai? Patient, Doctor, ya Admin?
// Clean card selection UI

import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Role cards ka data
const roles = [
  {
    id: 'patient',
    label: 'Patient',
    subtitle: 'Book appointments & track your queue',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'doctor',
    label: 'Doctor',
    subtitle: 'Manage your schedule & patient queue',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4v8M10 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="14" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="19" r="1.5" fill="currentColor" />
        <circle cx="14" cy="19" r="1.5" fill="currentColor" />
        <circle cx="19" cy="19" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
]

const RoleSelect = () => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    // Clear stale auth session when landing on RoleSelect to prevent session conflicts
    localStorage.removeItem('medqueue_token')
    localStorage.removeItem('medqueue_user')

    // Silent wake-up call to backend Render server (resolves cold starts)
    const wakeUp = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || 'https://medqueue-hospital-opd-system-8.onrender.com/api'
        const healthUrl = url.endsWith('/api') ? url.slice(0, -4) + '/health' : url + '/health'
        fetch(healthUrl).catch(() => {})
      } catch (err) {}
    }
    wakeUp()
  }, [])

  const handleContinue = () => {
    if (!selected) return
    navigate(`/login?role=${selected}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--brand-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className="mq-fadein" style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect x="11" y="3" width="8" height="24" rx="3" fill="white" />
              <rect x="3" y="11" width="24" height="8" rx="3" fill="white" />
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>
            MedQueue
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 }}>
            Hospital OPD Management
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            Who are you?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Select your role to continue
          </p>

          {/* Role Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roles.map((role) => {
              const isActive = selected === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: isActive ? 'rgba(0,180,216,0.06)' : 'var(--surface-2)',
                    border: `2px solid ${isActive ? 'var(--brand-accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: isActive
                        ? 'var(--brand-accent)'
                        : 'var(--surface-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {role.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: isActive ? 'var(--brand-accent)' : 'var(--text-primary)',
                        margin: 0,
                        transition: 'color 0.15s',
                      }}
                    >
                      {role.label}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        margin: '2px 0 0',
                      }}
                    >
                      {role.subtitle}
                    </p>
                  </div>

                  {/* Check */}
                  {isActive && (
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="var(--brand-accent)" />
                        <path
                          d="M6 10l3 3 5-5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Continue Button */}
          <button
            className="mq-btn-primary"
            onClick={handleContinue}
            disabled={!selected}
            style={{ marginTop: '24px' }}
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect
