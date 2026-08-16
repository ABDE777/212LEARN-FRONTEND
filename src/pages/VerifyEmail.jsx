import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';
import SEOHead from '../components/SEOHead';

/**
 * Landing page for the email-verification link sent on signup. Calls the
 * backend once with the token from the URL and reports the result.
 */
export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const ranRef = useRef(false); // StrictMode double-invoke guard

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const res = await api.post(`/auth/verify-email/${token}`);
        setMessage(res.data?.data?.message || 'Votre adresse email a été confirmée.');
        setStatus('success');
      } catch (err) {
        setMessage(
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Ce lien de vérification est invalide ou a expiré.'
        );
        setStatus('error');
      }
    })();
  }, [token]);

  const icon = status === 'success'
    ? <CheckCircle size={56} color="#16a34a" />
    : status === 'error'
      ? <XCircle size={56} color="var(--error-color, #ef4444)" />
      : <Loader size={56} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color, #f8fafc)', padding: '2rem' }}>
      <SEOHead title="Vérification de l'email" description="Confirmation de votre adresse email 212Learn." />
      <div style={{ maxWidth: 460, width: '100%', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 18, padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ marginBottom: '1.25rem' }}>{icon}</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.6rem' }}>
          {status === 'loading' ? 'Vérification en cours…' : status === 'success' ? 'Email confirmé' : 'Vérification impossible'}
        </h1>
        <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>{message}</p>
        {status !== 'loading' && (
          <Link
            to="/login"
            style={{ display: 'inline-block', padding: '0.7rem 1.6rem', background: 'var(--primary)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
          >
            Aller à la connexion
          </Link>
        )}
      </div>
    </div>
  );
}
