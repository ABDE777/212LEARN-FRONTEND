import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      console.log('Reset token from URL:', token);
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword: password });
      console.log('Reset response:', response.data);
      setSuccess(true);
    } catch (err) {
      const code = err.response?.data?.error?.code || err.response?.data?.code;
      setError(
        code === 'INVALID_TOKEN'
          ? 'Ce lien est invalide ou a expiré. Veuillez demander un nouveau lien.'
          : err.response?.data?.error?.message ||
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
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.5rem' }}>Mot de passe réinitialisé</h1>
              <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-primary"
                style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', cursor: 'pointer' }}
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Nouveau mot de passe</h1>
              <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
                Choisissez un nouveau mot de passe (minimum 8 caractères).
              </p>

              {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
