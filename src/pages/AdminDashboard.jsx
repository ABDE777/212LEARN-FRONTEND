import { useMemo, useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { Users, BookOpen, Folder, Settings, User, LogOut, FileText, Pencil, Trash2, BarChart3, TrendingUp, DollarSign, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight, RotateCcw, Lock, Plus, Mail, X, Loader, Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWafacash } from '../hooks/useWafacash';
import {
  useAdminUsers,
  useAdminCourses,
  useAdminInstructors,
  useAdminCreateCourse,
  useAdminUpdateCourse,
  useAdminDeleteCourse,
  usePublishCourse,
  usePendingKyc,
} from '../hooks/useAdminData';
import { useCategories } from '../hooks/useCategories';
import { useAdminStats } from '../hooks/useAdminStats';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';

function AdminStatsTab() {
  const { stats, loading, error } = useAdminStats();
  const { users, loading: usersLoading } = useAdminUsers();
  const { courses, loading: coursesLoading } = useAdminCourses();
  const { categories, loading: categoriesLoading } = useCategories();

  const isLoading = loading || usersLoading || coursesLoading || categoriesLoading;

  const derivedStats = useMemo(() => {
    if (stats) return stats;
    if (isLoading) return null;
    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalCategories: categories.length,
      totalRevenue: 0,
      activeCourses: courses.filter(c => c.status === 'published').length,
      draftCourses: courses.filter(c => c.status === 'draft').length,
      students: users.filter(u => u.role === 'student').length,
      instructors: users.filter(u => u.role === 'instructor').length,
      admins: users.filter(u => u.role === 'admin').length,
    };
  }, [stats, users, courses, categories, isLoading]);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Statistiques de la plateforme</h2>
      <p style={{ color: 'var(--secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Vue d'ensemble de l'activité et des performances de 212LEARN.
      </p>

      {isLoading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!isLoading && !error && derivedStats && (
        <>
          {/* Top-level KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Utilisateurs', value: derivedStats.totalUsers ?? 0, icon: <Users size={22} />, color: '#2D8CFF', bg: '#e8f4fd' },
              { label: 'Cours publiés', value: derivedStats.activeCourses ?? 0, icon: <BookOpen size={22} />, color: 'var(--primary)', bg: 'rgba(193,101,47,0.08)' },
              { label: 'Cours brouillons', value: derivedStats.draftCourses ?? 0, icon: <FileText size={22} />, color: '#b26a00', bg: '#fff8e1' },
              { label: 'Étudiants', value: derivedStats.students ?? 0, icon: <Users size={22} />, color: 'var(--accent)', bg: 'rgba(193,101,47,0.06)' },
              { label: 'Instructeurs', value: derivedStats.instructors ?? 0, icon: <TrendingUp size={22} />, color: '#34A853', bg: '#e8f5e9' },
              { label: 'Catégories', value: derivedStats.totalCategories ?? 0, icon: <Folder size={22} />, color: '#6264A7', bg: '#ede7f6' },
              { label: 'Revenu total', value: `${derivedStats.totalRevenue ?? 0} MAD`, icon: <DollarSign size={22} />, color: '#27ae60', bg: '#e8f5e9' },
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: '#fff',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color,
                  }}>
                    {item.icon}
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.2rem' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Role breakdown table */}
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>Répartition des utilisateurs</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>Rôle</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>% du total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Étudiants', count: derivedStats.students ?? 0 },
                  { role: 'Instructeurs', count: derivedStats.instructors ?? 0 },
                  { role: 'Administrateurs', count: derivedStats.admins ?? 0 },
                ].map((row, idx) => {
                  const total = derivedStats.totalUsers || 1;
                  const pct = ((row.count / total) * 100).toFixed(1);
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-color)' }}>{row.role}</td>
                      <td style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>{row.count}</td>
                      <td style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: 'var(--primary)', transition: 'width 0.3s' }} />
                          </div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function flattenCategories(categories, prefix = '') {
  return categories.flatMap((cat) => [
    { id: cat.id, label: prefix ? `${prefix} > ${cat.name}` : cat.name },
    ...(cat.children ? flattenCategories(cat.children, prefix ? `${prefix} > ${cat.name}` : cat.name) : []),
  ]);
}

function getAssignedInstructor(course) {
  if (course.formateur) return course.formateur;

  const instructors = Array.isArray(course.instructors) ? course.instructors : [];

  const preferredInstructor =
    instructors.find((item) => {
      const role = (item.role || '').toLowerCase();
      return role === 'lead_instructor' || role === 'assistant_instructor' || role === 'instructor';
    }) ||
    instructors.find((item) => (item.role || '').toLowerCase() !== 'owner') ||
    instructors[0];

  if (preferredInstructor?.user) return preferredInstructor.user;
  if (course.instructor) return course.instructor;
  if (course.formateurId) return { id: course.formateurId };
  return null;
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

function WafacashTab() {
  const { getPendingPayments, verifyPayment, loading, error } = useWafacash();
  const [payments, setPayments] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState(null);
  const [notes, setNotes] = useState({});
  const [actionMsg, setActionMsg] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadPayments = useCallback(async () => {
    try {
      const resData = await getPendingPayments();
      const rawPayments = resData?.payments || resData?.data?.payments || resData || [];
      setPayments(Array.isArray(rawPayments) ? rawPayments : []);
    } catch (err) {
      console.error('Failed to load pending payments', err);
    }
  }, [getPendingPayments]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleVerify = async (paymentId, action) => {
    setVerifyLoading(paymentId + action);
    setActionMsg(null);
    try {
      await verifyPayment(paymentId, action, notes[paymentId] || '');
      setActionMsg({
        type: 'success',
        text: action === 'approve' ? 'Paiement approuvé ! L\'accès au cours est activé.' : 'Paiement rejeté.',
      });
      await loadPayments();
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de traiter cette action.',
      });
    } finally {
      setVerifyLoading(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      WAITING_VERIFICATION: { bg: '#fff8e1', color: '#b26a00', icon: <Clock size={14} />, label: 'En attente' },
      PENDING: { bg: '#e8f4fd', color: '#2D8CFF', icon: <Clock size={14} />, label: 'Pending' },
      PAID: { bg: '#e8f5e9', color: '#27ae60', icon: <CheckCircle size={14} />, label: 'Payé' },
      REJECTED: { bg: '#ffebee', color: '#c62828', icon: <XCircle size={14} />, label: 'Rejeté' },
    };
    const s = styles[status] || { bg: '#f5f5f5', color: '#666', icon: null, label: status };
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Photo Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: 700 }}>Preuve de paiement (Reçu Wafacash)</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--secondary)' }}
              >
                <XCircle size={24} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', textAlign: 'center', background: '#f8fafc' }}>
              <img
                src={selectedReceipt}
                alt="Reçu Wafacash"
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
              />
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <a
                href={selectedReceipt}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Ouvrir en grand ↗
              </a>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ padding: '9px 18px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600, color: 'var(--secondary)' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Paiements Wafacash en attente</h2>
          <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.92rem' }}>
            Vérifiez les preuves de paiement soumises par les étudiants et approuvez ou rejetez-les.
          </p>
        </div>
        <button
          onClick={loadPayments}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            background: 'var(--surface-color)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-color)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
          }}
        >
          <RotateCcw size={16} /> Actualiser
        </button>
      </div>

      {actionMsg && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', background: actionMsg.type === 'success' ? '#e8f5e9' : '#ffebee', color: actionMsg.type === 'success' ? '#2e7d32' : '#c62828', border: `1px solid ${actionMsg.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`, fontWeight: 500 }}>
          {actionMsg.text}
        </div>
      )}

      {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}

      {loading && payments.length === 0 ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4.5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <CheckCircle size={52} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Aucun paiement en attente</h3>
          <p style={{ color: 'var(--secondary)' }}>Toutes les demandes Wafacash ont été traitées.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '17%' }} /> {/* Étudiant */}
                <col style={{ width: '14%' }} /> {/* Cours */}
                <col style={{ width: '12%' }} /> {/* Référence */}
                <col style={{ width: '9%' }}  /> {/* Montant */}
                <col style={{ width: '11%' }} /> {/* MTCN */}
                <col style={{ width: '9%' }}  /> {/* Statut */}
                <col style={{ width: '9%' }}  /> {/* Reçu */}
                <col style={{ width: '13%' }} /> {/* Notes */}
                <col style={{ width: '16%' }} /> {/* Actions */}
              </colgroup>
              <thead>
                <tr style={{ background: 'var(--bg-color, #f8fafc)', borderBottom: '1px solid var(--border-color)' }}>
                  {['Étudiant', 'Cours', 'Référence', 'Montant', 'MTCN', 'Statut', 'Reçu', 'Notes', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const student = p.enrollment?.user || p.user || p.student;
                  const course = p.enrollment?.course || p.course;
                  const refCode = p.transactionReference || p.paymentReference || p.reference || '—';
                  const currencyStr = p.currency || 'MAD';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.92rem' }}>
                        {student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Étudiant' : 'Étudiant'}
                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 400, marginTop: '2px' }}>{student?.email || '—'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-color)', fontSize: '0.92rem' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {course?.title || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 700 }}>
                        {refCode}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--primary, #4f46e5)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                        {p.amount} {currencyStr}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600 }}>
                        {p.mtcn || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>{statusBadge(p.status)}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {p.receiptUrl ? (
                          <button
                            onClick={() => setSelectedReceipt(p.receiptUrl)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              background: 'rgba(45, 140, 255, 0.1)',
                              color: '#2D8CFF',
                              border: '1px solid rgba(45, 140, 255, 0.25)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s',
                            }}
                          >
                            👁️ Voir reçu
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input
                          type="text"
                          placeholder="Notes optionnelles..."
                          value={notes[p.id] || ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          style={{
                            width: '100%',
                            minWidth: '180px',
                            padding: '8px 12px',
                            border: '1px solid var(--border-color, #cbd5e1)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            background: 'var(--bg-color, #f8fafc)',
                            color: 'var(--text-color)',
                            outline: 'none',
                          }}
                        />
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleVerify(p.id, 'approve')}
                            disabled={!!verifyLoading}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '7px 14px',
                              background: '#e8f5e9',
                              color: '#2e7d32',
                              border: '1px solid #c8e6c9',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {verifyLoading === p.id + 'approve' ? <Loader size={14} className="spin" /> : <CheckCircle size={15} />}
                            Approuver
                          </button>
                          <button
                            onClick={() => handleVerify(p.id, 'reject')}
                            disabled={!!verifyLoading}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '7px 14px',
                              background: '#ffebee',
                              color: '#c62828',
                              border: '1px solid #ffcdd2',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {verifyLoading === p.id + 'reject' ? <Loader size={14} className="spin" /> : <XCircle size={15} />}
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboard() {

  const USERS_PER_PAGE = 10;
  const [activeTab, setActiveTab] = useState('users');
  const [userSubTab, setUserSubTab] = useState('active');
  const [userPage, setUserPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(null);
  const [userActionMsg, setUserActionMsg] = useState(null);

  const {
    users,
    loading: usersLoading,
    error: usersError,
    refreshUsers,
    verifyInstructor,
    verifyStudent,
    restoreUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  } = useAdminUsers();
  const {
    users: pendingKycUsers,
    loading: pendingKycLoading,
    error: pendingKycError,
    refreshPendingKyc,
  } = usePendingKyc();
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

  const deletedUsers = useMemo(() => users.filter(u => u.deletedAt), [users]);
  const activeUsers = useMemo(() => users.filter(u => !u.deletedAt), [users]);
  const unverifiedUsers = useMemo(() => activeUsers.filter(u => !u.isVerified), [activeUsers]);

  const baseSubTabUsers = userSubTab === 'deleted' ? deletedUsers
    : userSubTab === 'unverified' ? unverifiedUsers
    : userSubTab === 'kyc' ? pendingKycUsers
    : activeUsers;

  const listLoading = userSubTab === 'kyc' ? pendingKycLoading : usersLoading;
  const listError = userSubTab === 'kyc' ? pendingKycError : usersError;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase();

    return baseSubTabUsers.filter((listedUser) => {
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
  }, [baseSubTabUsers, userRoleFilter, userSearch]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, userPage]);

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

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    bio: '',
  });
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState(null);

  const handleVerifyUser = async (userId, role, isVerified = true) => {
    setUserActionLoading(userId);
    setUserActionMsg(null);
    try {
      if (role === 'instructor') {
        await verifyInstructor(userId, isVerified);
      } else {
        await verifyStudent(userId, isVerified);
      }
      await refreshUsers();
      await refreshPendingKyc();
      setUserActionMsg({ type: 'success', text: isVerified ? 'Utilisateur vérifié avec succès.' : 'Vérification retirée.' });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserActionMsg({ type: 'error', text: 'Endpoint de vérification non disponible. Vérifiez que le backend implémente les routes PATCH /admin/users/:id/verify et PATCH /admin/users/:id/verify-student.' });
      } else {
        setUserActionMsg({ type: 'error', text: msg || 'Impossible de vérifier cet utilisateur.' });
      }
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCreateUserClick = () => {
    setEditingUser(null);
    setUserFormData({ firstName: '', lastName: '', email: '', password: '', role: 'student', bio: '' });
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleEditUserClick = (listedUser) => {
    setEditingUser(listedUser);
    setUserFormData({
      firstName: listedUser.firstName || '',
      lastName: listedUser.lastName || '',
      email: listedUser.email || '',
      password: '',
      role: listedUser.role || 'student',
      bio: listedUser.bio || '',
    });
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError(null);
    try {
      const payload = {
        firstName: userFormData.firstName.trim(),
        lastName: userFormData.lastName.trim(),
        email: userFormData.email.trim(),
        role: userFormData.role,
        bio: userFormData.bio.trim(),
      };

      if (editingUser) {
        if (userFormData.password.trim()) payload.password = userFormData.password.trim();
        await updateUser(editingUser.id, payload);
        setUserActionMsg({ type: 'success', text: 'Utilisateur mis à jour avec succès.' });
      } else {
        payload.password = userFormData.password.trim();
        await createUser(payload);
        setUserActionMsg({ type: 'success', text: 'Utilisateur créé avec succès.' });
      }
      await refreshUsers();
      await refreshPendingKyc();
      setShowUserForm(false);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserFormError(editingUser
          ? 'Endpoint de mise à jour non disponible. Implémentez PATCH /admin/users/:userId côté backend.'
          : 'Endpoint de création non disponible. Implémentez POST /admin/users côté backend.');
      } else {
        setUserFormError(msg || 'Erreur lors de l\'enregistrement de l\'utilisateur.');
      }
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(`Supprimer l'utilisateur "${userName}" ?`);
    if (!confirmed) return;

    setUserActionLoading(userId);
    setUserActionMsg(null);
    try {
      await deleteUser(userId);
      await refreshUsers();
      await refreshPendingKyc();
      setUserActionMsg({ type: 'success', text: 'Utilisateur supprimé avec succès.' });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserActionMsg({ type: 'error', text: 'Endpoint de suppression non disponible. Implémentez DELETE /admin/users/:userId côté backend.' });
      } else {
        setUserActionMsg({ type: 'error', text: msg || 'Impossible de supprimer cet utilisateur.' });
      }
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const confirmed = window.confirm(`Envoyer un email de réinitialisation de mot de passe à "${userName}" ?`);
    if (!confirmed) return;

    setUserActionLoading(userId);
    setUserActionMsg(null);
    try {
      await resetPassword(userId);
      setUserActionMsg({ type: 'success', text: 'Email de réinitialisation envoyé avec succès.' });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserActionMsg({ type: 'error', text: 'Endpoint de réinitialisation non disponible. Implémentez PATCH /admin/users/:userId/reset-password côté backend.' });
      } else {
        setUserActionMsg({ type: 'error', text: msg || 'Impossible d\'envoyer l\'email de réinitialisation.' });
      }
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleRestoreUser = async (userId) => {
    setUserActionLoading(userId);
    setUserActionMsg(null);
    try {
      await restoreUser(userId);
      await refreshUsers();
      setUserActionMsg({ type: 'success', text: 'Utilisateur restauré avec succès.' });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserActionMsg({ type: 'error', text: 'Endpoint de restauration non disponible côté backend. Demandez au développeur backend d\'implémenter PATCH /users/:id/restore.' });
      } else {
        setUserActionMsg({ type: 'error', text: msg || 'Impossible de restaurer cet utilisateur.' });
      }
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleUserSubTabChange = (tab) => {
    setUserSubTab(tab);
    setUserPage(1);
    setUserSearch('');
    setUserRoleFilter('all');
    setUserActionMsg(null);
  };

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
              onClick={() => setActiveTab('stats')}
              className={`sidebar-menu-btn ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Statistiques</span>
            </button>
            <button
              onClick={() => setActiveTab('wafacash')}
              className={`sidebar-menu-btn ${activeTab === 'wafacash' ? 'active' : ''}`}
            >
              <Wallet size={18} />
              <span>Paiements</span>
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
              onClick={() => setActiveTab('security')}
              className={`sidebar-menu-btn ${activeTab === 'security' ? 'active' : ''}`}
            >
              <Lock size={18} />
              <span>Sécurité</span>
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
          ) : activeTab === 'security' ? (
            <ChangePasswordForm />
          ) : (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'users' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>User Management</h2>
                      <p style={{ color: 'var(--secondary)' }}>
                        Gérez les utilisateurs actifs, non vérifiés, en attente de KYC et supprimés.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateUserClick}
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                      Créer un utilisateur
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[
                      { key: 'active', label: 'Actifs', icon: <Users size={15} />, count: activeUsers.length },
                      { key: 'unverified', label: 'Non vérifiés', icon: <ShieldAlert size={15} />, count: unverifiedUsers.length },
                      { key: 'kyc', label: 'KYC en attente', icon: <ShieldCheck size={15} />, count: pendingKycUsers.length },
                      { key: 'deleted', label: 'Supprimés', icon: <Trash2 size={15} />, count: deletedUsers.length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => handleUserSubTabChange(tab.key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                          padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600,
                          cursor: 'pointer', border: '1.5px solid',
                          borderColor: userSubTab === tab.key ? 'var(--primary)' : 'var(--border-color)',
                          background: userSubTab === tab.key ? 'rgba(193,101,47,0.08)' : '#fff',
                          color: userSubTab === tab.key ? 'var(--primary)' : 'var(--secondary)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                        <span style={{
                          marginLeft: '0.15rem', padding: '0.1rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.75rem', fontWeight: 700,
                          background: userSubTab === tab.key ? 'var(--primary)' : 'var(--border-color)',
                          color: userSubTab === tab.key ? '#fff' : 'var(--secondary)',
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Action message */}
                  {userActionMsg && (
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
                      background: userActionMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                      border: `1px solid ${userActionMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                      color: userActionMsg.type === 'success' ? '#155724' : '#721c24',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{userActionMsg.text}</span>
                      <button onClick={() => setUserActionMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>×</button>
                    </div>
                  )}

                  {/* Filters row */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par nom, email ou ID..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      style={{ minWidth: '240px', flex: 1 }}
                    />
                    <select
                      className="form-control"
                      value={userRoleFilter}
                      onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                      style={{ minWidth: '180px' }}
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {listLoading && <LoadingSpinner />}
                  {listError && <p style={{ color: 'var(--error-color)' }}>{listError}</p>}

                  {!listLoading && !listError && filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <Users size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        {userSubTab === 'deleted'
                          ? 'Aucun utilisateur supprimé.'
                          : userSubTab === 'unverified'
                          ? 'Tous les utilisateurs sont vérifiés.'
                          : userSubTab === 'kyc'
                          ? 'Aucune demande KYC en attente.'
                          : 'Aucun utilisateur ne correspond au filtre.'}
                      </p>
                    </div>
                  )}

                  {!listLoading && !listError && filteredUsers.length > 0 && (
                    <>
                      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-color)' }}>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Nom</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Email</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Rôle</th>
                              {userSubTab === 'deleted' && (
                                <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Supprimé le</th>
                              )}
                              {userSubTab === 'unverified' || userSubTab === 'kyc' ? (
                                <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Statut</th>
                              ) : null}
                              <th style={{ textAlign: 'right', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedUsers.map((listedUser) => (
                              <tr key={listedUser.id} style={userSubTab === 'deleted' ? { opacity: 0.65 } : undefined}>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    {listedUser.avatar ? (
                                      <img src={listedUser.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                                      }}>
                                        {listedUser.firstName?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                                      {[listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || '—'}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                                  {listedUser.email || '—'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                  <span style={{
                                    display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '9999px',
                                    fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                                    background: listedUser.role === 'admin' ? '#ede7f6'
                                      : listedUser.role === 'instructor' ? '#e8f5e9'
                                      : '#e8f4fd',
                                    color: listedUser.role === 'admin' ? '#5e35b1'
                                      : listedUser.role === 'instructor' ? '#2e7d32'
                                      : '#1565c0',
                                  }}>
                                    {listedUser.role || '—'}
                                  </span>
                                </td>
                                {userSubTab === 'deleted' && (
                                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                                    {listedUser.deletedAt
                                      ? new Date(listedUser.deletedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—'}
                                  </td>
                                )}
                                {userSubTab === 'unverified' || userSubTab === 'kyc' ? (
                                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                      padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                      fontSize: '0.78rem', fontWeight: 600,
                                      background: '#fff3cd', color: '#856404',
                                    }}>
                                      <ShieldAlert size={12} /> Non vérifié
                                    </span>
                                  </td>
                                ) : null}
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {(userSubTab === 'unverified' || userSubTab === 'kyc') && (
                                      <button
                                        onClick={() => handleVerifyUser(listedUser.id, listedUser.role, true)}
                                        disabled={userActionLoading === listedUser.id}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                          padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                          background: userActionLoading === listedUser.id ? '#e8f5e9' : '#155724',
                                          color: '#fff', cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          border: 'none', transition: 'background 0.2s',
                                        }}
                                      >
                                        <ShieldCheck size={14} />
                                        {userActionLoading === listedUser.id ? '...' : 'Vérifier'}
                                      </button>
                                    )}
                                    {userSubTab === 'deleted' && (
                                      <button
                                        onClick={() => handleRestoreUser(listedUser.id)}
                                        disabled={userActionLoading === listedUser.id}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                          padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                          background: userActionLoading === listedUser.id ? '#e3f2fd' : '#1565c0',
                                          color: '#fff', cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          border: 'none', transition: 'background 0.2s',
                                        }}
                                      >
                                        <RotateCcw size={14} />
                                        {userActionLoading === listedUser.id ? '...' : 'Restaurer'}
                                      </button>
                                    )}
                                    {userSubTab === 'active' && (
                                      <>
                                        {(listedUser.role === 'instructor' || listedUser.role === 'student') && (
                                          <button
                                            onClick={() => handleVerifyUser(listedUser.id, listedUser.role, !listedUser.isVerified)}
                                            disabled={userActionLoading === listedUser.id}
                                            style={{
                                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                              padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                              border: '1px solid',
                                              borderColor: listedUser.isVerified ? '#f5c6cb' : '#c3e6cb',
                                              background: listedUser.isVerified ? '#f8d7da' : '#d4edda',
                                              color: listedUser.isVerified ? '#721c24' : '#155724',
                                              cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                            }}
                                          >
                                            {listedUser.isVerified ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                            {listedUser.isVerified ? 'Déverifier' : 'Vérifier'}
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleEditUserClick(listedUser)}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Pencil size={13} /> Modifier
                                        </button>
                                        <button
                                          onClick={() => handleResetPassword(listedUser.id, [listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || listedUser.email)}
                                          disabled={userActionLoading === listedUser.id}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--primary)',
                                            cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          }}
                                        >
                                          <Mail size={13} /> Réinit. mdp
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(listedUser.id, [listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || listedUser.email)}
                                          disabled={userActionLoading === listedUser.id}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--error-color)',
                                            cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          }}
                                        >
                                          <Trash2 size={13} /> Supprimer
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalUserPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                            {(userPage - 1) * USERS_PER_PAGE + 1}–{Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length}
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => setUserPage(p => Math.max(1, p - 1))}
                              disabled={userPage === 1}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: '#fff',
                                cursor: userPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: userPage === 1 ? 0.4 : 1,
                              }}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalUserPages || Math.abs(p - userPage) <= 1)
                              .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                              }, [])
                              .map((p, idx) => p === '...'
                                ? <span key={`dots-${idx}`} style={{ display: 'flex', alignItems: 'center', padding: '0 0.3rem', color: 'var(--secondary)' }}>…</span>
                                : (
                                  <button
                                    key={p}
                                    onClick={() => setUserPage(p)}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      minWidth: '36px', height: '36px', borderRadius: '8px', padding: '0 0.4rem',
                                      border: '1px solid',
                                      borderColor: userPage === p ? 'var(--primary)' : 'var(--border-color)',
                                      background: userPage === p ? 'var(--primary)' : '#fff',
                                      color: userPage === p ? '#fff' : 'var(--text-color)',
                                      fontWeight: userPage === p ? 700 : 500,
                                      fontSize: '0.85rem', cursor: 'pointer',
                                    }}
                                  >
                                    {p}
                                  </button>
                                )
                              )}
                            <button
                              onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                              disabled={userPage === totalUserPages}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: '#fff',
                                cursor: userPage === totalUserPages ? 'not-allowed' : 'pointer',
                                opacity: userPage === totalUserPages ? 0.4 : 1,
                              }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {showUserForm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowUserForm(false)}>
                      <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ margin: 0, color: 'var(--text-color)' }}>
                            {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
                          </h3>
                          <button onClick={() => setShowUserForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', lineHeight: 1 }}>
                            <X size={20} />
                          </button>
                        </div>

                        {userFormError && (
                          <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {userFormError}
                          </div>
                        )}

                        <form onSubmit={handleUserFormSubmit}>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Prénom *</label>
                            <input
                              type="text"
                              className="form-control"
                              required
                              placeholder="Ex: Yassine"
                              value={userFormData.firstName}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Nom *</label>
                            <input
                              type="text"
                              className="form-control"
                              required
                              placeholder="Ex: El Amrani"
                              value={userFormData.lastName}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email *</label>
                            <input
                              type="email"
                              className="form-control"
                              required
                              placeholder="exemple@email.com"
                              value={userFormData.email}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Rôle *</label>
                            <select
                              className="form-control"
                              value={userFormData.role}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                            >
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                              Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              required={!editingUser}
                              placeholder={editingUser ? '••••••••' : 'Minimum 8 caractères'}
                              value={userFormData.password}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Bio</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Courte présentation de l'utilisateur"
                              value={userFormData.bio}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, bio: e.target.value }))}
                            />
                          </div>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: userFormLoading ? 'wait' : 'pointer' }}
                            disabled={userFormLoading}
                          >
                            {userFormLoading && <Loader size={16} className="spin" />}
                            {userFormLoading ? 'Enregistrement...' : (editingUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur')}
                          </button>
                        </form>
                      </div>
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
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Paramètres de la plateforme</h2>
                  <p style={{ color: 'var(--secondary)' }}>Bientôt disponible : gestion des paramètres globaux de la plateforme.</p>
                </div>
              )}

              {activeTab === 'stats' && <AdminStatsTab />}

              {activeTab === 'wafacash' && <WafacashTab />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
