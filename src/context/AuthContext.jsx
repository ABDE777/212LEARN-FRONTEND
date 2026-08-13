import { createContext, useContext, useState, useEffect } from 'react';
import api, { unwrap } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token') || window.__AUTH_TOKEN__;
    if (savedToken) {
      window.__AUTH_TOKEN__ = savedToken;
    }
    return savedToken;
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          const d = unwrap(response);
          setUser(d?.user ?? d);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setToken(null);
          window.__AUTH_TOKEN__ = null;
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, data } = response.data;
    const userData = data?.user || response.data.user;
    setToken(newToken);
    window.__AUTH_TOKEN__ = newToken;
    localStorage.setItem('token', newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, data } = response.data;
    const newUser = data?.user || response.data.user;
    if (newToken) {
      setToken(newToken);
      window.__AUTH_TOKEN__ = newToken;
      localStorage.setItem('token', newToken);
      setUser(newUser);
    }
    return newUser;
  };

  const logout = () => {
    setToken(null);
    window.__AUTH_TOKEN__ = null;
    localStorage.removeItem('token');
    setUser(null);
  };

  // Used by flows that already have a token from an API call (e.g. OTP restore)
  const loginWithToken = (newToken, userData) => {
    setToken(newToken);
    window.__AUTH_TOKEN__ = newToken;
    localStorage.setItem('token', newToken);
    setUser(userData);
  };

  const updateProfile = async (profileData) => {
    const response = await api.patch('/users/me', profileData);
    const d = unwrap(response);
    const updatedUser = d?.user ?? d;
    setUser(updatedUser);
    return updatedUser;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.patch('/users/me/password', { currentPassword, newPassword });
    return response.data;
  };

  const deleteAccount = async () => {
    await api.delete('/users/me');
    logout();
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const d = unwrap(response);
    const updatedUser = d?.user ?? d;
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithToken,
    signup,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    uploadAvatar,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
