import { useEffect, useRef, useState } from 'react';
import { X, Wifi, WifiOff, Users, Maximize2, Minimize2, ExternalLink, PhoneOff } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting | connected | error
  const [jwtToken, setJwtToken] = useState(null);
  const [domain, setDomain] = useState('meet.jit.si');
  const [roomName, setRoomName] = useState(null);

  // 1. Fetch JaaS join info from backend
  useEffect(() => {
    if (!meeting?.id) return;
    
    const fetchJoinInfo = async () => {
      try {
        const response = await api.get(`/meetings/${meeting.id}/join`);
        const data = response.data?.data;
        if (data?.jwt) {
          setJwtToken(data.jwt);
          // Store domain and roomName from response
          if (data?.domain) setDomain(data.domain);
          if (data?.roomName) setRoomName(data.roomName);
        }
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

          {/* End Session (instructor only) */}
          {isInstructor && (
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir terminer cette session ? Cela enregistrera la session pour les étudiants.')) {
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
