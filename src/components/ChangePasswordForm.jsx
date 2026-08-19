import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KeyRound, CheckCircle, AlertCircle, Loader, Trash2, AlertTriangle, X } from 'lucide-react';
import ModalPortal from './ModalPortal';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

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
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de supprimer le compte. Veuillez réessayer.'
      );
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Change Password Card */}
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
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

      {/* Danger Zone Card */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
        border: '1.5px solid #fee2e2',
        overflow: 'hidden',
      }}>
        <div style={{ background: '#fff5f5', padding: '1.25rem 2rem', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={22} color="#dc2626" />
          <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.1rem' }}>Zone de danger</h3>
        </div>
        <div style={{ padding: '1.5rem 2rem' }}>
          <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            La suppression de votre compte désactivera immédiatement votre accès.
            Vous pourrez le restaurer à tout moment en vous reconnectant avec votre e-mail et un code OTP.
          </p>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
              background: '#dc2626', color: '#fff', border: 'none',
              fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            <Trash2 size={16} />
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <ModalPortal>
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
        }} onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '2rem',
            maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fef2f2', borderRadius: '50%', padding: '10px', display: 'flex' }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <h2 style={{ margin: 0, color: '#1a1a2e', fontSize: '1.3rem' }}>Supprimer le compte</h2>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Êtes-vous sûr de vouloir supprimer votre compte ? Votre compte sera désactivé. Vous pourrez le réactiver ultérieurement par e-mail.
            </p>

            <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#dc2626', fontWeight: 600 }}>
                Tapez <strong>SUPPRIMER</strong> pour confirmer :
              </p>
              <input
                type="text"
                className="form-control"
                placeholder="SUPPRIMER"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                style={{ borderColor: '#fca5a5', marginBottom: 0 }}
                autoFocus
              />
            </div>

            {deleteError && (
              <div style={{ color: '#dc2626', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 500, color: '#64748b' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deleteLoading}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none',
                  background: deleteConfirmText === 'SUPPRIMER' ? '#dc2626' : '#fca5a5',
                  color: '#fff', cursor: deleteConfirmText === 'SUPPRIMER' ? 'pointer' : 'not-allowed',
                  fontWeight: 600, transition: 'background 0.2s',
                }}
              >
                {deleteLoading ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}

