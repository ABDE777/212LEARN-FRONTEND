import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronUp, Plus, Trash2, FileText, Video,
  Upload, ArrowLeft, Link, Image, Archive, Edit2, Check, X,
  File as FileIcon, Users, BookOpen, BarChart3, HelpCircle, User, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import { useCurriculumBuilder } from '../hooks/useCurriculumBuilder';
import { useInstructorAssignments, useSubmissions } from '../hooks/useInstructorAssignments';
import { useCourseGroups } from '../hooks/useCourseGroups';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const RESOURCE_ICONS = {
  video: <Video size={15} color="var(--primary)" />,
  pdf: <FileText size={15} color="#e74c3c" />,
  image: <Image size={15} color="#27ae60" />,
  zip: <Archive size={15} color="#f39c12" />,
  link: <Link size={15} color="var(--secondary)" />,
};

function resourceIcon(type = '') {
  return RESOURCE_ICONS[type.toLowerCase()] || <FileIcon size={15} color="var(--secondary)" />;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function Alert({ type = 'error', children, onClose }) {
  const colors = {
    error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
    success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
  };
  const c = colors[type];
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem',
    }}>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, padding: 0 }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Inline editable text
───────────────────────────────────────────── */
function InlineEdit({ value, onSave, placeholder = 'Edit…', className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    if (draft.trim() && draft.trim() !== value) {
      await onSave(draft.trim());
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <input
          ref={inputRef}
          className="form-control"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          style={{ padding: '0.3rem 0.6rem', fontSize: '1rem', width: '220px' }}
        />
        <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success-color)' }}><Check size={16} /></button>
        <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)' }}><X size={16} /></button>
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      onClick={() => { setDraft(value); setEditing(true); }}
    >
      {value || <span style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>{placeholder}</span>}
      <Edit2 size={13} style={{ opacity: 0.5 }} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Resource panel for a single lesson
───────────────────────────────────────────── */
function ResourcePanel({ lesson, addResource, deleteResource }) {
  const [mode, setMode] = useState(null); // 'file' | 'link' | null
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const resources = lesson.resources || [];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Correct flow (avoids Vercel 413 for large files):
      // 1) sign on backend (JSON) → 2) upload browser→Cloudinary → 3) save URL (JSON)
      const { uploadLessonResource } = await import('../utils/uploadResource.js');
      await uploadLessonResource({
        lessonId: lesson.id,
        file,
        onProgress: setUploadProgress,
      });

      // Refresh curriculum to get updated resources
      await addResource(lesson.id, null);
      setSuccess(`"${file.name}" uploadé avec succès.`);
      setMode(null);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Échec de l\'upload. Réessayez.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      // For external links the backend accepts JSON with type + url
      const { default: api } = await import('../services/api.js');
      await api.post(`/lessons/${lesson.id}/resources`, { type: 'link', url: linkUrl.trim() });
      // Re-fetch curriculum to show the new resource
      await addResource(lesson.id, null); // pass null → hook will only re-fetch
      setSuccess('Lien attaché avec succès.');
      setLinkUrl('');
      setMode(null);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Échec de l\'attachement du lien.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    setError(null);
    try {
      await deleteResource(resourceId);
    } catch (err) {
      setError('Impossible de supprimer la ressource.');
    }
  };

  return (
    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: resources.length ? '0.75rem' : 0 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Ressources ({resources.length})
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'file' ? null : 'file')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: mode === 'file' ? 'var(--primary)' : 'var(--surface-color)', color: mode === 'file' ? '#fff' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Upload size={13} /> Fichier
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'link' ? null : 'link')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: mode === 'link' ? 'var(--secondary)' : 'var(--surface-color)', color: mode === 'link' ? '#fff' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Link size={13} /> Lien externe
          </button>
        </div>
      </div>

      {/* Error / success */}
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* File upload panel */}
      {mode === 'file' && (
        <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            Formats acceptés : vidéo, PDF, ZIP, image (max 200 MB via Cloudinary)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.pdf,.zip,.png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ fontSize: '0.9rem' }}
          />
          {uploading && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ background: 'var(--border-color)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.2s' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                Upload en cours… {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* External link panel */}
      {mode === 'link' && (
        <form onSubmit={handleLinkSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            className="form-control"
            type="url"
            placeholder="https://youtube.com/watch?v=…"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            required
            disabled={uploading}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={uploading} className="btn-secondary" style={{ padding: '0.4rem 1rem', whiteSpace: 'nowrap' }}>
            {uploading ? 'Ajout…' : 'Ajouter'}
          </button>
        </form>
      )}

      {/* Resource list */}
      {resources.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {resources.map(r => (
            <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: '#fff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              {resourceIcon(r.type)}
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, fontSize: '0.85rem', color: 'var(--secondary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={r.url}
              >
                {r.url?.split('/').pop() || r.url}
              </a>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', flexShrink: 0 }}>
                {r.type?.toUpperCase()}
              </span>
              <button
                onClick={() => handleDelete(r.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)', flexShrink: 0 }}
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Curriculum Builder
───────────────────────────────────────────── */
function CurriculumBuilder({ courseId }) {
  const {
    curriculum, loading, error, fetchCurriculum,
    createSection, updateSection, deleteSection,
    createLesson, updateLesson, deleteLesson,
    addResource, deleteResource,
  } = useCurriculumBuilder(courseId);

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [newLessonData, setNewLessonData] = useState({ sectionId: null, title: '', type: 'video' });
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => { fetchCurriculum(); }, [fetchCurriculum]);

  const toggleSection = (id) =>
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    setGlobalError(null);
    try {
      await createSection(newSectionTitle.trim());
      setNewSectionTitle('');
    } catch {
      setGlobalError('Impossible de créer la section.');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLessonData.title.trim() || !newLessonData.sectionId) return;
    setGlobalError(null);
    try {
      await createLesson(newLessonData.sectionId, {
        title: newLessonData.title.trim(),
        type: newLessonData.type,
      });
      setNewLessonData({ sectionId: null, title: '', type: 'video' });
    } catch {
      setGlobalError('Impossible de créer la leçon.');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Supprimer cette section et toutes ses leçons ?')) return;
    try { await deleteSection(sectionId); } catch { setGlobalError('Impossible de supprimer la section.'); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try { await deleteLesson(lessonId); } catch { setGlobalError('Impossible de supprimer la leçon.'); }
  };

  if (loading && curriculum.length === 0) return <LoadingSpinner />;

  return (
    <div>
      {globalError && <Alert type="error" onClose={() => setGlobalError(null)}>{globalError}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {/* Add section form */}
      <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Titre de la nouvelle section…"
          value={newSectionTitle}
          onChange={e => setNewSectionTitle(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Ajouter une section
        </button>
      </form>

      {curriculum.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
          <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>Aucune section pour l'instant. Commencez par en créer une.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {curriculum.map(section => (
          <div key={section.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
            {/* Section header */}
            <div
              style={{ padding: '1rem 1.5rem', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleSection(section.id)}
            >
              <InlineEdit
                value={section.title}
                placeholder="Titre de section"
                onSave={title => updateSection(section.id, { title })}
                className="section-title"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => handleDeleteSection(section.id)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }} title="Supprimer la section">
                  <Trash2 size={17} />
                </button>
                <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                  {section.lessons?.length || 0} leçon{section.lessons?.length !== 1 ? 's' : ''}
                </span>
                {expandedSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Lessons */}
            {expandedSections[section.id] && (
              <div style={{ padding: '1.5rem' }}>
                {section.lessons?.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {section.lessons.map(lesson => (
                      <li key={lesson.id} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Lesson row */}
                        <div style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            {lesson.type === 'video' ? <Video size={16} color="var(--primary)" /> : <FileText size={16} color="var(--primary)" />}
                            <InlineEdit
                              value={lesson.title}
                              placeholder="Titre de leçon"
                              onSave={title => updateLesson(lesson.id, { title })}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            {/* Type selector */}
                            <select
                              className="form-control"
                              value={lesson.type || 'video'}
                              onChange={e => updateLesson(lesson.id, { type: e.target.value })}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                            >
                              <option value="video">Vidéo</option>
                              <option value="text">Texte</option>
                              <option value="quiz">Quiz</option>
                            </select>
                            <button onClick={() => handleDeleteLesson(lesson.id)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }} title="Supprimer la leçon">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Resource panel */}
                        <div style={{ padding: '0 1rem 0.85rem' }}>
                          <ResourcePanel
                            lesson={lesson}
                            addResource={addResource}
                            deleteResource={deleteResource}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Aucune leçon dans cette section.
                  </p>
                )}

                {/* Add lesson form */}
                {newLessonData.sectionId === section.id ? (
                  <form onSubmit={handleAddLesson} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Titre de la leçon"
                      value={newLessonData.title}
                      onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })}
                      required
                      style={{ flex: 1, minWidth: '180px' }}
                    />
                    <select
                      className="form-control"
                      value={newLessonData.type}
                      onChange={e => setNewLessonData({ ...newLessonData, type: e.target.value })}
                      style={{ width: 'auto' }}
                    >
                      <option value="video">Vidéo</option>
                      <option value="text">Texte/Article</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Enregistrer</button>
                    <button type="button" onClick={() => setNewLessonData({ sectionId: null, title: '', type: 'video' })} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Annuler</button>
                  </form>
                ) : (
                  <button
                    onClick={() => setNewLessonData({ sectionId: section.id, title: '', type: 'video' })}
                    style={{ background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '0.65rem', width: '100%', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
                  >
                    <Plus size={15} /> Ajouter une leçon
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Assignments & Grading
───────────────────────────────────────────── */
function AssignmentsManager({ courseId }) {
  const { curriculum, fetchCurriculum } = useCurriculumBuilder(courseId);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  useEffect(() => { fetchCurriculum(); }, [fetchCurriculum]);

  const lessons = curriculum.reduce((acc, section) => {
    if (section.lessons) acc.push(...section.lessons.map(l => ({ ...l, sectionTitle: section.title })));
    return acc;
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
          Sélectionner une leçon pour gérer ses devoirs
        </label>
        <select
          className="form-control"
          value={selectedLessonId}
          onChange={e => setSelectedLessonId(e.target.value)}
          style={{ maxWidth: '440px' }}
        >
          <option value="">-- Choisir une leçon --</option>
          {lessons.map(l => (
            <option key={l.id} value={l.id}>{l.sectionTitle} › {l.title}</option>
          ))}
        </select>
      </div>

      {selectedLessonId && <AssignmentList lessonId={selectedLessonId} />}
    </div>
  );
}

function AssignmentList({ lessonId }) {
  const { assignments, loading, fetchAssignments, createAssignment } = useInstructorAssignments(lessonId);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    fetchAssignments();
    setSelectedAssignmentId(null);
  }, [fetchAssignments, lessonId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateError(null);
    try {
      await createAssignment({ title: newTitle.trim(), dueDate: newDueDate || undefined });
      setNewTitle('');
      setNewDueDate('');
    } catch (err) {
      setCreateError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de créer le devoir.'
      );
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      <div>
        <h4 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Devoirs</h4>

        {createError && <Alert type="error" onClose={() => setCreateError(null)}>{createError}</Alert>}

        <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Titre du devoir"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
              <Plus size={16} />
            </button>
          </div>
          <input
            type="datetime-local"
            className="form-control"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
        </form>

        {loading && <LoadingSpinner />}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {assignments.map(a => (
            <li
              key={a.id}
              onClick={() => setSelectedAssignmentId(a.id)}
              style={{
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                background: selectedAssignmentId === a.id ? 'var(--bg-color)' : '#fff',
                borderColor: selectedAssignmentId === a.id ? 'var(--primary)' : 'var(--border-color)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{a.title}</strong>
              {a.dueDate && (
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  Échéance : {new Date(a.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {selectedAssignmentId ? (
          <SubmissionsList assignmentId={selectedAssignmentId} />
        ) : (
          <div style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--secondary)' }}>
            Sélectionnez un devoir pour voir et noter les soumissions
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionsList({ assignmentId }) {
  const { submissions, loading, fetchSubmissions, gradeSubmission } = useSubmissions(assignmentId);
  const [gradingId, setGradingId] = useState(null);
  const [gradeError, setGradeError] = useState(null);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions, assignmentId]);

  const handleGrade = async (subId, e) => {
    e.preventDefault();
    setGradeError(null);
    setGradingId(subId);
    try {
      await gradeSubmission(subId, {
        grade: Number(e.target.grade.value),
        feedback: e.target.feedback.value,
      });
    } catch (err) {
      setGradeError(err.response?.data?.error?.message || 'Erreur lors de la notation.');
    } finally {
      setGradingId(null);
    }
  };

  return (
    <div>
      <h4 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
        Soumissions ({submissions.length})
      </h4>

      {gradeError && <Alert type="error" onClose={() => setGradeError(null)}>{gradeError}</Alert>}
      {loading && <LoadingSpinner />}
      {!loading && submissions.length === 0 && (
        <p style={{ color: 'var(--secondary)' }}>Aucune soumission pour l'instant.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submissions.map(sub => (
          <div key={sub.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.2rem' }}>
                  {sub.user
                    ? `${sub.user.firstName || ''} ${sub.user.lastName || ''}`.trim() || sub.userId
                    : sub.userId}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  Soumis le : {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
              {sub.grade != null && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.3rem', color: sub.grade >= 50 ? 'var(--success-color)' : 'var(--error-color)' }}>
                    {sub.grade}/100
                  </span>
                </div>
              )}
            </div>

            {sub.fileUrl && (
              <a
                href={sub.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem' }}
              >
                <FileText size={15} /> Voir la soumission
              </a>
            )}

            {sub.feedback && (
              <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-color)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                Feedback : {sub.feedback}
              </div>
            )}

            <form onSubmit={e => handleGrade(sub.id, e)} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 120px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Note (0–100)
                  </label>
                  <input
                    name="grade"
                    type="number"
                    className="form-control"
                    defaultValue={sub.grade ?? ''}
                    min="0"
                    max="100"
                    required
                    style={{ padding: '0.4rem 0.6rem' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Feedback
                  </label>
                  <input
                    name="feedback"
                    type="text"
                    className="form-control"
                    defaultValue={sub.feedback || ''}
                    placeholder="Bon travail !"
                    style={{ padding: '0.4rem 0.6rem' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={gradingId === sub.id}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}
              >
                {gradingId === sub.id ? 'Notation…' : 'Soumettre la note'}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page shell
───────────────────────────────────────────── */
function GroupsManager({ courseId }) {
  const { getCourseGroups, getGroupStudents, loading } = useCourseGroups();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const g = await getCourseGroups(courseId);
        if (active) setGroups(g);
      } catch {
        if (active) setErr('Impossible de charger les groupes.');
      }
    })();
    return () => { active = false; };
  }, [courseId]);

  const openGroup = async (group) => {
    setSelectedGroup(group);
    setStudents([]);
    setStudentsLoading(true);
    try {
      const data = await getGroupStudents(group.id);
      setStudents(data.students || []);
    } catch {
      setErr('Impossible de charger les étudiants.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const cardStyle = {
    width: '100%', textAlign: 'left', cursor: 'pointer',
    background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem',
  };
  const rowStyle = {
    background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem 1rem',
  };

  if (loading && groups.length === 0 && !selectedGroup) return <LoadingSpinner />;

  if (selectedGroup) {
    return (
      <div>
        <button
          onClick={() => setSelectedGroup(null)}
          className="btn-secondary"
          style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Retour aux groupes
        </button>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Étudiants — {selectedGroup.name}</h2>
        {err && <p style={{ color: 'var(--error-color)' }}>{err}</p>}
        {studentsLoading ? (
          <LoadingSpinner />
        ) : students.length === 0 ? (
          <p style={{ color: 'var(--secondary)' }}>Aucun étudiant dans ce groupe.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {students.map(s => (
              <div key={s.id} style={rowStyle}>
                <div style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{s.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Groupes de ce cours</h2>
      {err && <p style={{ color: 'var(--error-color)' }}>{err}</p>}
      {groups.length === 0 ? (
        <p style={{ color: 'var(--secondary)' }}>Aucun groupe ne vous est assigné pour ce cours.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {groups.map(g => (
            <button key={g.id} onClick={() => openGroup(g)} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{g.studentCount ?? 0} étudiant(s)</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InstructorCourseManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('curriculum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [updateRequest, setUpdateRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    description: '',
    price: '',
    level: '',
    thumbnail: '',
  });
  const [updateThumbnailFile, setUpdateThumbnailFile] = useState(null);
  const [uploadingUpdateThumbnail, setUploadingUpdateThumbnail] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const tabs = [
    { key: 'curriculum', label: 'Curriculum Builder' },
    { key: 'assignments', label: 'Devoirs & Notation' },
    { key: 'groups', label: 'Groupes & Étudiants' },
    { key: 'updates', label: 'Mettre à jour' },
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data?.data?.course || response.data);
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    const fetchUpdateRequest = async () => {
      setLoadingRequest(true);
      try {
        const response = await api.get('/instructor/update-requests');
        const requests = response.data?.data?.updateRequests || response.data?.data || [];
        const courseRequest = requests.find(r => r.courseId === id);
        setUpdateRequest(courseRequest || null);
      } catch (err) {
        console.error('Failed to fetch update request:', err);
      } finally {
        setLoadingRequest(false);
      }
    };
    fetchUpdateRequest();
  }, [id]);

  const handleUpdateThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdateThumbnailFile(file);
      uploadUpdateThumbnailToCloudinary(file);
    }
  };

  const uploadUpdateThumbnailToCloudinary = async (file) => {
    setUploadingUpdateThumbnail(true);
    try {
      const signResponse = await api.post('/uploads/cloudinary-sign', {
        type: 'image',
        filename: file.name,
        mimetype: file.type,
      });

      const { uploadUrl, formFields, cloudName } = signResponse.data.data;

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
        setUpdateFormData({ ...updateFormData, thumbnail: uploadResult.secure_url });
      } else {
        console.error('Upload failed:', uploadResult);
      }
    } catch (err) {
      console.error('Failed to upload thumbnail:', err);
    } finally {
      setUploadingUpdateThumbnail(false);
    }
  };

  const handleSubmitUpdateRequest = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setSubmittingUpdate(true);

    try {
      const payload = {};
      if (updateFormData.title.trim()) payload.title = updateFormData.title.trim();
      if (updateFormData.description.trim()) payload.description = updateFormData.description.trim();
      if (updateFormData.price) payload.price = parseFloat(updateFormData.price);
      if (updateFormData.level) payload.level = updateFormData.level;
      if (updateFormData.thumbnail.trim()) payload.thumbnail = updateFormData.thumbnail.trim();

      await api.post(`/courses/${id}/update-requests`, payload);
      setUpdateFormOpen(false);
      setUpdateFormData({ title: '', description: '', price: '', level: '', thumbnail: '' });
      setUpdateThumbnailFile(null);
      // Refresh update request status
      const response = await api.get('/instructor/update-requests');
      const requests = response.data?.data?.updateRequests || response.data?.data || [];
      const courseRequest = requests.find(r => r.courseId === id);
      setUpdateRequest(courseRequest || null);
    } catch (err) {
      setUpdateError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit update request');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const sidebarTabs = [
    { key: 'courses',   icon: <BookOpen size={18} />,  label: 'Mes cours' },
    { key: 'analytics', icon: <BarChart3 size={18} />,   label: 'Analytics' },
    { key: 'quizzes',   icon: <HelpCircle size={18} />, label: 'Quiz' },
    { key: 'meetings',  icon: <Video size={18} />,      label: 'Sessions Live' },
    { key: 'students',  icon: <Users size={18} />,      label: 'Étudiants' },
    { key: 'profile',   icon: <User size={18} />,       label: 'Mon profil' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
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
            {sidebarTabs.map(t => (
              <button
                key={t.key}
                onClick={() => navigate(`/instructor/dashboard?tab=${t.key}`)}
                className="sidebar-menu-btn"
                title={t.label}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color)' }}
              title="Déconnexion"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        <main className="dashboard-main-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="btn-secondary"
            style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Retour à mes cours
          </button>

          <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Gérer le cours</h1>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeTab === t.key ? 'var(--primary)' : 'var(--secondary)',
                cursor: 'pointer',
                padding: '0.6rem 1rem',
                borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'color 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'curriculum' && <CurriculumBuilder courseId={id} />}
        {activeTab === 'assignments' && <AssignmentsManager courseId={id} />}
        {activeTab === 'groups' && <GroupsManager courseId={id} />}
        {activeTab === 'updates' && (
          <div>
            {loadingCourse ? (
              <LoadingSpinner />
            ) : !course ? (
              <p style={{ color: 'var(--secondary)' }}>Chargement du cours...</p>
            ) : course.status !== 'published' ? (
              <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>
                  Les demandes de mise à jour ne sont nécessaires que pour les cours publiés.
                </p>
                <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>
                  Statut actuel du cours : <strong>{course.status === 'draft' ? 'Brouillon' : course.status}</strong>
                </p>
              </div>
            ) : (
              <div>
                {loadingRequest ? (
                  <LoadingSpinner />
                ) : updateRequest ? (
                  <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Statut de la demande de mise à jour</h3>
                    <div style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      background: updateRequest.status === 'PENDING' ? '#fff3cd' : 
                               updateRequest.status === 'APPROVED' ? '#d4edda' : '#f8d7da',
                      border: `1px solid ${updateRequest.status === 'PENDING' ? '#ffc107' : 
                                    updateRequest.status === 'APPROVED' ? '#28a745' : '#dc3545'}`
                    }}>
                      <p style={{
                        fontWeight: 600,
                        color: updateRequest.status === 'PENDING' ? '#856404' : 
                               updateRequest.status === 'APPROVED' ? '#155724' : '#721c24',
                        margin: 0
                      }}>
                        {updateRequest.status === 'PENDING' ? '⏳ En attente de validation par l\'administrateur' :
                         updateRequest.status === 'APPROVED' ? '✅ Demande approuvée - Les modifications ont été appliquées' :
                         '❌ Demande rejetée'}
                      </p>
                      {updateRequest.status === 'REJECTED' && updateRequest.rejectionReason && (
                        <p style={{ marginTop: '0.5rem', color: '#721c24', fontSize: '0.9rem' }}>
                          Raison : {updateRequest.rejectionReason}
                        </p>
                      )}
                    </div>

                    {updateRequest.status === 'PENDING' && (
                      <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Modifications demandées :</h4>
                        {updateRequest.title && <p><strong>Titre :</strong> {updateRequest.title}</p>}
                        {updateRequest.description && <p><strong>Description :</strong> {updateRequest.description}</p>}
                        {updateRequest.price !== null && <p><strong>Prix :</strong> {updateRequest.price} MAD</p>}
                        {updateRequest.level && <p><strong>Niveau :</strong> {updateRequest.level}</p>}
                        {updateRequest.thumbnail && <p><strong>Image :</strong> URL mise à jour</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!updateFormOpen ? (
                      <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Demander une mise à jour du cours</h3>
                        <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                          Ce cours est publié. Pour modifier les informations de base (titre, description, prix, niveau, image),
                          vous devez soumettre une demande à l'administrateur pour validation.
                        </p>
                        <button
                          onClick={() => {
                            setUpdateFormData({
                              title: course.title || '',
                              description: course.description || '',
                              price: course.price || '',
                              level: course.level || '',
                              thumbnail: course.thumbnail || '',
                            });
                            setUpdateFormOpen(true);
                          }}
                          className="btn-primary"
                          style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
                        >
                          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Créer une demande de mise à jour
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Nouvelle demande de mise à jour</h3>
                          <button
                            onClick={() => setUpdateFormOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: '0.5rem' }}
                          >
                            <X size={24} />
                          </button>
                        </div>

                        {updateError && (
                          <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            {updateError}
                          </div>
                        )}

                        <form onSubmit={handleSubmitUpdateRequest}>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                              Nouveau titre (optionnel)
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                              placeholder="Laisser vide pour ne pas modifier"
                              value={updateFormData.title}
                              onChange={(e) => setUpdateFormData({ ...updateFormData, title: e.target.value })}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                              Nouvelle description (optionnel)
                            </label>
                            <textarea
                              className="form-control"
                              style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                              rows={3}
                              placeholder="Laisser vide pour ne pas modifier"
                              value={updateFormData.description}
                              onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div className="form-group">
                              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                                Nouveau prix (MAD, optionnel)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control"
                                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                                placeholder="Laisser vide pour ne pas modifier"
                                value={updateFormData.price}
                                onChange={(e) => setUpdateFormData({ ...updateFormData, price: e.target.value })}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                                Nouveau niveau (optionnel)
                              </label>
                              <select
                                className="form-control"
                                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                                value={updateFormData.level}
                                onChange={(e) => setUpdateFormData({ ...updateFormData, level: e.target.value })}
                              >
                                <option value="">-- Optionnel --</option>
                                <option value="beginner">Débutant</option>
                                <option value="intermediate">Intermédiaire</option>
                                <option value="advanced">Avancé</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                              Nouvelle image (optionnel)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control"
                              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                              onChange={handleUpdateThumbnailChange}
                              disabled={uploadingUpdateThumbnail}
                            />
                            {uploadingUpdateThumbnail && (
                              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                                Téléchargement en cours...
                              </p>
                            )}
                            {updateFormData.thumbnail && !uploadingUpdateThumbnail && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <img
                                  src={updateFormData.thumbnail}
                                  alt="Aperçu"
                                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                />
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                              type="submit"
                              disabled={submittingUpdate}
                              className="btn-primary"
                              style={{ flex: 1, padding: '0.75rem', cursor: 'pointer', opacity: submittingUpdate ? 0.6 : 1 }}
                            >
                              {submittingUpdate ? 'Soumission en cours...' : 'Soumettre la demande'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpdateFormOpen(false)}
                              style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', fontWeight: 600, color: 'var(--secondary)' }}
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
