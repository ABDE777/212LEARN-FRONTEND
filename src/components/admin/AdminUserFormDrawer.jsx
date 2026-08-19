import { Loader, X } from 'lucide-react';
import ModalPortal from '../ModalPortal';

export default function AdminUserFormDrawer({
  isOpen,
  onClose,
  editingUser,
  formData,
  setFormData,
  onSubmit,
  loading,
  error,
}) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#fff',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              {editingUser ? `Édition du compte de ${editingUser.firstName || editingUser.email}` : 'Ajouter un nouveau compte à 212Learn'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form id="admin-user-drawer-form" onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Prénom *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                  required
                  placeholder="Ex: Yassine"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                  required
                  placeholder="Ex: El Amrani"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Email *</label>
              <input
                type="email"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Rôle *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
              </label>
              <input
                type="password"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required={!editingUser}
                placeholder={editingUser ? '••••••••' : 'Minimum 8 caractères'}
                autoComplete={editingUser ? 'new-password' : 'new-password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Bio</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Courte présentation de l'utilisateur"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '1rem',
            background: '#fafafa',
          }}
        >
          <button
            type="submit"
            form="admin-user-drawer-form"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: loading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading && <Loader size={16} className="spin" />}
            {loading ? 'Enregistrement...' : (editingUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur')}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.92rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--secondary)',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
