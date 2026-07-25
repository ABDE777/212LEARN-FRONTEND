import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { Users, BookOpen, Folder, Settings, User, LogOut, FileText, Pencil, Trash2 } from 'lucide-react';
import {
  useAdminUsers,
  useAdminCourses,
  useAdminInstructors,
  useAdminCreateCourse,
  useAdminUpdateCourse,
  useAdminDeleteCourse,
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

function getAssignedInstructor(course) {
  const instructors = Array.isArray(course.instructors) ? course.instructors : [];

  const preferredInstructor =
    instructors.find((item) => {
      const role = (item.role || '').toLowerCase();
      return role === 'lead_instructor' || role === 'assistant_instructor' || role === 'instructor';
    }) ||
    instructors.find((item) => (item.role || '').toLowerCase() !== 'owner') ||
    instructors[0];

  return preferredInstructor?.user || course.instructor || null;
}

function getCourseInstructorLabel(course) {
  const assigned = getAssignedInstructor(course);
  if (!assigned) return 'Non assigné';
  return `${assigned.firstName || ''} ${assigned.lastName || ''}`.trim() || assigned.email || 'Instructeur';
}

function normalizeCourseForm(course) {
  return {
    title: course.title || '',
    description: course.description || '',
    categoryId: course.categoryId || course.category?.id || '',
    price: course.price ?? '',
    level: course.level || '',
    instructorId: getAssignedInstructor(course)?.id || '',
  };
}

function normalizeCategoryForm(category) {
  return {
    name: category.name || '',
    description: category.description || '',
    parentId: category.parentId || '',
  };
}

function AdminCourseCard({
  course,
  flatCategories,
  instructors,
  instructorsLoading,
  onPublish,
  publishLoading,
  onSave,
  saveLoading,
  saveError,
  onDelete,
  deleteLoading,
  isDraft = false,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => normalizeCourseForm(course));

  const resetForm = () => {
    setForm(normalizeCourseForm(course));
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(course.id, form);
    setEditing(false);
  };

  return (
    <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{course.title}</h3>
          <p style={{ marginBottom: '0.35rem', color: 'var(--secondary)' }}>
            Catégorie: <span style={{ fontWeight: 600 }}>{course.category?.name || 'Non définie'}</span>
          </p>
          <p style={{ marginBottom: '0.35rem', color: 'var(--secondary)' }}>
            Instructeur: <span style={{ fontWeight: 600 }}>{getCourseInstructorLabel(course)}</span>
          </p>
          <p style={{ marginBottom: '0.35rem', color: 'var(--secondary)' }}>
            Prix: <span style={{ fontWeight: 600 }}>{course.price ? `${course.price} MAD` : '0 MAD'}</span>
          </p>
          <p style={{ marginBottom: 0, color: 'var(--secondary)' }}>
            Statut:{' '}
            <span style={{ fontWeight: 600, color: course.status === 'published' ? 'var(--primary)' : '#b26a00' }}>
              {course.status}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              if (editing) {
                resetForm();
                return;
              }
              setEditing(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.9rem',
              background: editing ? '#f8f9fa' : 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Pencil size={16} />
            {editing ? 'Annuler' : 'Modifier'}
          </button>

          <button
            type="button"
            onClick={() => onDelete(course.id, course.title)}
            disabled={deleteLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.9rem',
              background: '#fff5f5',
              color: '#c62828',
              border: '1px solid #f1b5b5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Trash2 size={16} />
            {deleteLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>

      {course.description && !editing && (
        <p style={{ color: 'var(--secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>{course.description}</p>
      )}

      {editing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre</label>
            <input
              type="text"
              className="form-control"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Catégorie</label>
              <select
                className="form-control"
                required
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Prix (MAD)</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Niveau</label>
              <select
                className="form-control"
                value={form.level}
                onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
              >
                <option value="">-- Optionnel --</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Instructeur</label>
              <select
                className="form-control"
                value={form.instructorId}
                onChange={(e) => setForm((prev) => ({ ...prev, instructorId: e.target.value }))}
                disabled={instructorsLoading}
              >
                <option value="">-- Sélectionner un instructeur --</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName} ({instructor.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {saveError && (
            <div
              style={{
                color: '#721c24',
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              {saveError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={saveLoading}
              className="btn-primary"
              style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}
            >
              {saveLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#f8f9fa',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : isDraft ? (
        <button
          onClick={() => onPublish(course.id)}
          disabled={publishLoading}
          className="btn-primary"
          style={{ padding: '0.55rem 1rem', cursor: 'pointer' }}
        >
          {publishLoading ? 'Publication...' : 'Publier le cours'}
        </button>
      ) : null}
    </div>
  );
}

function AdminCategoryCard({ category, parentOptions, onSave, saveLoading, saveError, onDelete, deleteLoading }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => normalizeCategoryForm(category));

  const resetForm = () => {
    setForm(normalizeCategoryForm(category));
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(category.id, form);
    setEditing(false);
  };

  return (
    <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{category.name}</h3>
          <p style={{ color: 'var(--secondary)', marginBottom: '0.35rem' }}>
            {category.description || 'Aucune description disponible'}
          </p>
          {category.parentId && (
            <p style={{ color: 'var(--secondary)', marginBottom: 0 }}>
              Catégorie parente: <span style={{ fontWeight: 600 }}>{parentOptions.find((item) => item.id === category.parentId)?.label || category.parentId}</span>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              if (editing) {
                resetForm();
                return;
              }
              setEditing(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.9rem',
              background: editing ? '#f8f9fa' : 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Pencil size={16} />
            {editing ? 'Annuler' : 'Modifier'}
          </button>

          <button
            type="button"
            onClick={() => onDelete(category.id, category.name)}
            disabled={deleteLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.9rem',
              background: '#fff5f5',
              color: '#c62828',
              border: '1px solid #f1b5b5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Trash2 size={16} />
            {deleteLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom</label>
            <input
              type="text"
              className="form-control"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Catégorie parente</label>
            <select
              className="form-control"
              value={form.parentId}
              onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
            >
              <option value="">-- Aucune (Catégorie principale) --</option>
              {parentOptions
                .filter((item) => item.id !== category.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </div>

          {saveError && (
            <div
              style={{
                color: '#721c24',
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              {saveError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={saveLoading}
              className="btn-primary"
              style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}
            >
              {saveLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#f8f9fa',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {!editing && category.children && category.children.length > 0 && (
        <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>
            Sous-catégories :
          </p>
          {category.children.map((sub) => (
            <p key={sub.id} style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
              - {sub.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const { users, loading: usersLoading, error: usersError } = useAdminUsers();
  const { courses, loading: coursesLoading, error: coursesError, refreshCourses } = useAdminCourses();
  const { instructors, loading: instructorsLoading, error: instructorsError } = useAdminInstructors();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const { createCourse, loading: createCourseLoading } = useAdminCreateCourse();
  const { updateCourse, loading: updateCourseLoading, error: updateCourseError } = useAdminUpdateCourse();
  const { deleteCourse, loading: deleteCourseLoading, error: deleteCourseError } = useAdminDeleteCourse();
  const { publishCourse, loading: publishLoading, error: publishError } = usePublishCourse();
  const { user, logout } = useAuth();

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase();

    return users.filter((listedUser) => {
      const matchesRole = userRoleFilter === 'all' || (listedUser.role || '').toLowerCase() === userRoleFilter;
      const fullName = `${listedUser.firstName || ''} ${listedUser.lastName || ''}`.trim().toLowerCase();
      const email = (listedUser.email || '').toLowerCase();
      const id = (listedUser.id || '').toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        id.includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const draftCourses = useMemo(
    () => courses.filter((course) => (course.status || '').toLowerCase() === 'draft'),
    [courses]
  );
  const publishedCourses = useMemo(
    () => courses.filter((course) => (course.status || '').toLowerCase() !== 'draft'),
    [courses]
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState(null);
  const [categorySuccess, setCategorySuccess] = useState('');

  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategoryId, setCourseCategoryId] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [courseInstructorId, setCourseInstructorId] = useState('');
  const [createCourseError, setCreateCourseError] = useState(null);
  const [createCourseSuccess, setCreateCourseSuccess] = useState(false);
  const [courseActionSuccess, setCourseActionSuccess] = useState('');

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);
    setCategorySuccess('');
    try {
      const payload = { name: catName.trim() };
      if (catDesc.trim()) payload.description = catDesc.trim();
      if (catParentId) payload.parentId = catParentId;
      await createCategory(payload);
      setCreateSuccess(true);
      setCategorySuccess('Catégorie créée avec succès.');
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

  const handleUpdateCategory = async (categoryId, form) => {
    setCategoryActionError(null);
    setCategorySuccess('');
    try {
      const payload = { name: form.name.trim() };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.parentId) payload.parentId = form.parentId;
      await updateCategory(categoryId, payload);
      setCategorySuccess('Catégorie mise à jour avec succès.');
    } catch (err) {
      setCategoryActionError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la mise à jour de la catégorie.'
      );
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const confirmed = window.confirm(`Supprimer la catégorie "${categoryName}" ?`);
    if (!confirmed) return;

    setCategoryActionError(null);
    setCategorySuccess('');
    try {
      await deleteCategory(categoryId);
      setCategorySuccess('Catégorie supprimée avec succès.');
    } catch (err) {
      setCategoryActionError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la suppression de la catégorie.'
      );
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateCourseError(null);
    setCreateCourseSuccess(false);
    setCourseActionSuccess('');
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
      setCourseActionSuccess('Cours créé avec succès.');
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

  const handleUpdateCourse = async (courseId, form) => {
    setCourseActionSuccess('');
    try {
      const payload = {
        title: form.title.trim(),
        categoryId: form.categoryId,
        price: parseFloat(form.price),
      };

      if (form.description.trim()) payload.description = form.description.trim();
      if (form.level) payload.level = form.level;
      if (form.instructorId) payload.instructorId = form.instructorId;

      await updateCourse(courseId, payload);
      await refreshCourses();
      setCourseActionSuccess('Cours mis à jour avec succès.');
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = window.confirm(`Supprimer le cours "${courseTitle}" ?`);
    if (!confirmed) return;

    setCourseActionSuccess('');
    try {
      await deleteCourse(courseId);
      await refreshCourses();
      setCourseActionSuccess('Cours supprimé avec succès.');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishCourse = async (courseId) => {
    setCourseActionSuccess('');
    try {
      await publishCourse(courseId);
      await refreshCourses();
      setCourseActionSuccess('Le cours a été publié avec succès.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div className="dashboard-layout">
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
              onClick={() => setActiveTab('drafts')}
              className={`sidebar-menu-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Drafts</span>
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

        <main className="dashboard-main-content">
          {activeTab === 'profile' ? (
            <ProfileEditForm />
          ) : (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'users' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>User Management</h2>
                      <p style={{ color: 'var(--secondary)' }}>Filtrer les utilisateurs par rôle ou rechercher par nom, email ou ID.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un utilisateur..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ minWidth: '240px' }}
                      />
                      <select
                        className="form-control"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        style={{ minWidth: '180px' }}
                      >
                        <option value="all">Tous les rôles</option>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {usersLoading && <LoadingSpinner />}
                  {usersError && <p style={{ color: 'var(--error-color)' }}>{usersError}</p>}
                  {!usersLoading && !usersError && filteredUsers.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>Aucun utilisateur ne correspond au filtre.</p>
                  )}
                  {!usersLoading && !usersError && filteredUsers.length > 0 && (
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-color)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Nom</th>
                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Rôle</th>
                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((listedUser) => (
                            <tr key={listedUser.id}>
                              <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: 600 }}>
                                {[listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || '—'}
                              </td>
                              <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                                {listedUser.email || '—'}
                              </td>
                              <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', textTransform: 'capitalize' }}>
                                {listedUser.role || '—'}
                              </td>
                              <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                {listedUser.id}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Course Management</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem' }}>
                        L'admin peut modifier et supprimer les cours à tout moment depuis cette section.
                      </p>
                    </div>
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

                  {courseActionSuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {courseActionSuccess}
                    </div>
                  )}
                  {publishError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {publishError}
                    </div>
                  )}
                  {deleteCourseError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {deleteCourseError}
                    </div>
                  )}

                  {showCreateCourseForm && (
                    <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '2rem', background: '#fcfcfc' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Nouveau cours</h3>
                      {createCourseSuccess && (
                        <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          Cours créé et assigné avec succès !
                        </div>
                      )}
                      {createCourseError && (
                        <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          {createCourseError}
                        </div>
                      )}
                      {instructorsError && (
                        <div style={{ color: '#856404', background: '#fff3cd', border: '1px solid #ffeeba', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          {instructorsError}
                        </div>
                      )}
                      <form onSubmit={handleCreateCourse}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Titre *</label>
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
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Instructeur *</label>
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
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Catégorie *</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Prix (MAD) *</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Niveau</label>
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
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
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
                  {!coursesLoading && !coursesError && publishedCourses.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>Aucun cours publié trouvé.</p>
                  )}
                  {!coursesLoading && !coursesError && publishedCourses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {publishedCourses.map((course) => (
                        <AdminCourseCard
                          key={course.id}
                          course={course}
                          flatCategories={flatCategories}
                          instructors={instructors}
                          instructorsLoading={instructorsLoading}
                          onPublish={handlePublishCourse}
                          publishLoading={publishLoading}
                          onSave={handleUpdateCourse}
                          saveLoading={updateCourseLoading}
                          saveError={updateCourseError}
                          onDelete={handleDeleteCourse}
                          deleteLoading={deleteCourseLoading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'drafts' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Draft Courses</h2>
                    <p style={{ color: 'var(--secondary)' }}>
                      Tous les cours en statut draft sont regroupés ici. L'admin peut les modifier, les supprimer puis les publier.
                    </p>
                  </div>

                  {courseActionSuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {courseActionSuccess}
                    </div>
                  )}
                  {publishError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {publishError}
                    </div>
                  )}
                  {deleteCourseError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {deleteCourseError}
                    </div>
                  )}

                  {coursesLoading && <LoadingSpinner />}
                  {coursesError && <p style={{ color: 'var(--error-color)' }}>{coursesError}</p>}
                  {!coursesLoading && !coursesError && draftCourses.length === 0 && (
                    <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#fff8e1', border: '1px solid #f3d27a', color: '#8a6d1f' }}>
                      Aucun cours en brouillon n'a été chargé.
                      <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                        Si vous savez qu'il existe des drafts, vérifiez que votre session admin est bien active, car l'API n'autorise pas leur lecture en mode public.
                      </div>
                    </div>
                  )}
                  {!coursesLoading && !coursesError && draftCourses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {draftCourses.map((course) => (
                        <AdminCourseCard
                          key={course.id}
                          course={course}
                          flatCategories={flatCategories}
                          instructors={instructors}
                          instructorsLoading={instructorsLoading}
                          onPublish={handlePublishCourse}
                          publishLoading={publishLoading}
                          onSave={handleUpdateCourse}
                          saveLoading={updateCourseLoading}
                          saveError={updateCourseError}
                          onDelete={handleDeleteCourse}
                          deleteLoading={deleteCourseLoading}
                          isDraft
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Category Management</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem' }}>
                        L'admin peut créer, modifier et supprimer les catégories quand il veut.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      {showAddForm ? 'Annuler' : '+ Ajouter une catégorie'}
                    </button>
                  </div>

                  {categorySuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {categorySuccess}
                    </div>
                  )}
                  {categoryActionError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {categoryActionError}
                    </div>
                  )}

                  {showAddForm && (
                    <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '2rem', background: '#fcfcfc' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Nouvelle catégorie</h3>
                      {createSuccess && (
                        <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          Catégorie créée avec succès !
                        </div>
                      )}
                      {createError && (
                        <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {categories.map((category) => (
                        <AdminCategoryCard
                          key={category.id}
                          category={category}
                          parentOptions={flatCategories}
                          onSave={handleUpdateCategory}
                          saveLoading={categoriesLoading}
                          saveError={categoryActionError}
                          onDelete={handleDeleteCategory}
                          deleteLoading={categoriesLoading}
                        />
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
