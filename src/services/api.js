import axios from 'axios';

// Base URL – read from environment variable, fallback to local dev or production URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
});

// ── In-Memory Request Cache & Deduplication ──────────────────────────────────
const cache = new Map();
const pendingRequests = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds in-memory cache for GET queries

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
    // Invalidate the GET cache on any mutation (POST, PUT, PATCH, DELETE).
    // Clearing everything is the safe choice: the cache is only a 15s perf
    // optimization, and a per-prefix scheme kept missing resources (groups,
    // cart, wishlist, enrollments, coupons, meetings…) so writes there left the
    // UI showing stale data. Correctness over a tiny cache-hit gain.
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method?.toLowerCase())) {
      clearApiCache();
    }
    return response;
  },
  async error => {
    if (error.response && error.response.status === 401) {
      window.__AUTH_TOKEN__ = null;
      localStorage.removeItem('token');
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
