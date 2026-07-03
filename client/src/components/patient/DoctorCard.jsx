// src/components/patient/DoctorCard.jsx
// Doctor ki info card — search results mein use hoga

import { useNavigate } from 'react-router-dom'

// Star rating render
const Stars = ({ rating }) => {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M6.5 1l1.545 3.13 3.455.502-2.5 2.437.59 3.44L6.5 8.885 3.91 10.51l.59-3.441L2 4.632l3.455-.503L6.5 1z"
            fill={i <= Math.round(rating) ? '#f59e0b' : 'var(--border)'}
            stroke={i <= Math.round(rating) ? '#f59e0b' : 'var(--border)'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  )
}

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()
  const user = doctor.userId || {}

  // Doctor name initials
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DR'

  return (
    <div
      className="mq-card"
      style={{
        padding: '20px',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top section */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        {/* Avatar */}
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-mid))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: 'var(--brand-accent)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {user.profilePicture
            ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>

        {/* Name + spec */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name?.startsWith('Dr') ? user.name : `Dr. ${user.name}`}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--brand-accent)', margin: '0 0 4px', fontWeight: 500 }}>
            {doctor.specialization}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars rating={doctor.rating || 0} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ({doctor.totalReviews || 0})
            </span>
          </div>
        </div>

        {/* Fee */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            ₹{doctor.consultationFee}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            per visit
          </p>
        </div>
      </div>

      {/* Info pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{
          fontSize: 12, padding: '4px 10px',
          background: 'var(--surface-2)', borderRadius: 99,
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {doctor.experience} yrs exp
        </span>
        <span style={{
          fontSize: 12, padding: '4px 10px',
          background: 'var(--surface-2)', borderRadius: 99,
          color: 'var(--text-secondary)',
        }}>
          {doctor.qualification}
        </span>
        <span style={{
          fontSize: 12, padding: '4px 10px',
          background: 'var(--surface-2)', borderRadius: 99,
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M4 1v2M8 1v2M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {doctor.workingHours?.start} – {doctor.workingHours?.end}
        </span>
      </div>

      {/* Book button */}
      <button
        className="mq-btn-primary"
        onClick={() => navigate(`/patient/book/${doctor._id}`)}
        style={{ fontSize: 13, padding: '10px' }}
      >
        Book Appointment
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

export default DoctorCard
