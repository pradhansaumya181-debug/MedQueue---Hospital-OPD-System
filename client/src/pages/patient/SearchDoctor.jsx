// src/pages/patient/SearchDoctors.jsx — COMPLETE WITH FILTERS

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/common/DashboardLayout'
import DoctorCard from '@/components/patient/DoctorCard'
import { searchDoctors } from '@/services/appointmentService'

const specializations = [
  'All', 'Cardiologist', 'Dermatologist', 'General Physician',
  'Orthopedic', 'Neurologist', 'Pediatrician', 'Gynecologist', 'ENT',
]

// Star display (read only)
const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1l1.8 3.6 4 .58-2.9 2.83.68 4L7 9.9 3.42 12l.68-4L1.2 5.18l4-.58L7 1z"
          fill={i <= Math.round(rating) ? '#f59e0b' : 'var(--border)'}
          stroke={i <= Math.round(rating) ? '#f59e0b' : 'var(--border)'}
          strokeWidth="0.5"
        />
      </svg>
    ))}
  </div>
)

const SearchDoctors = () => {
  const navigate = useNavigate()
  const [query, setQuery]           = useState('')
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [doctors, setDoctors]       = useState([])
  const [isLoading, setIsLoading]   = useState(false)
  const [total, setTotal]           = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Advanced filters
  const [filters, setFilters] = useState({
    minFee: '',
    maxFee: '',
    minExp: '',
    minRating: 0,
    sortBy: 'rating', // 'rating' | 'fee_asc' | 'fee_desc' | 'experience'
  })

  const activeFilterCount = [
    filters.minFee, filters.maxFee, filters.minExp,
    filters.minRating > 0,
    filters.sortBy !== 'rating',
  ].filter(Boolean).length

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (query) params.q = query
      if (selectedSpec !== 'All') params.specialization = selectedSpec

      const res = await searchDoctors(params)
      let list = res.data.doctors || []

      // Client-side filtering
      if (filters.minFee) list = list.filter(d => d.consultationFee >= Number(filters.minFee))
      if (filters.maxFee) list = list.filter(d => d.consultationFee <= Number(filters.maxFee))
      if (filters.minExp) list = list.filter(d => d.experience >= Number(filters.minExp))
      if (filters.minRating > 0) list = list.filter(d => (d.rating || 0) >= filters.minRating)

      // Sort
      if (filters.sortBy === 'fee_asc') list.sort((a, b) => a.consultationFee - b.consultationFee)
      else if (filters.sortBy === 'fee_desc') list.sort((a, b) => b.consultationFee - a.consultationFee)
      else if (filters.sortBy === 'experience') list.sort((a, b) => b.experience - a.experience)
      else list.sort((a, b) => (b.rating || 0) - (a.rating || 0))

      setDoctors(list)
      setTotal(list.length)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [query, selectedSpec, filters])

  useEffect(() => {
    const timer = setTimeout(fetchDoctors, 400)
    return () => clearTimeout(timer)
  }, [fetchDoctors])

  const resetFilters = () => {
    setFilters({ minFee: '', maxFee: '', minExp: '', minRating: 0, sortBy: 'rating' })
  }

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

        {/* Search bar + filter button */}
        <div className="mq-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="mq-input"
                placeholder="Search by name, specialization..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${showFilters ? 'var(--brand-accent)' : 'var(--border)'}`,
                background: showFilters ? 'rgba(0,180,216,0.06)' : 'var(--surface)',
                color: showFilters ? 'var(--brand-accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M1 3h13M3 7.5h9M5.5 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--brand-accent)', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div style={{
              marginTop: 16, paddingTop: 16,
              borderTop: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>

              {/* Fee range */}
              <div>
                <label className="mq-label">Consultation Fee (₹)</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    className="mq-input"
                    type="number"
                    placeholder="Min"
                    value={filters.minFee}
                    onChange={e => setFilters(f => ({ ...f, minFee: e.target.value }))}
                    style={{ flex: 1 }}
                    min="0"
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: 14, flexShrink: 0 }}>to</span>
                  <input
                    className="mq-input"
                    type="number"
                    placeholder="Max"
                    value={filters.maxFee}
                    onChange={e => setFilters(f => ({ ...f, maxFee: e.target.value }))}
                    style={{ flex: 1 }}
                    min="0"
                  />
                </div>
              </div>

              {/* Experience + Sort row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mq-label">Min. Experience (years)</label>
                  <input
                    className="mq-input"
                    type="number"
                    placeholder="e.g. 5"
                    value={filters.minExp}
                    onChange={e => setFilters(f => ({ ...f, minExp: e.target.value }))}
                    min="0"
                  />
                </div>
                <div>
                  <label className="mq-label">Sort by</label>
                  <select
                    className="mq-input"
                    value={filters.sortBy}
                    onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <option value="rating">Top Rated</option>
                    <option value="fee_asc">Fee: Low to High</option>
                    <option value="fee_desc">Fee: High to Low</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <label className="mq-label">Minimum Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFilters(f => ({ ...f, minRating: r }))}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${filters.minRating === r ? 'var(--brand-accent)' : 'var(--border)'}`,
                        background: filters.minRating === r ? 'var(--brand-accent)' : 'var(--surface)',
                        color: filters.minRating === r ? '#fff' : 'var(--text-secondary)',
                        fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        display: 'flex', alignItems: 'center', gap: 4,
                        transition: 'all 0.15s',
                      }}
                    >
                      {r === 0 ? 'Any' : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M6.5 1l1.545 3.13 3.455.502-2.5 2.437.59 3.44L6.5 8.885 3.91 10.51l.59-3.441L2 4.632l3.455-.503L6.5 1z"
                              fill={filters.minRating === r ? 'white' : '#f59e0b'}
                              stroke={filters.minRating === r ? 'white' : '#f59e0b'}
                              strokeWidth="0.5"/>
                          </svg>
                          {r}+
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--error)', fontSize: 13,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    padding: 0, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Reset all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Specialization pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              style={{
                padding: '6px 16px', borderRadius: 99,
                border: `1.5px solid ${selectedSpec === spec ? 'var(--brand-accent)' : 'var(--border)'}`,
                background: selectedSpec === spec ? 'var(--brand-accent)' : 'var(--surface)',
                color: selectedSpec === spec ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: selectedSpec === spec ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
              }}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Results header */}
        {!isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {total} doctor{total !== 1 ? 's' : ''} found
              {selectedSpec !== 'All' ? ` in ${selectedSpec}` : ''}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Sorted by: <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                {filters.sortBy === 'rating' ? 'Top rated' :
                 filters.sortBy === 'fee_asc' ? 'Fee ↑' :
                 filters.sortBy === 'fee_desc' ? 'Fee ↓' : 'Experience'}
              </span>
            </p>
          </div>
        )}

        {/* Results grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                height: 220, borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)', border: '1px solid var(--border)',
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
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Try adjusting your filters or search term
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mq-btn-secondary"
                style={{ width: 'auto', padding: '8px 20px', margin: '0 auto', fontSize: 13 }}
              >
                Clear filters
              </button>
            )}
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
