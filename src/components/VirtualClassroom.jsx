import { useEffect, useRef, useState } from 'react';
import { X, Wifi, WifiOff, Users, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

/**
 * VirtualClassroom
 * ─────────────────
 * Intègre Jitsi Meet via l'External API (iframe + JS bridge).
 * Le backend génère meetingUrl = https://meet.jit.si/<roomName>
 *
 * Props:
 *  - meeting     : { id, title, meetingUrl, roomName, status }
 *  - displayName : nom de l'utilisateur courant
 *  - isInstructor: boolean — contrôles modérateur activés
 *  - onClose     : callback quand l'utilisateur ferme la salle
 */
export default function VirtualClassroom({ meeting, displayName, isInstructor, onClose }) {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const [apiLoaded, setApiLoaded] = useState(!!window.JitsiMeetExternalAPI);
  const [participantCount, setParticipantCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting | connected | error

  // 1. Charger le script Jitsi si pas encore présent
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setApiLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setApiLoaded(true);
    script.onerror = () => setConnectionStatus('error');
    document.head.appendChild(script);
    return () => {
      // Nettoyage uniquement si le script était en cours de chargement
      if (!window.JitsiMeetExternalAPI) document.head.removeChild(script);
    };
  }, []);

  // 2. Initialiser l'API Jitsi quand le script est chargé
  useEffect(() => {
    if (!apiLoaded || !jitsiContainerRef.current || !meeting?.meetingUrl) return;

    // Extraire domain + room depuis l'URL générée par le backend
    let domain = 'meet.jit.si';
    let roomName = meeting.roomName || meeting.meetingUrl.split('/').pop();

    try {
      const url = new URL(meeting.meetingUrl);
      domain = url.hostname;
      roomName = url.pathname.replace(/^\//, '') || roomName;
    } catch (_) {}

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: !isInstructor,
        startWithVideoMuted: !isInstructor,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        enableClosePage: false,
        toolbarButtons: isInstructor
          ? ['microphone', 'camera', 'desktop', 'fullscreen', 'participants-pane', 'chat', 'recording', 'security', 'raisehand', 'tileview', 'hangup']
          : ['microphone', 'camera', 'desktop', 'fullscreen', 'participants-pane', 'chat', 'raisehand', 'tileview', 'hangup'],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_ALWAYS_VISIBLE: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        MOBILE_APP_PROMO: false,
        BRAND_WATERMARK_LINK: '',
        APP_NAME: '212Learn — Salle Virtuelle',
      },
      userInfo: {
        displayName: displayName || 'Participant',
      },
    });

    apiRef.current = api;

    api.addEventListener('videoConferenceJoined', () => {
      setConnectionStatus('connected');
      if (isInstructor) {
        api.executeCommand('subject', meeting.title || 'Session 212Learn');
      }
    });

    api.addEventListener('participantJoined', () => {
      setParticipantCount((n) => n + 1);
    });

    api.addEventListener('participantLeft', () => {
      setParticipantCount((n) => Math.max(0, n - 1));
    });

    api.addEventListener('readyToClose', () => {
      onClose?.();
    });

    api.addEventListener('errorOccurred', () => {
      setConnectionStatus('error');
    });

    return () => {
      try { api.dispose(); } catch (_) {}
      apiRef.current = null;
    };
  }, [apiLoaded, meeting?.meetingUrl, meeting?.roomName, meeting?.title, displayName, isInstructor, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.parentElement?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      background: '#0f1117',
    }}>
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
          {/* Logo + title */}
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
            background: connectionStatus === 'connected' ? 'rgba(40,167,69,0.15)' : connectionStatus === 'error' ? 'rgba(220,53,69,0.15)' : 'rgba(255,193,7,0.15)',
            color: connectionStatus === 'connected' ? '#28a745' : connectionStatus === 'error' ? '#dc3545' : '#ffc107',
            border: `1px solid ${connectionStatus === 'connected' ? 'rgba(40,167,69,0.3)' : connectionStatus === 'error' ? 'rgba(220,53,69,0.3)' : 'rgba(255,193,7,0.3)'}`,
          }}>
            {connectionStatus === 'connected' ? <Wifi size={11} /> : connectionStatus === 'error' ? <WifiOff size={11} /> : (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffc107', animation: 'glowPulse 1s ease infinite', display: 'inline-block' }} />
            )}
            {connectionStatus === 'connected' ? 'Connecté' : connectionStatus === 'error' ? 'Erreur' : 'Connexion…'}
          </span>

          {/* Participant count */}
          {participantCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>
              <Users size={13} />
              {participantCount + 1} participants
            </span>
          )}

          {/* Open in new tab */}
          <a
            href={meeting?.meetingUrl}
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
        </div>
      </div>

      {/* Jitsi container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Loading overlay */}
        {connectionStatus === 'connecting' && (
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

        {/* Error overlay */}
        {connectionStatus === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#0f1117', zIndex: 1,
            padding: '2rem',
          }}>
            <WifiOff size={48} color="#dc3545" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Impossible de rejoindre la salle</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              Vérifiez votre connexion internet ou ouvrez le lien directement.
            </p>
            <a
              href={meeting?.meetingUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.5rem', borderRadius: '10px',
                background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontWeight: 600,
              }}
            >
              <ExternalLink size={16} />
              Ouvrir dans le navigateur
            </a>
          </div>
        )}

        <div ref={jitsiContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
