export default function Card({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = '1.5rem',
  style = {},
  ...props 
}) {
  const baseStyle = {
    borderRadius: '20px',
    padding,
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const variants = {
    default: {
      background: 'var(--bg-color)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: 'var(--neu-shadow-raised)',
    },
    glass: {
      background: 'var(--bg-color)',
      border: '1px solid rgba(255, 255, 255, 0.7)',
      boxShadow: 'var(--neu-shadow-raised)',
    },
    elevated: {
      background: 'var(--bg-color)',
      border: '1px solid rgba(255, 255, 255, 0.7)',
      boxShadow: 'var(--neu-shadow-raised-lg)',
    },
    flat: {
      background: 'var(--bg-color)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: 'var(--neu-shadow-inset)',
    },
  };

  return (
    <div
      style={{ ...baseStyle, ...variants[variant], ...style }}
      className={`neu-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
