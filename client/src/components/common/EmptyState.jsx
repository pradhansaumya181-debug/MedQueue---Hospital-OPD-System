// src/components/common/EmptyState.jsx
// Reusable empty state — poore app mein use hota hai

const EmptyState = ({
  emoji = '📭',
  title = 'Nothing here yet',
  message = '',
  actionLabel = '',
  onAction = null,
}) => (
  <div
    style={{
      textAlign: 'center',
      padding: '56px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--surface-3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        marginBottom: 8,
      }}
    >
      {emoji}
    </div>
    <h3
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
      }}
    >
      {title}
    </h3>
    {message && (
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          margin: 0,
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    )}
    {actionLabel && onAction && (
      <button
        className="mq-btn-primary"
        onClick={onAction}
        style={{
          width: 'auto',
          padding: '10px 24px',
          fontSize: 13,
          marginTop: 8,
        }}
      >
        {actionLabel}
      </button>
    )}
  </div>
)

export default EmptyState
