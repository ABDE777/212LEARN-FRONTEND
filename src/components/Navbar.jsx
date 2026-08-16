import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, ShoppingCart, Heart, Home, BookOpen, Info, LayoutDashboard, UserPlus, Plus, Trophy, Video, User, Lock, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { useWishlistContext } from '../context/WishlistContext';
import { Dock, DockItem, DockIcon, DockLabel } from './Dock';


const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/courses', label: 'Cours' },
  { to: '/contact', label: 'Contact' },
];

function Navbar({ extraDockOptions = [] }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dockMenuOpen, setDockMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const dockRef = useRef(null);

  const { cartCount, openCart } = useCartContext();
  const { wishlistCount } = useWishlistContext();

  // Scroll detection for sticky glassmorphic effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setDockMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setDropdownOpen(false);
    setDockMenuOpen(false);
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
  // Initials: first letter of first + last name (fallback to email initial).
  const initials = (
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.trim()
    || user?.email?.[0]
    || 'U'
  ).toUpperCase();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isInstructor = user?.role?.toUpperCase() === 'INSTRUCTOR';
  const isStudent = user?.role?.toUpperCase() === 'STUDENT';

  const handleDockActionClick = (tabKey) => {
    setDockMenuOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const role = user?.role?.toUpperCase();
    let basePath = '/student/dashboard';
    let targetTab = tabKey;

    if (role === 'INSTRUCTOR') {
      basePath = '/instructor/dashboard';
      if (tabKey === 'dashboard') targetTab = 'courses';
      else if (tabKey === 'lives') targetTab = 'meetings';
      else if (tabKey === 'profile' || tabKey === 'security') targetTab = 'profile';
    } else if (role === 'ADMIN') {
      basePath = '/admin/dashboard';
      if (tabKey === 'dashboard') targetTab = 'users';
      else if (tabKey === 'lives') targetTab = 'meetings';
      else if (tabKey === 'profile' || tabKey === 'security') targetTab = 'profile';
    }

    navigate(`${basePath}?tab=${targetTab}`);
  };

  // Fixed menu options displayed when clicking the single (+) button inside the Apple Dock
  const allDockMenuOptions = [
    {
      label: 'Tableau de bord',
      Icon: <Trophy size={16} />,
      onClick: () => handleDockActionClick('dashboard'),
    },
    {
      label: 'Session live',
      Icon: <Video size={16} />,
      onClick: () => handleDockActionClick('lives'),
    },
    {
      label: 'Profil',
      Icon: <User size={16} />,
      onClick: () => handleDockActionClick('profile'),
    },
    {
      label: 'Sécurité',
      Icon: <Lock size={16} />,
      onClick: () => handleDockActionClick('security'),
    },
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

                  {/* Navigation links for Dashboard, Profile, Security & Live Session */}
                  <Link
                    to={getDashboardPath(user?.role)}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      padding: '0.65rem 0.85rem', borderRadius: '12px',
                      textDecoration: 'none', color: 'var(--text-color)', fontWeight: 600,
                      fontSize: '0.88rem', transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                  >
                    <LayoutDashboard size={15} /> Tableau de bord
                  </Link>

                  <Link
                    to={`${getDashboardPath(user?.role)}?tab=profile`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      padding: '0.65rem 0.85rem', borderRadius: '12px',
                      textDecoration: 'none', color: 'var(--text-color)', fontWeight: 600,
                      fontSize: '0.88rem', transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                  >
                    <User size={15} /> Mon Profil
                  </Link>

                  <Link
                    to={`${getDashboardPath(user?.role)}?tab=security`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      padding: '0.65rem 0.85rem', borderRadius: '12px',
                      textDecoration: 'none', color: 'var(--text-color)', fontWeight: 600,
                      fontSize: '0.88rem', transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                  >
                    <Lock size={15} /> Sécurité
                  </Link>

                  <Link
                    to={`${getDashboardPath(user?.role)}?tab=meetings`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      padding: '0.65rem 0.85rem', borderRadius: '12px',
                      textDecoration: 'none', color: 'var(--text-color)', fontWeight: 600,
                      fontSize: '0.88rem', transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(193, 101, 47, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                  >
                    <Video size={15} /> Session live
                  </Link>

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
            <div className="nav-auth-buttons">
              <Link
                to="/login"
                className="nav-btn-login"
                title="Se connecter"
              >
                <LogIn size={15} />
                <span className="auth-btn-text">Connexion</span>
              </Link>
              <Link
                to="/signup"
                className="nav-btn-signup"
                title="Créer un compte"
              >
                <UserPlus size={15} />
                <span className="auth-btn-text">S'inscrire</span>
              </Link>
            </div>
          )}

        </div>
      </nav>

      {/* Primary mobile site navigation — Apple-style dock (bottom-center) */}
      <div className="site-dock" ref={dockRef}>
        <AnimatePresence>
          {isAuthenticated && dockMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.92, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(8px)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: '4.8rem',
                right: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.45rem',
                zIndex: 1400,
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '0.2rem',
              }}
            >
              {allDockMenuOptions.map((option, index) => (
                <motion.button
                  key={option.label || index}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => {
                    option.onClick?.();
                    setDockMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '12px',
                    background: 'var(--surface-color, #fff)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 8px 24px rgba(43,38,34,0.18)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'inline-flex', color: 'var(--primary)' }}>{option.Icon}</span>
                  <span>{option.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Dock>
          {/* Left Side: 2 buttons */}
          <DockItem key="Accueil" onClick={() => navigate('/')} title="Accueil">
            <DockLabel>Accueil</DockLabel>
            <DockIcon><Home size={22} /></DockIcon>
          </DockItem>

          <DockItem key="Cours" onClick={() => navigate('/courses')} title="Cours">
            <DockLabel>Cours</DockLabel>
            <DockIcon><BookOpen size={22} /></DockIcon>
          </DockItem>

          {/* Center: Animated 212Learn Logo */}
          <DockItem key="Logo" onClick={() => navigate('/')} title="212Learn - Accueil">
            <DockLabel>212Learn</DockLabel>
            <DockIcon>
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  filter: [
                    'drop-shadow(0 0 2px rgba(193,101,47,0.3))',
                    'drop-shadow(0 0 8px rgba(193,101,47,0.7))',
                    'drop-shadow(0 0 2px rgba(193,101,47,0.3))',
                  ],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-heading)',
                  boxShadow: '0 4px 14px rgba(193,101,47,0.4)',
                }}
              >
                212
              </motion.div>
            </DockIcon>
          </DockItem>

          {/* Right Side */}
          <DockItem key="APropos" onClick={() => navigate('/about')} title="À propos">
            <DockLabel>À propos</DockLabel>
            <DockIcon><Info size={22} /></DockIcon>
          </DockItem>

          <DockItem key="Contact" onClick={() => navigate('/contact')} title="Contact">
            <DockLabel>Contact</DockLabel>
            <DockIcon><PhoneCall size={22} /></DockIcon>
          </DockItem>

          {/* Plus menu only visible when user is logged in */}
          {isAuthenticated && (
            <DockItem key="PlusMenu" onClick={() => setDockMenuOpen((prev) => !prev)} title="Plus d'actions">
              <DockLabel>Plus</DockLabel>
              <DockIcon>
                <motion.div animate={{ rotate: dockMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
                  <Plus size={22} />
                </motion.div>
              </DockIcon>
            </DockItem>
          )}
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
