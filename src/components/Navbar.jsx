import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { useWishlistContext } from '../context/WishlistContext';

function NavIconButton({ to, onClick, icon, count, label }) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <>
      {icon}
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '999px',
            background: 'var(--primary, #4f46e5)',
            color: '#fff',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </>
  );

  const style = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: hovered ? 'var(--bg-color, #f8fafc)' : 'transparent',
    border: '1px solid',
    borderColor: hovered ? 'var(--border-color, #e2e8f0)' : 'transparent',
    color: hovered ? 'var(--primary, #4f46e5)' : 'var(--secondary, #64748b)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    cursor: 'pointer',
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...style, outline: 'none', padding: 0 }}
        aria-label={label}
        title={label}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
      aria-label={label}
      title={label}
    >
      {content}
    </Link>
  );
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { cartCount, openCart } = useCartContext();
  const { wishlistCount } = useWishlistContext();

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const handleLogout = function () {
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
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        alignItems: 'center',
        background: 'var(--surface-color, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary, #4f46e5)' }}>
        212Learn
      </Link>

      {/* Desktop Navigation Links */}
      <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" className={`nav-center-link ${location.pathname === '/' ? 'active' : ''}`}>
          Accueil
        </Link>
        <Link to="/about" className={`nav-center-link ${location.pathname === '/about' ? 'active' : ''}`}>
          À propos
        </Link>
        <Link to="/courses" className={`nav-center-link ${location.pathname === '/courses' ? 'active' : ''}`}>
          Cours
        </Link>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated && (
          <>
            <NavIconButton
              to="/wishlist"
              icon={<Heart size={19} />}
              count={wishlistCount}
              label="Mes souhaits"
            />
            <NavIconButton
              onClick={openCart}
              icon={<ShoppingCart size={19} />}
              count={cartCount}
              label="Mon panier"
            />
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color, #e2e8f0)', margin: '0 0.25rem' }} />
          </>
        )}

        {isAuthenticated ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-label="Menu utilisateur"
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
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Avatar de ${user?.firstName || 'utilisateur'}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={16} color="#fff" />
                </div>
              )}
              <span
                style={{
                  fontWeight: 500,
                  color: 'var(--text-color)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                }}
              >
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.email || 'Utilisateur'}
              </span>
              <ChevronDown
                size={16}
                style={{
                  color: 'var(--secondary)',
                  transition: 'transform 0.2s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '200px',
                  background: 'var(--surface-color, #fff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  padding: '0.5rem',
                  zIndex: 1000,
                }}
              >
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User size={16} />
                  Mon profil / Tableau de bord
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
                    color: 'var(--error-color, #ef4444)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/login"
              style={{
                color: 'var(--secondary)',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
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
                textDecoration: 'none',
              }}
            >
              S'inscrire
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--text-color)',
          }}
          aria-label="Menu principal"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        .nav-center-link {
          color: var(--secondary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .nav-center-link:hover, .nav-center-link.active {
          color: var(--primary);
          background: var(--bg-color);
        }
        @media (max-width: 768px) {
          .nav-desktop-links {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
