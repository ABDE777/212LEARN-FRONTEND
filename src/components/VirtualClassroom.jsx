import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Wifi, WifiOff, Users, Maximize2, Minimize2, ExternalLink, PhoneOff, AlertTriangle } from 'lucide-react';
import api from '../services/api';

/**
 * VirtualClassroom
 * ─────────────────
 * Intègre Jitsi Meet via l'External API (iframe + JS bridge).
 * Le backend génère meetingUrl et JWT token pour JaaS authentication.
 *
 * Props:
 *  - meeting     : { id, title, meetingUrl, roomName, status }
 *  - displayName : nom de l'utilisateur courant
 *  - isInstructor: boolean — contrôles modérateur activés
 *  - onClose     : callback quand l'utilisateur ferme la salle
 *  - onEndMeeting: callback quand l'instructeur termine la session
 */
export default function VirtualClassroom({ meeting, displayName, isInstructor, onClose, onEndMeeting }) {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const [apiLoaded, setApiLoaded] = useState(!!window.JitsiMeetExternalAPI);
  const [participantCount, setParticipantCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null); // instructor: plan/permission issue
  const [recNoticeDismissed, setRecNoticeDismissed] = useState(false); // student consent notice
  const recordingStartedRef = useRef(false); // guard: only auto-start once
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting | connected | error
  // The loading overlay sits on top of the Jitsi iframe. If the "joined" event
  // never fires (e.g. the room shows an auth/pre-join screen), the overlay must
  // still step aside so the user can see and interact with the real Jitsi UI.
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [domain, setDomain] = useState('meet.jit.si');
  const [roomName, setRoomName] = useState(null);
  // Anti-leak watermark: for students, stamp their identity over the video so any
  // screen recording is traceable. It drifts between corners so it can't simply
  // be cropped out. (OS-level screen capture can't be blocked outright — this is
  // deterrence + traceability, the same approach paid platforms use.)
  const [wmCorner, setWmCorner] = useState(0);
  useEffect(() => {
    if (isInstructor) return;
    const t = setInterval(() => setWmCorner((c) => (c + 1) % 4), 8000);
    return () => clearInterval(t);
  }, [isInstructor]);
  const wmStyle = [
    { top: '14%', left: '6%' },
    { top: '14%', right: '6%' },
    { bottom: '16%', right: '6%' },
    { bottom: '16%', left: '6%' },
  ][wmCorner];

  // 1. Fetch JaaS join info from backend
  useEffect(() => {
    if (!meeting?.id) return;
    
    const fetchJoinInfo = async () => {
      try {
        const response = await api.get(`/meetings/${meeting.id}/join`);
        const data = response.data?.data;
        // domain + roomName apply whether or not a JWT is issued: public Jitsi
        // (meet.jit.si) returns them with jwt = null.
        if (data?.domain) setDomain(data.domain);
        if (data?.roomName) setRoomName(data.roomName);
        if (data?.jwt) setJwtToken(data.jwt);
      } catch (err) {
        console.error('Failed to fetch JaaS join info:', err);
        // Continue without JWT for fallback to meet.jit.si
      }
    };
    
    fetchJoinInfo();
  }, [meeting?.id]);

  // 2. Charger le script Jitsi si pas encore présent
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setApiLoaded(true);
      return;
    }
    
    // Pour JaaS, charger le script avec l'AppID
    // Extraire l'AppID depuis l'URL de la réunion si disponible
    let scriptSrc = 'https://meet.jit.si/external_api.js'; // Fallback
    
    if (meeting?.meetingUrl) {
      try {
        const url = new URL(meeting.meetingUrl);
        const pathParts = url.pathname.split('/').filter(Boolean);
        // Si l'URL contient l'AppID (format JaaS), utiliser le script JaaS
        if (pathParts.length >= 2 && url.hostname === '8x8.vc') {
          const appId = pathParts[0];
          scriptSrc = `https://8x8.vc/${appId}/external_api.js`;
        }
      } catch (_) {}
    }
    
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => setApiLoaded(true);
    script.onerror = () => setConnectionStatus('error');
    document.head.appendChild(script);
    return () => {
      // Nettoyage uniquement si le script était en cours de chargement
      if (!window.JitsiMeetExternalAPI) document.head.removeChild(script);
    };
  }, [meeting?.meetingUrl]);

  // 3. Initialiser l'API Jitsi quand le script est chargé
  useEffect(() => {
    if (!apiLoaded || !jitsiContainerRef.current) return;

    // Use domain and roomName from /join endpoint, or fallback to meetingUrl
    let jitsiDomain = domain;
    let jitsiRoomName = roomName;

    if (!jitsiDomain || !jitsiRoomName) {
      // Fallback to parsing meetingUrl
      if (meeting?.meetingUrl) {
        try {
          const url = new URL(meeting.meetingUrl);
          jitsiDomain = url.hostname;
          jitsiRoomName = url.pathname.replace(/^\//, '') || meeting.roomName;
        } catch (_) {
          jitsiDomain = 'meet.jit.si';
          jitsiRoomName = meeting.roomName || meeting.meetingUrl.split('/').pop();
        }
      } else {
        return; // No meeting info available
      }
    }

    const apiOptions = {
      roomName: jitsiRoomName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
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
    };

    // Add JWT token if available for JaaS
    if (jwtToken) {
      apiOptions.jwt = jwtToken;
    }

    const api = new window.JitsiMeetExternalAPI(jitsiDomain, apiOptions);

    apiRef.current = api;

    api.addEventListener('videoConferenceJoined', () => {
      setConnectionStatus('connected');
      setOverlayDismissed(true);
      if (isInstructor) {
        api.executeCommand('subject', meeting.title || 'Session 212Learn');
        // Auto-start cloud (file) recording so the session is captured without
        // the instructor having to remember. Requires the recording feature in
        // the JaaS JWT (granted to moderators) and JaaS recording storage.
        if (!recordingStartedRef.current) {
          recordingStartedRef.current = true;
          setTimeout(() => {
            try { api.executeCommand('startRecording', { mode: 'file' }); } catch (_) {}
          }, 2500);
        }
      }
    });

    // Reflect the real recording state (also covers manual start/stop) and
    // surface failures — e.g. a JaaS plan without recording reports an error
    // here instead of turning recording on.
    api.addEventListener('recordingStatusChanged', (e) => {
      setIsRecording(Boolean(e?.on));
      if (e?.error) {
        setRecordingError(String(e.error));
      } else if (e?.on) {
        setRecordingError(null);
      }
    });

    // Safety net: reveal the Jitsi iframe even if "joined" never fires (auth or
    // pre-join screen), so the user is never trapped behind our loading overlay.
    const revealTimer = setTimeout(() => setOverlayDismissed(true), 9000);

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
      clearTimeout(revealTimer);
      try { api.dispose(); } catch (_) {}
      apiRef.current = null;
    };
  }, [apiLoaded, domain, roomName, meeting?.meetingUrl, meeting?.roomName, meeting?.title, displayName, isInstructor, onClose, jwtToken]);

  // 4. Polling du statut de la réunion pour les étudiants (auto-close quand l'instructeur termine)
  useEffect(() => {
    if (!meeting?.id || isInstructor) return; // Pas de polling pour l'instructeur

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/meetings/${meeting.id}`);
        const currentMeeting = response.data?.data?.meeting;
        
        // Si la réunion est terminée (COMPLETED), fermer automatiquement
        if (currentMeeting?.status === 'COMPLETED') {
          clearInterval(pollInterval);
          onClose?.();
        }
      } catch (err) {
        console.error('Failed to poll meeting status:', err);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    return () => clearInterval(pollInterval);
  }, [meeting?.id, isInstructor, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.parentElement?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Render through a portal to <body> so the overlay escapes the dashboard's
  // animated tab panel (a transformed ancestor would otherwise box this fixed
  // element inside the tab, leaving the sidebar clickable — switching tabs then
  // unmounts the live and disconnects the user). At the body level it truly
  // covers the whole viewport, so navigation can't drop the session.
  return createPortal(
    <div
      onContextMenu={(e) => e.preventDefault()}
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

          {/* Recording indicator */}
          {isRecording && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.7rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
              background: 'rgba(220,53,69,0.15)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.3)',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc3545', animation: 'glowPulse 1s ease infinite', display: 'inline-block' }} />
              REC
            </span>
          )}

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

          {/* End Session (instructor only) */}
          {isInstructor && (
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir terminer cette session ? Cela enregistrera la session pour les étudiants.')) {
                  // Explicitly stop recording first so JaaS finalizes the upload,
                  // then end the meeting after a short grace period.
                  try { apiRef.current?.executeCommand('stopRecording', 'file'); } catch (_) {}
                  setTimeout(() => onEndMeeting?.(meeting.id), 2000);
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

      {/* Instructor: recording failed to start (e.g. plan without recording) */}
      {isInstructor && recordingError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0,
          padding: '0.6rem 1.25rem', background: 'rgba(220,53,69,0.14)',
          borderBottom: '1px solid rgba(220,53,69,0.3)', color: '#ffb3ba', fontSize: '0.83rem',
        }}>
          <AlertTriangle size={15} style={{ color: '#dc3545', flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            L'enregistrement n'a pas pu démarrer ({recordingError}). Vérifiez que votre offre Jitsi/JaaS inclut l'enregistrement et qu'un stockage est configuré.
          </span>
          <button onClick={() => setRecordingError(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 2 }} aria-label="Fermer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Student: transparency/consent notice that the session is recorded */}
      {!isInstructor && isRecording && !recNoticeDismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0,
          padding: '0.6rem 1.25rem', background: 'rgba(220,53,69,0.12)',
          borderBottom: '1px solid rgba(220,53,69,0.25)', color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc3545', animation: 'glowPulse 1s ease infinite', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Cette session est enregistrée.</span>
          <button onClick={() => setRecNoticeDismissed(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 2 }} aria-label="Fermer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Jitsi container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Loading overlay */}
        {connectionStatus === 'connecting' && !overlayDismissed && (
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
