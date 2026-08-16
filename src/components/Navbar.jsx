import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, ShoppingCart, Heart, Menu, X, LayoutDashboard } from 'lucide-react';
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
            top: '-5px',
            right: '-5px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '999px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 2px 6px rgba(193, 101, 47, 0.5)',
            animation: 'scaleIn 0.2s ease',
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
    borderRadius: '12px',
    background: hovered ? 'rgba(193, 101, 47, 0.08)' : 'transparent',
    border: '1px solid ' + (hovered ? 'rgba(193,101,47,0.2)' : 'transparent'),
    color: hovered ? 'var(--primary)' : 'var(--secondary)',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    flexShrink: 0,
    cursor: 'pointer',
    transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
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

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/courses', label: 'Cours' },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const { cartCount, openCart } = useCartContext();
  const { wishlistCount } = useWishlistContext();

  // Scroll detection for sticky glassmorphic effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const getDashboardPath = (role) => {
    const r = role?.toUpperCase();
    if (r === 'INSTRUCTOR') return '/instructor/dashboard';
    if (r === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    window.location.href = '/';
  };

  const avatarUrl = user?.avatar || user?.profilePicture || user?.photo || null;
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isInstructor = user?.role?.toUpperCase() === 'INSTRUCTOR';
  const isStudent = user?.role?.toUpperCase() === 'STUDENT';

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: scrolled ? '0.7rem 2.5rem' : '1rem 2.5rem',
    alignItems: 'center',
    background: scrolled
      ? 'rgba(245, 237, 228, 0.88)'
      : 'var(--bg-color)',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: '1px solid ' + (scrolled ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.6)'),
    boxShadow: scrolled
      ? '0 4px 24px rgba(43, 38, 34, 0.1), 0 1px 0 rgba(255,255,255,0.7)'
      : 'var(--neu-shadow-raised-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
    animation: 'fadeInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
  };

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            fontSize: '1.55rem',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)',
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            212
          </span>
          <span style={{ color: 'var(--secondary)' }}>Learn</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`nav-center-link ${isActive ? 'active' : ''}`}
              >
                {label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '18px',
                    height: '2.5px',
                    background: 'var(--primary)',
                    borderRadius: '2px',
                    display: 'block',
                    animation: 'scaleIn 0.25s ease',
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Cart / Wishlist — only for students */}
          {isAuthenticated && isStudent && (
            <>
              <NavIconButton
                to="/wishlist"
                icon={<Heart size={18} />}
                count={wishlistCount}
                label="Mes souhaits"
              />
              <NavIconButton
                onClick={openCart}
                icon={<ShoppingCart size={18} />}
                count={cartCount}
                label="Mon panier"
              />
              <div style={{ width: '1px', height: '22px', background: 'rgba(43, 38, 34, 0.1)', margin: '0 0.15rem' }} />
            </>
          )}

          {/* User menu */}
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-label="Menu utilisateur"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.4rem 0.85rem 0.4rem 0.4rem',
                  background: dropdownOpen
                    ? 'rgba(193, 101, 47, 0.08)'
                    : 'transparent',
                  border: '1px solid ' + (dropdownOpen ? 'rgba(193,101,47,0.25)' : 'rgba(43,38,34,0.1)'),
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
              >
                {/* Avatar */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Avatar de ${user?.firstName || 'utilisateur'}`}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid rgba(193,101,47,0.3)',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={14} color="#fff" />
                  </div>
                )}

                <span style={{ fontWeight: 600, color: 'var(--text-color)', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {user?.firstName || user?.email?.split('@')[0] || 'Utilisateur'}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--secondary)',
                    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    minWidth: '230px',
                    background: 'rgba(245, 237, 228, 0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '18px',
                    boxShadow: '0 20px 60px rgba(43,38,34,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                    padding: '0.5rem',
                    zIndex: 1001,
                    animation: 'dropdownIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
                  }}
                >
                  {/* User info header */}
                  <div style={{
                    padding: '0.75rem 0.85rem',
                    borderBottom: '1px solid rgba(43,38,34,0.07)',
                    marginBottom: '0.4rem',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)', margin: 0 }}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', margin: '2px 0 0', opacity: 0.7 }}>
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to={getDashboardPath(user?.role)}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-color)',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-color)';
                    }}
                  >
                    <LayoutDashboard size={15} />
                    Tableau de bord
                  </Link>

                  <div style={{ height: '1px', background: 'rgba(43, 38, 34, 0.07)', margin: '0.3rem 0.5rem' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'transparent',
                      color: '#e53e3e',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                      fontFamily: 'var(--font-heading)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(229, 62, 62, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link
                to="/login"
                style={{
                  color: 'var(--secondary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(193,101,47,0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="btn-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  borderRadius: '10px',
                }}
              >
                S'inscrire
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{
              display: 'none',
              background: mobileMenuOpen ? 'rgba(193,101,47,0.08)' : 'transparent',
              border: '1px solid rgba(43,38,34,0.12)',
              borderRadius: '10px',
              cursor: 'pointer',
              padding: '7px',
              color: 'var(--text-color)',
              transition: 'all 0.2s ease',
            }}
            aria-label="Menu principal"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: 'sticky',
            top: '60px',
            zIndex: 999,
            background: 'rgba(245, 237, 228, 0.97)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 30px rgba(43,38,34,0.1)',
            padding: '1rem 1.5rem 1.5rem',
            animation: 'mobileMenuIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-color)',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(193,101,47,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div style={{ height: '1px', background: 'rgba(43,38,34,0.08)', marginBottom: '1rem' }} />

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to={getDashboardPath(user?.role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  fontWeight: 600, fontSize: '0.95rem',
                  color: 'var(--text-color)', textDecoration: 'none',
                  background: 'rgba(43,38,34,0.04)',
                }}
              >
                <LayoutDashboard size={16} />
                Tableau de bord
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  border: 'none', background: 'rgba(229,62,62,0.07)',
                  color: '#e53e3e', fontWeight: 600, fontSize: '0.95rem',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/login"
                style={{
                  flex: 1, textAlign: 'center', padding: '0.65rem 1rem',
                  borderRadius: '10px', border: '1px solid rgba(43,38,34,0.15)',
                  color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="btn-primary"
                style={{ flex: 1, textAlign: 'center', padding: '0.65rem 1rem', textDecoration: 'none', fontSize: '0.9rem', borderRadius: '10px' }}
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-center-link {
          color: var(--secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.92rem;
          padding: 0.5rem 0.9rem;
          border-radius: 10px;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-center-link:hover {
          color: var(--primary);
          background: rgba(193, 101, 47, 0.07);
        }
        .nav-center-link.active {
          color: var(--primary);
          background: rgba(193, 101, 47, 0.09);
        }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;
