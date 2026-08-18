import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, FileText, Search, X } from 'lucide-react';
import { useAdminAuditLogs } from '../../hooks/useAdminAudit';
import LoadingSpinner from '../LoadingSpinner';

const ROLE_LABELS = { admin: 'Admin', instructor: 'Formateur', student: 'Étudiant' };

const EMPTY_FILTERS = { search: '', action: 'all', resource: 'all', role: 'all', startDate: '', endDate: '' };

export default function AuditLogsTab() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const { logs, pagination, filterOptions, loading, error, refreshAuditLogs } = useAdminAuditLogs(page, 15);

  // Debounce the free-text search so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Refetch whenever the page or any applied filter changes.
  useEffect(() => {
    refreshAuditLogs(page, 15, filters);
  }, [page, filters, refreshAuditLogs]);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters = useMemo(
    () => searchInput !== '' || filters.action !== 'all' || filters.resource !== 'all'
      || filters.role !== 'all' || filters.startDate !== '' || filters.endDate !== '',
    [searchInput, filters]
  );

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    let bg = '#ede7f6', color = '#5e35b1';
    if (act.includes('DELETE') || act.includes('REMOVE')) { bg = '#ffebee'; color = '#c62828'; }
    else if (act.includes('RESTORE')) { bg = '#e3f2fd'; color = '#1565c0'; }
    else if (act.includes('LOGIN')) { bg = '#e0f2f1'; color = '#00695c'; }
    else if (act.includes('VERIFY') || act.includes('CREATE') || act.includes('REGISTER') || act.includes('ENROLL')) { bg = '#e8f5e9'; color = '#2e7d32'; }
    else if (act.includes('PAYMENT') || act.includes('SUBMIT')) { bg = '#fff8e1'; color = '#b8860b'; }
    else if (act.includes('UPDATE') || act.includes('RESET')) { bg = '#fff3cd'; color = '#856404'; }

    return (
      <span style={{
        display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: '9999px',
        fontSize: '0.78rem', fontWeight: 700, background: bg, color,
        fontFamily: 'monospace',
      }}>
        {action}
      </span>
    );
  };

  const selectStyle = {
    padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)',
    fontSize: '0.85rem', background: '#fff', color: 'var(--text-color)', minWidth: '140px',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>Journal d'activité</h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Historique complet des actions effectuées sur la plateforme par tous les utilisateurs.
          </p>
        </div>
        <button
          onClick={() => refreshAuditLogs(page, 15, filters)}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.88rem' }}
        >
          <RotateCcw size={15} /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur (nom, email)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.7rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
          />
        </div>

        <select value={filters.action} onChange={(e) => setFilter('action', e.target.value)} style={selectStyle}>
          <option value="all">Toutes les actions</option>
          {(filterOptions.actions || []).map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <select value={filters.resource} onChange={(e) => setFilter('resource', e.target.value)} style={selectStyle}>
          <option value="all">Toutes les cibles</option>
          {(filterOptions.resources || []).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={filters.role} onChange={(e) => setFilter('role', e.target.value)} style={selectStyle}>
          <option value="all">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Formateur</option>
          <option value="student">Étudiant</option>
        </select>

        <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Du
          <input type="date" value={filters.startDate} onChange={(e) => setFilter('startDate', e.target.value)} style={{ ...selectStyle, minWidth: 'auto' }} />
        </label>
        <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Au
          <input type="date" value={filters.endDate} onChange={(e) => setFilter('endDate', e.target.value)} style={{ ...selectStyle, minWidth: 'auto' }} />
        </label>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }}
          >
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
          <FileText size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
          <p style={{ color: 'var(--secondary)' }}>
            {hasActiveFilters ? 'Aucune activité ne correspond à ces filtres.' : 'Aucune activité enregistrée pour le moment.'}
          </p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Date & Heure</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Utilisateur</th>
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
                      <div style={{ fontWeight: 600, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {[log.user?.firstName, log.user?.lastName].filter(Boolean).join(' ') || 'Système / Anonyme'}
                        {log.user?.role && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }}>
                            {ROLE_LABELS[log.user.role] || log.user.role}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{log.user?.email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{log.resource || '—'}</span>
                      {log.resourceId && (
                        <code style={{ display: 'block', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                          ID: {String(log.resourceId).slice(0, 8)}…
                        </code>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <pre style={{ margin: 0, fontSize: '0.75rem', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', maxWidth: '260px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(log.details, null, 2)}
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
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
