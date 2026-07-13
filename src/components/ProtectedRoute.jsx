import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Simple loading indicator; can be replaced with a spinner component
    return <div className="loading-spinner">Chargement...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserve intended location for post‑login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
