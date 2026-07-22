// src/pages/doctor/DoctorProfile.jsx
// Doctor apna professional profile update kar sakta hai

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import useDoctorStore from '@/store/doctorStore'
import useToast from '@/hooks/useToast'
import api from '@/services/api'

const DoctorProfile = () => {
  const { doctorProfile, fetchDoctorProfile } = useDoctorStore()
  const toast = useToast()

  const [form, setForm] = useState({
    consultationFee: '',
    workingHours: { start: '09:00', end: '17:00' },
    availableDays: [1, 2, 3, 4, 5],
    specialization: '',
    qualification: '',
    experience: '',
    registrationNumber: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDoctorProfile()
  }, [])

  useEffect(() => {
    if (doctorProfile) {
      setForm({
        consultationFee: doctorProfile.consultationFee || '',
        workingHours: doctorProfile.workingHours || { start: '09:00', end: '17:00' },
        availableDays: doctorProfile.availableDays || [1, 2, 3, 4, 5],
        specialization: doctorProfile.specialization || '',
        qualification: doctorProfile.qualification || '',
        experience: doctorProfile.experience !== undefined ? doctorProfile.experience : '',
        registrationNumber: doctorProfile.registrationNumber || '',
      })
    }
  }, [doctorProfile])

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day].sort(),
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.availableDays.length === 0) {
      toast.error('Please select at least one available day')
      return
    }
    setIsLoading(true)
    try {
      await api.put('/doctors/profile', {
        consultationFee: Number(form.consultationFee),
        workingHours: form.workingHours,
        availableDays: form.availableDays,
        specialization: form.specialization,
        qualification: form.qualification,
        experience: Number(form.experience),
        registrationNumber: form.registrationNumber,
      })
      await fetchDoctorProfile()
      toast.success('Profile updated successfully!', 'Saved')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setIsLoading(false)
    }
  }

  const doc = doctorProfile
  const user = doc?.userId

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            My Profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            View and update your professional information
          </p>
        </div>

        {/* Static info card */}
        {doc && (
          <div className="mq-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-mid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: 'var(--brand-accent)',
              }}>
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'DR'}
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                  {user?.name?.startsWith('Dr') ? user.name : `Dr. ${user?.name}`}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--brand-accent)', margin: '0 0 2px', fontWeight: 500 }}>
                  {doc.specialization}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  {doc.qualification} • {doc.experience} years experience
                </p>
              </div>
            </div>

            {/* Read-only fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Registration No.', value: doc.registrationNumber },
                { label: 'Email', value: user?.email },
              ].map((f) => (
                <div key={f.label}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 3px', fontWeight: 500 }}>
                    {f.label}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                    {f.value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable form */}
        <div className="mq-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>
            Update Settings
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Specialization & Qualification */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="mq-label">Specialization</label>
                <input
                  className="mq-input"
                  type="text"
                  placeholder="e.g. Cardiologist"
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                />
              </div>
              <div>
                <label className="mq-label">Qualification</label>
                <input
                  className="mq-input"
                  type="text"
                  placeholder="e.g. MBBS, MD"
                  value={form.qualification}
                  onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                />
              </div>
            </div>

            {/* Experience & Registration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="mq-label">Experience (Years)</label>
                <input
                  className="mq-input"
                  type="number"
                  placeholder="e.g. 5"
                  min="0"
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                />
              </div>
              <div>
                <label className="mq-label">Registration No.</label>
                <input
                  className="mq-input"
                  type="text"
                  placeholder="e.g. REG123456"
                  value={form.registrationNumber}
                  onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                />
              </div>
            </div>

            {/* Consultation fee */}
            <div>
              <label className="mq-label">Consultation Fee (₹) *</label>
              <input
                className="mq-input"
                type="number"
                placeholder="500"
                value={form.consultationFee}
                onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
                min="0"
                required
              />
            </div>

            {/* Working hours */}
            <div>
              <label className="mq-label">Working Hours *</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  className="mq-input"
                  type="time"
                  value={form.workingHours.start}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      workingHours: { ...f.workingHours, start: e.target.value },
                    }))
                  }
                  style={{ flex: 1 }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: 14, flexShrink: 0 }}>to</span>
                <input
                  className="mq-input"
                  type="time"
                  value={form.workingHours.end}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      workingHours: { ...f.workingHours, end: e.target.value },
                    }))
                  }
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* Available days */}
            <div>
              <label className="mq-label">Available Days *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dayLabels.map((day, idx) => {
                  const active = form.availableDays.includes(idx)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${active ? 'var(--brand-accent)' : 'var(--border)'}`,
                        background: active ? 'var(--brand-accent)' : 'var(--surface)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>
                {form.availableDays.length} days selected
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

export default DoctorProfile
