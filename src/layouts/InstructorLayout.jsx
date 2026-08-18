import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function InstructorLayout() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-color)'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || '').toUpperCase();

  if (role !== 'INSTRUCTOR') {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  // Unapproved instructors can't reach any instructor page — even by typing the
  // URL directly. They're sent to the locked "pending approval" screen. The
  // backend enforces this too (restrictTo blocks their API calls).
  if (!user?.isVerified) {
    return <Navigate to="/instructor/pending" replace />;
  }

  return <Outlet />;
}

export default InstructorLayout;
