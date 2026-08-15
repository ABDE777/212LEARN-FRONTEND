import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, FileText, Save, Camera, AlertCircle, Edit2, X, Phone, GraduationCap, Briefcase, Building, Calendar, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api';
import PortfolioEditor from './PortfolioEditor';

// On-brand cover banner. The AI-generated image (highsfield / z_image, brand
// palette) is layered on top of a CSS gradient fallback, so if the CDN URL ever
// becomes unavailable the gradient still shows. To make it a permanent local
// asset: download COVER_IMG_URL into src/assets/profile-cover.webp, then
// `import coverImg from '../assets/profile-cover.webp'` and use url(${coverImg}).
const COVER_IMG_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3HJHfRoAticA39RGo2O3TsqeYDl/hf_20260815_005515_7369648c-58aa-4e94-93df-f7e4bbf44db7_min.webp';
const coverBackground = `
  url("${COVER_IMG_URL}") center / cover no-repeat,
  radial-gradient(120% 150% at 12% 15%, rgba(232,163,61,0.55), transparent 55%),
  radial-gradient(120% 130% at 90% 25%, rgba(27,75,90,0.85), transparent 60%),
  radial-gradient(90% 120% at 70% 110%, rgba(232,163,61,0.35), transparent 55%),
  linear-gradient(120deg, var(--primary) 0%, #a24f22 45%, var(--secondary) 100%)
`;

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
const EDUCATION_OPTIONS = [
  { value: '', label: 'Sélectionnez votre niveau' },
  { value: 'college', label: 'Collège' },
  { value: 'lycee', label: 'Lycée' },
  { value: 'bac', label: 'Bac' },
  { value: 'bac+1', label: 'Bac+1' },
  { value: 'bac+2', label: 'Bac+2' },
  { value: 'bac+3', label: 'Bac+3' },
  { value: 'bac+4', label: 'Bac+4' },
  { value: 'bac+5', label: 'Bac+5' },
  { value: 'autre', label: 'Autre' },
];
const TEACHING_OPTIONS = [
  { value: '', label: 'Sélectionnez le mode' },
  { value: 'online', label: 'En ligne' },
  { value: 'onsite', label: 'Présentiel' },
  { value: 'hybrid', label: 'Les deux' },
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
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (isEditing && type !== 'checkbox') validateField(name, value);
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
    if (!isEditing) return;
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

  // ── Presentation helpers (functions, not components, so inputs keep focus) ──
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.4rem', letterSpacing: '0.01em' };
  const control = (editable = true) => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-color)',
    outline: 'none',
    background: isEditing && editable ? '#ffffff' : 'rgba(245,237,228,0.5)',
    fontSize: '0.95rem',
    color: 'var(--text-color)',
    fontFamily: 'var(--font-body)',
    transition: 'box-shadow .2s, border-color .2s',
    cursor: isEditing && editable ? 'text' : 'not-allowed',
  });

  const renderText = (label, name, { placeholder = '', type = 'text', icon: Icon, full = false } = {}) => (
    <div key={name} style={full ? { gridColumn: '1 / -1' } : undefined}>
      <label style={labelStyle}>{Icon && <Icon size={14} style={{ color: 'var(--primary)' }} />}{label}</label>
      <input
        className="profile-input"
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={!isEditing}
        style={control(true)}
      />
      {errors[name] && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--error-color)', marginTop: '0.35rem' }}>
          <AlertCircle size={13} /> {errors[name]}
        </span>
      )}
    </div>
  );

  const renderSelect = (label, name, options, { icon: Icon } = {}) => (
    <div key={name}>
      <label style={labelStyle}>{Icon && <Icon size={14} style={{ color: 'var(--primary)' }} />}{label}</label>
      <select
        className="profile-input"
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        disabled={!isEditing}
        style={{ ...control(true), cursor: isEditing ? 'pointer' : 'not-allowed' }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const renderTextarea = (label, name, { placeholder = '', icon: Icon, rows = 3 } = {}) => (
    <div key={name} style={{ gridColumn: '1 / -1' }}>
      <label style={labelStyle}>{Icon && <Icon size={14} style={{ color: 'var(--primary)' }} />}{label}</label>
      <textarea
        className="profile-input"
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={!isEditing}
        style={{ ...control(true), resize: 'vertical' }}
      />
    </div>
  );

  const cardStyle = (i = 0) => ({
    background: 'var(--card)',
    borderRadius: 'calc(var(--radius) * 1.6)',
    padding: '1.75rem',
    marginBottom: '1.4rem',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    animationDelay: `${0.06 * i}s`,
  });
  const headingStyle = { fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.55rem' };
  const iconBadge = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff',
  };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' };

  const chip = (text) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.7rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
      color: 'var(--secondary)', backdropFilter: 'blur(8px)',
    }}>{text}</span>
  );

  const initials = `${(formData.firstName || user?.firstName || '?').charAt(0)}${(formData.lastName || user?.lastName || '').charAt(0)}`.toUpperCase();

  return (
    <form onSubmit={handleSubmit} id="profile-form" noValidate style={{ maxWidth: '920px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="profile-card" style={{ ...cardStyle(0), padding: 0, overflow: 'hidden' }}>
        <div className="profile-cover" style={{
          height: '180px', position: 'relative',
          background: coverBackground,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          {/* action bar */}
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.6rem' }}>
            {!isEditing ? (
              <button type="button" onClick={handleEdit} className="profile-glass-btn">
                <Edit2 size={16} /> Modifier le profil
              </button>
            ) : (
              <>
                <button type="button" onClick={handleCancel} className="profile-glass-btn">
                  <X size={16} /> Annuler
                </button>
                <button type="submit" disabled={loading} className="profile-glass-btn profile-glass-btn--solid">
                  {loading ? <span className="spin" style={{ display: 'inline-flex' }}><Save size={16} /></span> : <Save size={16} />}
                  {loading ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '0 1.75rem 1.6rem', marginTop: '-52px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1.25rem' }}>
          {/* avatar */}
          <div
            onDragOver={(e) => { e.preventDefault(); if (isEditing) setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            style={{ position: 'relative', width: '112px', height: '112px', flexShrink: 0 }}
          >
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', padding: '4px',
              background: isDragOver ? 'var(--accent)' : 'linear-gradient(135deg, var(--primary), var(--accent), var(--secondary))',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--card)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--card)', background: 'var(--secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 700 }}>
                  {initials || '?'}
                </div>
              )}
            </div>
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(43,38,34,0.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                {uploadProgress}%
              </div>
            )}
            {isEditing && !uploading && (
              <button type="button" onClick={() => fileInputRef.current?.click()} title="Changer la photo"
                style={{ position: 'absolute', bottom: '2px', right: '2px', width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--card)', background: 'var(--primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <Camera size={16} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files?.[0])} disabled={uploading} />
          </div>

          {/* identity */}
          <div style={{ flex: 1, minWidth: '220px', paddingBottom: '0.25rem' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 0.5rem 0' }}>
              {(formData.firstName || user?.firstName || '')} {(formData.lastName || user?.lastName || '')}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {chip(roleLabel)}
              {user?.email && chip(<><Mail size={13} /> {user.email}</>)}
              {memberSince && chip(<><Sparkles size={13} /> Membre depuis {memberSince}</>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal ─────────────────────────────────────────────────── */}
      <section className="profile-card" style={cardStyle(1)}>
        <h3 style={headingStyle}><span style={iconBadge}><User size={18} /></span> Informations personnelles</h3>
        <div style={gridStyle}>
          {renderText('Prénom', 'firstName', { placeholder: 'Votre prénom', icon: User })}
          {renderText('Nom', 'lastName', { placeholder: 'Votre nom', icon: User })}
          {renderText('Téléphone', 'phone', { placeholder: '+212 6XX XXX XXX', type: 'tel', icon: Phone })}
          {renderTextarea('Biographie', 'bio', { placeholder: 'Racontez-nous brièvement votre parcours…', icon: FileText })}
        </div>
      </section>

      {/* ── Academic (student / student_employee) ────────────────────── */}
      {showAcademic && (
        <section className="profile-card" style={cardStyle(2)}>
          <h3 style={headingStyle}><span style={iconBadge}><GraduationCap size={18} /></span> Informations académiques</h3>
          <div style={gridStyle}>
            {renderText('École / Université', 'school', { placeholder: "Nom de l'établissement", icon: Building })}
            {renderText("Domaine d'études", 'fieldOfStudy', { placeholder: 'ex : Informatique', icon: BookOpen })}
            {renderSelect("Niveau d'études", 'educationLevel', EDUCATION_OPTIONS, { icon: GraduationCap })}
            {renderSelect('Niveau', 'currentLevel', LEVEL_OPTIONS, { icon: Sparkles })}
            {renderText('Date de début', 'academicYearStart', { type: 'date', icon: Calendar })}
            {renderText('Date de fin', 'academicYearEnd', { type: 'date', icon: Calendar })}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: isEditing ? 'pointer' : 'not-allowed', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                <input type="checkbox" name="isSelfDirected" checked={!!formData.isSelfDirected} onChange={handleChange} disabled={!isEditing}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: isEditing ? 'pointer' : 'not-allowed' }} />
                Auto-formation (apprentissage en autonomie)
              </label>
            </div>
          </div>
        </section>
      )}

      {/* ── Professional (employee / student_employee) ───────────────── */}
      {showProfessional && (
        <section className="profile-card" style={cardStyle(3)}>
          <h3 style={headingStyle}><span style={iconBadge}><Briefcase size={18} /></span> Informations professionnelles</h3>
          <div style={gridStyle}>
            {renderText('Entreprise', 'companyName', { placeholder: "Nom de l'entreprise", icon: Building })}
            {renderText('Service / Département', 'department', { placeholder: 'ex : Ressources Humaines', icon: Briefcase })}
            {renderText('Poste', 'position', { placeholder: 'ex : Développeur', icon: User })}
            {renderText('Secteur', 'sector', { placeholder: 'ex : Technologie', icon: Building })}
            {renderSelect("Années d'expérience", 'experienceYears', EXPERIENCE_OPTIONS, { icon: Calendar })}
          </div>
        </section>
      )}

      {/* ── Self-directed objectives ─────────────────────────────────── */}
      {showSelfDirected && (
        <section className="profile-card" style={cardStyle(2)}>
          <h3 style={headingStyle}><span style={iconBadge}><BookOpen size={18} /></span> Objectifs d'apprentissage</h3>
          <div style={gridStyle}>
            {renderSelect('Niveau', 'currentLevel', LEVEL_OPTIONS, { icon: Sparkles })}
            {renderTextarea("Domaines d'intérêt", 'interests', { placeholder: 'ex : Développement web, Data Science, Design' })}
            {renderTextarea("Objectif d'apprentissage", 'learningObjective', { placeholder: 'Décrivez ce que vous souhaitez accomplir…' })}
          </div>
        </section>
      )}

      {/* ── Instructor professional ──────────────────────────────────── */}
      {user?.role === 'instructor' && (
        <section className="profile-card" style={cardStyle(2)}>
          <h3 style={headingStyle}><span style={iconBadge}><Briefcase size={18} /></span> Informations professionnelles</h3>
          <div style={gridStyle}>
            {renderText("Domaine d'expertise", 'expertiseDomain', { placeholder: 'ex : Développement Web', icon: Sparkles })}
            {renderText('Spécialité', 'specialization', { placeholder: 'ex : React & Node.js', icon: BookOpen })}
            {renderText('Organisation / Entreprise', 'organization', { placeholder: "Nom de l'organisation", icon: Building })}
            {renderSelect("Années d'expérience", 'experienceYears', EXPERIENCE_OPTIONS, { icon: Calendar })}
            {renderSelect("Mode d'enseignement", 'teachingMode', TEACHING_OPTIONS, { icon: GraduationCap })}
          </div>
        </section>
      )}

      {/* ── Portfolio ────────────────────────────────────────────────── */}
      {showPortfolio && (
        <div className="profile-card" style={{ animation: 'fadeUp .5s ease both', animationDelay: '0.28s' }}>
          <PortfolioEditor value={portfolio} isEditing={isEditing} onChange={setPortfolio} />
        </div>
      )}
    </form>
  );
}
