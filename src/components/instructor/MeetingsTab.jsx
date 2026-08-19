import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Check, CheckCircle, ChevronRight, Save, Video, X } from 'lucide-react';
import { useMeetings } from '../../hooks/useMeetings';
import LoadingSpinner from '../LoadingSpinner';
import SessionCalendar from '../SessionCalendar';
import VirtualClassroom from '../VirtualClassroom';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
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
export default function MeetingsTab({ courses }) {
  const [view, setView] = useState('calendar'); // 'calendar' | 'schedule'
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || '');
  const { meetings, loading, error, fetchMeetings, startMeeting, endMeeting, updateMeeting, deleteMeeting } = useMeetings(activeCourseId);
  const [activeVirtualMeeting, setActiveVirtualMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);

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
