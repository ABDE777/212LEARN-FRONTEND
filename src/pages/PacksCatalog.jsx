import { Link } from 'react-router-dom';
import { Package, Users, ArrowRight, Flame } from 'lucide-react';
import { usePacks } from '../hooks/usePacks';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

function PriceBlock({ pricing, currency }) {
  if (!pricing) return null;
  const { currentPrice, normalPrice, launchPrice, seatsLeft } = pricing;
  const onLaunch = launchPrice != null && seatsLeft > 0 && currentPrice === launchPrice;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
        {currentPrice} {currency}
      </span>
      {onLaunch && (
        <span style={{ textDecoration: 'line-through', color: 'var(--secondary)', fontSize: '0.95rem' }}>
          {normalPrice} {currency}
        </span>
      )}
      {onLaunch && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff4e5', color: '#b26a00', borderRadius: 999, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
          <Flame size={13} /> {seatsLeft} place{seatsLeft > 1 ? 's' : ''} au prix de lancement
        </span>
      )}
    </div>
  );
}

export default function PacksCatalog() {
  const { packs, loading, error } = usePacks();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={28} color="var(--primary)" /> Packs de cours
          </h1>
          <p style={{ color: 'var(--secondary)', margin: 0 }}>
            Plusieurs cours regroupés à prix réduit. Les premiers inscrits profitent du tarif de lancement.
          </p>
        </div>

        {loading && <LoadingSpinner />}

        {!loading && error && (
          <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--error-color)', margin: 0 }}>{error}</p>
          </Card>
        )}

        {!loading && !error && packs.length === 0 && (
          <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
            <Package size={40} color="var(--secondary)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Aucun pack disponible pour le moment.</p>
          </Card>
        )}

        {!loading && !error && packs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {packs.map((pack) => (
              <Card key={pack.id} variant="elevated" padding="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '16 / 9', background: pack.thumbnail ? `url(${pack.thumbnail}) center/cover` : 'linear-gradient(135deg, #1B4B5A, #C1652F)' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.15rem' }}>{pack.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    <Users size={15} /> {pack.courses?.length || 0} cours inclus
                  </div>
                  {pack.description && (
                    <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {pack.description}
                    </p>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <PriceBlock pricing={pack.pricing} currency={pack.currency} />
                  </div>
                  <Link
                    to={`/packs/${pack.id}`}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', padding: '0.7rem 1rem', background: 'var(--primary)', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Voir le pack <ArrowRight size={16} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
