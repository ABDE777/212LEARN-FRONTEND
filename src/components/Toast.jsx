import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastItem({ toast, onClose }) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const icon = isSuccess ? (
    <CheckCircle2 size={20} color="var(--success-color, #28a745)" />
  ) : isError ? (
    <AlertCircle size={20} color="var(--error-color, #dc3545)" />
  ) : (
    <Info size={20} color="var(--primary, #C1652F)" />
  );

  const borderLeftColor = isSuccess ? 'var(--success-color)' : isError ? 'var(--error-color)' : 'var(--primary)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        minWidth: '280px',
        maxWidth: '420px',
        padding: '0.95rem 1.25rem',
        background: 'var(--bg-color)',
        color: 'var(--text-color)',
        borderRadius: '16px',
        borderLeft: `5px solid ${borderLeftColor}`,
        boxShadow: 'var(--neu-shadow-raised)',
        borderTop: '1px solid rgba(255, 255, 255, 0.6)',
        borderRight: '1px solid rgba(255, 255, 255, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        fontSize: '0.92rem',
        fontWeight: 600,
        animation: 'slideInRight 0.3s ease-out',
        zIndex: 9999,
        position: 'relative',
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: 'var(--bg-color)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          width: '26px',
          height: '26px',
          cursor: 'pointer',
          color: 'var(--secondary)',
          boxShadow: 'var(--neu-shadow-raised-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        // Above modal/drawer overlays (z-index 99999) so success/error toasts
        // are visible even while a form drawer is open.
        zIndex: 1000000,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
