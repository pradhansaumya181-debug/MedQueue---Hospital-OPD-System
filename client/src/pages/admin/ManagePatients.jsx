// src/pages/admin/ManagePatients.jsx
// Admin patient list dekh sakta hai + block/unblock

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import useToast from '@/hooks/useToast'
import { getAllUsers, toggleUserBlock } from '@/services/adminService'

const ManagePatients = () => {
  const toast = useToast()
  const [patients, setPatients]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch]       = useState('')
  const [togglingId, setTogglingId] = useState(null)
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)

  const fetchPatients = async (pg = 1, q = '') => {
    setIsLoading(true)
    try {
      const res = await getAllUsers({ role: 'patient', page: pg, limit: 15, search: q })
      setPatients(res.data.users || [])
      setTotal(res.data.pagination?.total || 0)
    } catch { setPatients([]) }
    finally { setIsLoading(false) }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(1, search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleToggleBlock = async (id, isBlocked, name) => {
    setTogglingId(id)
    try {
      await toggleUserBlock(id)
      toast.success(`${name} ${isBlocked ? 'unblocked' : 'blocked'} successfully`)
      fetchPatients(page, search)
    } catch (err) {
      toast.error(err.message || 'Action failed')
    } finally {
      setTogglingId(null)
    }
  }

  const initials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'P'

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Patients
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            {total} total registered patients
          </p>
        </div>

        {/* Search */}
        <div className="mq-card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="mq-input"
              placeholder="Search patients by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mq-card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr auto auto',
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}>
            {['Patient', 'Contact', 'Status', 'Action'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {isLoading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height: 52, borderRadius: 8, background: 'var(--surface-2)', animation: 'mq-shimmer 1.4s ease infinite' }} />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {search ? `No patients matching "${search}"` : 'No patients yet'}
              </p>
            </div>
          ) : (
            patients.map((patient, idx) => (
              <div
                key={patient._id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto auto',
                  alignItems: 'center', gap: 12,
                  padding: '14px 20px',
                  borderBottom: idx < patients.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {/* Name + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--brand-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--brand-accent)',
                    flexShrink: 0, overflow: 'hidden',
                  }}>
                    {patient.profilePicture
                      ? <img src={patient.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : initials(patient.name)
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{patient.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0' }}>
                      {new Date(patient.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {patient.email}
                </p>

                {/* Status */}
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
                  color: patient.isBlocked ? '#ef4444' : '#10b981',
                  background: patient.isBlocked ? '#fef2f2' : '#ecfdf5',
                }}>
                  {patient.isBlocked ? 'Blocked' : 'Active'}
                </span>

                {/* Block/Unblock */}
                <button
                  onClick={() => handleToggleBlock(patient._id, patient.isBlocked, patient.name)}
                  disabled={togglingId === patient._id}
                  style={{
                    padding: '5px 12px', borderRadius: 6,
                    border: `1px solid ${patient.isBlocked ? '#10b981' : 'var(--error)'}`,
                    background: 'none',
                    color: patient.isBlocked ? '#10b981' : 'var(--error)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    opacity: togglingId === patient._id ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {togglingId === patient._id ? '...' : patient.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManagePatients
