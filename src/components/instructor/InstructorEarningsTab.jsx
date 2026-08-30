import { DollarSign, Clock, CheckCircle, Package } from 'lucide-react';
import { useInstructorEarnings } from '../../hooks/usePacks';
import LoadingSpinner from '../LoadingSpinner';

const money = (n, c = 'MAD') => `${Number(n || 0).toFixed(2)} ${c}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

function Stat({ Icon, label, value, color }) {
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (color || 'var(--primary)') + '22', color: color || 'var(--primary)' }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{label}</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-color)' }}>{value}</div>
      </div>
    </div>
  );
}

export default function InstructorEarningsTab() {
  const { summary, shares, loading, error } = useInstructorEarnings();

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  const cur = summary?.currency || 'MAD';

  return (
    <div>
      <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Mes revenus (packs)</h2>
      <p style={{ color: 'var(--secondary)', marginTop: 0 }}>
        Part nette qui vous revient sur les packs vendus, après la commission de la plateforme (indiquée par vente ci-dessous). Les paiements sont effectués manuellement par l'administration.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
        <Stat Icon={DollarSign} label="Total gagné (net)" value={money(summary?.totalEarned, cur)} />
        <Stat Icon={Clock} label="En attente de paiement" value={money(summary?.pendingAmount, cur)} color="#b26a00" />
        <Stat Icon={CheckCircle} label="Déjà payé" value={money(summary?.paidOutAmount, cur)} color="#2e7d32" />
        <Stat Icon={Package} label="Ventes" value={summary?.salesCount || 0} />
      </div>

      <h3 style={{ margin: '1.5rem 0 0.75rem 0' }}>Détail des ventes</h3>
      {(!shares || shares.length === 0) ? (
        <p style={{ color: 'var(--secondary)' }}>Aucune vente de pack pour le moment.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.6rem 0.5rem' }}>Date</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Cours</th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Brut</th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Commission</th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Net</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.6rem 0.5rem', color: 'var(--secondary)' }}>{fmtDate(s.packPurchase?.paidAt || s.createdAt)}</td>
                  <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-color)' }}>{s.course?.title || '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{money(s.grossAmount, s.currency)}</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#c0392b' }}>−{money(s.commissionAmount, s.currency)} ({Number(s.commissionPct)}%)</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{money(s.netAmount, s.currency)}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: 999, background: s.status === 'paid_out' ? '#e8f5e9' : '#fff4e5', color: s.status === 'paid_out' ? '#2e7d32' : '#b26a00' }}>
                      {s.status === 'paid_out' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
