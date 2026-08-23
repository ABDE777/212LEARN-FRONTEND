import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle,
  Lock, Menu, X, HelpCircle, Download, Clock, AlertCircle, XCircle,
  File as FileIcon, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, Archive,
} from 'lucide-react';
import { useCourseCurriculum } from '../hooks/useCourses';
import { useLessonProgress } from '../hooks/useProgress';
import { useCourseQuizzes, useQuiz } from '../hooks/useInstructorCourses';
import { useQuizAttempts } from '../hooks/useProgress';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import LessonAssignments from '../components/LessonAssignments';
import { useAuth } from '../context/AuthContext';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function resourceLabel(r) {
  if (r.title) return r.title;
  // derive display name from the Cloudinary URL (last segment) or fall back to type
  const raw = r.url?.split('/').pop() || '';
  // strip Cloudinary version prefix (v1234567890_) and extension for readability
  const cleaned = raw.replace(/^v\d+_/, '').replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  return cleaned || r.type?.toUpperCase() || 'Ressource';
}

function resourceIcon(type) {
  switch ((type || '').toLowerCase()) {
    case 'video':    return <VideoIcon size={16} />;
    case 'pdf':      return <FileText  size={16} />;
    case 'image':    return <ImageIcon size={16} />;
    case 'link':     return <LinkIcon  size={16} />;
    case 'zip':      return <Archive   size={16} />;
    case 'document': return <FileText  size={16} />;
    default:         return <FileIcon  size={16} />;
  }
}

/* ─── Protected Video Player ─────────────────────────────────────────────── */

/**
 * Hardened video player with FULLY CUSTOM controls:
 * - No native browser controls → no seekbar/timeline visible
 * - Only: Play/Pause toggle, Volume slider, elapsed time display
 * - Seek-lock still active via onSeeking (safety net for keyboard shortcuts)
 * - No download / no PiP / no remote playback / no speed control
 * - Right-click / drag / keyboard-save blocked
 * - Semi-transparent user watermark
 */
