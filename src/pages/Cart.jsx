import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Tag, ShoppingCart, ArrowRight, BookOpen } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { CourseCardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items: cartItems, fetchCart, removeFromCart, validateCoupon, loading, error } = useCartContext();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const userRole = user?.role?.toUpperCase();
    if (userRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
      return;
    } else if (userRole === 'INSTRUCTOR') {
      navigate('/instructor/dashboard', { replace: true });
      return;
    }
    fetchCart();
  }, [fetchCart, user, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      setCouponSuccess('');
      if (validateCoupon) {
        const res = await validateCoupon(couponCode);
        const discountVal = res?.discountPercentage || 10;
        setDiscount(discountVal);
        setCouponSuccess(`Coupon appliqué ! -${discountVal}%`);
      } else {
        setDiscount(10);
        setCouponSuccess('Coupon appliqué ! -10%');
      }
    } catch {
      setCouponError('Code promo invalide ou expiré.');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.course?.price || item.price || 0;
    return acc + Number(price);
  }, 0);

  const total = subtotal - subtotal * (discount / 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #f8fafc)' }}>
      <SEOHead title="Mon Panier" description="Consultez et validez les cours de votre panier sur 212Learn." />
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-color, #1e293b)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShoppingCart size={32} color="var(--primary, #4f46e5)" />
          Mon Panier ({cartItems.length})
        </h1>

        {error && (
          <div style={{ padding: '1rem 1.25rem', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        {loading && cartItems.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
            <CourseCardSkeleton />
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty State */
          <Card variant="default" padding="4rem 2rem" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <ShoppingCart size={44} color="var(--primary, #4f46e5)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-color, #1e293b)' }}>
              Votre panier est actuellement vide
            </h3>
            <p style={{ color: 'var(--secondary, #64748b)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Découvrez nos cours de pointe conçus pour propulser votre carrière.
            </p>
            <Link to="/courses" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="large">
                Découvrir le catalogue
              </Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="cart-grid-responsive">
            <style>{`
              @media (min-width: 992px) {
                .cart-grid-responsive {
                  grid-template-columns: 1fr 360px !important;
                }
              }
            `}</style>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => {
                const course = item.course || item;
                return (
                  <Card key={item.id || course.id} variant="default" padding="1.25rem" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={`Vignette de ${course.title}`}
                        style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '120px',
                          height: '80px',
                          background: 'var(--border-color, #cbd5e1)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <BookOpen size={28} color="#64748b" />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--text-color, #1e293b)', fontSize: '1.05rem', fontWeight: 600 }}>
                        <Link to={`/courses/${course.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {course.title}
                        </Link>
                      </h3>
                      <p style={{ color: 'var(--secondary, #64748b)', margin: 0, fontSize: '0.88rem' }}>
                        {course.category?.name || 'Informatique'} • {course.level || 'Tous niveaux'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary, #4f46e5)', marginBottom: '0.5rem' }}>
                        {Number(course.price) === 0 ? 'Gratuit' : `${course.price} MAD`}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, course.title)}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--error-color, #ef4444)',
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        <Trash2 size={16} /> Supprimer
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <Card variant="elevated" padding="2rem" style={{ position: 'sticky', top: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-color, #1e293b)' }}>
                Résumé de la commande
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--secondary, #64748b)' }}>
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#10b981', fontWeight: 600 }}>
                  <span>Réduction ({discount}%)</span>
                  <span>-{(subtotal * (discount / 100)).toFixed(2)} MAD</span>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px solid var(--border-color, #e2e8f0)',
                  paddingTop: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  color: 'var(--text-color, #1e293b)',
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--primary, #4f46e5)' }}>{total.toFixed(2)} MAD</span>
              </div>

              {/* Coupon Input */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Tag size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                    <input
                      type="text"
                      placeholder="Code promo"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 38px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        borderRadius: '8px',
                        background: 'var(--bg-color, #f8fafc)',
                        color: 'var(--text-color)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={loading || !couponCode.trim()}>
                    Appliquer
                  </Button>
                </div>
                {couponError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</p>}
                {couponSuccess && <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>{couponSuccess}</p>}
              </div>

              <Button
                variant="primary"
                size="large"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  const firstCourseId = cartItems[0]?.course?.id || cartItems[0]?.courseId;
                  if (firstCourseId) navigate(`/courses/${firstCourseId}/checkout`);
                }}
                disabled={loading}
              >
                Passer la commande <ArrowRight size={18} />
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
