import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { useWishlistContext } from '../context/WishlistContext';

function NavIconButton({ to, onClick, icon, count, label }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
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
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '2px 2px 5px rgba(193, 101, 47, 0.4)',
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
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'var(--bg-color)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    color: hovered ? 'var(--primary)' : 'var(--secondary)',
    textDecoration: 'none',
    transition: 'all 0.25s ease',
    flexShrink: 0,
    cursor: 'pointer',
    boxShadow: pressed
      ? 'var(--neu-shadow-inset-sm)'
      : hovered
      ? 'var(--neu-shadow-raised)'
      : 'var(--neu-shadow-raised-sm)',
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
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
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
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
        padding: '1rem 2.5rem',
        alignItems: 'center',
        background: 'var(--bg-color)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: 'var(--neu-shadow-raised-sm)',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
        212Learn
      </Link>

      {/* Desktop Navigation Links */}
      <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
            <div style={{ width: '1px', height: '24px', background: 'rgba(43, 38, 34, 0.1)', margin: '0 0.25rem' }} />
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
                padding: '0.45rem 1rem',
                background: 'var(--bg-color)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                outline: 'none',
                boxShadow: dropdownOpen ? 'var(--neu-shadow-inset-sm)' : 'var(--neu-shadow-raised-sm)',
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
                    boxShadow: 'var(--neu-shadow-raised-sm)',
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
                    boxShadow: 'var(--neu-shadow-raised-sm)',
                  }}
                >
                  <User size={16} color="#fff" />
                </div>
              )}
              <span
                style={{
                  fontWeight: 600,
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
                  top: 'calc(100% + 12px)',
                  right: 0,
                  minWidth: '220px',
                  background: 'var(--bg-color)',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  borderRadius: '16px',
                  boxShadow: 'var(--neu-shadow-raised-lg)',
                  padding: '0.6rem',
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
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'var(--text-color)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-sm)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.color = 'var(--text-color)';
                  }}
                >
                  <User size={16} />
                  Mon profil / Tableau de bord
                </Link>
                <div style={{ height: '1px', background: 'rgba(43, 38, 34, 0.08)', margin: '0.35rem 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--error-color, #ef4444)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              to="/login"
              style={{
                color: 'var(--secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '0.55rem 1.1rem',
                borderRadius: '12px',
                background: 'var(--bg-color)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: 'var(--neu-shadow-raised-sm)',
                transition: 'all 0.25s ease',
              }}
              className="nav-link"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="btn-primary"
              style={{
                padding: '0.55rem 1.35rem',
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
            background: 'var(--bg-color)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: 'var(--neu-shadow-raised-sm)',
            borderRadius: '10px',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-color)',
          }}
          aria-label="Menu principal"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <style>{`
        .nav-center-link {
          color: var(--secondary);
          text-decoration: none;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          transition: all 0.25s ease;
        }
        .nav-center-link:hover {
          color: var(--primary);
          box-shadow: var(--neu-shadow-raised-sm);
        }
        .nav-center-link.active {
          color: var(--primary);
          box-shadow: var(--neu-shadow-inset-sm);
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
