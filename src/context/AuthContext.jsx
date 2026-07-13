import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data?.data?.user || response.data?.user || response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setToken(null);
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
    setUser(userData);
    return userData;
  };

  const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    const { token: newToken, data } = response.data;
    const newUser = data?.user || response.data.user;
    if (newToken) {
      setToken(newToken);
      window.__AUTH_TOKEN__ = newToken;
      setUser(newUser);
    }
    return newUser;
  };

  const logout = () => {
    setToken(null);
    window.__AUTH_TOKEN__ = null;
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await api.patch('/users/me', profileData);
    const updatedUser = response.data?.data?.user || response.data?.user || response.data;
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateProfile,
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
