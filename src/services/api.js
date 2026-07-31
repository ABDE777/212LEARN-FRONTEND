import axios from 'axios';

// Base URL – read from environment variable, fallback to production URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-212learn.vercel.app/api/v1';

const api = axios.create({
  baseURL,
});

// Request interceptor – attach JWT if stored in localStorage or memory
api.interceptors.request.use(
  config => {
    const token = window.__AUTH_TOKEN__ || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Cache-busting: force a unique URL on every GET so the browser can never
    // replay a cached response (and the server can never match an ETag/304).
    if (config.method === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() };
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor – handle 401 (unauthorized) globally
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      window.__AUTH_TOKEN__ = null;
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
