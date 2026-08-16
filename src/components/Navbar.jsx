import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, ShoppingCart, Heart, Home, BookOpen, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { useWishlistContext } from '../context/WishlistContext';
import { Dock, DockItem, DockIcon, DockLabel } from './Dock';


const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/courses', label: 'Cours' },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Close the profile dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);


  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    window.location.href = '/';
  };

  const avatarUrl = user?.avatar || user?.profilePicture || user?.photo || null;
  // Initials: first letter of first + last name (fallback to email initial).
  const initials = (
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.trim()
    || user?.email?.[0]
    || 'U'
  ).toUpperCase();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isInstructor = user?.role?.toUpperCase() === 'INSTRUCTOR';
  const isStudent = user?.role?.toUpperCase() === 'STUDENT';

  // Site links shown in the bottom dock (mobile). The user's own sections live
  // in the (+) floating button, so the dock keeps only the public site links.
  const siteDockItems = [
    { label: 'Accueil', icon: <Home size={22} />, onClick: () => navigate('/') },
    { label: 'Cours', icon: <BookOpen size={22} />, onClick: () => navigate('/courses') },
    { label: 'À propos', icon: <Info size={22} />, onClick: () => navigate('/about') },
    ...(isAuthenticated
      ? []
      : [{ label: 'Connexion', icon: <LogIn size={22} />, onClick: () => navigate('/login') }]),
  ];

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
          {/* User menu (cart & wishlist now live inside the dropdown) */}
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-label="Menu utilisateur"
                title={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: dropdownOpen ? '0 0 0 3px rgba(193,101,47,0.25)' : 'none',
                }}
              >
                {/* Avatar — rounded icon with initials (or photo when available) */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Avatar de ${user?.firstName || 'utilisateur'}`}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid rgba(193,101,47,0.35)',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {initials}
                  </div>
                )}
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

                  {isStudent && (
                    <>
                      <button
                        onClick={() => { setDropdownOpen(false); openCart(); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: '0.7rem', padding: '0.65rem 0.85rem', borderRadius: '12px',
                          border: 'none', background: 'transparent', color: 'var(--text-color)',
                          fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', width: '100%',
                          textAlign: 'left', transition: 'all 0.18s ease', fontFamily: 'var(--font-heading)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem' }}>
                          <ShoppingCart size={15} /> Mon panier
                        </span>
                        {cartCount > 0 && (
                          <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </button>

                      <Link
                        to="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: '0.7rem', padding: '0.65rem 0.85rem', borderRadius: '12px',
                          textDecoration: 'none', color: 'var(--text-color)', fontWeight: 600,
                          fontSize: '0.88rem', transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem' }}>
                          <Heart size={15} /> Mes souhaits
                        </span>
                        {wishlistCount > 0 && (
                          <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                          </span>
                        )}
                      </Link>
                    </>
                  )}

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

        </div>
      </nav>

      {/* Primary mobile site navigation — Apple-style dock (bottom-center).
          Dashboards keep their own floating (+) menu for their tabs. */}
      <div className="site-dock">
        <Dock>
          {siteDockItems.map((item) => (
            <DockItem key={item.label} onClick={item.onClick} title={item.label}>
              <DockLabel>{item.label}</DockLabel>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
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
        }
      `}</style>
    </>
  );
}

export default Navbar;
