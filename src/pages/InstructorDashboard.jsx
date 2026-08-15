import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BookOpen, Plus, Video, Users, User, LogOut,
  Calendar, Clock, Link, ExternalLink, Copy, Check,
  CheckCircle, ChevronRight, ChevronLeft, Zap, Mail, Search,
  HelpCircle, Brain, Pencil, Trash2, X, Save, LayoutGrid,
  TrendingUp, TrendingDown, DollarSign, Award, BarChart3, RefreshCw, Tag,
  GraduationCap, Target, Activity, UserPlus,
} from 'lucide-react';
import { useInstructorCourses, useCreateCourse, useCourseCurriculum, useCourseQuizzes, useCreateQuiz, useGenerateAiQuiz, useAddQuizQuestion, useQuiz, useUpdateQuiz, useDeleteQuiz, useUpdateQuestion, useDeleteQuestion } from '../hooks/useInstructorCourses';
import { useMeetings } from '../hooks/useMeetings';
import { useCourseStudents } from '../hooks/useCourseStudents';
import { useInstructorAnalytics } from '../hooks/useInstructorAnalytics';
import { useCoupons } from '../hooks/useCoupons';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import VirtualClassroom from '../components/VirtualClassroom';
import SessionCalendar from '../components/SessionCalendar';
import api from '../services/api';

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

