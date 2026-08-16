import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, BookOpen, User, Lock, Trophy, LogOut } from 'lucide-react';
import { useWishlistContext } from '../context/WishlistContext';
import { useCartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import { CourseCardSkeleton } from '../components/SkeletonLoader';

export function WishlistContent() {
  const { fetchWishlist, removeFromWishlist, loading, items: wishlistItems } = useWishlistContext();
  const { addToCart, loading: cartLoading } = useCartContext();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = async (course) => {
    if (!course) return;
    const success = await addToCart(course.id, course.title);
    if (success) {
      await removeFromWishlist(course.id);
    }
  };

  return (
    <div>
      <SEOHead title="Mes Souhaits" description="Consultez et gérez votre liste de cours sauvegardés sur 212Learn." />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-color, #1e293b)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Heart size={32} color="var(--error-color, #ef4444)" fill="var(--error-color, #ef4444)" />
          Ma Liste de Souhaits
        </h1>
        <p style={{ color: 'var(--secondary, #64748b)', marginTop: '0.25rem' }}>
          Retrouvez les cours que vous avez mis de côté pour plus tard.
        </p>
      </div>

      {loading && wishlistItems.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        /* Empty State */
        <Card variant="default" padding="3.5rem 2rem" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Heart size={40} color="var(--error-color, #ef4444)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-color, #1e293b)' }}>
            Votre liste de souhaits est vide
          </h3>
          <p style={{ color: 'var(--secondary, #64748b)', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
            Sauvegardez les cours qui attisent votre curiosité pour les retrouver à tout moment.
          </p>
          <Link to="/courses" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="large">
              Explorer le catalogue des cours
            </Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {wishlistItems.map((item) => {
            const course = item.course || item;
            if (!course) return null;

            return (
              <Card key={item.id || course.id} variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {course.thumbnail ? (
                  <div
                    style={{
                      height: '170px',
                      background: `url(${course.thumbnail}) center/cover`,
                      borderRadius: '12px 12px 0 0',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '170px',
                      background: 'var(--border-color, #cbd5e1)',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOpen size={40} color="#64748b" />
                  </div>
                )}

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        background: 'var(--bg-color, #f8fafc)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--secondary, #64748b)',
                      }}
                    >
                      {course.category?.name || 'Informatique'}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(course.id, course.title)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--error-color, #ef4444)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Retirer des souhaits"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color, #1e293b)', fontSize: '1.1rem', fontWeight: 600 }}>
                    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {course.title}
                    </Link>
                  </h3>

                  <p
                    style={{
                      color: 'var(--secondary, #64748b)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {course.description || 'Découvrez ce cours complet pour développer vos compétences.'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color, #e2e8f0)',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary, #4f46e5)' }}>
                      {Number(course.price) === 0 ? 'Gratuit' : `${course.price} MAD`}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => handleAddToCart(course)}
                    disabled={cartLoading}
                  >
                    <ShoppingCart size={16} /> Ajouter au panier
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const userRole = user?.role?.toUpperCase();
    if (userRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (userRole === 'INSTRUCTOR') {
      navigate('/instructor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #f8fafc)' }}>
      <Navbar />

      <div className="dashboard-layout">
        {/* Sidebar Navigation Panel - Retained on Wishlist View */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-info">
            {user?.avatar ? (
              <img src={user.avatar} alt={`Avatar de ${user.firstName}`} className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="sidebar-username-wrapper">
              <div className="sidebar-username">
                {user?.firstName} {user?.lastName}
              </div>
              <span className="sidebar-userrole">Étudiant</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button onClick={() => navigate('/student/dashboard')} className="sidebar-menu-btn">
              <Trophy size={18} />
              <span>Tableau de bord</span>
            </button>
            <button onClick={() => navigate('/wishlist')} className="sidebar-menu-btn active">
              <Heart size={18} />
              <span>Mes Souhaits</span>
            </button>
            <button onClick={() => navigate('/student/dashboard?tab=profile')} className="sidebar-menu-btn">
              <User size={18} />
              <span>Mon Profil</span>
            </button>
            <button onClick={() => navigate('/student/dashboard?tab=security')} className="sidebar-menu-btn">
              <Lock size={18} />
              <span>Sécurité</span>
            </button>
            <button onClick={handleLogout} className="sidebar-menu-btn" style={{ marginTop: 'auto', color: 'var(--error-color)' }}>
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          <WishlistContent embedded={true} />
        </main>
      </div>
    </div>
  );
}
