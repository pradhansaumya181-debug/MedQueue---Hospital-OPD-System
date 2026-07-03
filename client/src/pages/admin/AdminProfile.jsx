// src/pages/admin/AdminProfile.jsx
// Admin ka profile page

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import useAuth from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'
import api from '@/services/api'

const AdminProfile = () => {
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', phone: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' })
    }
  }, [user])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      e.phone = 'Enter valid 10-digit mobile'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      // Admin ke liye User model update
      await api.put('/patients/profile', form) // same endpoint kaam karta hai
      await refreshUser()
      toast.success('Profile updated!', 'Saved')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setIsLoading(false)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 560 }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Admin Profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Manage your administrator account
          </p>
        </div>

        {/* Avatar card */}
        <div className="mq-card" style={{ padding: '24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, color: '#fff',
            flexShrink: 0,
            border: '3px solid #8b5cf6',
          }}>
            {initials || 'A'}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>
              {user?.email}
            </p>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px',
              borderRadius: 99, background: '#f5f3ff', color: '#8b5cf6',
              border: '1px solid #8b5cf630',
            }}>
              Hospital Admin
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="mq-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>
            Edit Information
          </h3>
          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            noValidate
          >
            {/* Name */}
            <div>
              <label className="mq-label">Full Name *</label>
              <input
                className={`mq-input ${errors.name ? 'error' : ''}`}
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (errors.name) setErrors((er) => ({ ...er, name: '' }))
                }}
              />
              {errors.name && <p className="mq-error-text">{errors.name}</p>}
            </div>

            {/* Email readonly */}
            <div>
              <label className="mq-label">Email Address</label>
              <input
                className="mq-input"
                type="email"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '5px 0 0' }}>
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="mq-label">Mobile Number</label>
              <input
                className={`mq-input ${errors.phone ? 'error' : ''}`}
                type="tel"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => {
                  setForm((f) => ({ ...f, phone: e.target.value }))
                  if (errors.phone) setErrors((er) => ({ ...er, phone: '' }))
                }}
              />
              {errors.phone && <p className="mq-error-text">{errors.phone}</p>}
            </div>

            {/* Account info */}
            <div style={{
              padding: '14px 16px',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Member since:{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>

            <button
              type="submit"
              className="mq-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <><div className="mq-spinner" /> Saving...</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 8l4 4 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminProfile
