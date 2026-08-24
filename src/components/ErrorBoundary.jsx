import { Component } from 'react';

/**
 * App-wide error boundary.
 *
 * Turns an uncaught render error (which otherwise blanks the whole page) into a
 * friendly, recoverable screen. It also handles the common "loading then blank"
 * case: after a redeploy, an already-open tab may request a lazy chunk whose
 * hashed filename no longer exists — the dynamic import rejects and React throws.
 * We detect that and reload the page once (guarded so it can't loop) to fetch
 * the fresh chunks.
 */
const isChunkLoadError = (error) => {
  const msg = `${error?.name || ''} ${error?.message || ''}`.toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('importing a module script failed') ||
    error?.name === 'ChunkLoadError'
  );
};

// Module-level guard: survives remounts within the same page load, so even if
// sessionStorage is unavailable (private mode) we can never auto-reload twice.
let autoReloadedThisLoad = false;

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error)) {
      // Reload at most once to pick up the new build's chunks. Two independent
      // guards (in-memory + sessionStorage) make an infinite reload impossible.
      let storageReloaded = false;
      try { storageReloaded = sessionStorage.getItem('chunk_reloaded') === '1'; } catch { /* ignore */ }
      if (!autoReloadedThisLoad && !storageReloaded) {
        autoReloadedThisLoad = true;
        try { sessionStorage.setItem('chunk_reloaded', '1'); } catch { /* ignore */ }
        window.location.reload();
        return;
      }
    }
    // Reaching a real render error: log it for debugging.
    console.error('[ErrorBoundary]', error);
  }

  handleReload = () => {
    try { sessionStorage.removeItem('chunk_reloaded'); } catch { /* ignore */ }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const chunk = isChunkLoadError(this.state.error);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-color)' }}>
        <div style={{ maxWidth: 460, textAlign: 'center', background: 'var(--surface-color, #fff)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{chunk ? '🔄' : '⚠️'}</div>
          <h1 style={{ fontSize: '1.3rem', color: 'var(--text-color)', margin: '0 0 0.75rem 0' }}>
            {chunk ? 'Une nouvelle version est disponible' : 'Une erreur est survenue'}
          </h1>
          <p style={{ color: 'var(--secondary)', margin: '0 0 1.5rem 0', fontSize: '0.95rem' }}>
            {chunk
              ? 'Rechargez la page pour charger la dernière version.'
              : "Cette page a rencontré un problème. Rechargez pour réessayer."}
          </p>
          <button
            onClick={this.handleReload}
            style={{ padding: '0.7rem 1.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
}
