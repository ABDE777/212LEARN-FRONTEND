import { useState } from 'react';
import { Loader, X } from 'lucide-react';
import CloudinaryImageUpload from '../CloudinaryImageUpload';
import ModalPortal from '../ModalPortal';

export default function AdminCreateCourseDrawer({
  isOpen,
  onClose,
  flatCategories,
  instructors,
  instructorsLoading,
  onSave,
  saveLoading,
  saveError,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState('');
  const [instructorId, setInstructorId] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setThumbnail('');
    setCategoryId('');
    setPrice('');
    setLevel('');
    setInstructorId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      categoryId,
      price: parseFloat(price),
      instructorId,
    };
    if (description.trim()) payload.description = description.trim();
    if (thumbnail.trim()) payload.thumbnail = thumbnail.trim();
    if (level) payload.level = level;

    await onSave(payload);
    handleClose();
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
      onClick={(e) => e.target === e.currentTarget && handleClose()}
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
            onClick={handleClose}
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

          <form id="admin-create-course-drawer-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Titre du cours *</label>
              <input
                type="text"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                placeholder="Ex: React from Zero to Hero"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Description détaillée du cours..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Image Miniature</label>
              <CloudinaryImageUpload
                value={thumbnail}
                onChange={(url) => setThumbnail(url)}
                placeholder="Glissez ou cliquez pour uploader la miniature du cours"
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={price === '0'}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={price === '0'}
                    onChange={(e) => setPrice(e.target.checked ? '0' : '')}
                  />
                  Cours gratuit
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Niveau</label>
                <select
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
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
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
                required
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
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
            form="admin-create-course-drawer-form"
            disabled={saveLoading || instructorsLoading || !instructorId}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {saveLoading ? <Loader size={16} className="spin" /> : null}
            {saveLoading ? 'Création en cours...' : 'Créer le cours'}
          </button>
          <button
            type="button"
            onClick={handleClose}
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
