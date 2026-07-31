import { useState } from 'react';
import api from '../services/api';
import { KeyRound, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPassword) {
      setStatus({ type: 'error', message: 'Veuillez saisir votre mot de passe actuel.' });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword === currentPassword) {
      setStatus({ type: 'error', message: 'Le nouveau mot de passe doit être différent de l\'actuel.' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
      console.log('Password change response:', response.data);
      setStatus({ type: 'success', message: 'Votre mot de passe a été modifié avec succès.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Impossible de modifier le mot de passe. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', maxWidth: '560px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <KeyRound size={24} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>Changer le mot de passe</h2>
      </div>
      <p style={{ color: 'var(--secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
        Mettez à jour votre mot de passe pour sécuriser votre compte.
      </p>

      {status && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: status.type === 'success' ? '#eefaf1' : '#fff0f0',
            border: status.type === 'success' ? '1px solid #bde8c9' : '1px solid #fcc',
            color: status.type === 'success' ? 'var(--success-color)' : 'var(--error-color)',
          }}
        >
          {status.type === 'success' ? <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mot de passe actuel</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <small style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>
            Minimum 8 caractères.
          </small>
        </div>

        <div className="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          {loading && <Loader size={16} className="spin" />}
          {loading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  );
}
