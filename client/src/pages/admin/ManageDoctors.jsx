// src/pages/admin/ManageDoctors.jsx
// Admin doctor profiles create + manage karta hai

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import ConfirmModal from '@/components/common/ConfirmModal'
import useToast from '@/hooks/useToast'
import { getAllUsers, createDoctorProfile, deleteDoctorProfile } from '@/services/adminService'
import api from '@/services/api'

const ManageDoctors = () => {
  const toast = useToast()
  const [doctors, setDoctors]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [form, setForm] = useState({
    userId: '', specialization: '', qualification: '',
    experience: '', registrationNumber: '', consultationFee: '',
    availableDays: [1,2,3,4,5],
    workingHours: { start: '09:00', end: '17:00' },
  })
  const [doctorUsers, setDoctorUsers] = useState([])
  const [formLoading, setFormLoading] = useState(false)

  const fetchDoctors = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/patients/doctors/search?limit=50')
      setDoctors(res.data.doctors || [])
    } catch { setDoctors([]) }
    finally { setIsLoading(false) }
  }

  const fetchDoctorUsers = async () => {
    try {
      const res = await getAllUsers({ role: 'doctor', limit: 100 })
      setDoctorUsers(res.data.users || [])
    } catch {}
  }

  useEffect(() => { fetchDoctors(); fetchDoctorUsers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.userId || !form.specialization || !form.consultationFee) {
      toast.error('Please fill all required fields')
      return
    }
    setFormLoading(true)
    try {
      await createDoctorProfile({
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
      })
      toast.success('Doctor profile created successfully!', 'Done')
      setShowForm(false)
      fetchDoctors()
    } catch (err) {
      toast.error(err.message || 'Failed to create profile')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteDoctorProfile(deleteModal.id)
      toast.success('Doctor deactivated successfully')
      setDeleteModal({ open: false, id: null, name: '' })
      fetchDoctors()
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate')
    } finally {
      setDeleteLoading(false)
    }
  }

  const updateForm = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Manage Doctors
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            className="mq-btn-primary"
            onClick={() => setShowForm(v => !v)}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}
          >
            {showForm ? '✕ Close Form' : '+ Add Doctor'}
          </button>
        </div>

        {/* Add doctor form */}
        {showForm && (
          <div className="mq-card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>
              Create Doctor Profile
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>

                {/* Doctor user select */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="mq-label">Select Doctor User *</label>
                  <select
                    className="mq-input"
                    value={form.userId}
                    onChange={updateForm('userId')}
                    required
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <option value="">-- Select a doctor user --</option>
                    {doctorUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {[
                  { field: 'specialization', label: 'Specialization *', placeholder: 'e.g. Cardiologist' },
                  { field: 'qualification', label: 'Qualification *', placeholder: 'e.g. MBBS, MD' },
                  { field: 'experience', label: 'Experience (years) *', placeholder: '5', type: 'number' },
                  { field: 'registrationNumber', label: 'Registration No. *', placeholder: 'MCI123456' },
                  { field: 'consultationFee', label: 'Consultation Fee (₹) *', placeholder: '500', type: 'number' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="mq-label">{f.label}</label>
                    <input
                      className="mq-input"
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={form[f.field]}
                      onChange={updateForm(f.field)}
                      required
                    />
                  </div>
                ))}

                {/* Working hours */}
                <div>
                  <label className="mq-label">Start Time</label>
                  <input
                    className="mq-input" type="time"
                    value={form.workingHours.start}
                    onChange={e => setForm(f => ({ ...f, workingHours: { ...f.workingHours, start: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="mq-label">End Time</label>
                  <input
                    className="mq-input" type="time"
                    value={form.workingHours.end}
                    onChange={e => setForm(f => ({ ...f, workingHours: { ...f.workingHours, end: e.target.value } }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="mq-btn-primary" disabled={formLoading} style={{ width: 'auto', padding: '10px 24px', fontSize: 13 }}>
                  {formLoading ? <><div className="mq-spinner" /> Creating...</> : 'Create Profile'}
                </button>
                <button type="button" className="mq-btn-secondary" onClick={() => setShowForm(false)} style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctors list */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 140, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', animation: 'mq-shimmer 1.4s ease infinite' }} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <p style={{ fontSize: 36, margin: '0 0 12px' }}>👨‍⚕️</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>No doctors yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add your first doctor profile above</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {doctors.map(doctor => {
              const u = doctor.userId || {}
              const initials = u.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'DR'
              return (
                <div key={doctor._id} className="mq-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--brand-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: 'var(--brand-accent)',
                      flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                        {u.name?.startsWith('Dr') ? u.name : `Dr. ${u.name}`}
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--brand-accent)', margin: 0, fontWeight: 500 }}>
                        {doctor.specialization}
                      </p>
                    </div>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: doctor.isActive ? '#10b981' : '#ef4444',
                      flexShrink: 0, marginTop: 4,
                    }} />
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {[
                      `${doctor.experience} yrs`,
                      `₹${doctor.consultationFee}`,
                      `${doctor.workingHours?.start}–${doctor.workingHours?.end}`,
                    ].map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, padding: '3px 9px', borderRadius: 99,
                        background: 'var(--surface-2)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setDeleteModal({ open: true, id: doctor._id, name: u.name })}
                    style={{
                      width: '100%', padding: '7px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--error)', background: 'none',
                      color: 'var(--error)', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    Deactivate Doctor
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.open}
          onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
          onConfirm={handleDelete}
          isLoading={deleteLoading}
          title="Deactivate Doctor?"
          message={`Dr. ${deleteModal.name}'s profile will be deactivated. Existing appointments will be preserved.`}
          confirmLabel="Yes, Deactivate"
          type="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default ManageDoctors
