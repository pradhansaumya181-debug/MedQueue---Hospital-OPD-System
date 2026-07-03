// src/pages/auth/Login.jsx
// FIXED — Admin ke liye register link nahi, role-specific links

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'

const stats = [
  { value: '50+', label: 'Doctors' },
  { value: '2k+', label: 'Patients served' },
  { value: '15min', label: 'Avg wait time' },
]

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'patient'

  const { loginGoogle, loginEmail, loginStaff, isLoading, error, clearError } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [formErrors, setFormErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      navigate('/')
    }
  }, [role, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error])

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleStaffLogin = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await loginStaff(form.email, form.password)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`, 'Login successful')
    }
  }

  const handleGoogleLogin = async () => {
    const result = await loginGoogle()
    if (result.success) {
      toast.success(`Welcome, ${result.user.name}!`)
    }
  }

  const handlePatientEmailLogin = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await loginEmail(form.email, form.password)
    if (result.success) {
      toast.success(`Welcome back!`)
    }
  }

  const isPatient = role === 'patient'
  const isDoctor  = role === 'doctor'
  const isAdmin   = role === 'admin'
  const roleLabel = isAdmin ? 'Hospital Admin' : role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-2)' }}>

      {/* ========== LEFT PANEL ========== */}
      <div
        style={{
          flex: '0 0 45%',
          background: 'var(--brand-dark)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px', position: 'relative', overflow: 'hidden',
        }}
        className="left-panel"
      >
        {/* BG decorations */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,180,216,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(0,180,216,0.05)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="8" y="2" width="6" height="18" rx="2" fill="white" />
              <rect x="2" y="8" width="18" height="6" rx="2" fill="white" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>MedQueue</span>
        </div>

        {/* Headline */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '99px', padding: '4px 12px', marginBottom: '20px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-accent)', animation: 'mq-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--brand-accent)', fontWeight: 500, letterSpacing: '0.05em' }}>LIVE QUEUE SYSTEM</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, lineHeight: 1.25, margin: '0 0 16px' }}>
            Smarter OPD<br />
            <span style={{ color: 'var(--brand-accent)' }}>starts here.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Real-time queue tracking, instant slot booking, and seamless coordination between patients and doctors.
          </p>

          <div style={{ display: 'flex', gap: '28px', marginTop: '32px' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            Logging in as <strong style={{ color: 'var(--brand-accent)' }}>{roleLabel}</strong>
          </span>
        </div>

        <style>{`
          @keyframes mq-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
          @media(max-width:768px){ .left-panel{display:none!important} }
        `}</style>
      </div>

      {/* ========== RIGHT PANEL ========== */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflow: 'auto' }}>
        <div className="mq-fadein" style={{ width: '100%', maxWidth: '400px' }}>

          {/* Back */}
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: 0, marginBottom: '32px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Change role
          </button>

          {/* Heading */}
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Sign in</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 28px' }}>
            {isPatient
              ? 'Use Google or email to access your appointments'
              : isAdmin
              ? 'Enter your admin credentials to continue'
              : 'Enter your doctor credentials to continue'}
          </p>

          {/* Google — sirf patient */}
          {isPatient && (
            <>
              <button className="mq-btn-secondary" onClick={handleGoogleLogin} disabled={isLoading}>
                {isLoading ? (
                  <div className="mq-spinner mq-spinner-dark" />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              <div className="mq-divider" style={{ margin: '20px 0' }}>or continue with email</div>
            </>
          )}

          {/* Email/Password form */}
          <form
            onSubmit={isPatient ? handlePatientEmailLogin : handleStaffLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            noValidate
          >
            <div>
              <label className="mq-label">Email address</label>
              <input
                className={`mq-input ${formErrors.email ? 'error' : ''}`}
                type="email"
                placeholder={isAdmin ? 'admin@hospital.com' : isDoctor ? 'dr.name@hospital.com' : 'you@email.com'}
                value={form.email}
                onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); if (formErrors.email) setFormErrors((er) => ({ ...er, email: '' })) }}
                autoComplete="email"
              />
              {formErrors.email && (
                <p className="mq-error-text">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#ef4444"/><path d="M6 3.5v3M6 8v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {formErrors.email}
                </p>
              )}
            </div>

            <div >
              <label className="mq-label" style={{ margin: 0 }}>
    Password
  </label>



  <div style={{ position: 'relative' }}>
                <input
                  className={`mq-input ${formErrors.password ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); if (formErrors.password) setFormErrors((er) => ({ ...er, password: '' })) }}
                  style={{ paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                {/* Password label ke saath "Forgot?" link */}
                {/* Password label ke saath "Forgot?" link */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
  {/* <label className="mq-label" style={{ margin: 0 }}>Password</label> */}
  {isPatient && (
    <Link
      to="/forgot-password"
      style={{ fontSize: 13, color: 'var(--brand-accent)', textDecoration: 'none', fontWeight: 500 }}
    >
      Forgot password?
    </Link>
  )}
</div>

                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 2l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mq-error-text">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#ef4444"/><path d="M6 3.5v3M6 8v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {formErrors.password}
                </p>
              )}
            </div>

            <button type="submit" className="mq-btn-primary" disabled={isLoading} style={{ marginTop: '4px' }}>
              {isLoading ? (
                <><div className="mq-spinner" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* ── Bottom links — ROLE SPECIFIC ── */}

          {/* Patient — Sign up free */}
          {isPatient && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: '20px' }}>
              Don't have an account?{' '}
              <Link to="/register?role=patient" style={{ color: 'var(--brand-accent)', fontWeight: 500, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          )}

          {/* Doctor — Create account */}
          {isDoctor && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: '20px' }}>
              First time?{' '}
              <Link to="/register?role=doctor" style={{ color: 'var(--brand-accent)', fontWeight: 500, textDecoration: 'none' }}>
                Create doctor account
              </Link>
            </p>
          )}

          {/* Admin — koi register link nahi */}
          {isAdmin && (
            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
                🔒 Admin accounts are managed by the system.
                <br />Contact IT support if you need access.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Login
