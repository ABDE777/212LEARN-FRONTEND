import { RotateCcw, Users, BookOpen, CheckCircle, Wallet, FileText, Folder } from 'lucide-react';
import { useSystemDiagnostics } from '../../hooks/useAdminAudit';
import LoadingSpinner from '../LoadingSpinner';

export default function SystemHealthTab() {
  const { diagnostics, loading, error, refreshDiagnostics } = useSystemDiagnostics();

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>Santé & Diagnostics Système</h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Surveillance en temps réel de la connectivité BDD, métriques d'exécution et volumes de données.
          </p>
        </div>
        <button
          onClick={refreshDiagnostics}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
        >
          <RotateCcw size={15} /> Rafraîchir
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && diagnostics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Top Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px', padding: '1.5rem 2rem', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 25px rgba(16,185,129,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#6ee7b7',
                boxShadow: '0 0 12px #6ee7b7', animation: 'pulse 1.5s infinite',
              }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Base de données connectée</h3>
                <p style={{ margin: '0.2rem 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
                  PostgreSQL Neon Cloud • Temps de réponse DB : <strong>{diagnostics.database?.latencyMs} ms</strong>
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut Global</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>OK • OPÉRATIONNEL</div>
            </div>
          </div>

          {/* Table Row Counters Grid */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Volume des données en base (Row Counts)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Utilisateurs', count: diagnostics.database?.counts?.users, icon: <Users size={20} color="#3b82f6" />, bg: '#eff6ff' },
                { label: 'Cours', count: diagnostics.database?.counts?.courses, icon: <BookOpen size={20} color="#8b5cf6" />, bg: '#f5f3ff' },
                { label: 'Inscriptions', count: diagnostics.database?.counts?.enrollments, icon: <CheckCircle size={20} color="#10b981" />, bg: '#ecfdf5' },
                { label: 'Paiements', count: diagnostics.database?.counts?.payments, icon: <Wallet size={20} color="#f59e0b" />, bg: '#fffbeb' },
                { label: 'Journal Audit', count: diagnostics.database?.counts?.auditLogs, icon: <FileText size={20} color="#ec4899" />, bg: '#fdf2f8' },
                { label: 'Catégories', count: diagnostics.database?.counts?.categories, icon: <Folder size={20} color="#06b6d4" />, bg: '#ecfeff' },
              ].map((c, i) => (
                <div key={i} style={{ background: c.bg, padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{c.label}</span>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
                    {c.count ?? '0'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System & Process Metrics */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Métriques du serveur Node.js</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Temps de fonctionnement (Uptime)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatUptime(diagnostics.system?.uptimeSeconds)}
                </div>
              </div>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Mémoire Heap Usée / Totale</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                  {diagnostics.system?.memoryUsage?.heapUsedMb} MB / {diagnostics.system?.memoryUsage?.heapTotalMb} MB
                </div>
              </div>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Version Node.js</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                  {diagnostics.system?.nodeVersion} ({diagnostics.system?.environment})
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
