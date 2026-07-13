import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/navbarlogo.png';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const handleLogout = function() {
    logout();
    window.location.href = '/';
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1.5rem 2rem', 
      alignItems: 'center',
      background: 'var(--surface-color)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
        212Learn
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', gap: '1rem' }}>
        <Link to="/" className={`nav-center-link ${location.pathname === '/' ? 'active' : ''}`}>Accueil</Link>
        <Link to="/about" className={`nav-center-link ${location.pathname === '/about' ? 'active' : ''}`}>À propos</Link>
        <Link to="/courses" className={`nav-center-link ${location.pathname === '/courses' ? 'active' : ''}`}>Cours</Link>
        <Link to="/categories" className={`nav-center-link ${location.pathname === '/categories' ? 'active' : ''}`}>Catégories</Link>
      </div>
      {isAuthenticated ? (
          <React.Fragment>
            {/* Profile Link */}
            <Link
              to={getDashboardPath(user?.role)}
              aria-label={`Accéder au tableau de bord de ${user?.firstName || 'l\'utilisateur'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
                textDecoration: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-color)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-color)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={16} color="#fff" />
              </div>
              <span style={{
                fontWeight: 500,
                color: 'var(--text-color)',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem'
              }}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.firstName || user?.email || 'Utilisateur'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--secondary)',
                fontWeight: 500
              }}
              className="nav-logout-btn"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--secondary)', 
                textDecoration: 'none', 
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}
              className="nav-link"
            >
              Se connecter
            </Link>
            <Link 
              to="/signup" 
              className="btn-primary" 
              style={{ 
                padding: '0.5rem 1.25rem',
                textDecoration: 'none'
              }}
            >
              S'inscrire
            </Link>
          </React.Fragment>
        )}

      <style>{`
        .nav-link:hover {
          background: var(--bg-color);
        }
        .nav-logout-btn:hover {
          background: var(--bg-color);
          border-color: var(--primary);
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
