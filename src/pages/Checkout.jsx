import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useCheckout } from '../hooks/usePayments';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { course, loading: courseLoading, error: courseError } = useCourse(id);
  const { createCheckoutSession, loading: checkoutLoading, error: checkoutError } = useCheckout();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${id}/checkout`);
    }
  }, [isAuthenticated, navigate, id]);

  const handleCheckout = async () => {
    if (!course || course.price === 0) {
      // Free course - skip payment
      navigate(`/learn/${id}/lesson/intro`);
      return;
    }

    setProcessing(true);
    try {
      const { checkoutUrl } = await createCheckoutSession(id);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (courseLoading) {
    return <LoadingSpinner />;
  }

  if (courseError || !course) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
            {courseError || 'Cours non trouvé'}
          </p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Retour au catalogue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--secondary)' }}>
          Finaliser l'inscription
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Left: Payment Form */}
          <div>
            <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                Informations de paiement
              </h2>

              {checkoutError && (
                <div style={{ 
                  background: '#fee', 
                  border: '1px solid #fcc', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1.5rem',
                  color: '#c33'
                }}>
                  {checkoutError}
                </div>
              )}

              {course.price === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
                    Ce cours est gratuit !
                  </h3>
                  <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                    Vous pouvez commencer l'apprentissage immédiatement.
                  </p>
                  <Button 
                    variant="primary" 
                    size="large"
                    onClick={handleCheckout}
                    loading={processing}
                  >
                    Commencer le cours
                  </Button>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    background: 'var(--bg-color)', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <CreditCard size={24} color="var(--primary)" />
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-color)', margin: 0 }}>
                        Paiement sécurisé via Stripe
                      </p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>
                        Vos informations de paiement sont cryptées et sécurisées
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                    <Lock size={16} />
                    <span style={{ fontSize: '0.9rem' }}>
                      Transaction sécurisée avec chiffrement SSL
                    </span>
                  </div>

                  <Button 
                    variant="primary" 
                    size="large"
                    style={{ width: '100%' }}
                    onClick={handleCheckout}
                    loading={processing || checkoutLoading}
                  >
                    {processing || checkoutLoading ? 'Traitement en cours...' : `Payer ${course.price}€`}
                  </Button>

                  <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '1rem' }}>
                    En cliquant, vous acceptez nos conditions d'utilisation et politique de confidentialité
                  </p>
                </div>
              )}
            </Card>

            <Card variant="default" padding="1.5rem">
              <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', fontSize: '1.1rem' }}>
                Garantie satisfait ou remboursé
              </h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Si vous n'êtes pas satisfait de votre achat, contactez-nous dans les 30 jours pour un remboursement complet.
              </p>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card variant="elevated" padding="2rem" style={{ position: 'sticky', top: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                Résumé de la commande
              </h2>

              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  )}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-color)', margin: '0 0 0.5rem 0' }}>
                      {course.title}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>
                      Accès illimité
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  <span>Sous-total</span>
                  <span>{course.price === 0 ? 'Gratuit' : `${course.price}€`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  <span>TVA (20%)</span>
                  <span>{course.price === 0 ? '0€' : `${(course.price * 0.2).toFixed(2)}€`}</span>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '1rem', 
                borderTop: '2px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-color)' }}>
                  Total
                </span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {course.price === 0 ? 'Gratuit' : `${(course.price * 1.2).toFixed(2)}€`}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Accès immédiat
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Certificat de complétion
                </p>
                <p>
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Support 24/7
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
