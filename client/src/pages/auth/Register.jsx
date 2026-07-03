// src/pages/auth/Register.jsx — COMPLETE FINAL

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'
import { registerWithEmail } from '@/firebase/firebaseAuth'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const role = ['patient', 'doctor'].includes(roleParam) ? roleParam : 'doctor'

  const { registerStaff, error, clearError } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (error) { toast.error(error); clearError() }
  }, [error])

  useEffect(() => {
    if (roleParam === 'admin') {
      navigate('/login?role=admin', { replace: true })
    }
  }, [roleParam])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      e.phone = 'Enter valid 10-digit mobile'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)

    try {
      if (role === 'patient') {
        // Patient — Firebase se register karo
        const { idToken } = await registerWithEmail(form.email, form.password)
        const response = await api.post('/auth/firebase', { idToken })
        const { user, token } = response.data

        useAuthStore.setState({
          user: { ...user, name: form.name },
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        localStorage.setItem('medqueue_token', token)

        toast.success(`Welcome to MedQueue, ${form.name}!`, 'Account created 🎉')
        navigate('/patient/dashboard')

      } else {
        // Doctor — Backend se register karo
        const result = await registerStaff(
          form.name, form.email, form.phone, form.password, role
        )
        if (result.success) {
          toast.success(`Welcome, ${result.user.name}!`, 'Account created')
        }
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Please sign in.')
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password too weak. Use at least 6 characters.')
      } else {
        toast.error(err.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }))
  }

  const roleLabel = role === 'patient' ? 'Patient' : 'Doctor'

  const fields = [
    { key: 'name',            label: 'Full name',                type: 'text',     placeholder: role === 'patient' ? 'Your full name' : 'Dr. Ramesh Kumar' },
    { key: 'email',           label: 'Email address',            type: 'email',    placeholder: role === 'patient' ? 'you@email.com' : 'dr.name@hospital.com' },
    { key: 'phone',           label: 'Mobile number (optional)', type: 'tel',      placeholder: '9876543210' },
    { key: 'password',        label: 'Password',                 type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword', label: 'Confirm password',         type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--surface-2)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
    }}>
      <div className="mq-fadein" style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '12px',
            background: 'var(--brand-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="9" y="2" width="8" height="22" rx="2.5" fill="var(--brand-accent)" />
              <rect x="2" y="9" width="22" height="8" rx="2.5" fill="var(--brand-accent)" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            Create {roleLabel} Account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Fill in your details to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="mq-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            noValidate
          >
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="mq-label">{label}</label>
                <input
                  className={`mq-input ${errors[key] ? 'error' : ''}`}
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={updateField(key)}
                  autoComplete={key === 'confirmPassword' ? 'new-password' : key}
                />
                {errors[key] && (
                  <p className="mq-error-text">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="#ef4444" />
                      <path d="M6 3.5v3M6 8v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}

            {form.password && (
              <div style={{
                padding: '10px 12px', background: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)',
              }}>
                Password strength:{' '}
                <span style={{
                  fontWeight: 600,
                  color: form.password.length >= 10 ? 'var(--success)'
                    : form.password.length >= 6 ? 'var(--warning)' : 'var(--error)',
                }}>
                  {form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Fair' : 'Weak'}
                </span>
              </div>
            )}

            <button type="submit" className="mq-btn-primary" disabled={isLoading} style={{ marginTop: '4px' }}>
              {isLoading ? (
                <><div className="mq-spinner" /> Creating account...</>
              ) : (
                `Create ${roleLabel} account`
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to={`/login?role=${role}`}
            style={{ color: 'var(--brand-accent)', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
