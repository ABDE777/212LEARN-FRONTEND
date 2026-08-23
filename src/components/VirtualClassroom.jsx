import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2, ExternalLink, PhoneOff, Wifi } from 'lucide-react';
import api from '../services/api';

/**
 * VirtualClassroom
 * ─────────────────
 * Salle virtuelle basée sur MiroTalk SFU (auto-hébergé, gratuit, sans limite
 * d'utilisateurs actifs/mois — contrairement à Jitsi/JaaS).
 *
 * La salle est simplement embarquée en <iframe>. L'URL de base vient de
 * VITE_MIROTALK_URL (votre serveur MiroTalk SFU) ; à défaut, l'instance
 * publique de démonstration est utilisée. Le nom de salle est déterministe
 * par réunion, donc instructeur et étudiants rejoignent la même salle.
 *
 * Props:
 *  - meeting     : { id, title, meetingUrl, roomName, status }
 *  - displayName : nom de l'utilisateur courant
 *  - isInstructor: boolean
 *  - onClose     : callback quand l'utilisateur ferme la salle
 *  - onEndMeeting: callback quand l'instructeur termine la session
 */
export default function VirtualClassroom({ meeting, displayName, isInstructor, onClose, onEndMeeting }) {
  const containerRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Anti-leak watermark: for students, stamp their identity over the video so any
  // screen recording is traceable. It drifts between corners so it can't simply
  // be cropped out. (OS-level capture can't be blocked — this is deterrence.)
  const [wmCorner, setWmCorner] = useState(0);
  useEffect(() => {
    if (isInstructor) return undefined;
    const t = setInterval(() => setWmCorner((c) => (c + 1) % 4), 8000);
    return () => clearInterval(t);
  }, [isInstructor]);
  const wmStyle = [
    { top: '14%', left: '6%' },
    { top: '14%', right: '6%' },
    { bottom: '16%', right: '6%' },
    { bottom: '16%', left: '6%' },
  ][wmCorner];

  // ── Build the MiroTalk SFU room URL ──────────────────────────────────────
  // Base: your self-hosted server (VITE_MIROTALK_URL) or the public demo.
  const base = (import.meta.env.VITE_MIROTALK_URL || 'https://sfu.mirotalk.com').replace(/\/+$/, '');
  const room = encodeURIComponent(`212learn-${meeting?.roomName || meeting?.id || 'salle'}`);
  const name = encodeURIComponent(displayName || (isInstructor ? 'Instructeur' : 'Participant'));
  // audio/video on; the participant shares their screen manually via the toolbar.
  const roomUrl = `${base}/join?room=${room}&name=${name}&audio=1&video=1&screen=0&hide=0&notify=0`;

  // ── Students: poll meeting status so the room auto-closes when the ─────────
  // instructor ends the session.
  useEffect(() => {
    if (!meeting?.id || isInstructor) return undefined;
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/meetings/${meeting.id}`);
        const currentMeeting = response.data?.data?.meeting;
        if (currentMeeting?.status === 'COMPLETED') {
          clearInterval(pollInterval);
          onClose?.();
        }
      } catch (err) {
        console.error('Failed to poll meeting status:', err);
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [meeting?.id, isInstructor, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Render through a portal to <body> so the overlay escapes the dashboard's
  // animated tab panel and truly covers the whole viewport.
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        background: '#0f1117',
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.25rem',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            padding: '4px 10px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
          }}>
            212Learn
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
              {meeting?.title || 'Salle Virtuelle'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', margin: 0 }}>
              {isInstructor ? 'Mode Instructeur' : 'Mode Étudiant'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Connection status */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.25rem 0.7rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600,
            background: connected ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.15)',
            color: connected ? '#28a745' : '#ffc107',
            border: `1px solid ${connected ? 'rgba(40,167,69,0.3)' : 'rgba(255,193,7,0.3)'}`,
          }}>
            {connected ? <Wifi size={11} /> : (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffc107', animation: 'glowPulse 1s ease infinite', display: 'inline-block' }} />
            )}
            {connected ? 'Connecté' : 'Connexion…'}
          </span>

          {/* Open in new tab */}
          <a
            href={roomUrl}
            target="_blank"
            rel="noreferrer"
            title="Ouvrir dans un nouvel onglet"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <ExternalLink size={14} />
          </a>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Quitter la salle"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.3)',
              color: '#dc3545', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.15)'; }}
          >
            <X size={14} />
          </button>

          {/* End Session (instructor only) */}
          {isInstructor && (
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir terminer cette session ?')) {
                  onEndMeeting?.(meeting.id);
                }
              }}
              title="Terminer la session"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.5rem 1rem', borderRadius: '8px',
                background: '#dc3545', border: '1px solid #dc3545',
                color: '#fff', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#c82333'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#dc3545'; }}
            >
              <PhoneOff size={14} style={{ marginRight: '0.4rem' }} />
              Terminer
            </button>
          )}
        </div>
      </div>

      {/* MiroTalk SFU room */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {/* Loading overlay */}
        {!connected && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#0f1117', zIndex: 1,
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
              animation: 'glowPulse 1.5s ease-in-out infinite',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>212</span>
            </div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>Connexion à la salle virtuelle…</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{meeting?.title}</p>
          </div>
        )}

        <iframe
          title="Salle Virtuelle 212Learn"
          src={roomUrl}
          onLoad={() => setConnected(true)}
          allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write; speaker-selection"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />

        {/* Traceability watermark — students only, drifts to resist cropping */}
        {!isInstructor && (
          <div
            aria-hidden
            style={{
              position: 'absolute', ...wmStyle, zIndex: 5, pointerEvents: 'none',
              color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem', fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)', transition: 'all 1s ease',
              letterSpacing: '0.02em', userSelect: 'none', whiteSpace: 'nowrap',
            }}
          >
            212Learn · {displayName || 'Participant'}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
