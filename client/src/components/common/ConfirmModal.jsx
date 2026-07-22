// src/components/common/ConfirmModal.jsx
// Beautiful custom confirmation modal
// window.confirm() ki jagah ye use karenge

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
}) => {
  if (!isOpen) return null

  const config = {
    danger: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="14" fill="#fef2f2"/>
          <path d="M14 9v6M14 17v2" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
      confirmBg: '#ef4444',
      confirmHover: '#dc2626',
      iconBg: '#fef2f2',
    },
    warning: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="14" fill="#fffbeb"/>
          <path d="M14 9v6M14 17v2" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
      confirmBg: '#f59e0b',
      confirmHover: '#d97706',
      iconBg: '#fffbeb',
    },
    info: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="14" fill="#eff6ff"/>
          <path d="M14 12v7M14 9v1.5" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
      confirmBg: 'var(--brand-accent)',
      confirmHover: 'var(--brand-accent-hover)',
      iconBg: '#eff6ff',
    },
  }

  const c = config[type]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10, 22, 40, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'backdropIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 28px',
          width: 'calc(100% - 32px)',
          maxWidth: '380px',
          zIndex: 1001,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          animation: 'modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: c.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          {c.icon}
        </div>

        {/* Text */}
        <h3 style={{
          fontSize: 17, fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          textAlign: 'center',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 14, color: 'var(--text-muted)',
          margin: '0 0 28px', textAlign: 'center',
          lineHeight: 1.6,
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              flex: 1, padding: '11px',
              background: 'var(--surface-2)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1, padding: '11px',
              background: c.confirmBg,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 600,
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = c.confirmHover }}
            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = c.confirmBg }}
          >
            {isLoading ? (
              <div className="mq-spinner" style={{ width: 16, height: 16 }} />
            ) : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.94); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}

export default ConfirmModal
