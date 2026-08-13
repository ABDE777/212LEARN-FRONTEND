import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, FileText, Save, UploadCloud, Camera, Trash2, CheckCircle2, AlertCircle, Edit2, X, Phone, GraduationCap, Briefcase, Building, Calendar } from 'lucide-react';
import api from '../services/api';

export default function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    ...(user?.role === 'student' || user?.role === 'employee' ? {
      school: user?.studentProfile?.school || '',
      fieldOfStudy: user?.studentProfile?.fieldOfStudy || '',
      educationLevel: user?.studentProfile?.educationLevel || '',
      academicYearStart: user?.studentProfile?.academicYearStart ? String(user.studentProfile.academicYearStart).slice(0, 10) : '',
      academicYearEnd: user?.studentProfile?.academicYearEnd ? String(user.studentProfile.academicYearEnd).slice(0, 10) : '',
      currentLevel: user?.studentProfile?.currentLevel || '',
      isSelfDirected: user?.studentProfile?.isSelfDirected || false,
    } : user?.role === 'instructor' ? {
      expertiseDomain: user?.instructorProfile?.expertiseDomain || '',
      specialization: user?.instructorProfile?.specialization || '',
      organization: user?.instructorProfile?.organization || '',
      experienceYears: user?.instructorProfile?.experienceYears || '',
      teachingMode: user?.instructorProfile?.teachingMode || '',
    } : {})
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
    if (isEditing) validateField(name, value);
  };

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      avatar: user?.avatar || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      ...(user?.role === 'student' || user?.role === 'employee' ? {
        school: user?.studentProfile?.school || '',
        fieldOfStudy: user?.studentProfile?.fieldOfStudy || '',
        educationLevel: user?.studentProfile?.educationLevel || '',
        academicYearStart: user?.studentProfile?.academicYearStart ? String(user.studentProfile.academicYearStart).slice(0, 10) : '',
        academicYearEnd: user?.studentProfile?.academicYearEnd ? String(user.studentProfile.academicYearEnd).slice(0, 10) : '',
        currentLevel: user?.studentProfile?.currentLevel || '',
        isSelfDirected: user?.studentProfile?.isSelfDirected || false,
      } : user?.role === 'instructor' ? {
        expertiseDomain: user?.instructorProfile?.expertiseDomain || '',
        specialization: user?.instructorProfile?.specialization || '',
        organization: user?.instructorProfile?.organization || '',
        experienceYears: user?.instructorProfile?.experienceYears || '',
        teachingMode: user?.instructorProfile?.teachingMode || '',
      } : {})
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
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
        phone: formData.phone || null,
        ...(user?.role === 'student' || user?.role === 'employee' ? {
          school: formData.school,
          fieldOfStudy: formData.fieldOfStudy,
          educationLevel: formData.educationLevel,
          academicYearStart: formData.academicYearStart || undefined,
          academicYearEnd: formData.academicYearEnd || undefined,
          currentLevel: formData.currentLevel || undefined,
          isSelfDirected: formData.isSelfDirected,
        } : user?.role === 'instructor' ? {
          expertiseDomain: formData.expertiseDomain,
          specialization: formData.specialization,
          organization: formData.organization,
          experienceYears: formData.experienceYears,
          teachingMode: formData.teachingMode,
        } : {})
      });
      showSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header with Avatar and Basic Info */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary, #4f46e5) 0%, var(--accent, #818cf8) 100%)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
            <div style={{ position: 'relative' }}>
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={`Photo de profil de ${formData.firstName}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid rgba(255,255,255,0.3)',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    border: '4px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <Camera size={16} style={{ color: 'var(--primary)' }} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                {formData.firstName} {formData.lastName}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                {user?.role === 'student' ? '🎓 Étudiant' : user?.role === 'instructor' ? '👨‍🏫 Instructeur' : user?.role === 'employee' ? '💼 Employé' : 'Utilisateur'}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
                {user?.email}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Edit2 size={16} />
              Modifier le profil
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <X size={16} />
                Annuler
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#ffffff',
                  color: 'var(--primary)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <Save size={16} />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate id="profile-form">
        {/* Personal Information Card */}
        <div
          style={{
            background: 'var(--surface-color, #ffffff)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            Informations personnelles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.firstName ? 'var(--error-color)' : 'var(--border-color, #e2e8f0)'}`,
                  outline: 'none',
                  background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                  fontSize: '0.95rem',
                  color: 'var(--text-color)',
                  cursor: isEditing ? 'text' : 'not-allowed',
                }}
              />
              {errors.firstName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--error-color)', marginTop: '0.35rem' }}>
                  <AlertCircle size={14} /> {errors.firstName}
                </span>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.lastName ? 'var(--error-color)' : 'var(--border-color, #e2e8f0)'}`,
                  outline: 'none',
                  background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                  fontSize: '0.95rem',
                  color: 'var(--text-color)',
                  cursor: isEditing ? 'text' : 'not-allowed',
                }}
              />
              {errors.lastName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--error-color)', marginTop: '0.35rem' }}>
                  <AlertCircle size={14} /> {errors.lastName}
                </span>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+212 6XX XXX XXX"
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  outline: 'none',
                  background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                  fontSize: '0.95rem',
                  color: 'var(--text-color)',
                  cursor: isEditing ? 'text' : 'not-allowed',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
              Biographie
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Racontez-nous brièvement votre parcours..."
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                outline: 'none',
                background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                resize: 'vertical',
                cursor: isEditing ? 'text' : 'not-allowed',
              }}
            />
          </div>
        </div>

        {/* Role-specific fields */}
        {(user?.role === 'student' || user?.role === 'employee') && (
          <div
            style={{
              background: 'var(--surface-color, #ffffff)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} style={{ color: 'var(--primary)' }} />
              Informations académiques
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  École / Université
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Nom de l'établissement"
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Domaine d'études
                </label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="ex: Informatique"
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Niveau d'études
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="college">Collège</option>
                  <option value="lycee">Lycée</option>
                  <option value="bac">Bac</option>
                  <option value="bac+1">Bac+1</option>
                  <option value="bac+2">Bac+2</option>
                  <option value="bac+3">Bac+3</option>
                  <option value="bac+4">Bac+4</option>
                  <option value="bac+5">Bac+5</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Niveau
                </label>
                <select
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Date de début
                </label>
                <input
                  type="date"
                  name="academicYearStart"
                  value={formData.academicYearStart}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Date de fin
                </label>
                <input
                  type="date"
                  name="academicYearEnd"
                  value={formData.academicYearEnd}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Groupe / Classe
                </label>
                <input
                  type="text"
                  value="Non attribué — assigné par un instructeur ou un administrateur"
                  disabled
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: 'var(--bg-color, #f8fafc)',
                    fontSize: '0.9rem',
                    color: 'var(--secondary)',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditing ? 'pointer' : 'not-allowed' }}>
                  <input
                    type="checkbox"
                    name="isSelfDirected"
                    checked={formData.isSelfDirected}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={{ width: '18px', height: '18px', cursor: isEditing ? 'pointer' : 'not-allowed' }}
                  />
                  <span>Auto-formation (apprentissage en autonomie)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'instructor' && (
          <div
            style={{
              background: 'var(--surface-color, #ffffff)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: 'var(--primary)' }} />
              Informations professionnelles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Domaine d'expertise
                </label>
                <input
                  type="text"
                  name="expertiseDomain"
                  value={formData.expertiseDomain}
                  onChange={handleChange}
                  placeholder="ex: Développement Web"
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Spécialité
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="ex: React & Node.js"
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Organisation / Entreprise
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Nom de l'organisation"
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Années d'expérience
                </label>
                <select
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">Sélectionnez votre expérience</option>
                  <option value="<1">Moins d'un an</option>
                  <option value="1-2">1–2 ans</option>
                  <option value="3-5">3–5 ans</option>
                  <option value="6-10">6–10 ans</option>
                  <option value=">10">Plus de 10 ans</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                  Mode d'enseignement
                </label>
                <select
                  name="teachingMode"
                  value={formData.teachingMode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    outline: 'none',
                    background: isEditing ? '#ffffff' : 'var(--bg-color, #f8fafc)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">Sélectionnez le mode</option>
                  <option value="online">En ligne</option>
                  <option value="onsite">Présentiel</option>
                  <option value="hybrid">Les deux</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
