import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BookOpen, Plus, Video, Users, User, LogOut,
  ChevronRight, ChevronLeft,
  HelpCircle, X, BarChart3, Tag, MessageSquare,
} from 'lucide-react';
import { useInstructorCourses, useCreateCourse } from '../hooks/useInstructorCourses';
import { useInstructorAnalytics } from '../hooks/useInstructorAnalytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import api from '../services/api';
import QuizzesTab from '../components/instructor/QuizzesTab';
import AnalyticsTab from '../components/instructor/AnalyticsTab';
import CouponsTab from '../components/instructor/CouponsTab';
import StudentsTab from '../components/instructor/StudentsTab';
import MeetingsTab from '../components/instructor/MeetingsTab';
import InstructorGroupChatSection from '../components/instructor/InstructorGroupChatSection';
import ModalPortal from '../components/ModalPortal';

/* ─── Instructor Group Chat Section ───────────────────────────── */
/* ─── helpers ─────────────────────────────── */
// GET /categories returns a nested tree (roots with children[]). Flatten it so
// the course-category dropdown lists parents AND sub-categories, indented and
// all selectable — same behaviour as the admin course form.
function flattenCategories(categories = [], level = 0) {
  return categories.flatMap((cat) => {
    const indent = '    '.repeat(level);
    const prefix = level > 0 ? `${indent}└─ ` : '📁 ';
    return [
      { id: cat.id, name: cat.name, level, selectLabel: `${prefix}${cat.name}` },
      ...(cat.children ? flattenCategories(cat.children, level + 1) : []),
    ];
  });
}


