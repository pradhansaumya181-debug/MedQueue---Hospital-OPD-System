// src/pages/admin/BulkCancel.jsx
// Admin ek doctor ke ek din ke saare appointments cancel kar sakta hai

import { useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import ConfirmModal from '@/components/common/ConfirmModal'
import useToast from '@/hooks/useToast'
import { bulkCancelAppointments } from '@/services/adminService'
import { getTodayString, formatFullDate } from '@/utils/formatDate'
import api from '@/services/api'

const BulkCancel = () => {
  const toast = useToast()
  const [doctors, setDoctors] = useState([])
  const [docLoading, setDocLoading] = useState(false)
  const [docsFetched, setDocsFetched] = useState(false)

  const [form, setForm] = useState({
    doctorId: '', date: getTodayString(), reason: '',
  })
  const [modalOpen, setModalOpen]   = useState(false)
  const [isLoading, setIsLoading]   = useState(false)
  const [result, setResult]         = useState(null)

  const fetchDoctors = async () => {
    if (docsFetched) return
    setDocLoading(true)
    try {
      const res = await api.get('/patients/doctors/search?limit=100')
      setDoctors(res.data.doctors || [])
      setDocsFetched(true)
    } catch {} finally { setDocLoading(false) }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const payload = { reason: form.reason }
      if (form.doctorId) payload.doctorId = form.doctorId
      if (form.date) payload.date = form.date

      const res = await bulkCancelAppointments(payload)
      setResult(res.data)
      setModalOpen(false)
      toast.success(`${res.data.cancelledCount} appointments cancelled`, 'Bulk Cancel Done')
    } catch (err) {
      setModalOpen(false)
      toast.error(err.message || 'Bulk cancel failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 600 }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Bulk Cancel
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Cancel multiple appointments at once — doctor emergency, holiday, etc.
          </p>
        </div>

        {/* Warning banner */}
        <div style={{
          padding: '14px 16px', marginBottom: 24,
          background: '#fffbeb', border: '1px solid #f59e0b',
          borderRadius: 'var(--radius-md)',
          display: 'flex', gap: 10,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
            This action will cancel <strong>all confirmed & pending</strong> appointments
            matching your filters. This cannot be undone. Patients will be notified.
          </p>
        </div>

        {/* Form */}
        <div className="mq-card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Doctor select */}
            <div>
              <label className="mq-label">Doctor (optional)</label>
              <select
                className="mq-input"
                value={form.doctorId}
                onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                onFocus={fetchDoctors}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <option value="">All Doctors</option>
                {docLoading && <option disabled>Loading...</option>}
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.userId?.name?.startsWith('Dr') ? d.userId.name : `Dr. ${d.userId?.name}`} — {d.specialization}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '5px 0 0' }}>
                Leave empty to cancel for all doctors on selected date
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="mq-label">Date (optional)</label>
              <input
                className="mq-input" type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
              {form.date && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '5px 0 0' }}>
                  {formatFullDate(form.date)}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="mq-label">Reason for cancellation *</label>
              <textarea
                className="mq-input"
                placeholder="e.g. Doctor on emergency leave, Hospital holiday..."
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: 14 }}
                required
              />
            </div>
          </div>

          <button
            className="mq-btn-primary"
            onClick={() => {
              if (!form.reason.trim()) { toast.error('Please provide a reason'); return }
              if (!form.doctorId && !form.date) { toast.error('Select at least a doctor or date'); return }
              setModalOpen(true)
            }}
            style={{ marginTop: 24, background: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 2l11 11M13 2L2 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Cancel Appointments
          </button>
        </div>

        {/* Result card */}
        {result && (
          <div className="mq-card" style={{ padding: 24, border: '1px solid #10b981', background: '#ecfdf5' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#065f46', margin: '0 0 12px' }}>
              ✅ Bulk Cancel Complete
            </h3>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#065f46', margin: 0 }}>{result.cancelledCount}</p>
                <p style={{ fontSize: 12, color: '#047857', margin: '4px 0 0' }}>Appointments Cancelled</p>
              </div>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#065f46', margin: 0 }}>{result.matchedCount}</p>
                <p style={{ fontSize: 12, color: '#047857', margin: '4px 0 0' }}>Total Matched</p>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={modalOpen}
          onCancel={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          isLoading={isLoading}
          title="Confirm Bulk Cancel?"
          message={`This will cancel all confirmed appointments${form.doctorId ? ' for the selected doctor' : ''}${form.date ? ` on ${formatFullDate(form.date)}` : ''}. Reason: "${form.reason}"`}
          confirmLabel="Yes, Cancel All"
          cancelLabel="Go Back"
          type="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default BulkCancel
