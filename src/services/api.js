import axios from 'axios';

// Base URL – read from environment variable, fallback to production URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-212learn.vercel.app/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // needed for HttpOnly cookies if backend uses them
});

// Request interceptor – attach JWT if stored in memory (AuthContext will set it)
api.interceptors.request.use(
  config => {
    // Expect token to be stored on window.__AUTH_TOKEN__ by AuthContext
    const token = window.__AUTH_TOKEN__;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor – handle 401 (unauthorized) globally
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
        // No refresh endpoint – clear token and redirect to login
        window.__AUTH_TOKEN__ = null;
        // Optionally you could trigger a logout via AuthContext, but here we just reject
        return Promise.reject(error);
  }
);

export default api;
