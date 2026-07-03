// src/components/common/Navbar.jsx
// Top navigation bar — saare dashboards mein common
// User info, role badge, logout button

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'
import useThemeStore from '@/store/themeStore'

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isDark, toggleTheme } = useThemeStore()


  const handleLogout = async () => {
    await logout()
    toast.info('Logged out successfully')
  }

  const roleConfig = {
    patient: { label: 'Patient', color: '#10b981', bg: '#ecfdf5' },
    doctor:  { label: 'Doctor',  color: '#3b82f6', bg: '#eff6ff' },
    admin:   { label: 'Admin',   color: '#8b5cf6', bg: '#f5f3ff' },
  }
  const rc = roleConfig[user?.role] || roleConfig.patient

  // User initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header
      style={{
        height: 64,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 16,
      }}
    >
      {/* Left — Logo + Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            color: 'var(--text-muted)',
            display: 'none', // Show on mobile via CSS
          }}
          className="menu-btn"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: 34, height: 34,
            borderRadius: 9,
            background: 'var(--brand-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="6" y="1" width="6" height="16" rx="2" fill="var(--brand-accent)"/>
              <rect x="1" y="6" width="16" height="6" rx="2" fill="var(--brand-accent)"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            MedQueue
          </span>
        </div>
      </div>

      {/* Right — User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
<button
  onClick={toggleTheme}
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  style={{
    width: 34, height: 34,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all 0.15s',
    flexShrink: 0,
  }}
  onMouseEnter={e => {
    e.currentTarget.style.borderColor = 'var(--brand-accent)'
    e.currentTarget.style.color = 'var(--brand-accent)'
  }}
  onMouseLeave={e => {
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.color = 'var(--text-muted)'
  }}
>
  {isDark ? (
    // Sun icon
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ) : (
    // Moon icon
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )}
</button>
        {/* Role badge */}
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: rc.color, background: rc.bg,
          padding: '3px 10px', borderRadius: 99,
          border: `1px solid ${rc.color}30`,
        }}>
          {rc.label}
        </span>

        {/* User avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 99, padding: '5px 12px 5px 6px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--brand-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--brand-accent)',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 180, zIndex: 20,
                overflow: 'hidden',
              }}>
                {/* User info */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '10px 16px',
                    background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13, color: 'var(--error)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}

export default Navbar
