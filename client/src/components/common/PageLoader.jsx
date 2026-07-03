// src/components/common/PageLoader.jsx
// Lazy loaded pages ke liye loading state
// Suspense fallback mein use hota hai

const PageLoader = ({ message = 'Loading...' }) => (
  <div
    style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      background: 'var(--surface-2)',
    }}
  >
    {/* Animated dots */}
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--brand-accent)',
            animation: `mqBounce 1.2s ease infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
    <p
      style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        margin: 0,
        fontWeight: 500,
      }}
    >
      {message}
    </p>
    <style>{`
      @keyframes mqBounce {
        0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
)

export default PageLoader
