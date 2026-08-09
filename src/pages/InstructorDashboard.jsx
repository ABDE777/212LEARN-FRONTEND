import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BookOpen, Plus, Video, Users, User, LogOut,
  Calendar, Clock, Link, ExternalLink, Copy, Check,
  CheckCircle, ChevronRight, ChevronLeft, Zap, Mail, Search,
  HelpCircle, Brain, Lock, Pencil, Trash2, X, Save,
} from 'lucide-react';
import { useInstructorCourses, useCreateCourse, useCourseCurriculum, useCourseQuizzes, useCreateQuiz, useGenerateAiQuiz, useAddQuizQuestion, useQuiz, useUpdateQuiz, useDeleteQuiz, useUpdateQuestion, useDeleteQuestion } from '../hooks/useInstructorCourses';
import { useMeetings } from '../hooks/useMeetings';
import { useCourseStudents } from '../hooks/useCourseStudents';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import VirtualClassroom from '../components/VirtualClassroom';

/* ─── helpers ─────────────────────────────── */
const PLATFORMS = [
  { id: 'zoom',   label: 'Zoom',         color: '#2D8CFF', pattern: 'zoom.us' },
  { id: 'meet',   label: 'Google Meet',  color: '#34A853', pattern: 'meet.google' },
  { id: 'teams',  label: 'Teams',        color: '#6264A7', pattern: 'teams.microsoft' },
  { id: 'custom', label: 'Autre lien',   color: '#C1652F', pattern: '' },
];

