export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false, 
  className = '',
  style = {},
  ...props 
}) {
  const baseStyle = {
    fontFamily: 'var(--font-heading)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 600,
    transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent)',
      color: '#fff',
      boxShadow: '4px 4px 12px rgba(195, 175, 155, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.85)',
    },
    secondary: {
      backgroundColor: 'var(--secondary)',
      color: '#fff',
      boxShadow: '4px 4px 12px rgba(195, 175, 155, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.85)',
    },
    outline: {
      background: 'var(--bg-color)',
      color: 'var(--secondary)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: 'var(--neu-shadow-raised-sm)',
    },
    ghost: {
      background: 'var(--bg-color)',
      color: 'var(--primary)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: 'var(--neu-shadow-raised-sm)',
    },
    danger: {
      backgroundColor: 'var(--error-color)',
      color: '#fff',
      boxShadow: '4px 4px 12px rgba(195, 175, 155, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.85)',
    },
  };

  const sizes = {
    small:  { padding: '8px 18px',  fontSize: '0.9rem', borderRadius: '10px' },
    medium: { padding: '12px 24px', fontSize: '1rem',   borderRadius: '14px' },
    large:  { padding: '16px 32px', fontSize: '1.1rem', borderRadius: '18px' },
  };

  return (
    <button
      style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }}
      className={`neu-button ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Chargement...' : children}
    </button>
  );
}