function ScheduleForm({ courses, initialCourseId, onScheduled }) {
  // When the tab already has a course in context (its calendar is open), start
  // straight at the details step for that course instead of re-asking.
  const hasInitial = Boolean(initialCourseId && courses.some(c => c.id === initialCourseId));
  const [step, setStep] = useState(hasInitial ? 2 : 1); // 1 = pick course, 2 = fill details
  const [courseId, setCourseId] = useState(hasInitial ? initialCourseId : '');
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
    setStep(hasInitial ? 2 : 1); setCourseId(hasInitial ? initialCourseId : '');
    setTitle(''); setDate(''); setTime(''); setError(null); setSuccess(false);
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
              <div style={{ borderRadius: '12px', border: '1.5px dashed var(--primary)', padding: '1.25rem', background: 'rgba(193,101,47,0.08)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: '0.6rem' }}>
                  Aperçu de la session
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Video size={20} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.2rem' }}>{title}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
                      {date && time && `${formatDate(new Date(`${date}T${time}`))} à ${time}`}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '0.15rem' }}>
                      via Classe Virtuelle 212Learn
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
  const [view, setView] = useState('calendar'); // 'calendar' | 'schedule'
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || '');
  const { meetings, loading, error, fetchMeetings, startMeeting, endMeeting, updateMeeting, deleteMeeting } = useMeetings(activeCourseId);
  const [activeVirtualMeeting, setActiveVirtualMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (activeCourseId) fetchMeetings();
  }, [activeCourseId, fetchMeetings]);

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

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await deleteMeeting(meetingId);
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  const handleMeetingClick = async (meeting) => {
    if (meeting.action === 'start') {
      // Start the meeting and then open virtual classroom
      try {
        const updatedMeeting = await startMeeting(meeting.id);
        await fetchMeetings();
        setActiveVirtualMeeting(updatedMeeting || meeting);
      } catch (err) {
        console.error('Failed to start meeting:', err);
      }
    } else if (meeting.status === 'LIVE') {
      setActiveVirtualMeeting(meeting);
    } else if (meeting.status === 'SCHEDULED') {
      handleEditMeeting(meeting);
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      await endMeeting(meetingId);
      setActiveVirtualMeeting(null);
      await fetchMeetings();
    } catch (err) {
      console.error('Failed to end meeting:', err);
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
          onEndMeeting={handleEndMeeting}
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
          onClick={() => setView(view === 'schedule' ? 'calendar' : 'schedule')}
          className={view === 'schedule' ? 'btn-secondary' : 'btn-primary'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          {view === 'schedule' ? <><Calendar size={16} /> Voir le calendrier</> : <><Calendar size={16} /> Planifier une session</>}
        </button>
      </div>

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

      {!loading && !error && (
        <SessionCalendar
          meetings={meetings}
          onMeetingClick={handleMeetingClick}
          onEditMeeting={handleEditMeeting}
          onDeleteMeeting={handleDeleteMeeting}
        />
      )}

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
                initialCourseId={activeCourseId}
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

/* ─── Analytics Tab ──────────────────────── */
/* Number formatting helpers, French locale. */
const nf = new Intl.NumberFormat('fr-FR');
const fmtInt = (n) => nf.format(Math.round(Number(n) || 0));
const fmtMoney = (n) => nf.format(Math.round(Number(n) || 0));
const monthLabel = (key) => {
  if (!key || !key.includes('-')) return key || '';
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
};
const levelLabel = (lvl) => ({ beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[lvl] || lvl || '—');

/* One compact stat tile. */
function StatTile({ icon: Icon, label, value, sub, subColor, accent }) {
  return (
    <div style={{ padding: '1.1rem 1.25rem', background: 'var(--surface-color, #fff)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--secondary)' }}>
        <span style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', background: `${accent}1a`, color: accent }}>
          <Icon size={17} />
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1.1 }}>{value}</div>
      {sub != null && <div style={{ fontSize: '0.8rem', color: subColor || 'var(--secondary)', fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

/* Vertical bar chart of the monthly revenue trend (single series, one hue). */
function MonthlyRevenueChart({ monthly, currency }) {
  const data = monthly || [];
  if (data.length === 0) {
    return <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>Aucune donnée de revenus pour le moment.</p>;
  }
  const max = Math.max(...data.map((m) => Number(m.revenue) || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 180, overflowX: 'auto', paddingTop: '1.5rem' }}>
      {data.map((m) => {
        const val = Number(m.revenue) || 0;
        const h = Math.max((val / max) * 140, val > 0 ? 4 : 0);
        return (
          <div key={m.month} title={`${monthLabel(m.month)} · ${fmtMoney(val)} ${currency} · ${fmtInt(m.enrollments)} inscription(s)`}
            style={{ flex: '1 0 42px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-color)' }}>{val > 0 ? fmtMoney(val) : ''}</span>
            <div style={{ width: '100%', maxWidth: 40, height: h, background: 'var(--primary)', borderRadius: '4px 4px 2px 2px', transition: 'height .3s' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>{monthLabel(m.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* Horizontal ranked bars — top courses by revenue. */
function TopCoursesChart({ topCourses, currency }) {
  const data = topCourses || [];
  if (data.length === 0) {
    return <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun revenu par cours à afficher.</p>;
  }
  const max = Math.max(...data.map((c) => Number(c.revenue) || 0), 1);
  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      {data.map((c, i) => {
        const val = Number(c.revenue) || 0;
        const w = Math.max((val / max) * 100, val > 0 ? 3 : 0);
        return (
          <div key={c.courseId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {i + 1}. {c.title}
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>
                {fmtMoney(val)} {currency}
              </span>
            </div>
            <div style={{ background: 'var(--border-color)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div title={`${fmtInt(c.students)} étudiant(s)`} style={{ width: `${w}%`, height: '100%', background: 'var(--primary)', borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{fmtInt(c.students)} étudiant(s)</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--surface-color, #fff)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: subtitle ? '0.2rem' : '1rem' }}>
        {Icon && <Icon size={18} style={{ color: 'var(--primary)' }} />}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>{title}</h3>
      </div>
      {subtitle && <p style={{ color: 'var(--secondary)', fontSize: '0.82rem', margin: '0 0 1rem' }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function AnalyticsTab({ revenueData, studentsData, completionData, loading, error, refetch }) {
  const currency = revenueData?.currency || 'MAD';

  const growth = Number(revenueData?.growth || 0);
  const totalRevenue = Number(revenueData?.totalRevenue || 0);
  const currentMonthRevenue = Number(revenueData?.currentMonthRevenue || 0);
  const avgOrder = Number(revenueData?.averageOrderValue || 0);
  const totalStudents = Number(studentsData?.totalStudents || 0);
  const totalEnrollments = Number(studentsData?.totalEnrollments ?? revenueData?.totalEnrollments ?? 0);
  const newStudents = Number(studentsData?.newStudentsThisMonth || 0);
  const avgCompletion = Number(completionData?.averageCompletion || 0);
  const avgProgress = Number(completionData?.averageProgress || 0);

  const monthly = revenueData?.monthly || [];
  const topCourses = revenueData?.topCourses || [];
  const studentCourses = studentsData?.courses || [];
  const completionCourses = completionData?.courses || [];

  const growthColor = growth > 0 ? '#059669' : growth < 0 ? 'var(--error-color, #ef4444)' : 'var(--secondary)';
  const GrowthIcon = growth >= 0 ? TrendingUp : TrendingDown;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-color)' }}>
            Analytics
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Revenus, étudiants et progression sur l'ensemble de vos cours
          </p>
        </div>
        <button
          onClick={refetch}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem',
            background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* ── KPI tiles ─────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            <StatTile icon={DollarSign} accent="#059669" label="Revenus totaux"
              value={`${fmtMoney(totalRevenue)} ${currency}`}
              sub={`Panier moyen : ${fmtMoney(avgOrder)} ${currency}`} />
            <StatTile icon={BarChart3} accent="#c1652f" label="Revenus ce mois"
              value={`${fmtMoney(currentMonthRevenue)} ${currency}`}
              sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GrowthIcon size={13} />{growth >= 0 ? '+' : ''}{growth}% vs mois dernier</span>}
              subColor={growthColor} />
            <StatTile icon={Users} accent="#2563eb" label="Étudiants uniques"
              value={fmtInt(totalStudents)}
              sub={`${fmtInt(totalEnrollments)} inscription(s) au total`} />
            <StatTile icon={UserPlus} accent="#7c3aed" label="Nouveaux ce mois"
              value={fmtInt(newStudents)}
              sub="Étudiants inscrits ce mois-ci" />
            <StatTile icon={Award} accent="#d97706" label="Complétion moyenne"
              value={`${avgCompletion}%`}
              sub="Étudiants ayant tout terminé" />
            <StatTile icon={Activity} accent="#0891b2" label="Progression moyenne"
              value={`${avgProgress}%`}
              sub="Avancement moyen des étudiants" />
          </div>

          {/* ── Monthly revenue trend ─────────────────── */}
          <SectionCard title="Revenus mensuels" subtitle="Sur les 12 derniers mois" icon={BarChart3}>
            <MonthlyRevenueChart monthly={monthly} currency={currency} />
          </SectionCard>

          {/* ── Top courses by revenue ────────────────── */}
          <SectionCard title="Meilleurs cours par revenu" subtitle="Vos 5 cours les plus rentables" icon={TrendingUp}>
            <TopCoursesChart topCourses={topCourses} currency={currency} />
          </SectionCard>

          {/* ── Two-column: students + completion ─────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <SectionCard title="Étudiants par cours" icon={GraduationCap}>
              {studentCourses.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun étudiant inscrit pour le moment.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {studentCourses.map((c) => (
                    <div key={c.courseId} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', background: 'var(--border-color)', padding: '1px 7px', borderRadius: 5 }}>{levelLabel(c.level)}</span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{fmtInt(c.students)}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>étudiant(s)</div>
                        </div>
                      </div>
                      {Array.isArray(c.recentStudents) && c.recentStudents.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>
                          Récents : {c.recentStudents.map((s) => s.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Complétion par cours" icon={Target}>
              {completionCourses.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucune donnée de complétion pour le moment.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {completionCourses.map((c) => (
                    <div key={c.courseId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>{c.averageProgress}%</span>
                      </div>
                      <div style={{ background: 'var(--border-color)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                        <div title={`Progression moyenne ${c.averageProgress}%`} style={{ width: `${c.averageProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: 6 }} />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--secondary)', marginTop: '0.3rem' }}>
                        {fmtInt(c.completedCount)}/{fmtInt(c.totalEnrolled)} terminé(s) · {fmtInt(c.totalLessons)} leçon(s) · {c.completionRate}% complet
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Coupons ──────────────────────── */
// Instructor coupons are scoped to one of the instructor's own courses; the
// backend requires a courseId on create and returns only the coupons this
// instructor created.
function CouponsTab({ courses }) {
  const { coupons, loading, error, createCoupon, deleteCoupon, refetch } = useCoupons();
  const emptyForm = { code: '', discount: '', expirationDate: '', maxUsage: 100, courseId: '' };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!form.courseId) { setFormError('Veuillez choisir un cours pour ce coupon.'); return; }
    submitLock.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        discount: parseFloat(form.discount),
        expirationDate: new Date(form.expirationDate).toISOString(),
        maxUsage: parseInt(form.maxUsage, 10),
        isActive: true,
        courseId: form.courseId,
      });
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de créer le coupon.');
    } finally {
      setSaving(false);
      submitLock.current = false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCoupon(id);
      await refetch();
    } catch {
      // no-op: the list simply won't change
    }
  };

  const courseTitle = (id) => courses.find(c => c.id === id)?.title || '—';
  const inputStyle = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Mes coupons</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Créez des codes de réduction valables uniquement pour l'un de vos cours.
        </p>
      </div>

      {courses.length === 0 ? (
        <p style={{ color: 'var(--secondary)' }}>Vous devez d'abord créer un cours pour pouvoir créer un coupon.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
          {formError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Code *</label>
              <input type="text" required placeholder="EX: PROMO20" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                style={{ ...inputStyle, textTransform: 'uppercase' }} />
            </div>
            <div>
              <label style={labelStyle}>Cours *</label>
              <select required value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })} style={inputStyle}>
                <option value="">Choisir un cours…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Réduction (%) *</label>
              <input type="number" required min="1" max="100" placeholder="20" value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date d'expiration *</label>
              <input type="date" required value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Utilisations max</label>
              <input type="number" min="1" value={form.maxUsage}
                onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Plus size={16} /> {saving ? 'Création…' : 'Créer le coupon'}
            </button>
          </div>
        </form>
      )}

      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : coupons.length === 0 ? (
        <p style={{ color: 'var(--secondary)' }}>Aucun coupon pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {coupons.map(c => {
            const expired = c.isExpired || new Date(c.expirationDate) < new Date();
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{c.code}</span>
                    <span style={{ background: 'rgba(193,101,47,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>-{Number(c.discount)}%</span>
                    {(!c.isActive || expired) && (
                      <span style={{ background: '#f3f4f6', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                        {expired ? 'Expiré' : 'Inactif'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--secondary)', marginTop: '0.3rem' }}>
                    {c.course?.title || courseTitle(c.courseId)} · {c.currentUsage}/{c.maxUsage} utilisé(s) · expire le {new Date(c.expirationDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} title="Supprimer" aria-label="Supprimer le coupon"
                  className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--error-color)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
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
  const { revenueData, studentsData, completionData, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useInstructorAnalytics();

  const [createCourseDrawerOpen, setCreateCourseDrawerOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCategoryId, setNewCourseCategoryId] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('');
  const [newCourseThumbnailFile, setNewCourseThumbnailFile] = useState(null);
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

      const { uploadUrl, formFields, cloudName } = signResponse.data.data;

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
            <div key="profile" className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <ProfileEditForm />
              <ChangePasswordForm />
            </div>
          ) : (
            <div key={activeTab} className="tab-panel" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>

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
