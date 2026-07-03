// src/pages/patient/SearchDoctors.jsx
// Doctor search with filters

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import DoctorCard from '@/components/patient/DoctorCard'
import { searchDoctors } from '@/services/appointmentService'

const specializations = [
  'All', 'Cardiologist', 'Dermatologist', 'General Physician',
  'Orthopedic', 'Neurologist', 'Pediatrician', 'Gynecologist', 'ENT',
]

const SearchDoctors = () => {
  const [query, setQuery] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (query) params.q = query
      if (selectedSpec !== 'All') params.specialization = selectedSpec

      const res = await searchDoctors(params)
      setDoctors(res.data.doctors || [])
      setTotal(res.data.pagination?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [query, selectedSpec])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(fetchDoctors, 400)
    return () => clearTimeout(timer)
  }, [fetchDoctors])

  return (
    <DashboardLayout>
      <div className="mq-fadein">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Find Doctors
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Search and book appointments with specialists
          </p>
        </div>

        {/* Search bar */}
        <div className="mq-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <svg
              width="18" height="18" viewBox="0 0 18 18" fill="none"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            >
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              className="mq-input"
              type="text"
              placeholder="Search by specialization or qualification..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>
        </div>

        {/* Specialization filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              style={{
                padding: '6px 16px',
                borderRadius: 99,
                border: `1.5px solid ${selectedSpec === spec ? 'var(--brand-accent)' : 'var(--border)'}`,
                background: selectedSpec === spec ? 'var(--brand-accent)' : 'var(--surface)',
                color: selectedSpec === spec ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: selectedSpec === spec ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Results header */}
        {!isLoading && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {total} doctor{total !== 1 ? 's' : ''} found
            {selectedSpec !== 'All' ? ` for ${selectedSpec}` : ''}
          </p>
        )}

        {/* Doctor cards grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                height: 200, borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                animation: 'mq-shimmer 1.4s ease infinite',
              }} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              No doctors found
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Try a different search term or specialization
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {doctors.map(doctor => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default SearchDoctors
