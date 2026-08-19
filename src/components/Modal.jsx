import { useEffect } from 'react';
import ModalPortal from './ModalPortal';

export default function Modal({
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium' 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    small: { maxWidth: '400px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '800px' },
    fullscreen: { maxWidth: '95vw', height: '95vh' }
  };

  return (
    <ModalPortal>
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(43, 38, 34, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-color)',
          borderRadius: '24px',
          padding: '2.25rem',
          width: '100%',
          ...sizes[size],
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--neu-shadow-raised-lg)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{ margin: 0, color: 'var(--secondary)', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-color)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--neu-shadow-raised-sm)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
    </ModalPortal>
  );
}
