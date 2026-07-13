import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Add a CSS class based on role for potential styling/layout tweaks
  const roleClass = user?.role ? `role-${user.role.toLowerCase()}` : '';

  return (
    <div className={`protected-layout ${roleClass}`} style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      <Outlet />
    </div>
  );
}

export default ProtectedLayout;
