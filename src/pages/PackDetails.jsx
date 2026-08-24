import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, Users, Flame, CheckCircle, BookOpen } from 'lucide-react';
import { usePack } from '../hooks/usePacks';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { pack, loading, error } = usePack(id);

  if (loading) return <LoadingSpinner />;

  if (error || !pack) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
        <Navbar />
        <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error || 'Pack introuvable.'}</p>
            <Button variant="outline" onClick={() => navigate('/packs')}>Retour aux packs</Button>
          </Card>
        </div>
      </div>
    );
  }

  const pricing = pack.pricing || {};
  const onLaunch = pricing.launchPrice != null && pricing.seatsLeft > 0 && pricing.currentPrice === pricing.launchPrice;

  const goCheckout = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/packs/${id}/checkout`);
      return;
    }
    navigate(`/packs/${id}/checkout`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <Link to="/packs" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>← Tous les packs</Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', marginTop: '1rem', alignItems: 'start' }}>
          <div>
            <div style={{ height: 220, borderRadius: 12, marginBottom: '1.5rem', background: pack.thumbnail ? `url(${pack.thumbnail}) center/cover` : 'linear-gradient(135deg, #1B4B5A, #C1652F)' }} />
            <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Package size={26} color="var(--primary)" /> {pack.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
              <Users size={16} /> {pack.courses?.length || 0} cours inclus
            </div>
            {pack.description && (
              <p style={{ color: 'var(--text-color)', lineHeight: 1.7 }}>{pack.description}</p>
            )}

            <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)', margin: '2rem 0 1rem 0' }}>Cours inclus</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(pack.courses || []).map((pc) => {
                const inst = pc.instructor;
                const instName = inst ? `${inst.firstName || ''} ${inst.lastName || ''}`.trim() : null;
                return (
                  <Card key={pc.id} variant="default" padding="1rem" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, background: pc.course?.thumbnail ? `url(${pc.course.thumbnail}) center/cover` : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!pc.course?.thumbnail && <BookOpen size={20} color="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>{pc.course?.title || 'Cours'}</div>
                      {instName && <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Formateur : {instName}</div>}
                    </div>
                    <CheckCircle size={18} color="var(--success-color)" />
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Purchase card */}
          <Card variant="elevated" padding="1.75rem" style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--primary)' }}>
                {pricing.currentPrice} {pack.currency}
              </span>
              {onLaunch && (
                <span style={{ textDecoration: 'line-through', color: 'var(--secondary)' }}>
                  {pricing.normalPrice} {pack.currency}
                </span>
              )}
            </div>

            {onLaunch && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff4e5', color: '#b26a00', borderRadius: 999, padding: '4px 12px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                <Flame size={14} /> Offre de lancement — {pricing.seatsLeft} place{pricing.seatsLeft > 1 ? 's' : ''} restante{pricing.seatsLeft > 1 ? 's' : ''}
              </div>
            )}

            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: '0.5rem 0 1.25rem 0' }}>
              Accès illimité à {pack.courses?.length || 0} cours, un seul paiement.
            </p>

            <Button variant="primary" size="large" style={{ width: '100%' }} onClick={goCheckout}>
              Acheter ce pack
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
