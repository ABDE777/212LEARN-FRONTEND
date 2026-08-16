import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, FileText, Save, UploadCloud, Camera, Trash2, CheckCircle2, AlertCircle, Edit2, X, Phone, GraduationCap, Briefcase, Building, Calendar, BookOpen, Code2, Globe, AtSign, Link2 } from 'lucide-react';

// Social links shown in the profile header (top-right). Keys match socialLinks.
const HEADER_SOCIAL = [
  { key: 'linkedin', label: 'LinkedIn', Icon: Briefcase },
  { key: 'github', label: 'GitHub', Icon: Code2 },
  { key: 'website', label: 'Site web', Icon: Globe },
  { key: 'twitter', label: 'Twitter / X', Icon: AtSign },
];
import api from '../services/api';
import PortfolioEditor from './PortfolioEditor';

// Dropdown option sets (mirror the registration form + backend enums).
const LEVEL_OPTIONS = [
  { value: '', label: 'Sélectionnez votre niveau' },
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
];
const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Sélectionnez votre expérience' },
  { value: '<1', label: "Moins d'un an" },
  { value: '1-2', label: '1–2 ans' },
  { value: '3-5', label: '3–5 ans' },
  { value: '6-10', label: '6–10 ans' },
  { value: '>10', label: 'Plus de 10 ans' },
];

const isoDate = (v) => (v ? String(v).slice(0, 10) : '');

// Flatten a studentProfile into editable form fields (covers every learner
// situation — student, employee, student_employee, self_directed).
const learnerFields = (sp = {}) => ({
  school: sp?.school || '',
  fieldOfStudy: sp?.fieldOfStudy || '',
  educationLevel: sp?.educationLevel || '',
  academicYearStart: isoDate(sp?.academicYearStart),
  academicYearEnd: isoDate(sp?.academicYearEnd),
  currentLevel: sp?.currentLevel || '',
  isSelfDirected: sp?.isSelfDirected || false,
  companyName: sp?.companyName || '',
  department: sp?.department || '',
  position: sp?.position || '',
  sector: sp?.sector || '',
  experienceYears: sp?.experienceYears || '',
  interests: sp?.interests || '',
  learningObjective: sp?.learningObjective || '',
});

const instructorFields = (ip = {}) => ({
  expertiseDomain: ip?.expertiseDomain || '',
  specialization: ip?.specialization || '',
  organization: ip?.organization || '',
  experienceYears: ip?.experienceYears || '',
  teachingMode: ip?.teachingMode || '',
});

// Portfolio fields live on the user (not the profile). See backend
// portfolioValidation.js for the shapes.
const portfolioFields = (u = {}) => ({
  skills: u?.skills || [],
  languages: u?.languages || [],
  certifications: u?.certifications || [],
  diplomas: u?.diplomas || [],
  socialLinks: u?.socialLinks || {},
});

