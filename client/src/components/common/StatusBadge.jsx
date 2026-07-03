// src/components/common/StatusBadge.jsx
// Reusable status badge — poori app mein same style

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#10b981', bg: '#ecfdf5' },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
  completed: { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' },
  no_show:   { label: 'No Show',   color: '#8b5cf6', bg: '#f5f3ff' },
  active:    { label: 'Active',    color: '#10b981', bg: '#ecfdf5' },
  blocked:   { label: 'Blocked',   color: '#ef4444', bg: '#fef2f2' },
  doctor:    { label: 'Doctor',    color: '#3b82f6', bg: '#eff6ff' },
  patient:   { label: 'Patient',   color: '#10b981', bg: '#ecfdf5' },
  admin:     { label: 'Admin',     color: '#8b5cf6', bg: '#f5f3ff' },
}

const StatusBadge = ({ status, customLabel, size = 'sm' }) => {
  const config = statusConfig[status] || {
    label: status,
    color: 'var(--text-muted)',
    bg: 'var(--surface-3)',
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 500,
        padding: size === 'sm' ? '3px 9px' : '5px 12px',
        borderRadius: 99,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}20`,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Dot indicator */}
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: config.color,
          flexShrink: 0,
        }}
      />
      {customLabel || config.label}
    </span>
  )
}

export default StatusBadge
