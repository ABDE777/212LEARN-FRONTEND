import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle, Wallet, Upload, Building2, Package } from 'lucide-react';
import { usePack, usePackActions } from '../hooks/usePacks';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PackCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  // Admins run the platform and instructors teach — neither can buy a pack (the
  // backend rejects them too). Show a clear message instead of the buy flow.
  const isStaff = ['admin', 'instructor'].includes(user?.role?.toLowerCase());
  const { pack, loading: packLoading, error: packError } = usePack(id);
  const { requestPurchase, submitPurchase, loading, error } = usePackActions();

  const [method, setMethod] = useState('wafacash');
  const [step, setStep] = useState(1); // 1 request → 2 proof → 3 done
  const [purchase, setPurchase] = useState(null);
  const [mtcn, setMtcn] = useState('');
  const [rib, setRib] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate(`/login?redirect=/packs/${id}/checkout`);
  }, [isAuthenticated, navigate, id]);

  const handleRequest = async () => {
    setLocalError('');
    try {
      const data = await requestPurchase(id, method);
      setPurchase(data);
      setStep(2);
    } catch { /* error surfaced via `error` */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (method === 'wafacash' && !/^\d{10}$/.test(mtcn.trim())) {
      setLocalError('Le MTCN doit comporter exactement 10 chiffres.');
      return;
    }
    if (method === 'transfer' && !/^\d{24}$/.test(rib.replace(/\s/g, ''))) {
      setLocalError('Le RIB doit comporter exactement 24 chiffres.');
      return;
    }
    if (!receiptFile) {
      setLocalError('Veuillez téléverser le reçu.');
      return;
    }
    try {
      await submitPurchase({
        paymentReference: purchase.paymentReference,
        provider: method,
        mtcn: mtcn.trim(),
        rib: rib.replace(/\s/g, ''),
        receiptFile,
      });
      setStep(3);
    } catch { /* error surfaced via `error` */ }
  };

  if (packLoading) return <LoadingSpinner />;

  if (packError || !pack) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
        <Navbar />
        <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{packError || 'Pack introuvable.'}</p>
            <Button variant="outline" onClick={() => navigate('/packs')}>Retour aux packs</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isStaff) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
        <Navbar />
        <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
            <Package size={40} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--text-color)', marginTop: 0 }}>{pack.title}</h2>
            <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
              Les administrateurs et formateurs ne peuvent pas acheter de pack.
            </p>
            <Button variant="outline" onClick={() => navigate('/packs')}>Retour aux packs</Button>
          </Card>
        </div>
      </div>
    );
  }

  const pricing = pack.pricing || {};
  const amount = purchase?.amount || pricing.currentPrice;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--secondary)' }}>Acheter le pack</h1>

        <div className="course-details-grid">
          <div>
            <Card variant="default" padding="2rem">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Informations de paiement</h2>

              {(error || localError) && (
                <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', color: '#c33' }}>
                  {error || localError}
                </div>
              )}

              {/* Method selector */}
              {step !== 3 && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { key: 'wafacash', Icon: Wallet, label: 'Wafacash (Espèces)' },
                    { key: 'transfer', Icon: Building2, label: 'Virement Bancaire' },
                  ].map(({ key, Icon, label }) => (
                    <div key={key}
                      onClick={() => { if (step === 1) setMethod(key); }}
                      style={{ flex: 1, padding: '1rem', border: `2px solid ${method === key ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 8, cursor: step === 1 ? 'pointer' : 'default', textAlign: 'center', opacity: step === 1 || method === key ? 1 : 0.5 }}>
                      <Icon size={24} color={method === key ? 'var(--primary)' : 'var(--secondary)'} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, color: method === key ? 'var(--primary)' : 'var(--secondary)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                    {method === 'wafacash'
                      ? "Payez en espèces dans n'importe quelle agence Wafacash. Générez d'abord votre référence."
                      : 'Effectuez un virement vers notre compte. Obtenez d\'abord nos coordonnées bancaires.'}
                  </p>
                  <Button variant="primary" size="large" onClick={handleRequest} loading={loading}>
                    {method === 'wafacash' ? 'Générer la référence' : 'Obtenir les coordonnées bancaires'}
                  </Button>
                </div>
              )}

              {step === 2 && purchase && (
                <form onSubmit={handleSubmit}>
                  {method === 'transfer' && (
                    <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 8, marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Coordonnées bancaires</h4>
                      <div style={{ color: 'var(--secondary)', lineHeight: 1.8 }}>
                        <p style={{ margin: 0 }}><strong>Banque :</strong> {purchase.bankInfo?.bankName}</p>
                        <p style={{ margin: 0 }}><strong>Titulaire :</strong> {purchase.bankInfo?.accountName}</p>
                        <p style={{ margin: 0 }}><strong>RIB :</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-color)' }}>{purchase.bankInfo?.rib}</span></p>
                        <p style={{ margin: 0 }}><strong>IBAN :</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-color)' }}>{purchase.bankInfo?.iban}</span></p>
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 8, marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Instructions</h4>
                    <ol style={{ color: 'var(--secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                      <li>{method === 'wafacash' ? 'Rendez-vous dans une agence Wafacash.' : 'Effectuez le virement vers le compte ci-dessus.'}</li>
                      <li>Référence : <strong style={{ color: 'var(--text-color)' }}>{purchase.paymentReference}</strong></li>
                      <li>Montant : <strong style={{ color: 'var(--text-color)' }}>{amount} MAD</strong></li>
                      <li>{method === 'wafacash' ? 'Photographiez le reçu remis par l\'agent.' : 'Téléversez votre relevé de virement.'}</li>
                    </ol>
                  </div>

                  {method === 'wafacash' ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>Numéro MTCN (10 chiffres)</label>
                      <input type="text" value={mtcn} onChange={(e) => setMtcn(e.target.value)} placeholder="Ex : 1234567890"
                        style={{ width: '100%', padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                    </div>
                  ) : (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>Votre RIB (24 chiffres)</label>
                      <input type="text" value={rib} onChange={(e) => setRib(e.target.value)} maxLength={24} placeholder="Ex : 011780000118000000001234"
                        style={{ width: '100%', padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'monospace' }} />
                    </div>
                  )}

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>{method === 'wafacash' ? 'Photo du reçu' : 'Relevé de virement'}</label>
                    <div style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: 8, padding: '2rem', textAlign: 'center', background: 'var(--bg-color)' }}>
                      <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0])}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                      <Upload size={32} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
                      <p style={{ color: 'var(--secondary)', margin: 0 }}>{receiptFile ? receiptFile.name : 'Cliquez ou glissez pour téléverser'}</p>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="large" style={{ width: '100%' }} loading={loading}>
                    Soumettre la preuve de paiement
                  </Button>
                </form>
              )}

              {step === 3 && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Preuve soumise avec succès !</h3>
                  <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                    Notre équipe vérifie votre paiement sous 24-48h. Dès validation, tous les cours du pack seront débloqués.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/student/dashboard')}>Aller au tableau de bord</Button>
                </div>
              )}
            </Card>
          </div>

          {/* Summary */}
          <Card variant="elevated" padding="2rem" style={{ position: 'sticky', top: '2rem', alignSelf: 'start' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Résumé</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, background: pack.thumbnail ? `url(${pack.thumbnail}) center/cover` : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!pack.thumbnail && <Package size={22} color="#fff" />}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>{pack.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', margin: 0 }}>{pack.courses?.length || 0} cours inclus</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{amount} {pack.currency}</span>
            </div>
            {purchase?.isLaunchPrice && (
              <p style={{ fontSize: '0.8rem', color: '#b26a00', marginTop: '0.5rem', marginBottom: 0 }}>✓ Tarif de lancement appliqué</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
