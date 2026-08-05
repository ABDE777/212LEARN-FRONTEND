import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import Button from './Button';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, isCartOpen, closeCart, removeFromCart, loading } = useCartContext();

  if (!isCartOpen) return null;

  const totalAmount = items.reduce((acc, item) => {
    const price = item.course?.price || item.price || 0;
    return acc + Number(price);
  }, 0);

  const handleProceedToCheckout = () => {
    closeCart();
    if (items.length > 0) {
      const firstCourseId = items[0].course?.id || items[0].courseId;
      if (firstCourseId) {
        navigate(`/courses/${firstCourseId}/checkout`);
      } else {
        navigate('/cart');
      }
    }
  };

  const handleExploreCatalog = () => {
    closeCart();
    navigate('/courses');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Overlay */}
      <div
        onClick={closeCart}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--surface-color, #ffffff)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9991,
          animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Drawer Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={22} color="var(--primary, #4f46e5)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-color, #1e293b)' }}>
              Mon Panier ({items.length})
            </h2>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary, #64748b)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-color, #f8fafc)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {items.length === 0 ? (
            /* Empty State */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem 1rem',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--bg-color, #f8fafc)',
                  border: '2px dashed var(--border-color, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <BookOpen size={36} color="var(--secondary, #94a3b8)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-color, #1e293b)', marginBottom: '0.5rem' }}>
                Votre panier est vide
              </h3>
              <p style={{ color: 'var(--secondary, #64748b)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '280px' }}>
                Découvrez nos cours d'exception et commencez votre apprentissage dès aujourd'hui !
              </p>
              <Button variant="primary" onClick={handleExploreCatalog}>
                Découvrir nos cours
              </Button>
            </div>
          ) : (
            /* Items List */
            items.map((item) => {
              const course = item.course || item;
              return (
                <div
                  key={item.id || course.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    background: 'var(--bg-color, #f8fafc)',
                    alignItems: 'center',
                  }}
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title || 'Vignette du cours'}
                      style={{ width: '70px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '70px',
                        height: '56px',
                        borderRadius: '8px',
                        background: 'var(--border-color, #cbd5e1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BookOpen size={24} color="#64748b" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        margin: '0 0 0.25rem 0',
                        color: 'var(--text-color, #1e293b)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {course.title || 'Cours'}
                    </h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary, #4f46e5)' }}>
                      {Number(course.price) === 0 ? 'Gratuit' : `${course.price} MAD`}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, course.title)}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--error-color, #ef4444)',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.15s',
                    }}
                    title="Supprimer du panier"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--surface-color, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--secondary, #64748b)', fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary, #4f46e5)' }}>
                {totalAmount === 0 ? 'Gratuit' : `${totalAmount.toFixed(2)} MAD`}
              </span>
            </div>

            <Button
              variant="primary"
              size="large"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={handleProceedToCheckout}
            >
              Commander maintenant <ArrowRight size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
