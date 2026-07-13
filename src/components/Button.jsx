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
    borderRadius: '8px',
    fontWeight: 600,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(232, 163, 61, 0.3)',
    },
    secondary: {
      backgroundColor: 'var(--secondary)',
      color: '#fff',
    },
    outline: {
      background: 'transparent',
      color: 'var(--secondary)',
      border: '1px solid var(--border-color)',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--primary)',
      boxShadow: 'none',
    },
    danger: {
      backgroundColor: 'var(--error-color)',
      color: '#fff',
    },
  };

  const sizes = {
    small:  { padding: '8px 16px',  fontSize: '0.9rem' },
    medium: { padding: '12px 24px', fontSize: '1rem'   },
    large:  { padding: '16px 32px', fontSize: '1.1rem' },
  };

  return (
    <button
      style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }}
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Chargement...' : children}
    </button>
  );
}
