export default function Select({ 
  label, 
  error, 
  options = [], 
  className = '', 
  ...props 
}) {
  return (
    <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: 500, 
          fontSize: '0.9rem', 
          color: 'var(--secondary)' 
        }}>
          {label}
        </label>
      )}
      <select
        className="form-control"
        style={{
          width: '100%',
          padding: '12px 16px',
          border: error ? '1px solid var(--error-color)' : '1px solid var(--border-color)',
          borderRadius: '8px',
          fontSize: '1rem',
          fontFamily: 'var(--font-body)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          background: 'var(--surface-color)',
          outline: 'none',
          cursor: 'pointer'
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
          display: 'block' 
        }}>
          {error}
        </span>
      )}
    </div>
  );
}
