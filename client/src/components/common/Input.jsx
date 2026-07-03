// src/components/common/Input.jsx
// Reusable input — label + error + icon support

const Input = ({
  label,
  error,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  rows,
  hint,
  ...props
}) => {
  const isTextarea = type === 'textarea'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label className="mq-label">
          {label}
          {required && (
            <span style={{ color: 'var(--error)', marginLeft: 3 }}>*</span>
          )}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        {icon && !isTextarea && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            {icon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            className={`mq-input ${error ? 'error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={rows || 3}
            style={{
              resize: 'vertical',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
            }}
            {...props}
          />
        ) : (
          <input
            className={`mq-input ${error ? 'error' : ''}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{
              paddingLeft: icon ? 40 : 14,
              opacity: disabled ? 0.6 : 1,
            }}
            {...props}
          />
        )}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          {hint}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="mq-error-text">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="6" fill="#ef4444" />
            <path
              d="M6 3.5v3M6 8v.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input

