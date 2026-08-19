import { useState, useEffect } from 'react';
import { Loader, X } from 'lucide-react';
import CloudinaryImageUpload from '../CloudinaryImageUpload';
import { normalizeCourseForm } from './adminCourseHelpers';
import ModalPortal from '../ModalPortal';

export default function AdminEditCourseDrawer({
  course,
  onClose,
  flatCategories,
  instructors,
  instructorsLoading,
  onSave,
  saveLoading,
  saveError,
}) {
  const [form, setForm] = useState(() => normalizeCourseForm(course));

  useEffect(() => {
    if (course) {
      setForm(normalizeCourseForm(course));
    }
  }, [course]);

  if (!course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(course.id, form);
    onClose();
  };

  return (
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
              Modifier le cours
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
              {course.title}
            </p>
          </div>
          <button
            onClick={onClose}
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
          {saveError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {saveError}
            </div>
          )}

          <form id="admin-edit-course-drawer-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Titre du cours *</label>
              <input
                type="text"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Description détaillée du cours..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Image Miniature</label>
              <CloudinaryImageUpload
                value={form.thumbnail}
                onChange={(url) => setForm((prev) => ({ ...prev, thumbnail: url }))}
                placeholder="Glissez ou cliquez pour uploader une nouvelle miniature"
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
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  disabled={String(form.price) === '0'}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={String(form.price) === '0'}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.checked ? '0' : '' }))}
                  />
                  Cours gratuit
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Niveau</label>
                <select
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                  value={form.level}
                  onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                >
                  <option value="">-- Optionnel --</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </div>

            {/* Status Field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.88rem' }}>Statut de publication</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { value: 'published', label: '✅ Publié', bg: 'rgba(40,167,69,0.08)', border: 'rgba(40,167,69,0.3)', color: '#155724', activeBg: '#d4edda', activeBorder: '#28a745' },
                  { value: 'draft', label: '📝 Brouillon', bg: 'rgba(232,163,61,0.08)', border: 'rgba(232,163,61,0.3)', color: '#856404', activeBg: '#fff3cd', activeBorder: '#e8a33d' },
                  { value: 'archived', label: '🗃️ Archivé', bg: 'rgba(108,117,125,0.08)', border: 'rgba(108,117,125,0.3)', color: '#495057', activeBg: '#e9ecef', activeBorder: '#6c757d' },
                ].map(({ value, label, bg, border, color, activeBg, activeBorder }) => {
                  const isActive = form.status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: value }))}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.5rem',
                        borderRadius: '10px',
                        border: `2px solid ${isActive ? activeBorder : border}`,
                        background: isActive ? activeBg : bg,
                        color,
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 0 3px ${activeBorder}33` : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Catégorie *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                required
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.selectLabel || cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Instructeur *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                value={form.instructorId}
                onChange={(e) => setForm((prev) => ({ ...prev, instructorId: e.target.value }))}
                disabled={instructorsLoading}
              >
                <option value="">
                  {instructorsLoading ? 'Chargement...' : '-- Sélectionner un instructeur --'}
                </option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.firstName} {inst.lastName} ({inst.email})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '1rem',
            background: '#fafafa',
          }}
        >
          <button
            type="submit"
            form="admin-edit-course-drawer-form"
            disabled={saveLoading}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {saveLoading ? <Loader size={16} className="spin" /> : null}
            {saveLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            type="button"
            onClick={onClose}
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
  );
}
