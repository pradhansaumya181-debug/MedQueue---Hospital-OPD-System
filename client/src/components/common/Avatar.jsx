// src/components/common/Avatar.jsx
// Reusable avatar component — image ya initials

const Avatar = ({
  name = '',
  src = null,
  size = 40,
  fontSize = null,
  prefix = '',
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const fSize = fontSize || Math.floor(size * 0.35)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-mid))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fSize,
        fontWeight: 700,
        color: 'var(--brand-accent)',
        flexShrink: 0,
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      ) : (
        `${prefix}${initials}`
      )}
    </div>
  )
}

export default Avatar