/* ─── Main dashboard ──────────────────────── */
export default function InstructorDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTabState] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return tabFromUrl;
    const tabFromStorage = localStorage.getItem('instructor_active_tab');
    if (tabFromStorage) return tabFromStorage;
    return 'courses';
  });

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    localStorage.setItem('instructor_active_tab', newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  // Sync the active tab with the URL so navigating here via ?tab=… (e.g. from
  // the bottom dock menu) switches tabs even when already on this page.
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) {
      setActiveTabState(t);
      localStorage.setItem('instructor_active_tab', t);
    }
  }, [searchParams]);

  const { courses, loading, error } = useInstructorCourses();
  const { createCourse, loading: createLoading, error: createError } = useCreateCourse();
  const { logout } = useAuth();
  const { revenueData, studentsData, completionData, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useInstructorAnalytics();

  const [createCourseDrawerOpen, setCreateCourseDrawerOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCategoryId, setNewCourseCategoryId] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('');
  const [, setNewCourseThumbnailFile] = useState(null);
  const [newCourseThumbnailUrl, setNewCourseThumbnailUrl] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await api.get('/categories');
        const allCategories = response.data?.data?.categories || response.data?.data || [];
        // Include sub-categories (the API nests them under each parent's children).
        setCategories(flattenCategories(allCategories));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCourseThumbnailFile(file);
      // Upload immediately to Cloudinary
      uploadThumbnailToCloudinary(file);
    }
  };

  const uploadThumbnailToCloudinary = async (file) => {
    setUploadingThumbnail(true);
    try {
      // Get signed upload from backend
      const signResponse = await api.post('/uploads/cloudinary-sign', {
        type: 'image',
        filename: file.name,
        mimetype: file.type,
      });

      const { uploadUrl, formFields } = signResponse.data.data;

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', formFields.api_key);
      formData.append('timestamp', formFields.timestamp);
      formData.append('signature', formFields.signature);
      formData.append('folder', formFields.folder);
      formData.append('public_id', formFields.public_id);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      
      if (uploadResult.secure_url) {
        setNewCourseThumbnailUrl(uploadResult.secure_url);
      } else {
        console.error('Upload failed:', uploadResult);
      }
    } catch (err) {
      console.error('Failed to upload thumbnail:', err);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const resetCourseForm = () => {
    setNewCourseTitle('');
    setNewCourseDescription('');
    setNewCourseCategoryId('');
    setNewCoursePrice('');
    setNewCourseLevel('');
    setNewCourseThumbnailFile(null);
    setNewCourseThumbnailUrl('');
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newCourseTitle,
        categoryId: newCourseCategoryId,
        price: parseFloat(newCoursePrice) || 0,
      };
      if (newCourseDescription.trim()) payload.description = newCourseDescription.trim();
      if (newCourseLevel) payload.level = newCourseLevel;
      if (newCourseThumbnailUrl) payload.thumbnail = newCourseThumbnailUrl;
      
      const course = await createCourse(payload);
      resetCourseForm();
      setCreateCourseDrawerOpen(false);
      navigate(`/instructor/courses/${course.id}/manage`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseCreateCourseDrawer = () => {
    resetCourseForm();
    setCreateCourseDrawerOpen(false);
  };

  const TABS = [
    { key: 'courses',   icon: <BookOpen size={18} />,  label: 'Mes cours' },
    { key: 'chat',      icon: <MessageSquare size={18} />, label: 'Chat Groupe (IA)' },
    { key: 'analytics', icon: <BarChart3 size={18} />,   label: 'Analytics' },
    { key: 'quizzes',   icon: <HelpCircle size={18} />, label: 'Quiz' },
    { key: 'meetings',  icon: <Video size={18} />,      label: 'Sessions Live' },
    { key: 'students',  icon: <Users size={18} />,      label: 'Étudiants' },
    { key: 'coupons',   icon: <Tag size={18} />,        label: 'Coupons' },
    { key: 'profile',   icon: <User size={18} />,       label: 'Mon profil' },
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar
        extraDockOptions={TABS.map((t) => ({ label: t.label, Icon: t.icon, onClick: () => setActiveTab(t.key) }))}
      />
      <div className="dashboard-layout">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle-btn"
            title={sidebarCollapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <nav className="sidebar-menu">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`sidebar-menu-btn ${activeTab === t.key ? 'active' : ''}`}
                title={t.label}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color)' }}
              title="Déconnexion"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        <main className="dashboard-main-content">
          {activeTab === 'profile' ? (
            <div key="profile" className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <ProfileEditForm />
              <ChangePasswordForm />
            </div>
          ) : (
            <div key={activeTab} className="tab-panel" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>

              {/* Group Chat */}
              {activeTab === 'chat' && <InstructorGroupChatSection />}

              {/* My Courses */}
              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Mes cours</h2>
                    <button
                      onClick={() => setCreateCourseDrawerOpen(true)}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                      <Plus size={18} /> Créer un cours
                    </button>
                  </div>

                  {/* Search and Filter */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <input
                        type="text"
                        placeholder="Rechercher un cours..."
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                    <div style={{ minWidth: '150px' }}>
                      <select
                        value={courseStatusFilter}
                        onChange={(e) => setCourseStatusFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.9rem',
                        }}
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="published">Publié</option>
                        <option value="draft">Brouillon</option>
                      </select>
                    </div>
                  </div>

                  {loading && <LoadingSpinner />}
                  {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
                  {!loading && !error && courses.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>Vous n'avez pas encore de cours.</p>
                  )}
                  {!loading && !error && courses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {courses
                        .filter(course => {
                          const matchesSearch = course.title.toLowerCase().includes(courseSearchTerm.toLowerCase());
                          const matchesStatus = courseStatusFilter === 'all' || course.status === courseStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map(course => (
                        <div key={course.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{course.title}</h3>
                          <p style={{ marginBottom: '0.35rem', color: 'var(--secondary)' }}>
                            Statut : <span style={{ fontWeight: 600, color: course.status === 'published' ? 'var(--success-color)' : '#b26a00' }}>
                              {course.status === 'published' ? 'Publié' : 'Brouillon'}
                            </span>
                          </p>
                          <p style={{ color: 'var(--secondary)', marginBottom: '0.35rem' }}>
                            {course._count?.enrollments || course.enrolledCount || 0} étudiants inscrits
                          </p>
                          {course.price && (
                            <p style={{ color: 'var(--text-color)', fontWeight: 600, marginBottom: '1rem' }}>
                              {course.price} MAD
                            </p>
                          )}
                          <button
                            onClick={() => navigate(`/instructor/courses/${course.id}/manage`)}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', width: '100%', cursor: 'pointer' }}
                          >
                            Gérer le cours
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}


              {/* Analytics */}
              {activeTab === 'analytics' && (
                <AnalyticsTab
                  revenueData={revenueData}
                  studentsData={studentsData}
                  completionData={completionData}
                  loading={analyticsLoading}
                  error={analyticsError}
                  refetch={refetchAnalytics}
                />
              )}

              {/* Meetings */}
              {activeTab === 'meetings' && (
                <MeetingsTab courses={courses} />
              )}

              {/* Students */}
              {activeTab === 'students' && (
                <StudentsTab courses={courses} />
              )}

              {/* Quizzes */}
              {activeTab === 'quizzes' && (
                <QuizzesTab courses={courses} />
              )}

              {/* Coupons */}
              {activeTab === 'coupons' && (
                <CouponsTab courses={courses} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Course Drawer */}
      {createCourseDrawerOpen && (
        <ModalPortal>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => e.target === e.currentTarget && handleCloseCreateCourseDrawer()}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              background: '#fff',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              position: 'relative',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
                  Créer un nouveau cours
                </h2>
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  Ajoutez un cours au catalogue 212Learn
                </p>
              </div>
              <button
                onClick={handleCloseCreateCourseDrawer}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--secondary)',
                  padding: '0.4rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              {createError && (
                <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateCourse}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Titre du cours *</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                    required
                    placeholder="Ex: React from Zero to Hero"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
                  <textarea
                    className="form-control"
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    rows={3}
                    placeholder="Description détaillée du cours..."
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Prix (MAD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                      required
                      placeholder="0 pour Gratuit"
                      value={newCoursePrice}
                      onChange={(e) => setNewCoursePrice(e.target.value)}
                      disabled={newCoursePrice === '0'}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newCoursePrice === '0'}
                        onChange={(e) => setNewCoursePrice(e.target.checked ? '0' : '')}
                      />
                      Cours gratuit
                    </label>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Niveau</label>
                    <select
                      className="form-control"
                      style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                      value={newCourseLevel}
                      onChange={(e) => setNewCourseLevel(e.target.value)}
                    >
                      <option value="">-- Optionnel --</option>
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Catégorie *</label>
                  <select
                    className="form-control"
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    required
                    value={newCourseCategoryId}
                    onChange={(e) => setNewCourseCategoryId(e.target.value)}
                    disabled={categoriesLoading}
                  >
                    <option value="">{categoriesLoading ? 'Chargement...' : '-- Sélectionner une catégorie --'}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.selectLabel || cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Image de couverture</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleThumbnailChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    disabled={uploadingThumbnail}
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                  />
                  {uploadingThumbnail && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                      Téléchargement en cours...
                    </p>
                  )}
                  {newCourseThumbnailUrl && !uploadingThumbnail && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={newCourseThumbnailUrl}
                        alt="Aperçu"
                        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--success-color)', marginTop: '0.3rem' }}>
                        Image téléchargée avec succès
                      </p>
                    </div>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.3rem' }}>
                    Formats acceptés: JPG, PNG, GIF, WebP (max 10 MB)
                  </p>
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: '1.25rem 2rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.75rem',
                background: '#fafafa',
              }}
            >
              <button
                onClick={handleCreateCourse}
                disabled={createLoading || !newCourseCategoryId}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {createLoading ? 'Création en cours...' : 'Créer le cours'}
              </button>
              <button
                type="button"
                onClick={handleCloseCreateCourseDrawer}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--secondary)',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Keyframe for pulse dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
