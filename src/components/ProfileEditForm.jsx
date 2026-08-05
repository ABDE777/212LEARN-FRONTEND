import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, FileText, Save, UploadCloud, Camera, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'firstName' && !value.trim()) {
      errorMsg = 'Le prénom est requis.';
    } else if (name === 'lastName' && !value.trim()) {
      errorMsg = 'Le nom est requis.';
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('L\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      let finalAvatarUrl = '';

      // Option 1: Try Cloudinary signature upload
      try {
        const signRes = await api.post('/uploads/cloudinary-sign', {
          type: 'image',
          filename: file.name,
          mimetype: file.type,
        });
        const sign = signRes.data?.data || signRes.data;

        if (sign?.uploadUrl) {
          const form = new FormData();
          form.append('file', file);
          form.append('api_key', sign.apiKey);
          form.append('timestamp', String(sign.timestamp));
          form.append('signature', sign.signature);
          form.append('folder', sign.folder);
          form.append('public_id', sign.public_id);

          const cloud = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (ev) => {
              if (ev.lengthComputable) {
                setUploadProgress(Math.round((ev.loaded / ev.total) * 90) + 10);
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
              } else {
                reject(new Error(`Upload Cloudinary échoué (${xhr.status})`));
              }
            };
            xhr.onerror = () => reject(new Error('Erreur réseau Cloudinary'));
            xhr.open('POST', sign.uploadUrl);
            xhr.send(form);
          });

          if (cloud?.secure_url) {
            finalAvatarUrl = cloud.secure_url;
          }
        }
      } catch (cloudErr) {
        console.warn('Cloudinary signature upload skipped, trying backend direct endpoint:', cloudErr);
      }

      // Option 2: Fallback to backend direct endpoint if Cloudinary not configured
      if (!finalAvatarUrl) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);

        const res = await api.post('/users/me/avatar', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        finalAvatarUrl =
          res.data?.data?.avatarUrl ||
          res.data?.data?.user?.avatar ||
          res.data?.avatarUrl ||
          res.data?.data?.avatar;
      }

      if (finalAvatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: finalAvatarUrl }));
        showSuccess('Photo de profil mise à jour avec succès !');
      } else {
        // Fallback local preview URL if backend upload endpoints return null
        const localPreview = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, avatar: localPreview }));
        showSuccess('Aperçu de la photo prêt. Cliquez sur Enregistrer pour valider.');
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showError(err.message || 'Impossible d\'uploader l\'image.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFirstNameValid = validateField('firstName', formData.firstName);
    const isLastNameValid = validateField('lastName', formData.lastName);

    if (!isFirstNameValid || !isLastNameValid) {
      showError('Veuillez corriger les erreurs du formulaire avant de soumettre.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: formData.avatar || null,
        bio: formData.bio || null,
      });
      showSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface-color, #ffffff)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
      }}
    >
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #1e293b)', marginBottom: '0.5rem' }}>
        Détails personnels
      </h2>
      <p style={{ color: 'var(--secondary, #64748b)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Mettez à jour vos informations et votre photo de profil.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Modern Image Upload Dropzone */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-color, #1e293b)',
              marginBottom: '0.75rem',
            }}
          >
            Photo de profil
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.5rem',
              borderRadius: '16px',
              border: `2px dashed ${isDragOver ? 'var(--primary, #4f46e5)' : 'var(--border-color, #cbd5e1)'}`,
              background: isDragOver ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-color, #f8fafc)',
              transition: 'all 0.2s ease',
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar Preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={`Photo de profil de ${formData.firstName}`}
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--surface-color, #ffffff)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary, #4f46e5) 0%, var(--accent, #818cf8) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '2.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : '?'}
                </div>
              )}

              {uploading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {uploadProgress}%
                </div>
              )}
            </div>

            {/* Dropzone Instructions & File Trigger Button */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>
                Importer une nouvelle photo
              </h4>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--secondary, #64748b)' }}>
                Glissez-déposez une image ici ou cliquez pour choisir un fichier. PNG, JPG, GIF jusqu'à 5MB.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '10px',
                    background: 'var(--primary, #4f46e5)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                >
                  <UploadCloud size={18} />
                  {uploading ? 'Téléversement...' : 'Uploader une photo'}
                </button>

                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                    disabled={uploading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1rem',
                      borderRadius: '10px',
                      background: 'transparent',
                      color: 'var(--error-color, #ef4444)',
                      border: '1px solid var(--error-color, #ef4444)',
                      fontWeight: 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {/* Prénom */}
          <div>
            <label
              htmlFor="profile-firstName"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}
            >
              Prénom <span style={{ color: 'var(--error-color)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.firstName ? 'var(--error-color)' : 'var(--secondary)',
                }}
              />
              <input
                type="text"
                id="profile-firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={(e) => validateField('firstName', e.target.value)}
                placeholder="Votre prénom"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.firstName ? 'var(--error-color, #ef4444)' : 'var(--border-color, #cbd5e1)'}`,
                  outline: 'none',
                  background: 'var(--bg-color, #f8fafc)',
                  fontSize: '0.95rem',
                  color: 'var(--text-color)',
                }}
              />
            </div>
            {errors.firstName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--error-color)', marginTop: '0.35rem' }}>
                <AlertCircle size={14} /> {errors.firstName}
              </span>
            )}
          </div>

          {/* Nom */}
          <div>
            <label
              htmlFor="profile-lastName"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}
            >
              Nom <span style={{ color: 'var(--error-color)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.lastName ? 'var(--error-color)' : 'var(--secondary)',
                }}
              />
              <input
                type="text"
                id="profile-lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={(e) => validateField('lastName', e.target.value)}
                placeholder="Votre nom"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.lastName ? 'var(--error-color, #ef4444)' : 'var(--border-color, #cbd5e1)'}`,
                  outline: 'none',
                  background: 'var(--bg-color, #f8fafc)',
                  fontSize: '0.95rem',
                  color: 'var(--text-color)',
                }}
              />
            </div>
            {errors.lastName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--error-color)', marginTop: '0.35rem' }}>
                <AlertCircle size={14} /> {errors.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div style={{ marginTop: '1.5rem' }}>
          <label
            htmlFor="profile-email"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}
          >
            Adresse Email (Non modifiable)
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}
            />
            <input
              type="email"
              id="profile-email"
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--bg-color, #f1f5f9)',
                color: 'var(--secondary, #64748b)',
                fontSize: '0.95rem',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginTop: '1.5rem' }}>
          <label
            htmlFor="profile-bio"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}
          >
            Biographie
          </label>
          <div style={{ position: 'relative' }}>
            <FileText
              size={18}
              style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--secondary)' }}
            />
            <textarea
              id="profile-bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Racontez-nous brièvement votre parcours..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #cbd5e1)',
                outline: 'none',
                background: 'var(--bg-color, #f8fafc)',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
