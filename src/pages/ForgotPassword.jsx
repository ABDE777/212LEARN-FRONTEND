import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-form-wrapper" style={{ maxWidth: '460px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 500 }}>
              <ArrowLeft size={20} />
              Retour
            </Link>
            <img src={logoImg} alt="212LEARN Logo" style={{ height: '80px', objectFit: 'contain' }} />
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} color="#fff" />
              </div>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.5rem' }}>Vérifiez votre boîte mail</h1>
              <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                Si un compte est associé à cette adresse, un lien de réinitialisation vous a été envoyé. Il est valable 15 minutes.
              </p>
              <Link to="/login" style={{ display: 'inline-block', marginTop: '1.5rem', fontWeight: 600 }}>Retour à la connexion</Link>
            </div>
          ) : (
            <>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Mot de passe oublié</h1>
              <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Adresse e-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="etudiant@212learn.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>

              <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Vous vous en souvenez ? <Link to="/login" style={{ fontWeight: 600 }}>Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
