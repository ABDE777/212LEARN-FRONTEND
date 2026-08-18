import { useState } from 'react';
import { RotateCcw, FileText } from 'lucide-react';
import { useAdminAuditLogs } from '../../hooks/useAdminAudit';
import LoadingSpinner from '../LoadingSpinner';

export default function AuditLogsTab() {
  const [page, setPage] = useState(1);
  const { logs, pagination, loading, error, refreshAuditLogs } = useAdminAuditLogs(page, 15);

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    let bg = '#ede7f6', color = '#5e35b1';
    if (act.includes('DELETE')) { bg = '#ffebee'; color = '#c62828'; }
    else if (act.includes('RESTORE')) { bg = '#e3f2fd'; color = '#1565c0'; }
    else if (act.includes('VERIFY') || act.includes('CREATE')) { bg = '#e8f5e9'; color = '#2e7d32'; }
    else if (act.includes('UPDATE') || act.includes('RESET')) { bg = '#fff3cd'; color = '#856404'; }

    return (
      <span style={{
        display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: '9999px',
        fontSize: '0.78rem', fontWeight: 700, background: bg, color: color,
        fontFamily: 'monospace',
      }}>
        {action}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>Journal d'audit administratif</h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Historique complet des actions administratives effectuées sur la plateforme.
          </p>
        </div>
        <button
          onClick={() => refreshAuditLogs(page)}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.88rem' }}
        >
          <RotateCcw size={15} /> Actualiser
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
          <FileText size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
          <p style={{ color: 'var(--secondary)' }}>Aucun journal d'audit enregistré pour le moment.</p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Date & Heure</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Administrateur</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Cible</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {[log.user?.firstName, log.user?.lastName].filter(Boolean).join(' ') || 'Système'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{log.user?.email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{log.entity}</span>
                      {log.entityId && (
                        <code style={{ display: 'block', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                          ID: {log.entityId.slice(0, 8)}...
                        </code>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      {log.metadata ? (
                        <pre style={{ margin: 0, fontSize: '0.75rem', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', maxWidth: '240px', overflowX: 'auto' }}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} entrées)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