export default function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const isLearner = user?.role === 'student' || user?.role === 'employee';
  // Learners all register with role 'student'; the real distinction (student /
  // employee / student_employee / self_directed) lives in the profile situation.
  const situation = user?.studentProfile?.situation || 'student';
  const showAcademic = isLearner && (situation === 'student' || situation === 'student_employee');
  const showProfessional = isLearner && (situation === 'employee' || situation === 'student_employee');
  const showSelfDirected = isLearner && situation === 'self_directed';
  const showPortfolio = isLearner || user?.role === 'instructor';
  const roleLabel =
    user?.role === 'instructor' ? '👨‍🏫 Instructeur'
    : user?.role === 'admin' ? '🛡️ Administrateur'
    : !isLearner ? 'Utilisateur'
    : situation === 'employee' ? '💼 Employé'
    : situation === 'student_employee' ? '🎓 Étudiant & 💼 Employé'
    : situation === 'self_directed' ? '📚 Auto-formation'
    : '🎓 Étudiant';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    ...(isLearner
      ? learnerFields(user?.studentProfile)
      : user?.role === 'instructor'
        ? instructorFields(user?.instructorProfile)
        : {}),
  });

  const [portfolio, setPortfolio] = useState(portfolioFields(user));
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
      ...(isLearner
        ? learnerFields(user?.studentProfile)
        : user?.role === 'instructor'
          ? instructorFields(user?.instructorProfile)
          : {}),
    });
    setPortfolio(portfolioFields(user));
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

    // Only send the profile fields that belong to this learner's situation, so
    // we don't clobber (e.g.) an employee's data with empty academic fields.
    let profilePayload = {};
    if (isLearner) {
      const academic = {
        school: formData.school,
        fieldOfStudy: formData.fieldOfStudy,
        educationLevel: formData.educationLevel,
        academicYearStart: formData.academicYearStart || undefined,
        academicYearEnd: formData.academicYearEnd || undefined,
        currentLevel: formData.currentLevel || undefined,
      };
      const professional = {
        companyName: formData.companyName,
        department: formData.department,
        position: formData.position,
        sector: formData.sector,
        experienceYears: formData.experienceYears || undefined,
      };
      const selfDirected = {
        interests: formData.interests,
        learningObjective: formData.learningObjective,
        currentLevel: formData.currentLevel || undefined,
      };
      if (situation === 'student') profilePayload = academic;
      else if (situation === 'employee') profilePayload = professional;
      else if (situation === 'student_employee') profilePayload = { ...academic, ...professional };
      else if (situation === 'self_directed') profilePayload = selfDirected;
      else profilePayload = academic;
      profilePayload.isSelfDirected = formData.isSelfDirected;
    } else if (user?.role === 'instructor') {
      profilePayload = {
        expertiseDomain: formData.expertiseDomain,
        specialization: formData.specialization,
        organization: formData.organization,
        experienceYears: formData.experienceYears,
        teachingMode: formData.teachingMode,
      };
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: formData.avatar || null,
        bio: formData.bio || null,
        phone: formData.phone || null,
        ...profilePayload,
        ...(showPortfolio ? portfolio : {}),
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

  // ── Shared field-rendering helpers (called as functions, not components, so
  //    inputs keep focus while typing) ─────────────────────────────────────────
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' };
  const controlStyle = (editable = true) => ({
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    outline: 'none',
    background: isEditing && editable ? '#ffffff' : 'var(--bg-color, #f8fafc)',
    fontSize: '0.95rem',
    color: 'var(--text-color)',
    cursor: isEditing && editable ? 'text' : 'not-allowed',
  });
  const cardStyle = {
    background: 'var(--surface-color, #ffffff)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };
  const headingStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };

  const renderText = (label, name, placeholder = '', type = 'text') => (
    <div key={name}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={!isEditing}
        style={controlStyle(true)}
      />
    </div>
  );
  const renderSelect = (label, name, options) => (
    <div key={name}>
      <label style={labelStyle}>{label}</label>
      <select
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={!isEditing}
        style={{ ...controlStyle(true), cursor: isEditing ? 'pointer' : 'not-allowed' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
  const renderTextarea = (label, name, placeholder = '') => (
    <div key={name} style={{ gridColumn: '1 / -1' }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
        disabled={!isEditing}
        style={{ ...controlStyle(true), resize: 'vertical' }}
      />
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Header with Avatar and Basic Info */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary, #4f46e5) 0%, var(--accent, #818cf8) 100%)',
          borderRadius: '20px',
          padding: 'clamp(1.25rem, 4vw, 2.5rem)',
          marginBottom: '2rem',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.9rem, 3vw, 1.5rem)', flex: '1 1 240px', minWidth: 0 }}>
            <div style={{ position: 'relative' }}>
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={`Photo de profil de ${formData.firstName}`}
                  style={{
                    width: 'clamp(72px, 20vw, 100px)',
                    height: 'clamp(72px, 20vw, 100px)',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid rgba(255,255,255,0.3)',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 'clamp(72px, 20vw, 100px)',
                    height: 'clamp(72px, 20vw, 100px)',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(1.8rem, 7vw, 2.5rem)',
                    fontWeight: 700,
                    border: '4px solid rgba(255,255,255,0.3)',
                    flexShrink: 0,
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
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: 700, margin: '0 0 0.5rem 0', lineHeight: 1.15, overflowWrap: 'anywhere' }}>
                {formData.firstName} {formData.lastName}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 'clamp(0.85rem, 2.6vw, 1rem)' }}>
                {roleLabel}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: 'clamp(0.78rem, 2.4vw, 0.9rem)', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.85rem' }}>
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

        {/* Liens (Social links & Online portfolio) section inside the top header card */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Link2 size={18} style={{ color: '#ffffff' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Liens</span>
          </div>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.82rem', color: '#ffffff' }}>
            Vos réseaux et votre portfolio en ligne.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.4rem' }}>
            {HEADER_SOCIAL.map(({ key, label, Icon }) => {
              const url = formData.socialLinks?.[key];
              if (!url && !isEditing) return null;
              return isEditing ? (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    padding: '0.4rem 0.75rem',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Icon size={15} style={{ color: '#fff' }} />
                  <input
                    type="url"
                    placeholder={label}
                    value={formData.socialLinks?.[key] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                      }))
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      width: '160px',
                    }}
                  />
                </div>
              ) : url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.22)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </a>
              ) : null;
            })}

            {!isEditing && HEADER_SOCIAL.every(({ key }) => !formData.socialLinks?.[key]) && (
              <span style={{ fontSize: '0.82rem', opacity: 0.75, color: '#ffffff' }}>Aucun lien renseigné.</span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate id="profile-form">
        <div className={showPortfolio ? 'profile-cols' : ''}>
        {/* Left column: personal + situation/instructor sections */}
        <div className="profile-col">
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
          <div className="pf-grid">
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
            <div style={{ gridColumn: '1 / -1' }}>
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

        {/* Role-specific fields — driven by the learner's situation, not just role */}
        {showAcademic && (
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
            <div className="pf-grid">
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

        {/* Employee / working-learner fields (situation: employee or student_employee) */}
        {showProfessional && (
          <div style={cardStyle}>
            <h3 style={headingStyle}>
              <Briefcase size={20} style={{ color: 'var(--primary)' }} />
              Informations professionnelles
            </h3>
            <div className="pf-grid">
              {renderText('Entreprise', 'companyName', "Nom de l'entreprise")}
              {renderText('Service / Département', 'department', 'ex: Ressources Humaines')}
              {renderText('Poste', 'position', 'ex: Développeur')}
              {renderText('Secteur', 'sector', 'ex: Technologie')}
              <div style={{ gridColumn: '1 / -1' }}>
                {renderSelect("Années d'expérience", 'experienceYears', EXPERIENCE_OPTIONS)}
              </div>
            </div>
          </div>
        )}

        {/* Self-directed learner fields (situation: self_directed) */}
        {showSelfDirected && (
          <div style={cardStyle}>
            <h3 style={headingStyle}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              Objectifs d'apprentissage
            </h3>
            <div className="pf-grid">
              {renderSelect('Niveau', 'currentLevel', LEVEL_OPTIONS)}
              {renderTextarea("Domaines d'intérêt", 'interests', 'ex: Développement web, Data Science, Design')}
              {renderTextarea("Objectif d'apprentissage", 'learningObjective', 'Décrivez ce que vous souhaitez accomplir...')}
            </div>
          </div>
        )}

        {user?.role === 'instructor' && (
          <div style={cardStyle}>
            <h3 style={headingStyle}>
              <Briefcase size={20} style={{ color: 'var(--primary)' }} />
              Informations professionnelles
            </h3>
            <div className="pf-grid">
              {renderText("Domaine d'expertise", 'expertiseDomain', 'ex: Développement Web')}
              {renderText('Spécialité', 'specialization', 'ex: React & Node.js')}
              {renderSelect("Années d'expérience", 'experienceYears', [
                { value: '', label: 'Sélectionnez votre expérience' },
                { value: '<1', label: "Moins d'un an" },
                { value: '1-2', label: '1–2 ans' },
                { value: '3-5', label: '3–5 ans' },
                { value: '6-10', label: '6–10 ans' },
                { value: '>10', label: 'Plus de 10 ans' },
              ])}
              {renderSelect("Mode d'enseignement", 'teachingMode', [
                { value: '', label: 'Sélectionnez le mode' },
                { value: 'online', label: 'En ligne' },
                { value: 'onsite', label: 'Présentiel' },
                { value: 'hybrid', label: 'Les deux' },
              ])}
              <div style={{ gridColumn: '1 / -1' }}>
                {renderText('Organisation / Entreprise', 'organization', "Nom de l'organisation")}
              </div>
            </div>
          </div>
        )}

        </div>{/* /profile-col (left) */}

        {/* Right column: portfolio (learners & instructors only). */}
        {showPortfolio && (
          <div className="profile-col">
            <PortfolioEditor value={portfolio} isEditing={isEditing} onChange={setPortfolio} />
          </div>
        )}
        </div>{/* /profile-cols */}
      </form>
    </div>
  );
}
