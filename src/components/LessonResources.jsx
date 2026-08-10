import { useState } from 'react';
import { FileText, Download, Trash2, Plus, X, Link as LinkIcon, Video, File, Image } from 'lucide-react';
import { useLessonResources } from '../hooks/useLessonResources';

export default function LessonResources({ lessonId }) {
  const { resources, loading, error, refetch, addResource, deleteResource } = useLessonResources(lessonId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', type: 'link' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={20} />;
      case 'pdf': return <FileText size={20} />;
      case 'image': return <Image size={20} />;
      case 'link': return <LinkIcon size={20} />;
      default: return <File size={20} />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.title.trim() || !formData.url.trim()) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      await addResource(formData);
      setFormData({ title: '', url: '', type: 'link' });
      setShowAddForm(false);
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    
    try {
      await deleteResource(resourceId);
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
          Ressources
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Add Resource Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                background: '#fff',
              }}
            >
              <option value="link">Lien</option>
              <option value="pdf">PDF</option>
              <option value="video">Vidéo</option>
              <option value="image">Image</option>
              <option value="file">Fichier</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: Guide d'étude"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
              }}
            />
          </div>
          {formError && (
            <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Ajout...' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormData({ title: '', url: '', type: 'link' });
                setFormError('');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: 'var(--secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Resources List */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
          Chargement...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error-color)' }}>
          {error}
        </div>
      )}

      {!loading && !error && resources.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          <File size={36} style={{ opacity: 0.3, color: 'var(--secondary)', marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Aucune ressource ajoutée
          </p>
        </div>
      )}

      {!loading && !error && resources.length > 0 && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {resources.map((resource) => (
            <div
              key={resource.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--bg-color)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--primary)10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                {getResourceIcon(resource.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                  {resource.title}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  {resource.type}
                </p>
              </div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.4rem',
                  background: 'var(--primary)10',
                  color: 'var(--primary)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                title="Télécharger"
              >
                <Download size={16} />
              </a>
              <button
                onClick={() => handleDelete(resource.id)}
                style={{
                  padding: '0.4rem',
                  background: '#fee',
                  color: '#c33',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