function ProtectedVideoPlayer({ src, userName, onComplete }) {
  const videoRef      = useRef(null);
  const maxReachedRef = useRef(0);
  const completedRef  = useRef(false);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [volume,       setVolume]       = useState(1);
  const [isMuted,      setIsMuted]      = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  // Reset when src changes
  useEffect(() => {
    maxReachedRef.current = 0;
    completedRef.current  = false;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [src]);

  // Auto-hide controls after 3 s of inactivity
  const revealControls = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };
  useEffect(() => {
    revealControls();
    return () => clearTimeout(hideTimer.current);
  }, []);

  // Block save-related keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s','u','p','j'].includes(e.key.toLowerCase())) {
        e.preventDefault(); e.stopPropagation();
      }
      // Space = play/pause
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, []);

  // Block PiP
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const prevent = (e) => e.preventDefault();
    vid.addEventListener('enterpictureinpicture', prevent);
    return () => vid.removeEventListener('enterpictureinpicture', prevent);
  }, []);

  /* ── Video event handlers ── */
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    if (vid.currentTime > maxReachedRef.current) {
      maxReachedRef.current = vid.currentTime;
    }
    if (!completedRef.current && vid.duration > 0 && vid.currentTime >= vid.duration * 0.98) {
      completedRef.current = true;
      onComplete?.();
    }
  };

  // Seek-lock safety net (keyboard arrow keys etc.)
  const handleSeeking = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.currentTime > maxReachedRef.current + 1) {
      vid.currentTime = maxReachedRef.current;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (!completedRef.current) { completedRef.current = true; onComplete?.(); }
  };

  const handleLoadedMetadata = () => {
    const vid = videoRef.current;
    if (vid) { setDuration(vid.duration); vid.play().catch(() => {}); }
  };

  const handlePlay  = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  /* ── Control actions ── */
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); } else { vid.pause(); }
    revealControls();
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
    setIsMuted(v === 0);
    revealControls();
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const next = !isMuted;
    vid.muted = next;
    setIsMuted(next);
    revealControls();
  };

  const handleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    revealControls();
  };

  /* ── Helpers ── */
  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const stopEvent = (e) => { e.preventDefault(); e.stopPropagation(); };

  /* ── Icon SVGs (inline — no extra dep) ── */
  const PlayIcon  = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><polygon points="5,3 19,12 5,21"/></svg>;
  const PauseIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
  const VolIcon   = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><polygon points="3,9 7,9 12,5 12,19 7,15 3,15"/>{!isMuted && <><path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="white" strokeWidth="1.8" fill="none"/></>}{isMuted && <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2"/>}</svg>;
  const FullIcon  = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="white" strokeWidth="2" fill="none"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>;

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', background: '#000', userSelect: 'none', cursor: 'default' }}
      onContextMenu={stopEvent}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
    >
      {/* Video — NO native controls */}
      <video
        ref={videoRef}
        src={src}
        draggable={false}
        disablePictureInPicture
        disableRemotePlayback
        style={{ width: '100%', height: '100%', display: 'block' }}
        onContextMenu={stopEvent}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onClick={togglePlay}
      />

      {/* Play/Pause big centre click area */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
            cursor: 'pointer', zIndex: 3,
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.4)',
          }}>
            <svg viewBox="0 0 24 24" width="34" height="34" fill="white" style={{ marginLeft: 4 }}>
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
        </div>
      )}

      {/* Custom controls bar — NO seekbar */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          padding: '1.5rem 1rem 0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          zIndex: 4,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Time display — no seekbar */}
        <span style={{ color: '#fff', fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: '80px' }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Volume */}
        <button
          onClick={toggleMute}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <VolIcon />
        </button>
        <input
          type="range" min="0" max="1" step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{ width: '70px', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <FullIcon />
        </button>
      </div>

      {/* Watermark */}
      {userName && (
        <div style={{
          position: 'absolute', top: '12px', right: '16px',
          color: 'rgba(255,255,255,0.18)', fontSize: '0.78rem',
          fontWeight: 600, letterSpacing: '0.04em',
          pointerEvents: 'none', userSelect: 'none',
          zIndex: 5, textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          fontFamily: 'monospace',
        }}>
          212LEARN · {userName}
        </div>
      )}
    </div>
  );
}

/* ─── Inline Quiz Player ──────────────────────────────────────────────────── */

