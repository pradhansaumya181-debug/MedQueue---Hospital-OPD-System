// src/pages/doctor/ManageSlots.jsx
// Doctor apne working days ke liye slots generate karta hai

import { useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import useToast from '@/hooks/useToast'
import { generateSlots } from '@/services/doctorService'
import { getTodayString, formatFullDate, formatTime } from '@/utils/formatDate'

const ManageSlots = () => {
  const toast = useToast()
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [slots, setSlots]               = useState([])
  const [isLoading, setIsLoading]       = useState(false)
  const [generated, setGenerated]       = useState(false)

  // Next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const handleGenerate = async () => {
    setIsLoading(true)
    setGenerated(false)
    try {
      const res = await generateSlots(selectedDate)
      setSlots(res.data.slots || [])
      setGenerated(true)
      toast.success(`${res.data.totalSlots} slots generated for ${formatFullDate(selectedDate)}`, 'Slots Ready')
    } catch (err) {
      toast.error(err.message || 'Failed to generate slots')
    } finally {
      setIsLoading(false)
    }
  }

  const available = slots.filter(s => !s.isBooked).length
  const booked    = slots.filter(s => s.isBooked).length

  return (
    <DashboardLayout>
      <div className="mq-fadein" style={{ maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Manage Slots
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Generate appointment slots for your working days
          </p>
        </div>

        {/* Date selector card */}
        <div className="mq-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Select Date
          </h3>

          {/* Date scroll */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
            {dates.map(date => {
              const d = new Date(date)
              const isSelected = date === selectedDate
              const isToday = date === getTodayString()
              const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
              return (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setGenerated(false); setSlots([]) }}
                  style={{
                    flexShrink: 0, minWidth: 60,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--brand-accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--brand-accent)' : 'var(--surface)',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{isToday ? 'Today' : dayNames[d.getDay()]}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{d.getDate()}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{monthNames[d.getMonth()]}</span>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              📅 {formatFullDate(selectedDate)}
            </p>
            <button
              className="mq-btn-primary"
              onClick={handleGenerate}
              disabled={isLoading}
              style={{ width: 'auto', padding: '10px 24px', fontSize: 13 }}
            >
              {isLoading ? (
                <><div className="mq-spinner" /> Generating...</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2v11M2 7.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Generate Slots
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats row */}
        {generated && slots.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', value: slots.length, color: 'var(--brand-accent)', bg: 'rgba(0,180,216,0.08)' },
              { label: 'Available', value: available, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Booked', value: booked, color: '#f59e0b', bg: '#fffbeb' },
            ].map(s => (
              <div key={s.label} className="mq-card" style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{s.label} Slots</p>
              </div>
            ))}
          </div>
        )}

        {/* Slots grid */}
        {generated && slots.length > 0 && (
          <div className="mq-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              All Slots
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {slots.map(slot => (
                <div
                  key={slot._id}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${slot.isBooked ? '#f59e0b' : 'var(--border)'}`,
                    background: slot.isBooked ? '#fffbeb' : 'var(--surface-2)',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 500, color: slot.isBooked ? '#92400e' : 'var(--text-primary)', margin: '0 0 2px' }}>
                    {formatTime(slot.startTime)}
                  </p>
                  <p style={{ fontSize: 10, color: slot.isBooked ? '#b45309' : 'var(--text-muted)', margin: 0 }}>
                    {slot.isBooked ? '🔴 Booked' : '🟢 Free'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ManageSlots
