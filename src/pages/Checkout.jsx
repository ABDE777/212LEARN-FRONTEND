import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, Wallet, FileText, Upload, AlertCircle } from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useCheckout } from '../hooks/usePayments';
import { useWafacash } from '../hooks/useWafacash';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCartContext();

  const { course, loading: courseLoading, error: courseError } = useCourse(id);
  const { createCheckoutSession, loading: stripeLoading, error: stripeError } = useCheckout();
  const { requestPayment, submitProof, loading: wafaLoading, error: wafaError } = useWafacash();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [wafaStep, setWafaStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);
  const [mtcn, setMtcn] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${id}/checkout`);
    }
  }, [isAuthenticated, navigate, id]);

  const handleStripeCheckout = async () => {
    if (!course || course.price === 0) {
      await clearCart();
      navigate(`/learn/${id}/lesson/intro`);
      return;
    }
    try {
      const { checkoutUrl } = await createCheckoutSession(id);
      await clearCart();
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const handleWafaRequest = async () => {
    try {
      const data = await requestPayment(id);
      setPaymentData(data);
      setWafaStep(2);
    } catch (error) {
      console.error('Wafacash request failed:', error);
    }
  };

  const handleWafaSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!mtcn || mtcn.length < 10) {
      setLocalError('Le MTCN doit contenir au moins 10 caractères.');
      return;
    }
    if (!receiptFile) {
      setLocalError('Veuillez uploader la photo du reçu.');
      return;
    }
    try {
      await submitProof(paymentData.paymentReference || paymentData.paymentId, mtcn, receiptFile);
      await clearCart();
      setWafaStep(3);
    } catch (error) {
      console.error('Wafacash submit failed:', error);
    }
  };

  if (courseLoading) return <LoadingSpinner />;

  if (courseError || !course) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{courseError || 'Cours non trouvé'}</p>
          <Button variant="outline" onClick={() => navigate('/courses')}>Retour au catalogue</Button>
        </Card>
      </div>
    );
  }

  const isFree = course.price === 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--secondary)' }}>Finaliser l'inscription</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Left: Payment Form */}
          <div>
            <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Informations de paiement</h2>

              {(stripeError || wafaError || localError) && (
                <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#c33' }}>
                  {stripeError || wafaError || localError}
                </div>
              )}

              {isFree ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Ce cours est gratuit !</h3>
                  <Button variant="primary" size="large" onClick={handleStripeCheckout} loading={stripeLoading}>
                    Commencer le cours
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Payment Method Selector */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div 
                      onClick={() => { setPaymentMethod('card'); setWafaStep(1); }}
                      style={{ 
                        flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'card' ? 'var(--bg-color)' : 'transparent'
                      }}
                    >
                      <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--primary)' : 'var(--secondary)'} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--secondary)' }}>Carte Bancaire</div>
                    </div>
                    <div 
                      onClick={() => setPaymentMethod('wafacash')}
                      style={{ 
                        flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'wafacash' ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'wafacash' ? 'var(--bg-color)' : 'transparent'
                      }}
                    >
                      <Wallet size={24} color={paymentMethod === 'wafacash' ? 'var(--primary)' : 'var(--secondary)'} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, color: paymentMethod === 'wafacash' ? 'var(--primary)' : 'var(--secondary)' }}>Wafacash (Espèces)</div>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                        <Lock size={16} />
                        <span style={{ fontSize: '0.9rem' }}>Transaction sécurisée avec chiffrement SSL (Stripe)</span>
                      </div>
                      <Button variant="primary" size="large" style={{ width: '100%' }} onClick={handleStripeCheckout} loading={stripeLoading}>
                        Payer {course.price}€ par carte
                      </Button>
                    </div>
                  )}

                  {paymentMethod === 'wafacash' && (
                    <div>
                      {wafaStep === 1 && (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                            Payez en espèces dans n'importe quelle agence Wafacash. Cliquez ci-dessous pour générer votre référence de paiement.
                          </p>
                          <Button variant="primary" size="large" onClick={handleWafaRequest} loading={wafaLoading}>
                            Générer la référence de paiement
                          </Button>
                        </div>
                      )}

                      {wafaStep === 2 && paymentData && (
                        <form onSubmit={handleWafaSubmit}>
                          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Instructions</h4>
                            <ol style={{ color: 'var(--secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                              <li>Rendez-vous dans une agence Wafacash.</li>
                              <li>Indiquez que vous souhaitez payer pour 212Learn.</li>
                              <li>Présentez la référence : <strong style={{ color: 'var(--text-color)', fontSize: '1.1rem' }}>{paymentData.paymentReference}</strong></li>
                              <li>Réglez le montant de <strong style={{ color: 'var(--text-color)' }}>{paymentData.amount || course.price}€</strong>.</li>
                              <li>Prenez une photo claire du reçu remis par l'agent.</li>
                            </ol>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>Numéro MTCN (10 chiffres)</label>
                            <input 
                              type="text" 
                              value={mtcn}
                              onChange={(e) => setMtcn(e.target.value)}
                              placeholder="Ex: 1234567890"
                              style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                            />
                          </div>

                          <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>Photo du reçu (Image)</label>
                            <div style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: 'var(--bg-color)' }}>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setReceiptFile(e.target.files[0])}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                              />
                              <Upload size={32} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
                              <p style={{ color: 'var(--secondary)', margin: 0 }}>
                                {receiptFile ? receiptFile.name : 'Cliquez ou glissez pour uploader le reçu'}
                              </p>
                            </div>
                          </div>

                          <Button type="submit" variant="primary" size="large" style={{ width: '100%' }} loading={wafaLoading}>
                            Soumettre la preuve de paiement
                          </Button>
                        </form>
                      )}

                      {wafaStep === 3 && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                          <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 1rem auto' }} />
                          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Preuve soumise avec succès !</h3>
                          <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                            Notre équipe va vérifier votre paiement sous 24h. Vous recevrez une notification dès que votre accès sera activé.
                          </p>
                          <Button variant="outline" onClick={() => navigate('/dashboard')}>
                            Aller au tableau de bord
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {wafaStep === 1 && (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '2rem' }}>
                      En cliquant, vous acceptez nos conditions d'utilisation et politique de confidentialité
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card variant="default" padding="1.5rem">
              <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', fontSize: '1.1rem' }}>Garantie satisfait ou remboursé</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Si vous n'êtes pas satisfait de votre achat, contactez-nous dans les 30 jours pour un remboursement complet.
              </p>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card variant="elevated" padding="2rem" style={{ position: 'sticky', top: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Résumé de la commande</h2>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  )}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-color)', margin: '0 0 0.5rem 0' }}>{course.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>Accès illimité</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>{course.price === 0 ? 'Gratuit' : `${(course.price * 1.2).toFixed(2)}€`}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
