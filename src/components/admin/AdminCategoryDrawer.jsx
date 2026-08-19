import { useState, useEffect } from 'react';
import { Loader, X } from 'lucide-react';
import ModalPortal from '../ModalPortal';

export default function AdminCategoryDrawer({
  isOpen,
  onClose,
  editingCategory,
  parentCategoryId,
  flatCategories,
  onSave,
  saveLoading,
  saveError,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [parentId, setParentId] = useState('');
  const [isSubcategory, setIsSubcategory] = useState(false);

  // Top-level categories only (for parent dropdown)
  const parentOptions = flatCategories.filter((cat) => !cat.parentId);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setDescription(editingCategory.description || '');
      setIcon(editingCategory.icon || '');
      const pid = editingCategory.parentId || '';
      setParentId(pid);
      setIsSubcategory(!!pid);
    } else {
      setName('');
      setDescription('');
      setIcon('');
      const pid = parentCategoryId || '';
      setParentId(pid);
      setIsSubcategory(!!pid);
    }
  }, [editingCategory, parentCategoryId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || null,
      parentId: isSubcategory ? (parentId || null) : null,
    };
    try {
      await onSave(editingCategory ? editingCategory.id : null, payload);
    } catch {
      // Error is displayed via saveError prop - stay open
    }
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
        }}
      >
        {/* Header */}
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
              {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              {editingCategory ? editingCategory.name : 'Ajoutez une nouvelle catégorie au catalogue'}
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

        {/* Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {saveError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {saveError}
            </div>
          )}

          <form id="admin-category-drawer-form" onSubmit={handleSubmit}>

            {/* Type Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Type de catégorie *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: false, icon: '📁', label: 'Catégorie principale', sublabel: 'Niveau racine', activeBg: 'rgba(27,75,90,0.08)', activeBorder: 'var(--primary)', activeColor: 'var(--primary)' },
                  { value: true,  icon: '📄', label: 'Sous-catégorie',       sublabel: 'Appartient à une catégorie', activeBg: 'rgba(193,101,47,0.08)', activeBorder: 'var(--accent)', activeColor: 'var(--accent)' },
                ].map(({ value, icon, label, sublabel, activeBg, activeBorder, activeColor }) => {
                  const isActive = isSubcategory === value;
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => { setIsSubcategory(value); if (!value) setParentId(''); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                        padding: '1rem 0.75rem', borderRadius: '12px',
                        border: `2px solid ${isActive ? activeBorder : 'var(--border-color)'}`,
                        background: isActive ? activeBg : '#fafafa',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 0 3px ${activeBorder}22` : 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? activeColor : 'var(--text-color)' }}>{label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parent dropdown — only when subcategory selected */}
            {isSubcategory && (
              <div className="form-group" style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                  Catégorie parente *
                </label>
                {parentOptions.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#fff8e1', border: '1px solid #ffe082', fontSize: '0.85rem', color: '#856404' }}>
                    ⚠️ Aucune catégorie principale disponible. Créez d&apos;abord une catégorie principale.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    required
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                  >
                    <option value="">-- Choisir une catégorie parente --</option>
                    {parentOptions
                      .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
                      ))}
                  </select>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Nom *</label>
              <input
                type="text"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                placeholder={isSubcategory ? 'Ex: React, TensorFlow...' : 'Ex: Développement Web, IA...'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Icône</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="">-- Choisir une icône --</option>
                <option value="Code">💻 Code</option>
                <option value="Database">🗄️ Base de données</option>
                <option value="Globe">🌐 Web/Réseau</option>
                <option value="Video">🎥 Vidéo</option>
                <option value="Users">👥 Pédagogique</option>
                <option value="BookOpen">📚 Livre (défaut)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Description optionnelle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
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
            form="admin-category-drawer-form"
            disabled={saveLoading}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: saveLoading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {saveLoading && <Loader size={16} className="spin" />}
            {saveLoading ? 'Enregistrement...' : (editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie')}
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
