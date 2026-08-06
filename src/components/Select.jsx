export default function Select({ 
  label, 
  error, 
  options = [], 
  className = '', 
  style = {},
  ...props 
}) {
  return (
    <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: 600, 
          fontSize: '0.9rem', 
          color: 'var(--secondary)' 
        }}>
          {label}
        </label>
      )}
      <select
        className={`form-control neu-select ${className}`}
        style={{
          width: '100%',
          padding: '14px 18px',
          border: error ? '1px solid var(--error-color)' : '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '14px',
          fontSize: '1rem',
          fontFamily: 'var(--font-body)',
          transition: 'all 0.25s ease',
          background: 'var(--bg-color)',
          boxShadow: error ? 'inset 3px 3px 6px rgba(220, 53, 69, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.8)' : 'var(--neu-shadow-inset)',
          outline: 'none',
          cursor: 'pointer',
          color: 'var(--text-color)',
          ...style
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ 
          color: 'var(--error-color)', 
          fontSize: '0.85rem', 
          marginTop: '0.5rem', 
          display: 'block',
          fontWeight: 500,
        }}>
          {error}
        </span>
      )}
    </div>
  );
}
