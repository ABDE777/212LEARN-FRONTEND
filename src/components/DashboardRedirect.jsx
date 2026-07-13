import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Redirects /dashboard to the proper role‑specific dashboard
export default function DashboardRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toUpperCase();
  if (role === 'INSTRUCTOR') return <Navigate to="/instructor/dashboard" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  // Default student dashboard
  return <Navigate to="/student/dashboard" replace />;
}
