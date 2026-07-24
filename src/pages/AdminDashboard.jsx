import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Users, BookOpen, Folder, Settings, User, LogOut } from 'lucide-react';
import {
  useAdminUsers,
  useAdminCourses,
  useAdminInstructors,
  useAdminCreateCourse,
  usePublishCourse,
} from '../hooks/useAdminData';
import { useCategories } from '../hooks/useCategories';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';

function flattenCategories(categories, prefix = '') {
  return categories.flatMap((cat) => [
    { id: cat.id, label: prefix ? `${prefix} > ${cat.name}` : cat.name },
    ...(cat.children ? flattenCategories(cat.children, prefix ? `${prefix} > ${cat.name}` : cat.name) : []),
  ]);
}

function getCourseInstructorLabel(course) {
  const assigned = course.instructors?.[0]?.user || course.instructor;
  if (!assigned) return 'Non assigné';
  return `${assigned.firstName || ''} ${assigned.lastName || ''}`.trim() || assigned.email || 'Instructeur';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const { users, loading: usersLoading, error: usersError } = useAdminUsers();
  const { courses, loading: coursesLoading, error: coursesError, refreshCourses } = useAdminCourses();
  const { instructors, loading: instructorsLoading, error: instructorsError } = useAdminInstructors();
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory } = useCategories();
  const { createCourse, loading: createCourseLoading } = useAdminCreateCourse();
  const { publishCourse, loading: publishLoading } = usePublishCourse();
  const { user, logout } = useAuth();

  const flatCategories = flattenCategories(categories);

  const [showAddForm, setShowAddForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategoryId, setCourseCategoryId] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [courseInstructorId, setCourseInstructorId] = useState('');
  const [createCourseError, setCreateCourseError] = useState(null);
  const [createCourseSuccess, setCreateCourseSuccess] = useState(false);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);
    try {
      const payload = { name: catName };
      if (catDesc) payload.description = catDesc;
      if (catParentId) payload.parentId = catParentId;
      await createCategory(payload);
      setCreateSuccess(true);
      setCatName('');
      setCatDesc('');
      setCatParentId('');
      setTimeout(() => {
        setShowAddForm(false);
        setCreateSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la création de la catégorie.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateCourseError(null);
    setCreateCourseSuccess(false);
    try {
      const payload = {
        title: courseTitle.trim(),
        categoryId: courseCategoryId,
        price: parseFloat(coursePrice),
        instructorId: courseInstructorId,
      };
      if (courseDescription.trim()) payload.description = courseDescription.trim();
      if (courseLevel) payload.level = courseLevel;

      await createCourse(payload);
      setCreateCourseSuccess(true);
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategoryId('');
      setCoursePrice('');
      setCourseLevel('');
      setCourseInstructorId('');
      await refreshCourses();
      setTimeout(() => {
        setShowCreateCourseForm(false);
        setCreateCourseSuccess(false);
      }, 1500);
    } catch (err) {
      setCreateCourseError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la création du cours.'
      );
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await publishCourse(courseId);
      await refreshCourses();
    } catch (err) {
      console.error(err);
    }
  };

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
              <span className="sidebar-userrole">Admin</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('users')}
              className={`sidebar-menu-btn ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-menu-btn ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`sidebar-menu-btn ${activeTab === 'categories' ? 'active' : ''}`}
            >
              <Folder size={18} />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`sidebar-menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-menu-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
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
          ) : (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'users' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>User Management</h2>
                  {usersLoading && <LoadingSpinner />}
                  {usersError && <p style={{ color: 'var(--error-color)' }}>{usersError}</p>}
                  {!usersLoading && !usersError && users.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No users found.</p>
                  )}
                  {!usersLoading && !usersError && users.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {users.map((user) => (
                        <div key={user.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                            {user.firstName} {user.lastName}
                          </h3>
                          <p style={{ marginBottom: '0.25rem', color: 'var(--secondary)' }}>{user.email}</p>
                          <p style={{ color: 'var(--secondary)' }}>
                            Role: <span style={{ fontWeight: 600 }}>{user.role}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Course Management</h2>
                    <button
                      onClick={() => {
                        setShowCreateCourseForm(!showCreateCourseForm);
                        setCreateCourseError(null);
                        setCreateCourseSuccess(false);
                      }}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      {showCreateCourseForm ? 'Annuler' : '+ Créer un cours'}
                    </button>
                  </div>

                  {showCreateCourseForm && (
                    <div style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      marginBottom: '2rem',
                      background: '#fcfcfc',
                    }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                        Nouveau cours
                      </h3>
                      {createCourseSuccess && (
                        <div style={{
                          color: '#155724',
                          background: '#d4edda',
                          border: '1px solid #c3e6cb',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem',
                        }}>
                          Cours créé et assigné avec succès !
                        </div>
                      )}
                      {createCourseError && (
                        <div style={{
                          color: '#721c24',
                          background: '#f8d7da',
                          border: '1px solid #f5c6cb',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem',
                        }}>
                          {createCourseError}
                        </div>
                      )}
                      {instructorsError && (
                        <div style={{
                          color: '#856404',
                          background: '#fff3cd',
                          border: '1px solid #ffeeba',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem',
                        }}>
                          {instructorsError}
                        </div>
                      )}
                      <form onSubmit={handleCreateCourse}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            Titre *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            placeholder="Ex: React from Zero to Hero"
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            Instructeur *
                          </label>
                          <select
                            className="form-control"
                            required
                            value={courseInstructorId}
                            onChange={(e) => setCourseInstructorId(e.target.value)}
                            disabled={instructorsLoading}
                          >
                            <option value="">
                              {instructorsLoading ? 'Chargement des instructeurs...' : '-- Sélectionner un instructeur --'}
                            </option>
                            {instructors.map((instructor) => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.firstName} {instructor.lastName} ({instructor.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            Catégorie *
                          </label>
                          <select
                            className="form-control"
                            required
                            value={courseCategoryId}
                            onChange={(e) => setCourseCategoryId(e.target.value)}
                            disabled={categoriesLoading}
                          >
                            <option value="">
                              {categoriesLoading ? 'Chargement...' : '-- Sélectionner une catégorie --'}
                            </option>
                            {flatCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                              Prix (MAD) *
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              required
                              min="0"
                              step="0.01"
                              placeholder="299.99"
                              value={coursePrice}
                              onChange={(e) => setCoursePrice(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                              Niveau
                            </label>
                            <select
                              className="form-control"
                              value={courseLevel}
                              onChange={(e) => setCourseLevel(e.target.value)}
                            >
                              <option value="">-- Optionnel --</option>
                              <option value="beginner">Débutant</option>
                              <option value="intermediate">Intermédiaire</option>
                              <option value="advanced">Avancé</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            Description
                          </label>
                          <textarea
                            className="form-control"
                            placeholder="Description du cours..."
                            rows={3}
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={createCourseLoading || instructorsLoading || !courseInstructorId}
                          className="btn-primary"
                          style={{ padding: '0.6rem 1.5rem', cursor: 'pointer' }}
                        >
                          {createCourseLoading ? 'Création...' : 'Créer le cours'}
                        </button>
                      </form>
                    </div>
                  )}

                  {coursesLoading && <LoadingSpinner />}
                  {coursesError && <p style={{ color: 'var(--error-color)' }}>{coursesError}</p>}
                  {!coursesLoading && !coursesError && courses.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No courses found.</p>
                  )}
                  {!coursesLoading && !coursesError && courses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {courses.map((course) => (
                        <div key={course.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{course.title}</h3>
                          <p style={{ marginBottom: '0.25rem', color: 'var(--secondary)' }}>
                            Instructeur: <span style={{ fontWeight: 600 }}>{getCourseInstructorLabel(course)}</span>
                          </p>
                          <p style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                            Status: <span style={{ fontWeight: 600, color: course.status === 'published' ? 'var(--primary)' : 'var(--secondary)' }}>
                              {course.status}
                            </span>
                          </p>
                          {course.status === 'draft' && (
                            <button
                              onClick={() => handlePublishCourse(course.id)}
                              disabled={publishLoading}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              {publishLoading ? 'Publishing...' : 'Publish Course'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Category Management</h2>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      {showAddForm ? 'Annuler' : '+ Ajouter une catégorie'}
                    </button>
                  </div>

                  {showAddForm && (
                    <div style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      marginBottom: '2rem',
                      background: '#fcfcfc'
                    }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Nouvelle catégorie</h3>
                      {createSuccess && (
                        <div style={{
                          color: '#155724',
                          background: '#d4edda',
                          border: '1px solid #c3e6cb',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          Catégorie créée avec succès !
                        </div>
                      )}
                      {createError && (
                        <div style={{
                          color: '#721c24',
                          background: '#f8d7da',
                          border: '1px solid #f5c6cb',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          {createError}
                        </div>
                      )}
                      <form onSubmit={handleCreateCategory}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Nom *</label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            placeholder="Ex: Machine Learning"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                          <textarea
                            className="form-control"
                            placeholder="Description de la catégorie..."
                            rows={3}
                            value={catDesc}
                            onChange={(e) => setCatDesc(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Catégorie Parente (facultatif)</label>
                          <select
                            className="form-control"
                            value={catParentId}
                            onChange={(e) => setCatParentId(e.target.value)}
                          >
                            <option value="">-- Aucune (Catégorie principale) --</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={createLoading}
                          className="btn-primary"
                          style={{ padding: '0.6rem 1.5rem', cursor: 'pointer' }}
                        >
                          {createLoading ? 'Création...' : 'Créer la catégorie'}
                        </button>
                      </form>
                    </div>
                  )}

                  {categoriesLoading && <LoadingSpinner />}
                  {categoriesError && <p style={{ color: 'var(--error-color)' }}>{categoriesError}</p>}
                  {!categoriesLoading && !categoriesError && categories.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No categories found.</p>
                  )}
                  {!categoriesLoading && !categoriesError && categories.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {categories.map((category) => (
                        <div key={category.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{category.name}</h3>
                          <p style={{ color: 'var(--secondary)' }}>{category.description || 'No description available'}</p>
                          {category.children && category.children.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                Subcategories:
                              </p>
                              {category.children.map((sub) => (
                                <p key={sub.id} style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                  - {sub.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Platform Settings</h2>
                  <p style={{ color: 'var(--secondary)' }}>Coming soon: Settings will appear here</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
