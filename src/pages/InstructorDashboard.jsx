import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BookOpen, Plus, Video, Users, User, LogOut,
  Calendar, Clock, Link, ExternalLink, Copy, Check,
  CheckCircle, ChevronRight, Zap, Mail, Search,
} from 'lucide-react';
import { useInstructorCourses, useCreateCourse } from '../hooks/useInstructorCourses';
import { useMeetings } from '../hooks/useMeetings';
import { useCourseStudents } from '../hooks/useCourseStudents';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';

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
function MeetingCard({ meeting }) {
  const isPast = new Date(meeting.meetingDate) < Date.now();
  const countdown = useCountdown(meeting.meetingDate);
  const isImminent = !isPast && countdown && !countdown.includes('j') && !countdown.includes('h');
  const platform = detectPlatform(meeting.meetingUrl);

  return (
    <div style={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${isPast ? 'var(--border-color)' : platform.color + '33'}`,
      background: isPast ? '#f9f9f9' : '#fff',
      opacity: isPast ? 0.75 : 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: isPast ? 'none' : 'var(--shadow-sm)',
    }}
      onMouseEnter={e => !isPast && (e.currentTarget.style.transform = 'translateY(-3px)', e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = isPast ? 'none' : 'var(--shadow-sm)')}
    >
      {/* Colored top bar */}
      <div style={{ height: '4px', background: isPast ? 'var(--border-color)' : platform.color }} />

      <div style={{ padding: '1.25rem' }}>
        {/* Platform badge + imminent pulse */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
            background: isPast ? '#eee' : platform.color + '18', color: isPast ? '#999' : platform.color,
          }}>
            <Video size={11} />
            {platform.label}
          </span>

          {isPast ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontStyle: 'italic' }}>Terminée</span>
          ) : isImminent ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#e74c3c' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e74c3c', animation: 'pulse 1s infinite' }} />
              EN COURS / BIENTÔT
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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--secondary)' }}>
            <Calendar size={13} /> {formatDate(meeting.meetingDate)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--secondary)' }}>
            <Clock size={13} /> {formatTime(meeting.meetingDate)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
              background: isPast ? '#eee' : platform.color, color: isPast ? '#888' : '#fff',
              textDecoration: 'none', transition: 'opacity 0.2s',
            }}
          >
            <ExternalLink size={13} />
            {isPast ? 'Voir le lien' : 'Rejoindre'}
          </a>
          <CopyButton text={meeting.meetingUrl} />
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule form ────────────────────────── */
function ScheduleForm({ courses, onScheduled }) {
  const [step, setStep] = useState(1); // 1 = pick course, 2 = fill details
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl]   = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { createMeeting } = useMeetings(courseId);
  const platform = detectPlatform(url);
  const selectedCourse = courses.find(c => c.id === courseId);

  // minimum datetime = now + 5 min
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 10);
  const minTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(11, 16);

  const reset = () => {
    setStep(1); setCourseId(''); setTitle(''); setUrl('');
    setDate(''); setTime(''); setError(null); setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !title.trim() || !url.trim() || !date || !time) return;
    setError(null);
    setSubmitting(true);
    try {
      const meetingDate = new Date(`${date}T${time}:00`).toISOString();
      await createMeeting({ title: title.trim(), meetingUrl: url.trim(), meetingDate });
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

            {/* Platform buttons + URL */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Lien de la réunion *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (p.id !== 'custom') setUrl(`https://${p.pattern}.com/`);
                    }}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${platform.id === p.id ? p.color : 'var(--border-color)'}`,
                      background: platform.id === p.id ? p.color + '18' : 'transparent',
                      color: platform.id === p.id ? p.color : 'var(--secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  className="form-control"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Link size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: platform.color, pointerEvents: 'none' }} />
              </div>
              {url && (
                <p style={{ fontSize: '0.78rem', color: platform.color, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={11} /> Plateforme détectée : {platform.label}
                </p>
              )}
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
            {title && url && date && time && (
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
                      via {platform.label}
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
  const { meetings, loading, error, fetchMeetings } = useMeetings(activeCourseId);

  useEffect(() => {
    if (activeCourseId) fetchMeetings();
  }, [activeCourseId, fetchMeetings]);

  const now = Date.now();
  const upcoming = meetings.filter(m => new Date(m.meetingDate) >= now).sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
  const past = meetings.filter(m => new Date(m.meetingDate) < now).sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Sessions Live</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Planifiez et gérez vos sessions Zoom, Meet ou Teams.
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
        <ScheduleForm
          courses={courses}
          onScheduled={(cId) => {
            setActiveCourseId(cId);
            setView('list');
          }}
        />
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

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)', display: 'inline-block' }} />
                À venir ({upcoming.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-color)', display: 'inline-block' }} />
                Passées ({past.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {past.map(m => <MeetingCard key={m.id} meeting={m} />)}
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

/* ─── Main dashboard ──────────────────────── */
export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  const navigate = useNavigate();
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
    { key: 'meetings', icon: <Video size={18} />,      label: 'Sessions Live' },
    { key: 'students', icon: <Users size={18} />,      label: 'Étudiants' },
    { key: 'profile',  icon: <User size={18} />,       label: 'Mon profil' },
  ];

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
                {user?.firstName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="sidebar-username-wrapper">
              <div className="sidebar-username">{user?.firstName} {user?.lastName}</div>
              <span className="sidebar-userrole">Instructeur</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`sidebar-menu-btn ${activeTab === t.key ? 'active' : ''}`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
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
