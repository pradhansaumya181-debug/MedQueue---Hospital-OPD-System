import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { loginStaff, isLoading, error, clearError } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    // Silent wake-up call to backend Render server
    const wakeUp = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || 'https://medqueue-hospital-opd-system-8.onrender.com/api'
        const healthUrl = url.endsWith('/api') ? url.slice(0, -4) + '/health' : url + '/health'
        fetch(healthUrl).catch(() => {})
      } catch (err) {}
    }
    wakeUp()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    const result = await loginStaff(form.email, form.password)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`, 'Admin Login successful')
      navigate('/admin/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#5b5b5b', // Mimicking native grey background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#201f1f', // Dark prompt background
        borderRadius: '8px',
        padding: '20px 24px',
        width: '320px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0' }}>Sign in</h2>
        <p style={{ color: '#a0a0a0', fontSize: '11px', margin: '0 0 16px 0' }}>https://medqueue.com</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ color: '#e0e0e0', fontSize: '12px', width: '80px' }}>Username</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoFocus
              style={{
                flex: 1,
                background: '#121212',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '13px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#999'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ color: '#e0e0e0', fontSize: '12px', width: '80px' }}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                flex: 1,
                background: '#121212',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '13px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#999'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: '#e8a9d9', // Mimicking the pinkish button from the screenshot
                color: '#000',
                border: 'none',
                borderRadius: '16px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isLoading ? '...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
