import axios from 'axios';

// Base URL – prefer the VITE_API_BASE_URL env var. When it isn't set, default by
// build mode: production builds hit the deployed backend (so a missing env var on
// a Vercel deploy can't silently point the live site at localhost), while dev
// builds keep using the local API server.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://backend-212learn.vercel.app/api/v1'
    : 'http://localhost:5000/api/v1');

const api = axios.create({
  baseURL,
});

// ── In-Memory Request Cache & Deduplication ──────────────────────────────────
const cache = new Map();
const pendingRequests = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds in-memory cache for GET queries

/**
 * Unwrap the backend's `{ success, data }` envelope: returns `res.data.data`
 * when present, otherwise `res.data`. Use this instead of hand-written
 * `res.data.data.x || res.data.x` fallbacks so envelope handling is consistent.
 */
export const unwrap = (res) => (res?.data?.data !== undefined ? res.data.data : res?.data);

// ── Legacy HTML-entity decoding ──────────────────────────────────────────────
// An old backend sanitizer stored user text HTML-escaped (apostrophes as
// &#x27;, quotes as &quot;, & as &amp;). The backend no longer encodes, but rows
// created before the fix — and JSON fields never covered by the DB cleanup —
// still carry entities. Decode them on the way in so text renders correctly
// everywhere. React re-escapes on render, so this doesn't reintroduce any XSS.
const ENTITY_RE = /&(?:#x27|#39|apos|quot|amp|lt|gt);/g;
const ENTITY_MAP = {
  '&#x27;': "'", '&#39;': "'", '&apos;': "'",
  '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>',
};
const decodeEntitiesInString = (s) =>
  s.includes('&') ? s.replace(ENTITY_RE, (m) => ENTITY_MAP[m] || m) : s;

// Walk a parsed response body and decode entity sequences in every string.
// Depth-guarded against pathological/cyclic payloads.
const decodeEntitiesDeep = (value, depth = 0) => {
  if (depth > 8 || value == null) return value;
  if (typeof value === 'string') return decodeEntitiesInString(value);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = decodeEntitiesDeep(value[i], depth + 1);
    return value;
  }
  if (typeof value === 'object') {
    for (const k of Object.keys(value)) value[k] = decodeEntitiesDeep(value[k], depth + 1);
    return value;
  }
  return value;
};

/**
 * Clear cached API responses by URL prefix
 */
export const clearApiCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Request interceptor – attach JWT if stored
api.interceptors.request.use(
  config => {
    const token = window.__AUTH_TOKEN__ || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor – handle caching, deduplication & 401 errors
api.interceptors.response.use(
  response => {
    // Decode any legacy HTML entities in the body so escaped text (e.g. an
    // apostrophe stored as &#x27;) renders correctly. Runs before caching, so
    // cached copies are decoded too.
    if (response.data && typeof response.data === 'object') {
      response.data = decodeEntitiesDeep(response.data);
    }
    // Invalidate the GET cache on any mutation (POST, PUT, PATCH, DELETE).
    // Clearing everything is the safe choice: the cache is only a 15s perf
    // optimization, and a per-prefix scheme kept missing resources (groups,
    // cart, wishlist, enrollments, coupons, meetings…) so writes there left the
    // UI showing stale data. Correctness over a tiny cache-hit gain.
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method?.toLowerCase())) {
      clearApiCache();
      // Notify subscribed data hooks that server state changed, so lists refresh
      // after any create/update/delete without a manual page reload. Skip auth
      // endpoints (login/register/logout) — those drive their own navigation.
      const mUrl = response.config.url || '';
      if (typeof window !== 'undefined' && !mUrl.startsWith('/auth/')) {
        window.dispatchEvent(new CustomEvent('api:mutated', { detail: { url: mUrl } }));
      }
    }
    return response;
  },
  async error => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // Auth endpoints legitimately return 401 (wrong password, expired reset
    // link…) — those belong to the calling form, don't force a logout/redirect.
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password|verify-email|restore-account)/.test(url);

    if (status === 401 && !isAuthEndpoint) {
      window.__AUTH_TOKEN__ = null;
      localStorage.removeItem('token');

      // Single-session: the account was used elsewhere. Tell the user why.
      const code = error.response?.data?.error?.code;
      try {
        sessionStorage.setItem(
          'auth_notice',
          code === 'SESSION_REPLACED'
            ? 'Vous avez été déconnecté car votre compte a été utilisé sur un autre appareil.'
            : 'Votre session a expiré. Veuillez vous reconnecter.'
        );
      } catch { /* ignore storage failure */ }

      // Keep the UI honest: leave the half-logged-in state and go to login,
      // unless we're already on a public auth page (avoids redirect loops).
      const path = window.location.pathname;
      const onAuthPage = ['/login', '/signup', '/forgot-password'].some((p) => path.startsWith(p))
        || path.startsWith('/reset-password') || path.startsWith('/verify-email');
      if (!onAuthPage) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Custom cached GET method
const originalGet = api.get;
api.get = function (url, config = {}) {
  // If skipCache option is set, perform direct GET
  if (config.skipCache) {
    return originalGet.call(api, url, config);
  }

  const token = window.__AUTH_TOKEN__ || localStorage.getItem('token') || '';
  const queryString = JSON.stringify(config.params || {});
  const cacheKey = `${url}?${queryString}__token:${token.slice(-12)}`;

  // 1. Return cached response if valid
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < (config.ttl || CACHE_TTL_MS))) {
    return Promise.resolve(cached.data);
  }

  // 2. Deduplicate inflight requests to prevent duplicate network calls
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = originalGet.call(api, url, config)
    .then(response => {
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response,
      });
      pendingRequests.delete(cacheKey);
      return response;
    })
    .catch(error => {
      pendingRequests.delete(cacheKey);
      throw error;
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export default api;