function InlineQuizPlayer({ quizId, courseId, onClose }) {
  const { quiz, loading, error: loadError } = useQuiz(quizId);
  const { submitQuizAttempt, loading: submitting, error: submitError } = useQuizAttempts();

  const [answers, setAnswers]               = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults]       = useState(false);
  const [results, setResults]               = useState(null);
  const startTimeRef                        = useRef(Date.now());

  const questions    = quiz?.questions || [];
  const totalCount   = questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQ     = questions[currentQuestion];
  const progress     = totalCount ? ((currentQuestion + 1) / totalCount) * 100 : 0;

  const handleAnswerSelect = (questionId, optionText) =>
    setAnswers(prev => ({ ...prev, [questionId]: optionText }));

  const handleSubmit = async () => {
    if (!quiz || answeredCount === 0) return;
    const duration     = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const answersArray = questions
      .filter(q => answers[q.id])
      .map(q => ({ questionId: q.id, selectedAnswer: answers[q.id] }));
    try {
      const result = await submitQuizAttempt(quizId, { answers: answersArray, duration });
      setResults(result);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResults(null);
    setShowResults(false);
    startTimeRef.current = Date.now();
  };

  const blockCopy = (e) => { e.preventDefault(); return false; };

  /* ── wrapper styling ── */
  const wrap = {
    background: 'var(--bg-color)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  };

  if (loading) return (
    <div style={{ ...wrap, padding: '3rem', textAlign: 'center' }}>
      <LoadingSpinner />
    </div>
  );

  if (loadError) return (
    <div style={{ ...wrap, padding: '2rem', textAlign: 'center' }}>
      <AlertCircle size={40} color="var(--error-color)" style={{ marginBottom: '1rem' }} />
      <p style={{ color: 'var(--error-color)' }}>{loadError}</p>
      <button onClick={onClose} style={btnStyle('outline')}>Fermer</button>
    </div>
  );

  if (!quiz || (quiz.validationStatus && quiz.validationStatus !== 'approved')) return (
    <div style={{ ...wrap, padding: '2rem', textAlign: 'center' }}>
      <AlertCircle size={40} color="#b26a00" style={{ marginBottom: '1rem' }} />
      <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Quiz non disponible</h3>
      <p style={{ color: 'var(--secondary)' }}>Ce quiz n'a pas encore été publié.</p>
      <button onClick={onClose} style={{ ...btnStyle('outline'), marginTop: '1rem' }}>Retour au cours</button>
    </div>
  );

  if (totalCount === 0) return (
    <div style={{ ...wrap, padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--secondary)' }}>Ce quiz ne contient aucune question pour le moment.</p>
      <button onClick={onClose} style={{ ...btnStyle('outline'), marginTop: '1rem' }}>Retour au cours</button>
    </div>
  );

  /* ── Results screen ── */
  if (showResults && results) {
    const percentage   = results.percentage || `${Math.round(results.score)}%`;
    const passed       = results.passed;
    const incorrectCount = Math.max(0, results.totalCount - results.correctCount);

    return (
      <div style={wrap}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>{quiz.title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%',
            background: passed ? 'var(--success-color)' : 'var(--error-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{percentage}</span>
          </div>
          <h2 style={{ color: passed ? 'var(--success-color)' : 'var(--error-color)', marginBottom: '0.5rem' }}>
            {passed ? 'Félicitations !' : 'Essayez encore'}
          </h2>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            {passed ? 'Vous avez réussi le quiz !' : 'Vous devez obtenir au moins 60% pour réussir.'}
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Questions', value: results.totalCount, color: 'var(--primary)' },
              { label: 'Correctes', value: results.correctCount, color: 'var(--success-color)' },
              { label: 'Incorrectes', value: incorrectCount, color: 'var(--error-color)' },
            ].map(s => (
              <div key={s.label} style={{ padding: '0.75rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-color)', marginBottom: '0.75rem' }}>Détail des réponses</h4>
            {(results.breakdown || []).map((item, idx) => (
              <div key={item.questionId || idx} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.5rem', background: '#fff', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                {item.isCorrect
                  ? <CheckCircle size={16} color="var(--success-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  : <XCircle    size={16} color="var(--error-color)"   style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.2rem' }}>{idx + 1}. {item.statement}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', margin: 0 }}>
                    Votre réponse : <span style={{ fontWeight: 600, color: item.isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>{item.selectedAnswer || '—'}</span>
                  </p>
                  {!item.isCorrect && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', margin: '0.1rem 0 0' }}>
                      Bonne réponse : <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{item.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!passed && (
              <button onClick={handleRetry} style={btnStyle('secondary')}>Réessayer le quiz</button>
            )}
            <button onClick={onClose} style={btnStyle('primary')}>Continuer le cours</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active quiz ── */
  return (
    <div
      style={wrap}
      onCopy={blockCopy}
      onCut={blockCopy}
      onContextMenu={blockCopy}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HelpCircle size={20} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>{quiz.title}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
            <Clock size={16} /> {answeredCount}/{totalCount} répondues
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }} title="Quitter le quiz">
            <X size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem', userSelect: 'none', WebkitUserSelect: 'none' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.4rem' }}>
            <span>Question {currentQuestion + 1} sur {totalCount}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', margin: 0 }}>
            {currentQ?.statement}
          </h3>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {(currentQ?.options || []).map((option) => {
            const selected = answers[currentQ.id] === option;
            return (
              <button
                key={option}
                onClick={() => handleAnswerSelect(currentQ.id, option)}
                style={{
                  padding: '0.9rem 1.25rem',
                  border: selected ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                  borderRadius: '10px',
                  background: selected ? 'rgba(var(--primary-rgb, 180,90,20),0.06)' : 'var(--surface-color)',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  border: selected ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
                </div>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Question dots */}
        {totalCount > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: currentQuestion === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: answers[q.id] ? 'var(--primary)' : '#fff',
                  color: answers[q.id] ? '#fff' : 'var(--secondary)',
                  fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            style={btnStyle('outline', currentQuestion === 0)}
          >
            <ChevronLeft size={18} /> Précédent
          </button>

          {currentQuestion === totalCount - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalCount || submitting}
              style={btnStyle('primary', answeredCount < totalCount || submitting)}
            >
              {submitting ? 'Envoi…' : 'Soumettre le quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(totalCount - 1, prev + 1))}
              disabled={!answers[currentQ?.id]}
              style={btnStyle('primary', !answers[currentQ?.id])}
            >
              Suivant <ChevronRight size={18} />
            </button>
          )}
        </div>

        {answeredCount < totalCount && (
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--secondary)', marginTop: '0.75rem' }}>
            Répondez à toutes les questions ({answeredCount}/{totalCount}) pour soumettre.
          </p>
        )}

        {submitError && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} /> {submitError}
          </div>
        )}
      </div>
    </div>
  );
}

/* small button style helper */
function btnStyle(variant, disabled = false) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, fontSize: '0.9rem', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s',
    border: 'none',
  };
  if (variant === 'primary')  return { ...base, background: 'var(--primary)', color: '#fff' };
  if (variant === 'secondary') return { ...base, background: 'var(--secondary)', color: '#fff' };
  return { ...base, background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--secondary)' };
}

/* ─── Main ClassroomPlayer ────────────────────────────────────────────────── */

export default function ClassroomPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate               = useNavigate();
  const { user }               = useAuth();
  const { curriculum, loading, error } = useCourseCurriculum(courseId);
  const { updateProgress, loading: progressLoading } = useLessonProgress();
  const { quizzes, loading: quizzesLoading } = useCourseQuizzes(courseId);

  const [currentLesson, setCurrentLesson]   = useState(null);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [selectedQuizId, setSelectedQuizId] = useState(null); // inline quiz
  const [videoCompleted, setVideoCompleted] = useState(false); // unlocks next-lesson btn

  const approvedQuizzes = (quizzes || []).filter(q => q.validationStatus === 'approved');

  // Seed completedLessons from the DB-provided progress on first curriculum load
  useEffect(() => {
    if (!curriculum) return;
    const done = new Set();
    for (const section of curriculum.sections) {
      for (const lesson of (section.lessons || [])) {
        if (lesson.progress?.completed) done.add(lesson.id);
      }
    }
    setCompletedLessons(done);
  }, [curriculum]);

  useEffect(() => {
    if (curriculum && lessonId) {
      for (const section of curriculum.sections) {
        const lesson = section.lessons?.find(l => l.id === lessonId);
        if (lesson) {
          setCurrentLesson({ ...lesson, sectionTitle: section.title });
          setSelectedQuizId(null);
          // Restore persisted video-completion state from DB so the button
          // gate is correct even after a page reload.
          setVideoCompleted(lesson.progress?.videoCompleted === true);
          break;
        }
      }
    }
  }, [curriculum, lessonId]);

  const handleLessonClick = (lesson) => {
    if (lesson.isLocked) return;
    navigate(`/learn/${courseId}/lesson/${lesson.id}`);
  };

  // Called automatically when the video finishes — saves progress and unlocks next btn
  const handleVideoComplete = async () => {
    setVideoCompleted(true);
    if (!currentLesson) return;
    try {
      // Persist videoCompleted=true AND completed=true to the server
      await updateProgress(lessonId, {
        completed:      true,
        videoCompleted: true,
        videoPosition:  0,   // reset position — lesson is done
      });
      setCompletedLessons(prev => new Set([...prev, lessonId]));
    } catch (error) {
      console.error('Failed to auto-save progress:', error);
    }
  };

  const navigateToNextLesson = () => {
    if (!curriculum) return;
    for (let i = 0; i < curriculum.sections.length; i++) {
      const section     = curriculum.sections[i];
      const lessonIndex = section.lessons?.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1 && lessonIndex < section.lessons.length - 1) {
        navigate(`/learn/${courseId}/lesson/${section.lessons[lessonIndex + 1].id}`);
        return;
      }
      if (lessonIndex !== -1 && i < curriculum.sections.length - 1) {
        const nextSection = curriculum.sections[i + 1];
        if (nextSection.lessons?.length > 0) {
          navigate(`/learn/${courseId}/lesson/${nextSection.lessons[0].id}`);
          return;
        }
      }
    }
  };

  const navigateToPreviousLesson = () => {
    if (!curriculum) return;
    for (let i = 0; i < curriculum.sections.length; i++) {
      const section     = curriculum.sections[i];
      const lessonIndex = section.lessons?.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1 && lessonIndex > 0) {
        navigate(`/learn/${courseId}/lesson/${section.lessons[lessonIndex - 1].id}`);
        return;
      }
      if (lessonIndex !== -1 && i > 0) {
        const prevSection = curriculum.sections[i - 1];
        if (prevSection.lessons?.length > 0) {
          navigate(`/learn/${courseId}/lesson/${prevSection.lessons[prevSection.lessons.length - 1].id}`);
          return;
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>
          <Link to="/student/dashboard" style={{ textDecoration: 'none' }}>Retour au tableau de bord</Link>
        </Card>
      </div>
    );
  }

  // ── Derive video URL from resources (Lesson has no videoUrl column) ──
  const videoUrl = currentLesson?.resources?.find(r => r.type === 'video')?.url || null;

  // ── All non-video resources to show in the resources panel ──
  const displayResources = (currentLesson?.resources || []).filter(r => r.type !== 'video');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '1rem 1.5rem', alignItems: 'center',
        background: 'var(--surface-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/student/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              212LEARN
            </div>
          </Link>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
            {currentLesson?.sectionTitle}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? '350px' : '0',
          background: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          display: sidebarOpen ? 'block' : 'none',
        }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Programme</h3>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {curriculum?.sections?.map((section, sectionIndex) => (
              <div key={section.id} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '0.95rem', fontWeight: 600,
                  color: 'var(--text-color)', marginBottom: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Section {sectionIndex + 1}: {section.title}
                </h4>
                <div>
                  {section.lessons?.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrent   = lesson.id === lessonId;
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem 1rem', borderRadius: '8px',
                          cursor: lesson.isLocked ? 'not-allowed' : 'pointer',
                          background: isCurrent ? 'var(--bg-color)' : 'transparent',
                          marginBottom: '0.5rem',
                          opacity: lesson.isLocked ? 0.5 : 1,
                        }}
                      >
                        {lesson.isLocked
                          ? <Lock size={16} color="var(--secondary)" />
                          : isCompleted
                            ? <CheckCircle size={16} color="var(--success-color)" />
                            : <PlayCircle  size={16} color="var(--primary)" />}
                        <span style={{
                          fontSize: '0.9rem',
                          color: isCurrent ? 'var(--primary)' : 'var(--text-color)',
                          fontWeight: isCurrent ? 600 : 400, flex: 1,
                        }}>
                          {lesson.title}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                          {lesson.duration || '10 min'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quizzes section */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: 'var(--secondary)' }}>Quiz</h3>
              {quizzesLoading && <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Chargement…</p>}
              {!quizzesLoading && approvedQuizzes.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Aucun quiz publié pour ce cours.</p>
              )}
              {approvedQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    background: selectedQuizId === quiz.id ? 'var(--primary)10' : 'var(--bg-color)',
                    marginBottom: '0.5rem',
                    border: selectedQuizId === quiz.id ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                >
                  <HelpCircle size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-color)', flex: 1 }}>
                    {quiz.title}
                  </span>
                  {quiz.lastAttempt && (
                    <span style={{
                      fontSize: '0.8rem',
                      color: quiz.lastAttempt.score >= 60 ? 'var(--success-color)' : 'var(--error-color)',
                      fontWeight: 600,
                    }}>
                      {quiz.lastAttempt.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Toggle Sidebar Button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'fixed', left: '1rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%', padding: '0.75rem',
                cursor: 'pointer', zIndex: 50,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Menu size={20} color="var(--secondary)" />
            </button>
          )}

          {currentLesson ? (
            <>
              {/* ── Inline Quiz OR Video Area ── */}
              {selectedQuizId ? (
                <div style={{ padding: '1.5rem' }}>
                  <InlineQuizPlayer
                    quizId={selectedQuizId}
                    courseId={courseId}
                    onClose={() => setSelectedQuizId(null)}
                  />
                </div>
              ) : (
                <div style={{
                  background: '#000', aspectRatio: '16/9',
                  maxHeight: '70vh', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {videoUrl ? (
                    <ProtectedVideoPlayer
                      src={videoUrl}
                      userName={user ? `${user.firstName} ${user.lastName}` : ''}
                      onComplete={handleVideoComplete}
                    />
                  ) : currentLesson.type === 'pdf' ? (
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <FileText size={64} style={{ marginBottom: '1rem' }} />
                      <p>Document PDF</p>
                      {currentLesson.pdfUrl && (
                        <a href={currentLesson.pdfUrl} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#fff', textDecoration: 'underline' }}>
                          Ouvrir le PDF
                        </a>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <PlayCircle size={64} style={{ marginBottom: '1rem' }} />
                      <p>Contenu non disponible</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Info and Controls */}
              <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                    {currentLesson.title}
                  </h1>
                  <p style={{ color: 'var(--secondary)', fontSize: '1rem' }}>
                    {currentLesson.description || 'Aucune description disponible'}
                  </p>
                </div>

                {/* Navigation Controls */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.5rem',
                  background: 'var(--surface-color)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}>
                  {/* Previous lesson — always enabled */}
                  <button
                    onClick={navigateToPreviousLesson}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px', cursor: 'pointer',
                      color: 'var(--secondary)', fontWeight: 500,
                    }}
                  >
                    <ChevronLeft size={20} />
                    Leçon précédente
                  </button>

                  {/* Status pill — shows completion or a lock hint */}
                  {videoUrl ? (
                    videoCompleted ? (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        background: 'var(--success-color)',
                        color: '#fff', borderRadius: '8px',
                        fontWeight: 600, fontSize: '0.9rem',
                      }}>
                        <CheckCircle size={18} /> Leçon terminée
                      </span>
                    ) : (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        background: 'var(--bg-color)',
                        color: 'var(--secondary)', borderRadius: '8px',
                        fontWeight: 500, fontSize: '0.85rem',
                        border: '1px solid var(--border-color)',
                      }}>
                        ⏳ Regardez la vidéo pour continuer
                      </span>
                    )
                  ) : (
                    /* No video lesson — show completed state if already done */
                    completedLessons.has(lessonId) ? (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        background: 'var(--success-color)',
                        color: '#fff', borderRadius: '8px',
                        fontWeight: 600, fontSize: '0.9rem',
                      }}>
                        <CheckCircle size={18} /> Leçon terminée
                      </span>
                    ) : null
                  )}

                  {/* Next lesson — disabled until video completes (or no video) */}
                  <button
                    onClick={navigateToNextLesson}
                    disabled={!!videoUrl && !videoCompleted}
                    title={videoUrl && !videoCompleted ? 'Terminez la vidéo pour continuer' : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: videoUrl && !videoCompleted ? 'var(--border-color)' : 'var(--primary)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: videoUrl && !videoCompleted ? 'not-allowed' : 'pointer',
                      color: videoUrl && !videoCompleted ? 'var(--secondary)' : '#fff',
                      fontWeight: 600,
                      opacity: videoUrl && !videoCompleted ? 0.6 : 1,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Leçon suivante
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Resources (non-video) */}
                {displayResources.length > 0 && (
                  <Card variant="default" padding="1.5rem" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', margin: '0 0 1rem 0' }}>Ressources</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {displayResources.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: 'var(--bg-color)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'var(--primary)',
                            fontWeight: 500,
                            border: '1px solid var(--border-color)',
                            transition: 'background 0.15s',
                          }}
                        >
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                            {resourceIcon(resource.type)}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-color)' }}>
                            {resourceLabel(resource)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase' }}>
                            {resource.type}
                          </span>
                          <Download size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                        </a>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Assignments */}
                <LessonAssignments lessonId={lessonId} />
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Leçon non trouvée</p>
              <Link to="/student/dashboard" style={{ textDecoration: 'none' }}>
                Retour au tableau de bord
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
