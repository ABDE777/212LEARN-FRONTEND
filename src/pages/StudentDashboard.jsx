import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Target, BookOpen, TrendingUp, Award, LogOut, User, Lock, Trash2, AlertTriangle, X, Video, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStudentDashboardData } from '../hooks/useStudentDashboard';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import VirtualClassroom from '../components/VirtualClassroom';
import SessionCalendar from '../components/SessionCalendar';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingActionMenu from '../components/FloatingActionMenu';
import { WishlistContent } from './Wishlist';

/* ─── Student Live Sessions Component ────────────────────────── */
function StudentLiveSessionsTab({ enrollments = [], currentUser }) {
  const [selectedCourseId, setSelectedCourseId] = useState(enrollments[0]?.course?.id || enrollments[0]?.courseId || '');
  const { meetings, loading, error, fetchMeetings } = useMeetings(selectedCourseId);
  const [activeVirtualMeeting, setActiveVirtualMeeting] = useState(null);

  useEffect(() => {
    if (selectedCourseId) fetchMeetings();
  }, [selectedCourseId, fetchMeetings]);

  return (
    <div>
      {/* Active Virtual Classroom modal */}
      {activeVirtualMeeting && (
        <VirtualClassroom
          meeting={activeVirtualMeeting}
          displayName={currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Étudiant'}
          isInstructor={false}
          onClose={() => setActiveVirtualMeeting(null)}
        />
      )}

      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-color)' }}>
          Classes Virtuelles & Sessions Live
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.92rem' }}>
          Rejoignez vos cours interactifs en direct et visionnez les enregistrements.
        </p>
      </div>

      {/* Course filter pills */}
      {enrollments.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          {enrollments.map((e) => {
            const cId = e.course?.id || e.courseId;
            const cTitle = e.course?.title || 'Cours';
            return (
              <button
                key={cId}
                type="button"
                onClick={() => setSelectedCourseId(cId)}
                style={{
                  padding: '0.4rem 1.1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${selectedCourseId === cId ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: selectedCourseId === cId ? 'rgba(193,101,47,0.08)' : 'transparent',
                  color: selectedCourseId === cId ? 'var(--primary)' : 'var(--secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {cTitle}
              </button>
            );
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
          Vous n'êtes inscrit à aucun cours pour le moment.
        </p>
      )}

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>}

      {!loading && !error && meetings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fff', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
          <Video size={36} color="var(--secondary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '0.3rem' }}>Aucune session disponible</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', opacity: 0.8 }}>
            Votre instructeur n'a pas encore planifié de session live pour ce cours.
          </p>
        </div>
      )}

      {!loading && !error && meetings.length > 0 && (
        <SessionCalendar
          meetings={meetings}
          onMeetingClick={(meeting) => {
            if (meeting.status === 'LIVE') {
              setActiveVirtualMeeting(meeting);
            }
          }}
          readOnly={true}
        />
      )}
    </div>
  );
}

// The student's own groups (assigned by a formateur for a course they paid for).
function MyGroupsSection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { default: api } = await import('../services/api');
        const res = await api.get('/groups/mine');
        if (active) setGroups(res.data?.data?.groups || []);
      } catch {
        if (active) setGroups([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading || groups.length === 0) return null;

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{ marginBottom: '1.25rem', color: 'var(--text-color)', fontSize: '1.3rem', fontWeight: 700 }}>
        Mes groupes
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {groups.map((g) => (
          <Card key={g.groupId} variant="elevated" padding="1.25rem">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-color)' }}>{g.name}</div>
                {g.course?.title && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{g.course.title}</div>
                )}
              </div>
            </div>
            {g.formateur && (
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', margin: 0 }}>
                Formateur : {g.formateur.firstName} {g.formateur.lastName}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { profile, achievements, badges, enrollments, loading, error } = useStudentDashboardData(user?.id);

  const [activeTab, setActiveTabState] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== 'search') return tabFromUrl;
    const tabFromStorage = localStorage.getItem('student_active_tab');
    if (tabFromStorage && tabFromStorage !== 'search') return tabFromStorage;
    return 'dashboard';
  });

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    localStorage.setItem('student_active_tab', newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Delete own account ────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const { default: api } = await import('../services/api');
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de supprimer le compte. Veuillez réessayer.'
      );
      setDeleteLoading(false);
    }
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const currentUser = user;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #f8fafc)' }}>
      <SEOHead title="Tableau de Bord Étudiant" description="Consultez votre progression, vos cours et vos statistiques sur 212Learn." />
      <Navbar />

      {/* Mobile navigation — floating action menu (sidebar is hidden on phones) */}
      <FloatingActionMenu
        className="fab-mobile-only"
        options={[
          { label: 'Tableau de bord', Icon: <Trophy size={16} />, onClick: () => setActiveTab('dashboard') },
          { label: 'Sessions Live', Icon: <Video size={16} />, onClick: () => setActiveTab('lives') },
          { label: 'Mon Profil', Icon: <User size={16} />, onClick: () => setActiveTab('profile') },
          { label: 'Sécurité', Icon: <Lock size={16} />, onClick: () => setActiveTab('security') },
        ]}
      />

      <div className="dashboard-layout">
        {/* Sidebar Panel */}
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle-btn"
            title={sidebarCollapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`sidebar-menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              title="Tableau de bord"
            >
              <Trophy size={18} />
              <span>Tableau de bord</span>
            </button>
            <button
              onClick={() => setActiveTab('lives')}
              className={`sidebar-menu-btn ${activeTab === 'lives' ? 'active' : ''}`}
              title="Sessions Live"
            >
              <Video size={18} />
              <span>Sessions Live</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-menu-btn ${activeTab === 'profile' ? 'active' : ''}`}
              title="Mon Profil"
            >
              <User size={18} />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`sidebar-menu-btn ${activeTab === 'security' ? 'active' : ''}`}
              title="Sécurité"
            >
              <Lock size={18} />
              <span>Sécurité</span>
            </button>
            <button
              onClick={handleLogout}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color, #ef4444)' }}
              title="Déconnexion"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          {activeTab === 'profile' ? (
            <div key="profile" className="tab-panel"><ProfileEditForm /></div>
          ) : activeTab === 'security' ? (
            <div key="security" className="tab-panel"><ChangePasswordForm /></div>
          ) : activeTab === 'wishlist' ? (
            <div key="wishlist" className="tab-panel"><WishlistContent embedded={true} /></div>
          ) : activeTab === 'lives' ? (
            <div key="lives" className="tab-panel"><StudentLiveSessionsTab enrollments={enrollments} currentUser={user} /></div>
          ) : (
            <div key={activeTab} className="tab-panel">
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
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                  <LoadingSpinner />
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
                          {achievements?.points ?? 0}
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
                        <BookOpen size={28} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          {achievements?.totalEnrollments ?? enrollments.length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Cours suivis</div>
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
                          {achievements?.completedLessons ?? 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Leçons complétées</div>
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
                        <TrendingUp size={28} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          {achievements?.completionRate ?? 0}%
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Taux de complétion</div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                        <LoadingSpinner />
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
                          // Real progress from the backend (completed lessons / total lessons).
                          const progressPercent = item.progress ?? 0;
                          const totalLessons = item.totalLessons ?? 0;
                          const completedLessons = item.completedLessons ?? 0;

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

                    {(!badges || badges.length === 0) ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', margin: 0 }}>
                        Aucun badge pour le moment — continuez à apprendre pour en débloquer !
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {badges.map((b) => (
                          <div key={b.id || b.name} style={{ textAlign: 'center' }} title={b.description || ''}>
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
                                overflow: 'hidden',
                              }}
                            >
                              {b.icon && b.icon.startsWith('http') ? (
                                <img src={b.icon} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : b.icon ? (
                                <span style={{ fontSize: '1.4rem' }}>{b.icon}</span>
                              ) : (
                                <Award size={24} color="#fff" />
                              )}
                            </div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-color)' }}>{b.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>

              <MyGroupsSection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
