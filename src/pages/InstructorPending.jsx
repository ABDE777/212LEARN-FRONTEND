import { Navigate } from 'react-router-dom';
import { Clock, ShieldCheck, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Two support numbers for instructors who want to speed up their approval.
const WHATSAPP_CONTACTS = [
  { label: '+212 631-883412', number: '212631883412' },
  { label: '+212 605-713171', number: '212605713171' },
];
const WA_TEXT = encodeURIComponent(
  "Bonjour, je viens de créer un compte instructeur sur 212Learn et j'aimerais accélérer la validation de mon compte."
);

export default function InstructorPending() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-color)' }}>Chargement…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = (user?.role || '').toUpperCase();
  // Non-instructors don't belong here; approved instructors go to their dashboard.
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'STUDENT' || role === 'EMPLOYEE') return <Navigate to="/student/dashboard" replace />;
  if (role === 'INSTRUCTOR' && user?.isVerified) return <Navigate to="/instructor/dashboard" replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'grid', placeItems: 'center', padding: '2rem 1.25rem' }}>
      <style>{`
        .ip-card { max-width: 560px; width: 100%; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px -30px rgba(27,75,90,.5); }
        .ip-top { background: linear-gradient(130deg, var(--secondary) 0%, var(--primary) 70%, var(--accent) 130%); padding: 2.2rem; text-align: center; color: #fff; position: relative; }
        .ip-badge { width: 76px; height: 76px; margin: 0 auto 1rem; border-radius: 20px; background: rgba(255,255,255,.18); display: grid; place-items: center; border: 3px solid rgba(255,255,255,.35); }
        .ip-title { margin: 0; font-size: 1.5rem; font-weight: 800; }
        .ip-sub { margin: .55rem 0 0; opacity: .92; font-size: .95rem; line-height: 1.5; }
        .ip-body { padding: 2rem; }
        .ip-steps { display: grid; gap: .9rem; margin: 0 0 1.6rem; }
        .ip-step { display: flex; align-items: flex-start; gap: .8rem; }
        .ip-step-ic { flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--primary) 13%, transparent); color: var(--primary); }
        .ip-step p { margin: 0; font-size: .92rem; color: var(--text-color); line-height: 1.45; }
        .ip-wa-title { font-size: .82rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--secondary); opacity: .75; margin: 0 0 .7rem; }
        .ip-wa { display: flex; align-items: center; justify-content: center; gap: .5rem; padding: .8rem 1rem; border-radius: 12px; background: #25D366; color: #fff; font-weight: 700; font-size: .92rem; text-decoration: none; transition: transform .15s ease, opacity .15s ease; }
        .ip-wa:hover { transform: translateY(-1px); opacity: .95; }
        .ip-logout { display: inline-flex; align-items: center; gap: .5rem; margin-top: 1.4rem; background: none; border: none; color: var(--secondary); font-weight: 600; font-size: .88rem; cursor: pointer; }
      `}</style>

      <div className="ip-card">
        <div className="ip-top">
          <div className="ip-badge"><Clock size={34} /></div>
          <h1 className="ip-title">Compte en attente de validation</h1>
          <p className="ip-sub">
            Bonjour {user?.firstName || ''}, votre demande de compte instructeur a bien été envoyée à
            l'administrateur. Vous pourrez accéder à votre espace dès qu'elle sera approuvée.
          </p>
        </div>

        <div className="ip-body">
          <div className="ip-steps">
            <div className="ip-step">
              <div className="ip-step-ic"><ShieldCheck size={17} /></div>
              <p>Un administrateur examine votre profil et vos informations professionnelles.</p>
            </div>
            <div className="ip-step">
              <div className="ip-step-ic"><Clock size={17} /></div>
              <p>Vous recevrez l'accès à votre tableau de bord une fois votre compte validé.</p>
            </div>
          </div>

          <p className="ip-wa-title">Accélérer la validation</p>
          <div style={{ display: 'grid', gap: '.7rem' }}>
            {WHATSAPP_CONTACTS.map((c) => (
              <a key={c.number} className="ip-wa" href={`https://wa.me/${c.number}?text=${WA_TEXT}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> Contacter sur WhatsApp — {c.label}
              </a>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="ip-logout" onClick={logout}><LogOut size={16} /> Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
