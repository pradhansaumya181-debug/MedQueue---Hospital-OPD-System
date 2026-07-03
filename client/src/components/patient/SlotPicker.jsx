// src/components/patient/SlotPicker.jsx
// Time slot grid — available slots dikhata hai
// Selected slot highlight hota hai

import { formatTime } from '@/utils/formatDate'

const SlotPicker = ({ slots, selectedSlot, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--surface-3)',
            animation: 'mq-shimmer 1.4s ease infinite',
          }} />
        ))}
        <style>{`
          @keyframes mq-shimmer {
            0%,100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 16px',
        background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border)',
      }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto 10px', display: 'block' }}>
          <circle cx="18" cy="18" r="17" stroke="var(--border)" strokeWidth="1.5"/>
          <path d="M18 11v7l4 2" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          No slots available for this date
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
      gap: 8,
    }}>
      {slots.map((slot) => {
        const isSelected = selectedSlot?._id === slot._id
        return (
          <button
            key={slot._id || slot.startTime}
            onClick={() => onSelect(slot)}
            style={{
              padding: '10px 8px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isSelected ? 'var(--brand-accent)' : 'var(--border)'}`,
              background: isSelected ? 'var(--brand-accent)' : 'var(--surface)',
              color: isSelected ? '#fff' : 'var(--text-primary)',
              fontSize: 13,
              fontWeight: isSelected ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--brand-accent)'
                e.currentTarget.style.color = 'var(--brand-accent)'
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
          >
            {formatTime(slot.startTime)}
          </button>
        )
      })}
    </div>
  )
}

export default SlotPicker
