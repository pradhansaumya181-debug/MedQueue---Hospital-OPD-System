// src/pages/auth/ForgotPassword.jsx
// Firebase se password reset email bhejo
// Patient apna email enter karta hai → Firebase link bhejta hai

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/firebaseConfig'

const ForgotPassword = () => {
  const [email, setEmail]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }

    setIsLoading(true)
    setError('')

    try {
      await sendPasswordResetEmail(auth, email, {
        // Reset ke baad yahan redirect hoga
        url: `${window.location.origin}/login?role=patient`,
      })
      setSent(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--brand-dark)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      <div className="mq-fadein" style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--brand-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="10" y="2" width="8" height="24" rx="3" fill="white"/>
              <rect x="2" y="10" width="24" height="8" rx="3" fill="white"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
            MedQueue
          </h1>
        </div>

        <div className="mq-card" style={{ padding: 32 }}>

          {!sent ? (
            <>
              {/* Lock icon */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(0,180,216,0.1)',
                border: '1px solid rgba(0,180,216,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="3" stroke="var(--brand-accent)" strokeWidth="1.8"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--brand-accent)" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1.5" fill="var(--brand-accent)"/>
                </svg>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', textAlign: 'center' }}>
                Forgot password?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.6 }}>
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
                <div>
                  <label className="mq-label">Email address</label>
                  <input
                    className={`mq-input ${error ? 'error' : ''}`}
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    autoFocus
                  />
                  {error && (
                    <p className="mq-error-text">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="6" fill="#ef4444"/>
                        <path d="M6 3.5v3M6 8v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {error}
                    </p>
                  )}
                </div>

                <button type="submit" className="mq-btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <><div className="mq-spinner"/> Sending...</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4l6 4 6-4M2 4v8h12V4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Send reset link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // Success state
            <>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="14" fill="#10b981"/>
                  <path d="M7 14l5 5 9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', textAlign: 'center' }}>
                Check your email
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 8px', textAlign: 'center', lineHeight: 1.6 }}>
                Reset link sent to:
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--brand-accent)', textAlign: 'center', margin: '0 0 24px' }}>
                {email}
              </p>
              <div style={{
                padding: '12px 16px', background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
                textAlign: 'center',
              }}>
                Check spam folder if you don't see it within 2 minutes.
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mq-btn-secondary"
                style={{ marginTop: 16 }}
              >
                Send to different email
              </button>
            </>
          )}

          {/* Back to login */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            Remember your password?{' '}
            <Link to="/login?role=patient" style={{ color: 'var(--brand-accent)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
