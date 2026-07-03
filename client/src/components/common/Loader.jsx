// src/components/common/Loader.jsx
// Full page loading spinner
// Jab app pehli baar load ho rahi ho ya auth check ho raha ho

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--surface-2)',
      }}
    >
      {/* Logo + Spinner */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid var(--brand-light)',
          }}
        />
        {/* Spinning arc */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--brand-accent)',
            animation: 'mq-spin 0.8s linear infinite',
          }}
        />
        {/* Center icon */}
        <div
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            background: 'var(--brand-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Medical cross */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="8" y="2" width="6" height="18" rx="2" fill="white" />
            <rect x="2" y="8" width="18" height="6" rx="2" fill="white" />
          </svg>
        </div>
      </div>

      <p
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        {message}
      </p>
    </div>
  )
}

export default Loader
