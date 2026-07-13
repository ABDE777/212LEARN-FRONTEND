export default function Card({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = '1.5rem',
  style = {},
  ...props 
}) {
  const baseStyle = {
    borderRadius: '16px',
    padding,
  };

  const variants = {
    default: {
      background: 'var(--surface-color)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
    },
    glass: {
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-glass)',
    },
    elevated: {
      background: 'var(--surface-color)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
    },
    flat: {
      background: 'var(--surface-color)',
      border: 'none',
      boxShadow: 'none',
    },
  };

  return (
    <div
      style={{ ...baseStyle, ...variants[variant], ...style }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
