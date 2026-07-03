// src/components/common/Sidebar.jsx
// Left sidebar navigation
// Role ke hisaab se alag menu items dikhata hai

import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

// Nav items per role
const navItems = {
  patient: [
    {
      to: '/patient/dashboard', label: 'Dashboard',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
    },
    {
      to: '/patient/search', label: 'Find Doctors',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6"/><path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    {
      to: '/patient/appointments', label: 'My Appointments',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 2v4M12 2v4M2 9h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    {
      to: '/patient/waiting-room', label: 'Waiting Room',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      to: '/patient/profile',
      label: 'My Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
  ],
  doctor: [
    {
      to: '/doctor/dashboard', label: 'Dashboard',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
    },
    {
      to: '/doctor/queue', label: "Today's Queue",
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M2 9h10M2 13h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    {
      to: '/doctor/slots', label: 'Manage Slots',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 2v4M12 2v4M2 9h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    {
      to: '/doctor/profile',
      label: 'My Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
  ],
  admin: [
    {
      to: '/admin/dashboard', label: 'Dashboard',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
    },
    {
      to: '/admin/doctors', label: 'Manage Doctors',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    {
      to: '/admin/patients', label: 'Patients',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M1 16c0-3 2.686-5 6-5M13 11v6M10 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    {
      to: '/admin/cancel', label: 'Bulk Cancel',
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    },
    // {
    //   to: '/admin/profile',
    //   label: 'My Profile',
    //   icon: (
    //     <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    //       <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
    //       <path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    //     </svg>
    //   ),
    // },
    {
  to: '/admin/profile',
  label: 'My Profile',
  icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
},
  ],
}

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const items = navItems[user?.role] || []

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 49, display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 224,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: 64,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          overflowY: 'auto',
        }}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(0,180,216,0.08)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — version */}
        <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
            MedQueue v1.0.0
          </p>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -224px !important;
            height: 100vh !important;
            z-index: 50;
            transition: left 0.25s ease;
          }
          .sidebar.open { left: 0 !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  )
}

export default Sidebar
