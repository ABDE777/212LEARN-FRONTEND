import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle, Wallet, Upload, Tag, Building2 } from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useWafacash } from '../hooks/useWafacash';
import { useTransfer } from '../hooks/useTransfer';
import { useCoupons } from '../hooks/useCoupons';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCartContext();

  const { course, loading: courseLoading, error: courseError } = useCourse(id);
  const { requestPayment: requestWafaPayment, submitProof, loading: wafaLoading, error: wafaError } = useWafacash();
  const { requestPayment: requestTransferPayment, submitTransferDetails, loading: transferLoading, error: transferError } = useTransfer();
  const { validateCoupon } = useCoupons(false); // Checkout only validates; skip the admin-only coupon list fetch

  const [paymentMethod, setPaymentMethod] = useState('wafacash');
  const [wafaStep, setWafaStep] = useState(1);
  const [transferStep, setTransferStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);
  const [mtcn, setMtcn] = useState('');
  const [rib, setRib] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [transferReceiptFile, setTransferReceiptFile] = useState(null);
  const [localError, setLocalError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // Free course: enroll the student (creates a settled 0-amount PAID enrollment
  // on the backend) before sending them into the course.
  const handleFreeEnroll = async () => {
    setEnrolling(true);
    setLocalError('');
    try {
      await api.post('/enrollments', { courseId: id });
    } catch (err) {
      const code = err.response?.data?.error?.code;
      // Already enrolled is fine — just continue into the course.
      if (code !== 'ALREADY_ENROLLED') {
        setLocalError(err.response?.data?.error?.message || err.response?.data?.message || "Impossible de vous inscrire au cours.");
        setEnrolling(false);
        return;
      }
    }
    clearCart();
    navigate(`/learn/${id}/lesson/intro`);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${id}/checkout`);
    }
  }, [isAuthenticated, navigate, id]);

  const handleWafaRequest = async () => {
    try {
      const data = await requestWafaPayment(id);
      setPaymentData(data);
      setWafaStep(2);
    } catch (error) {
      console.error('Wafacash request failed:', error);
    }
  };

  const handleTransferRequest = async () => {
    try {
      const data = await requestTransferPayment(id);
      setPaymentData(data);
      setTransferStep(2);
    } catch (error) {
      console.error('Transfer request failed:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Veuillez entrer un code de coupon.');
      return;
    }

    try {
      const response = await validateCoupon(couponCode.trim(), course.id);
      // validateCoupon returns the axios `res.data` envelope: { success, data: {...} }.
      const couponData = response?.data ?? response;

      const percent = Number(couponData?.discountPercent) || 0;
      setDiscount((Number(course.price) || 0) * (percent / 100));
      setAppliedCoupon(couponData?.code || couponCode.trim());
      setCouponError('');
    } catch (error) {
      setCouponError(error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Code de coupon invalide.');
      setDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError('');
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

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!rib || rib.length !== 24) {
      setLocalError('Le RIB doit contenir exactement 24 chiffres.');
      return;
    }
    try {
      await submitTransferDetails(paymentData.paymentReference || paymentData.paymentId, rib, transferReceiptFile);
      await clearCart();
      setTransferStep(3);
    } catch (error) {
      console.error('Transfer submit failed:', error);
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

  // Price arrives from the API as a string (Prisma Decimal) — compare numerically.
  const isFree = Number(course.price) === 0;

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

              {(wafaError || transferError || localError) && (
                <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#c33' }}>
                  {wafaError || transferError || localError}
                </div>
              )}

              {isFree ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Ce cours est gratuit !</h3>
                  <Button variant="primary" size="large" onClick={handleFreeEnroll} loading={enrolling}>
                    S'inscrire gratuitement
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Payment Method Selector */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div 
                      onClick={() => { setPaymentMethod('wafacash'); setTransferStep(1); }}
                      style={{ 
                        flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'wafacash' ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'wafacash' ? 'var(--bg-color)' : 'transparent'
                      }}
                    >
                      <Wallet size={24} color={paymentMethod === 'wafacash' ? 'var(--primary)' : 'var(--secondary)'} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, color: paymentMethod === 'wafacash' ? 'var(--primary)' : 'var(--secondary)' }}>Wafacash (Espèces)</div>
                    </div>
                    <div 
                      onClick={() => { setPaymentMethod('transfer'); setWafaStep(1); }}
                      style={{ 
                        flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'transfer' ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'transfer' ? 'var(--bg-color)' : 'transparent'
                      }}
                    >
                      <Building2 size={24} color={paymentMethod === 'transfer' ? 'var(--primary)' : 'var(--secondary)'} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, color: paymentMethod === 'transfer' ? 'var(--primary)' : 'var(--secondary)' }}>Virement Bancaire</div>
                    </div>
                  </div>

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
                              <li>Réglez le montant de <strong style={{ color: 'var(--text-color)' }}>{paymentData.amount || course.price} MAD</strong>.</li>
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

                  {paymentMethod === 'transfer' && (
                    <div>
                      {transferStep === 1 && (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                            Effectuez un virement bancaire vers notre compte. Cliquez ci-dessous pour obtenir nos coordonnées bancaires.
                          </p>
                          <Button variant="primary" size="large" onClick={handleTransferRequest} loading={transferLoading}>
                            Obtenir les coordonnées bancaires
                          </Button>
                        </div>
                      )}

                      {transferStep === 2 && paymentData && (
                        <form onSubmit={handleTransferSubmit}>
                          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Coordonnées Bancaires</h4>
                            <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
                              <p style={{ margin: 0 }}><strong>Banque:</strong> {paymentData.bankInfo?.bankName || 'Attijariwafa Bank'}</p>
                              <p style={{ margin: 0 }}><strong>Titulaire du compte:</strong> {paymentData.bankInfo?.accountName || '212Learn SARL'}</p>
                              <p style={{ margin: 0 }}><strong>RIB:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--text-color)' }}>{paymentData.bankInfo?.rib || '01178000011800000000123456'}</span></p>
                              <p style={{ margin: 0 }}><strong>IBAN:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-color)' }}>{paymentData.bankInfo?.iban || 'MA89 0117 8000 0118 0000 0000 1234 56'}</span></p>
                              <p style={{ margin: 0 }}><strong>SWIFT/BIC:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-color)' }}>{paymentData.bankInfo?.swift || 'CWBAMAMM'}</span></p>
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Instructions</h4>
                            <ol style={{ color: 'var(--secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                              <li>Effectuez un virement vers le compte ci-dessus.</li>
                              <li>Utilisez la référence : <strong style={{ color: 'var(--text-color)', fontSize: '1.1rem' }}>{paymentData.paymentReference}</strong> dans le libellé du virement.</li>
                              <li>Transférez le montant de <strong style={{ color: 'var(--text-color)' }}>{paymentData.amount || course.price} MAD</strong>.</li>
                              <li>Uploadez une photo de votre relevé de virement.</li>
                              <li>Indiquez votre RIB (24 chiffres) pour identification.</li>
                            </ol>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>Votre RIB (24 chiffres)</label>
                            <input 
                              type="text" 
                              value={rib}
                              onChange={(e) => setRib(e.target.value)}
                              placeholder="Ex: 01178000011800000000123456"
                              maxLength={24}
                              style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'monospace' }}
                            />
                          </div>

                          <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>Relevé de virement (Image)</label>
                            <div style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: 'var(--bg-color)' }}>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setTransferReceiptFile(e.target.files[0])}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                              />
                              <Upload size={32} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
                              <p style={{ color: 'var(--secondary)', margin: 0 }}>
                                {transferReceiptFile ? transferReceiptFile.name : 'Cliquez ou glissez pour uploader le relevé de virement'}
                              </p>
                            </div>
                          </div>

                          <Button type="submit" variant="primary" size="large" style={{ width: '100%' }} loading={transferLoading}>
                            Soumettre les détails du virement
                          </Button>
                        </form>
                      )}

                      {transferStep === 3 && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                          <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 1rem auto' }} />
                          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Virement soumis avec succès !</h3>
                          <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                            Notre équipe va vérifier votre virement sous 24-48h. Vous recevrez une notification dès que votre accès sera activé.
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

              {/* Coupon Code Section */}
              {!isFree && !appliedCoupon && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>
                    <Tag size={16} />
                    Code de réduction
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Entrez votre code"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: `1px solid ${couponError ? 'var(--error-color)' : 'var(--border-color)'}`,
                        borderRadius: '6px',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        fontSize: '0.9rem',
                      }}
                    />
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleApplyCoupon}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Appliquer
                    </Button>
                  </div>
                  {couponError && (
                    <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                      {couponError}
                    </p>
                  )}
                </div>
              )}

              {!isFree && appliedCoupon && (
                <div style={{ marginBottom: '1.5rem', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '6px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#2e7d32', fontWeight: 500, fontSize: '0.9rem' }}>
                      ✓ Coupon appliqué: {appliedCoupon}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2e7d32',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textDecoration: 'underline',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                  <div style={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                    Réduction: -{discount.toFixed(2)} MAD
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  <span>Sous-total</span>
                  <span>{isFree ? 'Gratuit' : `${course.price} MAD`}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#4caf50' }}>
                    <span>Réduction</span>
                    <span>-{discount.toFixed(2)} MAD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  <span>TVA (20%)</span>
                  <span>{isFree ? '0 MAD' : `${((Number(course.price) - discount) * 0.2).toFixed(2)} MAD`}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {isFree ? 'Gratuit' : `${((Number(course.price) - discount) * 1.2).toFixed(2)} MAD`}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
