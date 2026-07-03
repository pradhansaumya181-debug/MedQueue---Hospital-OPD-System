// src/components/patient/RatingModal.jsx
// Star rating modal — appointment complete hone ke baad

import { useState } from 'react'
import api from '@/services/api'
import useToast from '@/hooks/useToast'

// Interactive star component
const StarRating = ({ value, onChange, size = 32 }) => {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 2,
              transition: 'transform 0.1s',
              transform: hover === star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={filled ? '#f59e0b' : 'none'}
                stroke={filled ? '#f59e0b' : 'var(--border)'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

const ratingLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

const RatingModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const toast = useToast()
  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const doctorName = (() => {
    const name = appointment?.doctorId?.userId?.name
    if (!name) return 'the doctor'
    return name.startsWith('Dr') ? name : `Dr. ${name}`
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.warning('Please select a rating'); return }

    setIsLoading(true)
    try {
      await api.post('/reviews', {
        appointmentId: appointment._id,
        rating,
        comment,
      })
      toast.success('Thank you for your feedback!', 'Review submitted')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,22,40,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        width: '100%', maxWidth: 400,
        zIndex: 1001,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-muted)',
            padding: 4, borderRadius: 6,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Rate your experience
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            How was your consultation with {doctorName}?
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Stars */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <StarRating value={rating} onChange={setRating} size={36} />
            {rating > 0 && (
              <p style={{
                fontSize: 14, fontWeight: 600,
                color: rating >= 4 ? 'var(--success)' : rating >= 3 ? 'var(--warning)' : 'var(--error)',
                margin: 0,
              }}>
                {ratingLabels[rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="mq-label">Share your experience (optional)</label>
            <textarea
              className="mq-input"
              placeholder="What went well? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              style={{ resize: 'none', fontFamily: 'var(--font-sans)', fontSize: 14 }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', textAlign: 'right' }}>
              {comment.length}/500
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="mq-btn-secondary"
              style={{ flex: 1 }}
            >
              Skip
            </button>
            <button
              type="submit"
              className="mq-btn-primary"
              disabled={isLoading || !rating}
              style={{ flex: 1 }}
            >
              {isLoading ? <><div className="mq-spinner"/> Submitting...</> : 'Submit Review'}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes modalIn {
            from { opacity:0; transform:translate(-50%,-48%) scale(0.94); }
            to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
          }
        `}</style>
      </div>
    </>
  )
}

export default RatingModal
