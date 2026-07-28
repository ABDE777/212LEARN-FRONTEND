import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Image, FileText, Save, Camera, X } from 'lucide-react';

export default function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
    bio: user?.bio || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Veuillez sélectionner un fichier image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'L\'image ne doit pas dépasser 5 Mo.' });
      return;
    }

    setStatus(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const token = window.__AUTH_TOKEN__ || localStorage.getItem('token');

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(new Error(JSON.parse(xhr.response)?.error?.message || `Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'upload.'));

        const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-212learn.vercel.app/api/v1';
        xhr.open('POST', `${baseURL}/users/me/avatar`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formDataUpload);
      });

      const avatarUrl = response?.data?.avatarUrl || response?.data?.user?.avatar || response?.avatarUrl;
      if (avatarUrl) {
        setFormData(prev => ({ ...prev, avatar: avatarUrl }));
        setStatus({ type: 'success', message: 'Avatar uploadé avec succès !' });
      } else {
        setStatus({ type: 'error', message: 'Réponse inattendue du serveur.' });
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Impossible d\'uploader l\'avatar. Vous pouvez utiliser une URL à la place.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: formData.avatar || null,
        bio: formData.bio || null
      });
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès !' });
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
      <h2 style={{ fontSize: '1.75rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
        Détails personnels
      </h2>
      <p style={{ color: 'var(--secondary)', opacity: 0.8, marginBottom: '2rem' }}>
        Mettez à jour vos informations personnelles pour personnaliser votre profil.
      </p>

      {status && (
        <div className={`form-status-alert ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Avatar Upload / Input Section */}
        <div className="profile-avatar-selector">
          {/* Clickable avatar preview */}
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => !uploading && fileInputRef.current?.click()}
            title="Cliquer pour changer l'avatar"
          >
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="Aperçu de l'avatar" 
                className="profile-avatar-preview"
                onError={(e) => {
                  e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                }}
              />
            ) : (
              <div className="profile-avatar-preview" style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700
              }}>
                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Camera size={24} color="#fff" />
            </div>
            {/* Upload progress overlay */}
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '0.25rem',
              }}>
                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />

          <div className="profile-avatar-input-wrapper">
            <label className="form-group" style={{ margin: 0 }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                URL de l'avatar (Image)
              </span>
              <div style={{ position: 'relative' }}>
                <Image size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', opacity: 0.6 }} />
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: formData.avatar ? '36px' : '12px' }}
                />
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: '2px',
                    }}
                    title="Supprimer l'avatar"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '0.35rem' }}>
              Cliquez sur l'image pour upload un fichier, ou collez une URL ci-dessus.
            </p>
          </div>
        </div>

        <div className="profile-form-grid">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">Prénom</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', opacity: 0.6 }} />
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName">Nom</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', opacity: 0.6 }} />
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
        </div>

        {/* Email - Readonly */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label htmlFor="email">Adresse Email (Non modifiable)</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', opacity: 0.4 }} />
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="form-control"
              style={{ paddingLeft: '40px', background: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label htmlFor="bio">Biographie</label>
          <div style={{ position: 'relative' }}>
            <FileText size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--secondary)', opacity: 0.6 }} />
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Parlez-nous un peu de vous..."
              className="form-control"
              style={{ paddingLeft: '40px', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '12px 32px'
            }}
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
