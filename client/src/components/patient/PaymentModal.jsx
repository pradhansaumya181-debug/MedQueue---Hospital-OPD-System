// src/components/patient/PaymentModal.jsx
// Razorpay checkout modal — booking se pehle payment
// Razorpay ka popup khulta hai → patient pays → backend verify karta hai

import { useState } from 'react'
import { createOrder, verifyPayment } from '@/services/paymentService'
import useToast from '@/hooks/useToast'
import useAuth from '@/hooks/useAuth'

const PaymentModal = ({
  isOpen,
  onClose,
  bookingData,      // { doctorId, date, slotId, reason, doctorName, fee, startTime }
  onSuccess,        // Callback after successful payment + booking
}) => {
  const toast = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('confirm') // 'confirm' | 'processing'

  if (!isOpen) return null

  const { doctorId, date, slotId, reason, doctorName, fee, startTime } = bookingData

  const handlePayment = async () => {
    setIsLoading(true)
    setStep('processing')

    try {
      // Step 1: Backend se Razorpay order create karo
      const orderRes = await createOrder({ doctorId, date, slotId, reason })
      const { orderId, amount, keyId } = orderRes.data

      // Step 2: Razorpay checkout options
      const options = {
        key:         keyId,
        amount,
        currency:    'INR',
        name:        'MedQueue',
        description: `Consultation with ${doctorName}`,
        order_id:    orderId,

        // Prefill patient info
        prefill: {
          name:    user?.name || '',
          email:   user?.email || '',
          contact: user?.phone || '',
        },

        // Razorpay theme
        theme: { color: '#00b4d8' },

        // Payment success callback
        handler: async (response) => {
          try {
            // Step 3: Backend se verify + slot book karo
            const verifyRes = await verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              doctorId, date, slotId, reason,
            })

            toast.success(
              `Appointment confirmed! Token #${verifyRes.data.appointment?.tokenNumber}`,
              'Payment Successful 🎉'
            )
            onSuccess?.(verifyRes.data)
            onClose()

          } catch (verifyErr) {
            toast.error('Payment done but booking failed. Contact support.')
          }
        },

        // Modal dismiss callback
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setStep('confirm')
          },
        },
      }

      // Step 4: Razorpay checkout open karo
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`)
        setIsLoading(false)
        setStep('confirm')
      })
      rzp.open()

    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment')
      setIsLoading(false)
      setStep('confirm')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,22,40,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        width: '100%', maxWidth: 420,
        zIndex: 1001,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {step === 'confirm' ? (
          <>
            {/* Payment icon */}
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(0,180,216,0.1)',
              border: '1px solid rgba(0,180,216,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="2" y="6" width="22" height="16" rx="3" stroke="var(--brand-accent)" strokeWidth="1.8"/>
                <path d="M2 11h22" stroke="var(--brand-accent)" strokeWidth="1.8"/>
                <path d="M6 16h4M16 16h4" stroke="var(--brand-accent)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', textAlign: 'center' }}>
              Complete Payment
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px', textAlign: 'center' }}>
              Secure payment via Razorpay
            </p>

            {/* Order summary */}
            <div style={{
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              marginBottom: 24,
            }}>
              {[
                { label: 'Doctor', value: doctorName },
                { label: 'Date', value: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) },
                { label: 'Time', value: startTime },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(0,180,216,0.06)',
                borderTop: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-accent)' }}>
                  ₹{fee}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 16, marginBottom: 20,
            }}>
              {['256-bit SSL', 'PCI DSS', 'Secure Checkout'].map(badge => (
                <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1L2 3v3c0 2.5 1.7 4.8 4 5.5C8.3 10.8 10 8.5 10 6V3L6 1z"
                      fill="#10b981" opacity="0.8"/>
                    <path d="M4 6l1.5 1.5L8 4.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{badge}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} className="mq-btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                style={{
                  flex: 1, padding: '12px',
                  background: 'var(--brand-accent)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 8l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5"/>
                </svg>
                Pay ₹{fee}
              </button>
            </div>
          </>
        ) : (
          // Processing state
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 20px' }}>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '3px solid var(--brand-light)',
              }}/>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'var(--brand-accent)',
                animation: 'mq-spin 0.8s linear infinite',
              }}/>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Processing payment...
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Please do not close this window
            </p>
          </div>
        )}

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

export default PaymentModal
