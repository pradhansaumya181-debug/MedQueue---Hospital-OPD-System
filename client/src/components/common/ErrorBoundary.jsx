// src/components/common/ErrorBoundary.jsx
// Unexpected errors ko gracefully handle karta hai
// Bina is ke poori app crash ho jaati hai ek error se

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'var(--surface-2)',
            padding: 24,
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--error-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4L2 28h28L16 4z"
                stroke="var(--error)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M16 13v6M16 22v2"
                stroke="var(--error)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 8px',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                margin: '0 0 24px',
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred. Please refresh the page or contact
              support if the problem persists.
            </p>
          </div>

          {/* Error detail (dev only) */}
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                fontSize: 11,
                color: 'var(--error)',
                background: 'var(--error-bg)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                maxWidth: 600,
                overflow: 'auto',
                textAlign: 'left',
                border: '1px solid var(--error)',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => window.location.reload()}
              className="mq-btn-primary"
              style={{ width: 'auto', padding: '10px 24px', fontSize: 14 }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="mq-btn-secondary"
              style={{ width: 'auto', padding: '10px 24px', fontSize: 14 }}
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