function detectPlatform(url = '') {
  return PLATFORMS.find(p => p.pattern && url.includes(p.pattern)) || PLATFORMS[3];
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function useCountdown(targetIso) {
  const [diff, setDiff] = useState(() => new Date(targetIso) - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(targetIso) - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}j ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min ${s}s`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copier le lien"
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success-color)' : 'var(--secondary)', padding: '2px' }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/* ─── Meeting card ─────────────────────────── */
function MeetingCard({ meeting, onStart, onEnd, onJoin, onEdit }) {
  const isPast = meeting.status === 'COMPLETED' || new Date(meeting.meetingDate) < Date.now();
  const isLive = meeting.status === 'LIVE';
  const isScheduled = meeting.status === 'SCHEDULED';
  const countdown = useCountdown(meeting.meetingDate);
  const isImminent = !isPast && !isLive && countdown && !countdown.includes('j') && !countdown.includes('h');
  const [actionLoading, setActionLoading] = useState(false);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await onStart?.(meeting.id);
      onJoin?.(meeting);
    } catch (_) {}
    setActionLoading(false);
  };

  const handleEnd = async () => {
    setActionLoading(true);
    try {
      await onEnd?.(meeting.id);
    } catch (_) {}
    setActionLoading(false);
  };

  const handleEdit = () => {
    onEdit?.(meeting);
  };

  return (
    <div style={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${isLive ? '#28a745' : isPast ? 'var(--border-color)' : 'var(--primary)33'}`,
      background: isLive ? '#f6fff8' : isPast ? '#f9f9f9' : '#fff',
      opacity: isPast && !meeting.recordingUrl ? 0.75 : 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: isLive ? '0 4px 14px rgba(40,167,69,0.18)' : isPast ? 'none' : 'var(--shadow-sm)',
    }}
      onMouseEnter={e => !isPast && (e.currentTarget.style.transform = 'translateY(-3px)', e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = isLive ? '0 4px 14px rgba(40,167,69,0.18)' : isPast ? 'none' : 'var(--shadow-sm)')}
    >
      {/* Colored top bar */}
      <div style={{ height: '4px', background: isLive ? '#28a745' : isPast ? 'var(--border-color)' : 'var(--primary)' }} />

      <div style={{ padding: '1.25rem' }}>
        {/* Platform badge + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
            background: isLive ? 'rgba(40,167,69,0.15)' : isPast ? '#eee' : 'rgba(193,101,47,0.18)',
            color: isLive ? '#28a745' : isPast ? '#999' : 'var(--primary)',
          }}>
            <Video size={11} />
            Classe Virtuelle 212Learn
          </span>

          {isLive ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#28a745' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28a745', animation: 'pulse 1s infinite' }} />
              EN DIRECT
            </span>
          ) : isPast ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontStyle: 'italic' }}>Terminée</span>
          ) : isImminent ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#e74c3c' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e74c3c', animation: 'pulse 1s infinite' }} />
              BIENTÔT
            </span>
          ) : countdown ? (
            <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
              dans {countdown}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.6rem', lineHeight: 1.3 }}>
          {meeting.title}
        </h3>

        {/* Date / time */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--secondary)' }}>
            <Calendar size={13} /> {formatDate(meeting.meetingDate)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--secondary)' }}>
            <Clock size={13} /> {formatTime(meeting.meetingDate)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isLive ? (
            <>
              <button
                type="button"
                onClick={() => onJoin?.(meeting)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                  background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                <Video size={14} /> Rejoindre la salle
              </button>
              <button
                type="button"
                onClick={handleEnd}
                disabled={actionLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                  background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)', cursor: 'pointer',
                }}
              >
                Terminer la classe
              </button>
            </>
          ) : isScheduled ? (
            <>
              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                <Zap size={14} /> Démarrer la classe
              </button>
              <button
                type="button"
                onClick={handleEdit}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                  background: 'rgba(193,101,47,0.1)', color: '#C1652F', border: '1px solid rgba(193,101,47,0.2)', cursor: 'pointer',
                }}
              >
                <Pencil size={14} /> Modifier
              </button>
            </>
          ) : meeting.recordingUrl ? (
            <a
              href={meeting.recordingUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                background: 'var(--secondary)', color: '#fff', textDecoration: 'none',
              }}
            >
              <Video size={14} /> Voir le replay
            </a>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
              Session terminée
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Edit meeting form ─────────────────────── */
function EditMeetingForm({ meeting, onSave, onCancel }) {
  const [title, setTitle] = useState(meeting.title || '');
  const [date, setDate] = useState(new Date(meeting.meetingDate).toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date(meeting.meetingDate).toISOString().slice(11, 16));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // minimum datetime = now + 5 min
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 10);
  const minTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(11, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) return;
    setError(null);
    setSubmitting(true);
    try {
      const meetingDate = new Date(`${date}T${time}:00`).toISOString();
      await onSave({
        title: title.trim(),
        meetingDate,
      });
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de modifier la session. Vérifiez les champs et réessayez.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {/* Title */}
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Titre de la session *
          </label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ex : Q&A React Hooks — Session Live"
            required
          />
        </div>

        {/* Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
              Date *
            </label>
            <input
              type="date"
              className="form-control"
              value={date}
              min={minDate}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
              Heure *
            </label>
            <input
              type="time"
              className="form-control"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(193,101,47,0.08)', borderRadius: '8px', border: '1px solid rgba(193,101,47,0.15)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={16} style={{ color: 'var(--primary)' }} />
            Cette session utilisera la classe virtuelle intégrée Jitsi 212Learn
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.75rem 1.25rem', background: 'transparent', color: 'var(--secondary)', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
          Annuler
        </button>
        <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0.75rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {submitting ? 'Modification…' : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>
    </form>
  );
}

function ScheduleForm({ courses, onScheduled }) {
  const [step, setStep] = useState(1); // 1 = pick course, 2 = fill details
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { createMeeting } = useMeetings(courseId);
  const selectedCourse = courses.find(c => c.id === courseId);

  // minimum datetime = now + 5 min
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 10);
  const minTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(11, 16);

  const reset = () => {
    setStep(1); setCourseId(''); setTitle('');
    setDate(''); setTime(''); setError(null); setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !title.trim() || !date || !time) return;
    setError(null);
    setSubmitting(true);
    try {
      const meetingDate = new Date(`${date}T${time}:00`).toISOString();
      await createMeeting({
        title: title.trim(),
        meetingDate,
        // No meetingUrl - will use in-app Jitsi virtual classroom
      });
      setSuccess(true);
      onScheduled?.(courseId);
      setTimeout(reset, 2500);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de créer la session. Vérifiez les champs et réessayez.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="#fff" />
        </div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>Session planifiée !</h3>
        <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
          Les étudiants inscrits ont été notifiés automatiquement.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem',
              background: step >= s ? 'var(--primary)' : 'var(--border-color)',
              color: step >= s ? '#fff' : 'var(--secondary)',
              transition: 'background 0.3s',
            }}>
              {step > s ? <Check size={16} /> : s}
            </div>
            <span style={{ fontSize: '0.85rem', color: step >= s ? 'var(--primary)' : 'var(--secondary)', fontWeight: step >= s ? 600 : 400 }}>
              {s === 1 ? 'Choisir le cours' : 'Détails de la session'}
            </span>
            {i === 0 && <ChevronRight size={16} style={{ color: 'var(--border-color)' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Step 1: pick course */}
      {step === 1 && (
        <div>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Sélectionnez le cours pour lequel vous souhaitez planifier une session live.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {courses.map(course => (
              <button
                key={course.id}
                type="button"
                onClick={() => { setCourseId(course.id); setStep(2); }}
                style={{
                  padding: '1.25rem', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                  border: `2px solid ${courseId === course.id ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: courseId === course.id ? 'rgba(193,101,47,0.05)' : '#fff',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = courseId === course.id ? 'var(--primary)' : 'var(--border-color)'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <BookOpen size={18} color="var(--primary)" />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.3rem', fontSize: '0.92rem', lineHeight: 1.3 }}>
                  {course.title}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
                  {course._count?.enrollments || course.enrolledCount || 0} étudiants
                </p>
              </button>
            ))}
          </div>
          {courses.length === 0 && (
            <p style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>
              Vous n'avez aucun cours. Créez d'abord un cours.
            </p>
          )}
        </div>
      )}

      {/* Step 2: fill details */}
      {step === 2 && (
        <form onSubmit={handleSubmit}>
          {/* Selected course pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(193,101,47,0.06)', borderRadius: '10px', border: '1px solid rgba(193,101,47,0.15)', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-color)' }}>
                {selectedCourse?.title}
              </span>
            </div>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
              Changer
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Title */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Titre de la session *
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ex : Q&A React Hooks — Session Live"
                required
              />
            </div>

            {/* Virtual Classroom Info */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ padding: '1rem', background: 'rgba(193,101,47,0.08)', borderRadius: '8px', border: '1px solid rgba(193,101,47,0.15)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={16} style={{ color: 'var(--primary)' }} />
                  Cette session utilisera la classe virtuelle intégrée Jitsi 212Learn
                </p>
              </div>
            </div>

            {/* Date + Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  min={minDate}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  Heure *
                </label>
                <input
                  type="time"
                  className="form-control"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Live preview card */}
            {title && date && time && (
              <div style={{ borderRadius: '12px', border: `1.5px dashed ${platform.color}`, padding: '1.25rem', background: platform.color + '08' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: platform.color, marginBottom: '0.6rem' }}>
                  Aperçu de la session
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: platform.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Video size={20} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.2rem' }}>{title}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
                      {date && time && `${formatDate(new Date(`${date}T${time}`))} à ${time}`}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: platform.color, marginTop: '0.15rem' }}>
                      via {url ? platform.label : 'Classe Virtuelle 212Learn'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0.75rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {submitting ? 'Planification…' : <><Calendar size={16} /> Planifier la session</>}
            </button>
            <button type="button" onClick={reset} className="btn-secondary" style={{ padding: '0.75rem 1.25rem', background: 'transparent', color: 'var(--secondary)', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ─── Meetings tab ─────────────────────────── */
function MeetingsTab({ courses }) {
  const [view, setView] = useState('list'); // 'list' | 'schedule'
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || '');
  const { meetings, loading, error, fetchMeetings, startMeeting, endMeeting, updateMeeting } = useMeetings(activeCourseId);
  const [activeVirtualMeeting, setActiveVirtualMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (activeCourseId) fetchMeetings();
  }, [activeCourseId, fetchMeetings]);

  const liveMeetings = meetings.filter(m => m.status === 'LIVE');
  const upcoming = meetings.filter(m => m.status === 'SCHEDULED').sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
  const past = meetings.filter(m => m.status === 'COMPLETED').sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
  };

  const handleUpdateMeeting = async (updatedData) => {
    try {
      await updateMeeting(editingMeeting.id, updatedData);
      setEditingMeeting(null);
    } catch (err) {
      console.error('Failed to update meeting:', err);
    }
  };

  return (
    <div>
      {/* Active Virtual Classroom Modal */}
      {activeVirtualMeeting && (
        <VirtualClassroom
          meeting={activeVirtualMeeting}
          displayName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Instructeur'}
          isInstructor={true}
          onClose={() => setActiveVirtualMeeting(null)}
        />
      )}

      {/* Edit Meeting Drawer */}
      {editingMeeting && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }}
          onClick={() => setEditingMeeting(null)}
        >
          <div
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: '450px', maxWidth: '90vw', background: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Modifier la session
              </h3>
              <button
                type="button"
                onClick={() => setEditingMeeting(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} style={{ color: 'var(--secondary)' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <EditMeetingForm
                meeting={editingMeeting}
                onSave={handleUpdateMeeting}
                onCancel={() => setEditingMeeting(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Sessions Live & Classe Virtuelle</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Planifiez, démarrez et gérez vos cours virtuels interactifs en direct.
          </p>
        </div>
        <button
          onClick={() => setView(view === 'schedule' ? 'list' : 'schedule')}
          className={view === 'schedule' ? 'btn-secondary' : 'btn-primary'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          {view === 'schedule' ? <><Video size={16} /> Voir les sessions</> : <><Calendar size={16} /> Planifier une session</>}
        </button>
      </div>

      {view === 'schedule' ? (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }}
          onClick={() => setView('list')}
        >
          <div
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: '500px', maxWidth: '90vw', background: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Planifier une session
              </h3>
              <button
                type="button"
                onClick={() => setView('list')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} style={{ color: 'var(--secondary)' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <ScheduleForm
                courses={courses}
                onScheduled={(cId) => {
                  setActiveCourseId(cId);
                  setView('list');
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Course filter pills */}
          {courses.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {courses.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCourseId(c.id)}
                  style={{
                    padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${activeCourseId === c.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: activeCourseId === c.id ? 'rgba(193,101,47,0.08)' : 'transparent',
                    color: activeCourseId === c.id ? 'var(--primary)' : 'var(--secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}
                </button>
              ))}
            </div>
          )}

          {loading && <LoadingSpinner />}
          {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

          {!loading && !error && meetings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--border-color)', borderRadius: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(193,101,47,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Calendar size={28} color="var(--primary)" />
              </div>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Aucune session planifiée</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Planifiez votre première session live pour ce cours.
              </p>
              <button className="btn-primary" onClick={() => setView('schedule')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem' }}>
                <Calendar size={16} /> Planifier maintenant
              </button>
            </div>
          )}

          {/* Live Sessions NOW */}
          {liveMeetings.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#28a745', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28a745', animation: 'pulse 1s infinite', display: 'inline-block' }} />
                En direct maintenant ({liveMeetings.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {liveMeetings.map(m => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onStart={startMeeting}
                    onEnd={endMeeting}
                    onJoin={(meetingToJoin) => setActiveVirtualMeeting(meetingToJoin)}
                    onEdit={handleEditMeeting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                Planifiées / À venir ({upcoming.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {upcoming.map(m => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onStart={startMeeting}
                    onEnd={endMeeting}
                    onJoin={(meetingToJoin) => setActiveVirtualMeeting(meetingToJoin)}
                    onEdit={handleEditMeeting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-color)', display: 'inline-block' }} />
                Sessions terminées / Enregistrements ({past.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {past.map(m => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onStart={startMeeting}
                    onEnd={endMeeting}
                    onJoin={(meetingToJoin) => setActiveVirtualMeeting(meetingToJoin)}
                    onEdit={handleEditMeeting}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Students tab ──────────────────────────── */
function StudentsTab({ courses }) {
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || '');
  const [search, setSearch] = useState('');
  const { students, loading, error } = useCourseStudents(activeCourseId);

  const filtered = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const email = (s.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Mes étudiants</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Consultez les étudiants inscrits à vos cours.
        </p>
      </div>

      {/* Course filter pills */}
      {courses.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {courses.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActiveCourseId(c.id); setSearch(''); }}
              style={{
                padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${activeCourseId === c.id ? 'var(--primary)' : 'var(--border-color)'}`,
                background: activeCourseId === c.id ? 'rgba(193,101,47,0.08)' : 'transparent',
                color: activeCourseId === c.id ? 'var(--primary)' : 'var(--secondary)',
                transition: 'all 0.15s',
              }}
            >
              {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', opacity: 0.6 }} />
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(193,101,47,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Users size={28} color="var(--primary)" />
          </div>
          <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            {students.length === 0 ? 'Aucun étudiant inscrit' : 'Aucun résultat'}
          </h3>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            {students.length === 0
              ? "Aucun étudiant n'est encore inscrit à ce cours."
              : 'Aucun étudiant ne correspond à votre recherche.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Nom</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Date d'inscription</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => (
                <tr key={student.id || idx}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {student.firstName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {student.firstName || ''} {student.lastName || ''}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} />
                      {student.email || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                    {student.enrolledAt
                      ? new Date(student.enrolledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
          {filtered.length} étudiant{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''} sur {students.length}
        </p>
      )}
    </div>
  );
}

/* ─── Quizzes tab ───────────────────────────── */
function QuizzesTab({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [viewingQuizId, setViewingQuizId] = useState(null);

  const [aiLessonId, setAiLessonId] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(5);

  const [newQuestionQuizId, setNewQuestionQuizId] = useState('');
  const [questionStatement, setQuestionStatement] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);
  const [questionCorrect, setQuestionCorrect] = useState('');

  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizEditTitle, setQuizEditTitle] = useState('');

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQStatement, setEditQStatement] = useState('');
  const [editQOptions, setEditQOptions] = useState(['', '', '', '']);
  const [editQCorrect, setEditQCorrect] = useState('');

  const [quizMsg, setQuizMsg] = useState(null);

  const { curriculum, loading: currLoading } = useCourseCurriculum(selectedCourseId);
  const { quizzes, loading: quizzesLoading, refreshQuizzes } = useCourseQuizzes(selectedCourseId);
  const { createQuiz, loading: createLoading, error: createError } = useCreateQuiz();
  const { generateQuiz, loading: genLoading, error: genError } = useGenerateAiQuiz();
  const { addQuestion, loading: addQLoading, error: addQError } = useAddQuizQuestion();
  const { quiz: viewingQuiz, loading: viewingLoading, error: viewingError, refreshQuiz } = useQuiz(viewingQuizId);
  const { updateQuiz, error: updateQuizError } = useUpdateQuiz();
  const { deleteQuiz, loading: deleteQuizLoading } = useDeleteQuiz();
  const { updateQuestion, error: updateQuestionError } = useUpdateQuestion();
  const { deleteQuestion, loading: deleteQuestionLoading } = useDeleteQuestion();

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const allLessons = curriculum.flatMap(sec =>
    (sec.lessons || []).map(les => ({
      id: les.id || les._id,
      label: `${sec.title || sec.name} — ${les.title || les.name || 'Leçon'}`,
    }))
  );

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedLessonId || !quizTitle.trim()) return;
    try {
      await createQuiz(selectedLessonId, quizTitle.trim());
      setQuizTitle('');
      setSelectedLessonId('');
      setQuizMsg({ type: 'success', text: 'Quiz créé avec succès.' });
      await refreshQuizzes();
    } catch (_) {}
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiLessonId || !aiTitle.trim() || !aiPrompt.trim()) return;
    try {
      await generateQuiz(aiLessonId, { title: aiTitle.trim(), prompt: aiPrompt.trim(), questionCount: aiCount });
      setAiTitle('');
      setAiPrompt('');
      setAiCount(5);
      setAiLessonId('');
      setQuizMsg({ type: 'success', text: 'Quiz généré avec succès.' });
      await refreshQuizzes();
    } catch (_) {}
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionQuizId || !questionStatement.trim() || questionOptions.some(o => !o.trim()) || !questionCorrect.trim()) return;
    try {
      await addQuestion(newQuestionQuizId, {
        statement: questionStatement.trim(),
        options: questionOptions.map(o => o.trim()),
        correctAnswer: questionCorrect.trim(),
      });
      setQuestionStatement('');
      setQuestionOptions(['', '', '', '']);
      setQuestionCorrect('');
      setQuizMsg({ type: 'success', text: 'Question ajoutée avec succès.' });
    } catch (_) {}
  };

  const handleOptionChange = (idx, val) => {
    setQuestionOptions(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleQuizStatusChange = async (quizId, status) => {
    try {
      await updateQuiz(quizId, { validationStatus: status });
      setQuizMsg({ type: 'success', text: `Statut du quiz défini sur "${status}".` });
      await refreshQuizzes();
      if (viewingQuizId === quizId) await refreshQuiz();
    } catch (_) {}
  };

  const startEditQuiz = (quiz) => {
    setEditingQuizId(quiz.id);
    setQuizEditTitle(quiz.title || '');
  };

  const handleSaveQuizTitle = async (e) => {
    e.preventDefault();
    if (!editingQuizId || !quizEditTitle.trim()) return;
    try {
      await updateQuiz(editingQuizId, { title: quizEditTitle.trim() });
      setEditingQuizId(null);
      setQuizMsg({ type: 'success', text: 'Titre du quiz mis à jour.' });
      await refreshQuizzes();
      if (viewingQuizId === editingQuizId) await refreshQuiz();
    } catch (_) {}
  };

  const handleDeleteQuiz = async (quiz) => {
    const confirmed = window.confirm(`Supprimer le quiz "${quiz.title}" et toutes ses questions ?`);
    if (!confirmed) return;
    try {
      await deleteQuiz(quiz.id);
      if (viewingQuizId === quiz.id) setViewingQuizId(null);
      setQuizMsg({ type: 'success', text: 'Quiz supprimé avec succès.' });
      await refreshQuizzes();
    } catch (_) {}
  };

  const startEditQuestion = (q) => {
    const opts = q.options || [];
    setEditingQuestionId(q.id);
    setEditQStatement(q.statement || '');
    setEditQOptions(opts.length === 4 ? [...opts] : [...opts, ...Array(4 - opts.length).fill('')].slice(0, 4));
    setEditQCorrect(q.correctAnswer || '');
  };

  const handleEditOptionChange = (idx, val) => {
    setEditQOptions(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestionId || !editQStatement.trim() || editQOptions.some(o => !o.trim()) || !editQCorrect.trim()) return;
    try {
      await updateQuestion(editingQuestionId, {
        statement: editQStatement.trim(),
        options: editQOptions.map(o => o.trim()),
        correctAnswer: editQCorrect.trim(),
      });
      setEditingQuestionId(null);
      setQuizMsg({ type: 'success', text: 'Question mise à jour avec succès.' });
      await refreshQuiz();
    } catch (_) {}
  };

  const handleDeleteQuestion = async (question) => {
    const confirmed = window.confirm('Supprimer cette question ?');
    if (!confirmed) return;
    try {
      await deleteQuestion(question.id);
      setQuizMsg({ type: 'success', text: 'Question supprimée avec succès.' });
      await refreshQuiz();
    } catch (_) {}
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Quiz</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Créez, modifiez et gérez des quiz pour vos cours.
        </p>
      </div>

      {quizMsg && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: quizMsg.type === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${quizMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          color: quizMsg.type === 'success' ? '#155724' : '#721c24',
        }}>
          <span>{quizMsg.text}</span>
          <button onClick={() => setQuizMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>×</button>
        </div>
      )}
      {(updateQuizError || updateQuestionError) && (
        <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {updateQuizError || updateQuestionError}
        </div>
      )}

      {/* Course selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {courses.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setSelectedCourseId(c.id); setSelectedLessonId(''); setAiLessonId(''); setNewQuestionQuizId(''); setViewingQuizId(null); setEditingQuizId(null); setEditingQuestionId(null); setQuizMsg(null); }}
            style={{
              padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${selectedCourseId === c.id ? 'var(--primary)' : 'var(--border-color)'}`,
              background: selectedCourseId === c.id ? 'rgba(193,101,47,0.08)' : 'transparent',
              color: selectedCourseId === c.id ? 'var(--primary)' : 'var(--secondary)',
              transition: 'all 0.15s',
            }}
          >
            {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}
          </button>
        ))}
      </div>

      {/* View quiz detail */}
      {viewingQuizId && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--primary)', borderRadius: '12px', background: 'rgba(193,101,47,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
              {viewingQuiz ? viewingQuiz.title : 'Chargement...'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {viewingQuiz && (
                <select
                  className="form-control"
                  value={viewingQuiz.validationStatus || 'draft'}
                  onChange={e => handleQuizStatusChange(viewingQuiz.id, e.target.value)}
                  style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                >
                  <option value="draft">draft</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              )}
              {viewingQuiz && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuiz(viewingQuiz)}
                  disabled={deleteQuizLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                    border: '1px solid #f5c6cb', background: '#f8d7da', color: '#721c24', cursor: deleteQuizLoading ? 'wait' : 'pointer',
                  }}
                >
                  <Trash2 size={13} /> Supprimer
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingQuizId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Fermer
              </button>
            </div>
          </div>
          {viewingLoading && <LoadingSpinner />}
          {!viewingLoading && viewingError && (
            <p style={{ color: 'var(--error-color)', fontSize: '0.9rem' }}>{viewingError}</p>
          )}
          {!viewingLoading && !viewingError && !viewingQuiz && (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucune donnée reçue pour ce quiz.</p>
          )}
          {!viewingLoading && viewingQuiz && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
                Statut : <span style={{ fontWeight: 600, color: viewingQuiz.validationStatus === 'approved' ? 'var(--success-color)' : viewingQuiz.validationStatus === 'rejected' ? 'var(--error-color)' : '#b26a00' }}>
                  {viewingQuiz.validationStatus}
                </span>
                {' · '}{(viewingQuiz.questions || []).length} question{(viewingQuiz.questions || []).length !== 1 ? 's' : ''}
              </p>
              {(viewingQuiz.questions || []).length === 0 && (
                <p style={{ color: 'var(--secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>Aucune question pour l'instant.</p>
              )}
              {(viewingQuiz.questions || []).map((q, idx) => (
                editingQuestionId === q.id ? (
                  <div key={q.id || idx} style={{ padding: '1rem', border: '1.5px solid var(--primary)', borderRadius: '8px', marginBottom: '0.75rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary)' }}>Modifier la question</p>
                      <button type="button" onClick={() => setEditingQuestionId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.82rem' }}>Annuler</button>
                    </div>
                    <form onSubmit={handleSaveQuestion}>
                      <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Question *</label>
                        <input type="text" className="form-control" value={editQStatement} onChange={e => setEditQStatement(e.target.value)} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        {editQOptions.map((opt, oi) => (
                          <div key={oi} className="form-group" style={{ margin: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.8rem', color: 'var(--secondary)' }}>Option {oi + 1} *</label>
                            <input type="text" className="form-control" value={opt} onChange={e => handleEditOptionChange(oi, e.target.value)} required />
                          </div>
                        ))}
                      </div>
                      <div className="form-group" style={{ margin: 0, marginBottom: '1rem', maxWidth: '400px' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Bonne réponse *</label>
                        <select className="form-control" value={editQCorrect} onChange={e => setEditQCorrect(e.target.value)} required>
                          <option value="">-- Choisir la bonne réponse --</option>
                          {editQOptions.filter(o => o.trim()).map((opt, oi) => (
                            <option key={oi} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={!editQStatement.trim() || editQOptions.some(o => !o.trim()) || !editQCorrect.trim()}
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Enregistrer
                      </button>
                    </form>
                  </div>
                ) : (
                  <div key={q.id || idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.92rem' }}>{idx + 1}. {q.statement}</p>
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button type="button" onClick={() => startEditQuestion(q)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)', cursor: 'pointer' }}>
                          <Pencil size={12} /> Modifier
                        </button>
                        <button type="button" onClick={() => handleDeleteQuestion(q)} disabled={deleteQuestionLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: '1px solid #f5c6cb', background: '#fff', color: 'var(--error-color)', cursor: deleteQuestionLoading ? 'wait' : 'pointer' }}>
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', background: opt === q.correctAnswer ? 'rgba(52,168,83,0.1)' : 'var(--bg-color)', border: `1px solid ${opt === q.correctAnswer ? 'var(--success-color)' : 'var(--border-color)'}`, color: opt === q.correctAnswer ? 'var(--success-color)' : 'var(--text-color)' }}>
                          {opt} {opt === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Create quiz manually */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <HelpCircle size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)' }}>Créer un quiz</h3>
          </div>
          {createError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{createError}</p>}
          <form onSubmit={handleCreateQuiz}>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Leçon *</label>
              <select
                className="form-control"
                value={selectedLessonId}
                onChange={e => setSelectedLessonId(e.target.value)}
                required
                disabled={currLoading}
              >
                <option value="">{currLoading ? 'Chargement...' : '-- Sélectionner une leçon --'}</option>
                {allLessons.map(les => (
                  <option key={les.id} value={les.id}>{les.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Titre du quiz *</label>
              <input
                type="text"
                className="form-control"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="ex: Quiz React Hooks"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={createLoading || !selectedLessonId || !quizTitle.trim()} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              {createLoading ? 'Création...' : 'Créer le quiz'}
            </button>
          </form>
        </div>

        {/* AI generate */}
        <div style={{ padding: '1.5rem', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', background: 'rgba(124,58,237,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={18} color="#7C3AED" />
            <h3 style={{ fontSize: '1rem', color: '#7C3AED' }}>Générer avec l'IA</h3>
          </div>
          {genError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{genError}</p>}
          <form onSubmit={handleAiGenerate}>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Leçon *</label>
              <select
                className="form-control"
                value={aiLessonId}
                onChange={e => setAiLessonId(e.target.value)}
                required
                disabled={currLoading}
              >
                <option value="">{currLoading ? 'Chargement...' : '-- Sélectionner une leçon --'}</option>
                {allLessons.map(les => (
                  <option key={les.id} value={les.id}>{les.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Titre du quiz *</label>
              <input
                type="text"
                className="form-control"
                value={aiTitle}
                onChange={e => setAiTitle(e.target.value)}
                placeholder="ex: Quiz JavaScript avancé"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Prompt / consignes *</label>
              <textarea
                className="form-control"
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Décrivez le contenu du quiz..."
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Nombre de questions</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={20}
                value={aiCount}
                onChange={e => setAiCount(parseInt(e.target.value) || 5)}
              />
            </div>
            <button type="submit" disabled={genLoading || !aiLessonId || !aiTitle.trim() || !aiPrompt.trim()} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: genLoading || !aiLessonId || !aiTitle.trim() || !aiPrompt.trim() ? 0.6 : 1 }}>
              {genLoading ? 'Génération...' : 'Générer avec l\'IA'}
            </button>
          </form>
        </div>
      </div>

      {/* Add question */}
      <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Ajouter une question</h3>
        {addQError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{addQError}</p>}
        <form onSubmit={handleAddQuestion}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Quiz *</label>
              <select className="form-control" value={newQuestionQuizId} onChange={e => setNewQuestionQuizId(e.target.value)} required>
                <option value="">-- Sélectionner un quiz --</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.questionCount || 0} questions)</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Question *</label>
              <input type="text" className="form-control" value={questionStatement} onChange={e => setQuestionStatement(e.target.value)} placeholder="Quelle est la bonne réponse ?" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {questionOptions.map((opt, idx) => (
              <div key={idx} className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.8rem', color: 'var(--secondary)' }}>Option {idx + 1} *</label>
                <input type="text" className="form-control" value={opt} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} required />
              </div>
            ))}
          </div>
          <div className="form-group" style={{ margin: 0, marginBottom: '1rem', maxWidth: '400px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Bonne réponse *</label>
            <select className="form-control" value={questionCorrect} onChange={e => setQuestionCorrect(e.target.value)} required>
              <option value="">-- Choisir la bonne réponse --</option>
              {questionOptions.filter(o => o.trim()).map((opt, idx) => (
                <option key={idx} value={opt.trim()}>{opt.trim()}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={addQLoading || !newQuestionQuizId || !questionStatement.trim() || questionOptions.some(o => !o.trim()) || !questionCorrect.trim()} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            {addQLoading ? 'Ajout...' : 'Ajouter la question'}
          </button>
        </form>
      </div>

      {/* Existing quizzes list */}
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          Quiz existants {selectedCourse ? `— ${selectedCourse.title}` : ''}
        </h3>
        {quizzesLoading && <LoadingSpinner />}
        {!quizzesLoading && quizzes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            <HelpCircle size={28} style={{ color: 'var(--secondary)', opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun quiz pour ce cours.</p>
          </div>
        )}
        {!quizzesLoading && quizzes.length > 0 && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {quizzes.map(quiz => (
              <div key={quiz.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#fff', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  {editingQuizId === quiz.id ? (
                    <form onSubmit={handleSaveQuizTitle} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={quizEditTitle}
                        onChange={e => setQuizEditTitle(e.target.value)}
                        autoFocus
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.88rem' }}
                      />
                      <button type="submit" disabled={!quizEditTitle.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        <Save size={13} /> OK
                      </button>
                      <button type="button" onClick={() => setEditingQuizId(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: 'transparent', color: 'var(--secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <X size={13} /> Annuler
                      </button>
                    </form>
                  ) : (
                    <p style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.2rem' }}>{quiz.title}</p>
                  )}
                  <p style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
                    {quiz.lessonTitle || 'Leçon'} {quiz.sectionTitle ? `· ${quiz.sectionTitle}` : ''} · {quiz.questionCount || 0} question{(quiz.questionCount || 0) !== 1 ? 's' : ''}
                    {' · '}
                    <span style={{ color: quiz.validationStatus === 'approved' ? 'var(--success-color)' : quiz.validationStatus === 'rejected' ? 'var(--error-color)' : '#b26a00', fontWeight: 600 }}>
                      {quiz.validationStatus}
                    </span>
                  </p>
                  {quiz.lastAttempt && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                      Dernière tentative : {quiz.lastAttempt.score}%
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <select
                    className="form-control"
                    value={quiz.validationStatus || 'draft'}
                    onChange={e => handleQuizStatusChange(quiz.id, e.target.value)}
                    style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    title="Changer le statut"
                  >
                    <option value="draft">draft</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => editingQuizId === quiz.id ? setEditingQuizId(null) : startEditQuiz(quiz)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff', color: 'var(--text-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <Pencil size={13} /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingQuizId(quiz.id)}
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--primary)', borderRadius: '8px', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Voir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz)}
                    disabled={deleteQuizLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #f5c6cb', borderRadius: '8px', background: '#fff', color: 'var(--error-color)', cursor: deleteQuizLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
  const { courses, loading, error } = useInstructorCourses();
  const { createCourse, loading: createLoading, error: createError } = useCreateCourse();
  const { user, logout } = useAuth();

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const course = await createCourse({
        title: newCourseTitle,
        categoryId: newCourseCategory || undefined,
      });
      navigate(`/instructor/courses/${course.id}/manage`);
    } catch (err) {
      console.error(err);
    }
  };

  const TABS = [
    { key: 'courses',  icon: <BookOpen size={18} />,  label: 'Mes cours' },
    { key: 'create',   icon: <Plus size={18} />,       label: 'Créer un cours' },
    { key: 'quizzes',  icon: <HelpCircle size={18} />, label: 'Quiz' },
    { key: 'meetings', icon: <Video size={18} />,      label: 'Sessions Live' },
    { key: 'students', icon: <Users size={18} />,      label: 'Étudiants' },
    { key: 'profile',  icon: <User size={18} />,       label: 'Mon profil' },
    { key: 'security', icon: <Lock size={18} />,       label: 'Sécurité' },
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
            <div key="profile" className="tab-panel"><ProfileEditForm /></div>
          ) : activeTab === 'security' ? (
            <div key="security" className="tab-panel"><ChangePasswordForm /></div>
          ) : (
            <div key={activeTab} className="tab-panel" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>

              {/* My Courses */}
              {activeTab === 'courses' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Mes cours</h2>
                  {loading && <LoadingSpinner />}
                  {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
                  {!loading && !error && courses.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>Vous n'avez pas encore de cours.</p>
                  )}
                  {!loading && !error && courses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {courses.map(course => (
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

              {/* Create course */}
              {activeTab === 'create' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Créer un cours</h2>
                  {createError && <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{createError}</p>}
                  <form onSubmit={handleCreateCourse} style={{ maxWidth: '500px' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre du cours *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newCourseTitle}
                        onChange={e => setNewCourseTitle(e.target.value)}
                        required
                        placeholder="ex : Maîtriser React en 2026"
                      />
                    </div>
                    <button type="submit" className="btn-primary" disabled={createLoading} style={{ padding: '0.75rem 1.5rem' }}>
                      {createLoading ? 'Création…' : 'Créer le brouillon'}
                    </button>
                  </form>
                </div>
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
            </div>
          )}
        </main>
      </div>

      {/* Keyframe for pulse dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
