import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

/**
 * FloatingActionMenu — a round floating button that expands, with a spring +
 * blur animation, into a vertical stack of labelled action buttons.
 *
 * Adapted to this project's stack (plain JSX + inline styles, no Tailwind/TS).
 *
 * Props:
 *  - options: [{ label, onClick, Icon }]  — the actions to show when open.
 *  - className: extra class on the fixed wrapper (e.g. to gate to mobile).
 *  - style: extra inline style merged onto the wrapper (position overrides).
 *  - ariaLabel: label for the toggle button.
 */
export default function FloatingActionMenu({ options = [], className = '', style, ariaLabel = 'Menu' }) {
  const [isOpen, setIsOpen] = useState(false);

  const glass = {
    background: 'rgba(17,17,17,0.62)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 20px rgba(0,0,0,0.22)',
    cursor: 'pointer',
  };

  return (
    <div className={className} style={{ position: 'fixed', bottom: '1.75rem', right: '1.25rem', zIndex: 1400, ...style }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        style={{
          ...glass,
          width: 54,
          height: 54,
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut', type: 'spring', stiffness: 300, damping: 20 }}
          style={{ display: 'flex' }}
        >
          <Plus size={24} color="#fff" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 10, y: 10, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            style={{ position: 'absolute', bottom: '3.75rem', right: 0, marginBottom: '0.5rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {options.map((option, index) => (
                <motion.div
                  key={option.label || index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    onClick={() => { option.onClick?.(); setIsOpen(false); }}
                    style={{
                      ...glass,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.55rem 0.95rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {option.Icon}
                    <span>{option.label}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
