import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastItem({ toast, onClose }) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const icon = isSuccess ? (
    <CheckCircle2 size={20} color="#10B981" />
  ) : isError ? (
    <AlertCircle size={20} color="#EF4444" />
  ) : (
    <Info size={20} color="#3B82F6" />
  );

  const borderLeftColor = isSuccess ? '#10B981' : isError ? '#EF4444' : '#3B82F6';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '280px',
        maxWidth: '420px',
        padding: '0.85rem 1.1rem',
        background: 'var(--surface-color, #ffffff)',
        color: 'var(--text-color, #1e293b)',
        borderRadius: '12px',
        borderLeft: `4px solid ${borderLeftColor}`,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)',
        fontSize: '0.9rem',
        fontWeight: 500,
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
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--secondary, #64748b)',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
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
        zIndex: 9999,
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
