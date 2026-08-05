import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Flame, Target, BookOpen, Clock, TrendingUp, Award, LogOut, User, Lock, ShoppingCart, Heart } from 'lucide-react';
import { useStudentDashboardData } from '../hooks/useStudentDashboard';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { WishlistContent } from './Wishlist';
import SEOHead from '../components/SEOHead';
import { DashboardStatsSkeleton, CourseCardSkeleton } from '../components/SkeletonLoader';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { openCart } = useCartContext();

  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { profile, achievements, enrollments, loading, error } = useStudentDashboardData(user?.id);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleContinueCourse = (courseId, lessonId) => {
    navigate(`/learn/${courseId}/lesson/${lessonId || 'intro'}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Récemment';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const currentUser = profile || user;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #f8fafc)' }}>
      <SEOHead title="Tableau de Bord Étudiant" description="Consultez votre progression, vos cours et vos statistiques sur 212Learn." />
      <Navbar />

      <div className="dashboard-layout">
        {/* Sidebar Panel */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-info">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={`Photo de ${currentUser.firstName}`}
                className="sidebar-avatar"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="sidebar-avatar">
                {currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="sidebar-username-wrapper">
              <div className="sidebar-username">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <span className="sidebar-userrole">Étudiant</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`sidebar-menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Trophy size={18} />
              <span>Tableau de bord</span>
            </button>
            <button onClick={openCart} className="sidebar-menu-btn">
              <ShoppingCart size={18} />
              <span>Mon Panier</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`sidebar-menu-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Heart size={18} />
              <span>Mes Souhaits</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-menu-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`sidebar-menu-btn ${activeTab === 'security' ? 'active' : ''}`}
            >
              <Lock size={18} />
              <span>Sécurité</span>
            </button>
            <button
              onClick={handleLogout}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color, #ef4444)' }}
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          {activeTab === 'profile' ? (
            <ProfileEditForm />
          ) : activeTab === 'security' ? (
            <ChangePasswordForm />
          ) : activeTab === 'wishlist' ? (
            <WishlistContent embedded={true} />
          ) : (
            <div>
              {/* Welcome Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-color, #1e293b)' }}>
                  Bienvenue, {currentUser?.firstName || 'Étudiant'} 👋
                </h1>
                <p style={{ fontSize: '1.05rem', color: 'var(--secondary, #64748b)' }}>
                  Continuez votre parcours d'apprentissage vers l'excellence.
                </p>
              </div>

              {/* Gamification Stats */}
              {loading && !achievements ? (
                <div style={{ marginBottom: '2.5rem' }}>
                  <DashboardStatsSkeleton />
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2.5rem',
                  }}
                >
                  <Card variant="default" padding="1.5rem">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: 'var(--primary, #4f46e5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Trophy size={28} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          {achievements?.points ?? 1250}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Points totaux</div>
                      </div>
                    </div>
                  </Card>

                  <Card variant="default" padding="1.5rem">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: '#FF6B35',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Flame size={28} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          {achievements?.streak ?? 7}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Jours consécutifs</div>
                      </div>
                    </div>
                  </Card>

                  <Card variant="default" padding="1.5rem">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: 'var(--accent, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Target size={28} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          {achievements?.completedCourses ?? 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Cours terminés</div>
                      </div>
                    </div>
                  </Card>

                  <Card variant="default" padding="1.5rem">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={28} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          {achievements?.totalHours ?? 24}h
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Apprentissage</div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Main Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="student-grid-wrapper">
                <style>{`
                  @media (min-width: 992px) {
                    .student-grid-wrapper {
                      grid-template-columns: 2fr 1fr !important;
                    }
                  }
                `}</style>

                {/* Left Column: Enrolled Courses */}
                <div>
                  <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: 700 }}>
                        Continuer l'apprentissage ({enrollments.length})
                      </h2>
                      <Link to="/courses" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                        Voir tout le catalogue →
                      </Link>
                    </div>

                    {loading && enrollments.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <CourseCardSkeleton />
                        <CourseCardSkeleton />
                      </div>
                    ) : enrollments.length === 0 ? (
                      /* Empty State Enrolled Courses */
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                        <div
                          style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            background: 'var(--bg-color, #f8fafc)',
                            border: '2px dashed var(--border-color, #e2e8f0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                          }}
                        >
                          <BookOpen size={32} color="var(--secondary)" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                          Vous n'êtes inscrit à aucun cours pour le moment
                        </h3>
                        <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                          Inscrivez-vous dès maintenant pour accéder aux leçons et quiz.
                        </p>
                        <Link to="/courses">
                          <Button variant="primary">Explorer le catalogue</Button>
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {enrollments.map((item) => {
                          const course = item.course || item;
                          const progressPercent = item.progress ?? (item.status === 'completed' ? 100 : 35);
                          const totalLessons = course.duration ? Math.ceil(course.duration / 15) : 12;
                          const completedLessons = Math.round((progressPercent / 100) * totalLessons);

                          return (
                            <div
                              key={item.id || course.id}
                              style={{
                                padding: '1.25rem',
                                background: 'var(--bg-color, #f8fafc)',
                                borderRadius: '14px',
                                border: '1px solid var(--border-color, #e2e8f0)',
                                display: 'flex',
                                gap: '1.25rem',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={`Vignette du cours ${course.title}`}
                                  style={{ width: '110px', height: '76px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '110px',
                                    height: '76px',
                                    background: 'var(--border-color, #cbd5e1)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <BookOpen size={28} color="#64748b" />
                                </div>
                              )}

                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.35rem' }}>
                                  {course.title}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                                  Niveau: {course.level || 'Tous niveaux'}
                                </p>

                                {/* Progress Bar */}
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                    <span>{completedLessons}/{totalLessons} leçons</span>
                                    <span style={{ fontWeight: 600 }}>{progressPercent}%</span>
                                  </div>
                                  <div style={{ height: '6px', background: 'var(--border-color, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        height: '100%',
                                        background: 'var(--primary, #4f46e5)',
                                        width: `${progressPercent}%`,
                                        borderRadius: '3px',
                                        transition: 'width 0.3s ease',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right', minWidth: '130px' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                                  Accès: {formatDate(item.enrolledAt)}
                                </p>
                                <Button
                                  variant="primary"
                                  size="small"
                                  onClick={() => handleContinueCourse(course.id)}
                                >
                                  Continuer
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Right Column: Badges & Activity */}
                <div>
                  <Card variant="elevated" padding="1.5rem" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ marginBottom: '1.25rem', color: 'var(--text-color)', fontSize: '1.15rem', fontWeight: 700 }}>
                      Badges obtenus
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.4rem',
                          }}
                        >
                          <Award size={24} color="#fff" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-color)' }}>Pionnier</p>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.4rem',
                          }}
                        >
                          <Flame size={24} color="#fff" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-color)' }}>Streak 7</p>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2196F3, #1565C0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.4rem',
                          }}
                        >
                          <BookOpen size={24} color="#fff" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-color)' }}>Assidu</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
