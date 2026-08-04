import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, Flame, Target, BookOpen, Clock, TrendingUp, Award, ChevronRight, LogOut, User, Lock, ShoppingCart, Heart } from 'lucide-react';
import { useStudentAchievements } from '../hooks/useStudentDashboard';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { achievements, loading, error } = useStudentAchievements(user?.id);
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Mock enrolled courses data
    const mockCourses = [
      {
        _id: '1',
        title: 'Introduction à la Programmation Python',
        thumbnail: null,
        progress: 65,
        totalLessons: 24,
        completedLessons: 16,
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        instructor: { name: 'Jean Dupont' }
      },
      {
        _id: '2',
        title: 'Structures de Données Avancées',
        thumbnail: null,
        progress: 30,
        totalLessons: 18,
        completedLessons: 5,
        lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        instructor: { name: 'Marie Martin' }
      }
    ];
    setEnrolledCourses(mockCourses);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/learn/${courseId}/lesson/intro`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div className="dashboard-layout">
        {/* Sidebar Panel */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-info">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="sidebar-username-wrapper">
              <div className="sidebar-username">{user?.firstName} {user?.lastName}</div>
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
            <button
              onClick={() => navigate('/cart')}
              className="sidebar-menu-btn"
            >
              <ShoppingCart size={18} />
              <span>Mon Panier</span>
            </button>
            <button
              onClick={() => navigate('/wishlist')}
              className="sidebar-menu-btn"
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
              style={{ marginTop: 'auto', color: 'var(--error-color)' }}
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
          ) : (
            <div>
              {/* Welcome Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                  Bienvenue, {user?.firstName} 👋
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>
                  Continuez votre parcours d'apprentissage
                </p>
              </div>

              {/* Gamification Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                <Card variant="default" padding="1.5rem">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Trophy size={28} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-color)' }}>
                        {achievements?.points || 1250}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Points totaux</div>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="1.5rem">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px',
                      background: '#FF6B35',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Flame size={28} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-color)' }}>
                        {achievements?.streak || 7}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Jours consécutifs</div>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="1.5rem">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Target size={28} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-color)' }}>
                        {achievements?.completedCourses || 3}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Cours terminés</div>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="1.5rem">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px',
                      background: 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock size={28} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-color)' }}>
                        {achievements?.totalHours || 24}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Heures d'apprentissage</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="student-grid-wrapper">
                <style>{`
                  @media (min-width: 992px) {
                    .student-grid-wrapper {
                      grid-template-columns: 2fr 1fr !important;
                    }
                  }
                `}</style>
                {/* Main Content */}
                <div>
                  {/* Continue Learning */}
                  <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ color: 'var(--secondary)' }}>Continuer l'apprentissage</h2>
                      <Link to="/courses" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Voir tout
                      </Link>
                    </div>

                    {enrolledCourses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <BookOpen size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                          Vous n'êtes inscrit à aucun cours
                        </p>
                        <Link to="/courses">
                          <Button variant="primary">Explorer le catalogue</Button>
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {enrolledCourses.map((course) => (
                          <div 
                            key={course._id}
                            style={{ 
                              padding: '1.5rem',
                              background: 'var(--bg-color)',
                              borderRadius: '12px',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              gap: '1.5rem',
                              alignItems: 'center',
                              flexWrap: 'wrap'
                            }}
                          >
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                            ) : (
                              <div style={{ 
                                width: '120px', 
                                height: '80px', 
                                background: 'var(--border-color)', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <BookOpen size={32} color="var(--secondary)" />
                              </div>
                            )}
                            
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                                {course.title}
                              </h3>
                              <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                                Par {course.instructor.name}
                              </p>
                              
                              {/* Progress Bar */}
                              <div style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                  <span>{course.completedLessons}/{course.totalLessons} leçons</span>
                                  <span>{course.progress}%</span>
                                </div>
                                <div style={{ 
                                  height: '6px', 
                                  background: 'var(--border-color)', 
                                  borderRadius: '3px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{ 
                                    height: '100%', 
                                    background: 'var(--primary)', 
                                    width: `${course.progress}%`,
                                    borderRadius: '3px'
                                  }} />
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '150px' }}>
                              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                                Dernier accès: {formatDate(course.lastAccessed)}
                              </p>
                              <Button 
                                variant="primary" 
                                size="small"
                                onClick={() => handleContinueCourse(course._id)}
                              >
                                Continuer
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Recent Activity */}
                  <Card variant="default" padding="2rem">
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Activité récente</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          background: 'var(--success-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Trophy size={20} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: 'var(--text-color)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            Badge obtenu: Apprenti Déterminé
                          </p>
                          <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                            Il y a 2 heures
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <BookOpen size={20} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: 'var(--text-color)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            Leçon complétée: Introduction aux boucles
                          </p>
                          <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                            Il y a 5 heures
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <TrendingUp size={20} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: 'var(--text-color)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            Quiz réussi: Variables et Types de Données
                          </p>
                          <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                            Hier
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Sidebar Stats Panel */}
                <div>
                  {/* Badges */}
                  <Card variant="elevated" padding="2rem" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Badges</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <Award size={28} color="#fff" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Premier Pas</p>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <Flame size={28} color="#fff" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Streak 7</p>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2196F3, #1565C0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <BookOpen size={28} color="#fff" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Étudiant</p>
                      </div>

                      <div style={{ textAlign: 'center', opacity: 0.4 }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <Award size={28} color="var(--secondary)" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>???</p>
                      </div>

                      <div style={{ textAlign: 'center', opacity: 0.4 }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <Award size={28} color="var(--secondary)" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>???</p>
                      </div>

                      <div style={{ textAlign: 'center', opacity: 0.4 }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem'
                        }}>
                          <Award size={28} color="var(--secondary)" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>???</p>
                      </div>
                    </div>
                  </Card>

                  {/* Weekly Goal */}
                  <Card variant="elevated" padding="2rem">
                    <h2 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Objectif hebdomadaire</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                      Complétez 5 leçons cette semaine
                    </p>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                        <span>3/5 leçons</span>
                        <span>60%</span>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        background: 'var(--border-color)', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'var(--success-color)', 
                          width: '60%',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                      2 leçons restantes pour atteindre votre objectif !
                    </p>
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
