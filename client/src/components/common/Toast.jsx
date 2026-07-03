// src/components/common/Toast.jsx
// Zomato-style toast notifications
// Screen ke bottom-right mein stack hote hain
// Automatically gayab ho jaate hain

import {  useState } from 'react'
import useToastStore from '@/store/toastStore'

// Single toast item
const ToastItem = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false)

  // Remove animation
  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 250)
  }

  // Colors type ke hisaab se
  const config = {
    success: {
      bg: '#ecfdf5',
      border: '#10b981',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#10b981" />
          <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      titleColor: '#065f46',
      msgColor: '#047857',
    },
    error: {
      bg: '#fef2f2',
      border: '#ef4444',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#ef4444" />
          <path d="M6 6l6 6M12 6l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      titleColor: '#7f1d1d',
      msgColor: '#b91c1c',
    },
    warning: {
      bg: '#fffbeb',
      border: '#f59e0b',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#f59e0b" />
          <path d="M9 5v5M9 12v1" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      titleColor: '#78350f',
      msgColor: '#b45309',
    },
    info: {
      bg: '#eff6ff',
      border: '#3b82f6',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#3b82f6" />
          <path d="M9 8v5M9 6v1" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      titleColor: '#1e3a8a',
      msgColor: '#1d4ed8',
    },
  }

  const c = config[toast.type] || config.info

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '300px',
        maxWidth: '380px',
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? 'translateX(20px)' : 'translateX(0)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        animation: 'toastIn 0.3s ease forwards',
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: 1 }}>{c.icon}</div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: c.titleColor,
              marginBottom: 2,
            }}
          >
            {toast.title}
          </p>
        )}
        <p style={{ fontSize: 13, color: c.msgColor, lineHeight: 1.5 }}>
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: c.titleColor,
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// Toast container — poori app ke upar render hoga
const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

export default ToastContainer
