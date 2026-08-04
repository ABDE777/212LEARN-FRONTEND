import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

function NavIconBtn({ to, icon, count }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: hovered ? 'var(--bg-color)' : 'transparent',
        border: '1px solid',
        borderColor: hovered ? 'var(--border-color)' : 'transparent',
        color: hovered ? 'var(--primary)' : 'var(--secondary)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      {icon}
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          minWidth: '18px',
          height: '18px',
          padding: '0 4px',
          borderRadius: '999px',
          background: 'var(--primary)',
          color: '#fff',
          fontSize: '0.68rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { cart, fetchCart } = useCart();
  const { wishlist, fetchWishlist } = useWishlist();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const cartCount = cart?.items?.length || 0;
  const wishlistCount = wishlist?.items?.length ?? (Array.isArray(wishlist) ? wishlist.length : 0);

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const handleLogout = function() {
    setDropdownOpen(false);
    logout();
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.avatar || user?.profilePicture || user?.photo || null;

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isAuthenticated && (
          <>
            <NavIconBtn
              to="/wishlist"
              icon={<Heart size={18} />}
              count={wishlistCount}
            />
            <NavIconBtn
              to="/cart"
              icon={<ShoppingCart size={18} />}
              count={cartCount}
            />
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.25rem' }} />
          </>
        )}

        {isAuthenticated ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.4rem 0.9rem',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
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
                if (!dropdownOpen) {
                  e.currentTarget.style.background = 'var(--surface-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User size={16} color="#fff" />
                </div>
              )}
              <span style={{
                fontWeight: 500,
                color: 'var(--text-color)',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
              }}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.firstName || user?.email || 'Utilisateur'}
              </span>
              <ChevronDown size={16} style={{ color: 'var(--secondary)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '200px',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 1000,
              }}>
                <Link
                  to={getDashboardPath(user?.role)}
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-color)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-color)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <User size={16} />
                  Mon profil
                </Link>
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.35rem 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--secondary)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-color)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
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
      </div>

      <style>{`
        .nav-link:hover {
          background: var(--bg-color);
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
