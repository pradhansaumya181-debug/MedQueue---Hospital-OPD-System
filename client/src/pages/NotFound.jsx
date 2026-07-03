// src/pages/NotFound.jsx
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { getDashboardPath } from '@/utils/roleRedirect'

const NotFound = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const handleGoHome = () => {
    if (isAuthenticated && user?.role) {
      navigate(getDashboardPath(user.role))
    } else {
      navigate('/')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--brand-dark)',
        gap: 0,
        padding: 24,
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--brand-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="9" y="2" width="8" height="22" rx="2.5" fill="white" />
          <rect x="2" y="9" width="22" height="8" rx="2.5" fill="white" />
        </svg>
      </div>

      {/* 404 */}
      <h1
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.08)',
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-4px',
          userSelect: 'none',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#fff',
          margin: '-20px 0 12px',
        }}
      >
        Page not found
      </h2>

      <p
        style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 36px',
          maxWidth: 340,
          lineHeight: 1.7,
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleGoHome}
          style={{
            padding: '12px 28px',
            background: 'var(--brand-accent)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'var(--brand-accent-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'var(--brand-accent)')
          }
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-md)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')
          }
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default NotFound
