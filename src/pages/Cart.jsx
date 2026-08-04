import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Tag, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

export default function Cart() {
  const { cart, fetchCart, removeFromCart, validateCoupon, loading, error } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      setCouponSuccess('');
      const res = await validateCoupon(couponCode);
      // Assuming res data has percentage or fixed discount amount
      // This logic will depend on backend response format, e.g., res.discountPercentage
      const discountVal = res?.discountPercentage || 0; 
      setDiscount(discountVal);
      setCouponSuccess(`Coupon appliqué ! -${discountVal}%`);
    } catch (err) {
      setCouponError('Code promo invalide ou expiré');
    }
  };

  if (loading && !cart) {
    return <LoadingSpinner />;
  }

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.course?.price || 0), 0);
  const total = subtotal - (subtotal * (discount / 100));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShoppingCart size={36} color="var(--primary)" />
          Mon Panier
        </h1>

        {error && (
          <div style={{ padding: '1rem', background: 'var(--error-color)', color: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <Card variant="default" padding="3rem" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShoppingCart size={64} color="var(--secondary)" opacity={0.5} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
              Votre panier est vide
            </h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
              Découvrez nos cours et ajoutez-les à votre panier.
            </p>
            <Link to="/courses" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Explorer les cours</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => (
                <Card key={item.id} variant="default" padding="1.5rem" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {item.course?.thumbnail ? (
                    <img 
                      src={item.course.thumbnail} 
                      alt={item.course.title} 
                      style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  ) : (
                    <div style={{ width: '120px', height: '80px', background: 'var(--border-color)', borderRadius: '8px' }} />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
                      <Link to={`/courses/${item.courseId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.course?.title}
                      </Link>
                    </h3>
                    <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.9rem' }}>
                      {item.course?.category?.name || 'Informatique'} • {item.course?.level || 'Tous niveaux'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      {item.course?.price === 0 ? 'Gratuit' : `${item.course?.price}€`}
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => removeFromCart(item.id)}
                      disabled={loading}
                      style={{ color: 'var(--error-color)', padding: '4px 8px' }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <Card variant="elevated" padding="2rem" style={{ position: 'sticky', top: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-color)' }}>Résumé</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--secondary)' }}>
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--success-color)' }}>
                  <span>Réduction ({discount}%)</span>
                  <span>-{(subtotal * (discount / 100)).toFixed(2)}€</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-color)' }}>
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>

              {/* Coupon Code Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Tag size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                    <input 
                      type="text" 
                      placeholder="Code promo" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 10px 10px 35px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }} 
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={loading || !couponCode.trim()}>
                    Appliquer
                  </Button>
                </div>
                {couponError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</p>}
                {couponSuccess && <p style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponSuccess}</p>}
              </div>

              <Button 
                variant="primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => navigate('/checkout')} // Adjust based on your payment flow integration
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
