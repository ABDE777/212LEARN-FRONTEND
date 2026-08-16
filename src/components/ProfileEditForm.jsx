import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Save, Camera, AlertCircle, Edit2, X, GraduationCap, Briefcase, BookOpen, Code2, Globe, AtSign, Link2 } from 'lucide-react';
import api from '../services/api';
import PortfolioEditor from './PortfolioEditor';

// Social links shown in the profile header (top-right). Keys match socialLinks.
const HEADER_SOCIAL = [
  { key: 'linkedin', label: 'LinkedIn', Icon: Briefcase },
  { key: 'github', label: 'GitHub', Icon: Code2 },
  { key: 'website', label: 'Site web', Icon: Globe },
  { key: 'twitter', label: 'Twitter / X', Icon: AtSign },
];

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
const EDUCATION_LEVEL_OPTIONS = [
  { value: '', label: 'Sélectionnez votre niveau' },
  { value: 'college', label: 'Collège' }, { value: 'lycee', label: 'Lycée' }, { value: 'bac', label: 'Bac' },
  { value: 'bac+1', label: 'Bac+1' }, { value: 'bac+2', label: 'Bac+2' }, { value: 'bac+3', label: 'Bac+3' },
  { value: 'bac+4', label: 'Bac+4' }, { value: 'bac+5', label: 'Bac+5' }, { value: 'autre', label: 'Autre' },
];
const TEACHING_MODE_OPTIONS = [
  { value: '', label: 'Sélectionnez le mode' },
  { value: 'online', label: 'En ligne' }, { value: 'onsite', label: 'Présentiel' }, { value: 'hybrid', label: 'Les deux' },
];
const optLabel = (options, value) => options.find((o) => o.value === value)?.label || '';

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

// Portfolio fields live on the user (not the profile).
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
    socialLinks: user?.socialLinks || {},
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
  const [, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'firstName' && !value.trim()) errorMsg = 'Le prénom est requis.';
    else if (name === 'lastName' && !value.trim()) errorMsg = 'Le nom est requis.';
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (isEditing && (name === 'firstName' || name === 'lastName')) validateField(name, value);
  };

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      avatar: user?.avatar || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      socialLinks: user?.socialLinks || {},
      ...(isLearner
        ? learnerFields(user?.studentProfile)
        : user?.role === 'instructor'
          ? instructorFields(user?.instructorProfile)
          : {}),
    });
    setPortfolio(portfolioFields(user));
    setIsEditing(true);
  };

  const handleCancel = () => { setIsEditing(false); setErrors({}); };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
    if (file.size > 5 * 1024 * 1024) return showError('L\'image ne doit pas dépasser 5 Mo.');

    setUploading(true);
    setUploadProgress(10);
    try {
      let finalAvatarUrl = '';
      try {
        const signRes = await api.post('/uploads/cloudinary-sign', { type: 'image', filename: file.name, mimetype: file.type });
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
            xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 90) + 10); };
            xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.response)); else reject(new Error(`Upload Cloudinary échoué (${xhr.status})`)); };
            xhr.onerror = () => reject(new Error('Erreur réseau Cloudinary'));
            xhr.open('POST', sign.uploadUrl);
            xhr.send(form);
          });
          if (cloud?.secure_url) finalAvatarUrl = cloud.secure_url;
        }
      } catch (cloudErr) {
        console.warn('Cloudinary signature upload skipped, trying backend direct endpoint:', cloudErr);
      }

      if (!finalAvatarUrl) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);
        const res = await api.post('/users/me/avatar', formDataUpload, { headers: { 'Content-Type': 'multipart/form-data' } });
        finalAvatarUrl = res.data?.data?.avatarUrl || res.data?.data?.user?.avatar || res.data?.avatarUrl || res.data?.data?.avatar;
      }

      if (finalAvatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: finalAvatarUrl }));
        showSuccess('Photo de profil mise à jour avec succès !');
      } else {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFirstNameValid = validateField('firstName', formData.firstName);
    const isLastNameValid = validateField('lastName', formData.lastName);
    if (!isFirstNameValid || !isLastNameValid) return showError('Veuillez corriger les erreurs du formulaire avant de soumettre.');

    let profilePayload = {};
    if (isLearner) {
      const academic = {
        school: formData.school, fieldOfStudy: formData.fieldOfStudy, educationLevel: formData.educationLevel,
        academicYearStart: formData.academicYearStart || undefined, academicYearEnd: formData.academicYearEnd || undefined,
        currentLevel: formData.currentLevel || undefined,
      };
      const professional = {
        companyName: formData.companyName, department: formData.department, position: formData.position,
        sector: formData.sector, experienceYears: formData.experienceYears || undefined,
      };
      const selfDirected = { interests: formData.interests, learningObjective: formData.learningObjective, currentLevel: formData.currentLevel || undefined };
      if (situation === 'student') profilePayload = academic;
      else if (situation === 'employee') profilePayload = professional;
      else if (situation === 'student_employee') profilePayload = { ...academic, ...professional };
      else if (situation === 'self_directed') profilePayload = selfDirected;
      else profilePayload = academic;
      profilePayload.isSelfDirected = formData.isSelfDirected;
    } else if (user?.role === 'instructor') {
      profilePayload = {
        expertiseDomain: formData.expertiseDomain, specialization: formData.specialization,
        organization: formData.organization, experienceYears: formData.experienceYears, teachingMode: formData.teachingMode,
      };
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName, lastName: formData.lastName,
        avatar: formData.avatar || null, bio: formData.bio || null, phone: formData.phone || null,
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

  // ── Field renderer: a view tile when reading, a styled control when editing.
  //    Defined as a plain function (not a component) so inputs keep focus. ──────
  const field = (label, name, { type = 'text', options, placeholder, full, error } = {}) => {
    const val = formData[name] ?? '';
    let control;
    if (!isEditing) {
      let shown;
      if (options) shown = optLabel(options, val);
      else if (type === 'date') shown = val ? new Date(val).toLocaleDateString('fr-FR') : '';
      else shown = val;
      control = <div className="pef-value">{shown ? shown : <em className="pef-empty">Non renseigné</em>}</div>;
    } else if (options) {
      control = (
        <select className="pef-input" name={name} value={val} onChange={handleChange}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    } else if (type === 'textarea') {
      control = <textarea className="pef-input" name={name} value={val} onChange={handleChange} placeholder={placeholder} rows={4} style={{ resize: 'vertical' }} />;
    } else {
      control = <input className={`pef-input${error && errors[name] ? ' has-err' : ''}`} type={type} name={name} value={val} onChange={handleChange} placeholder={placeholder} />;
    }
    return (
      <div className={`pef-field${full ? ' full' : ''}`} key={name}>
        <span className="pef-label">{label}</span>
        {control}
        {error && errors[name] && <span className="pef-inline-err"><AlertCircle size={13} /> {errors[name]}</span>}
      </div>
    );
  };

  const card = (Icon, title, inner) => (
    <div className="pef-card">
      <h3 className="pef-card-title"><Icon size={18} /> {title}</h3>
      <div className="pef-grid">{inner}</div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .pef-header { position: relative; overflow: hidden; border-radius: 22px; margin-bottom: 1.6rem; color: #fff;
          background: linear-gradient(130deg, var(--secondary) 0%, var(--primary) 65%, var(--accent) 130%); padding: clamp(1.4rem, 4vw, 2.2rem); box-shadow: 0 18px 44px -26px rgba(27,75,90,.55); }
        .pef-header::after { content:''; position:absolute; top:-70px; right:-30px; width:230px; height:230px; border-radius:50%; background: radial-gradient(circle, rgba(255,255,255,.2), transparent 70%); pointer-events:none; }
        .pef-h-top { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.2rem; position:relative; z-index:1; }
        .pef-id { display:flex; align-items:center; gap:clamp(.9rem,3vw,1.4rem); flex:1 1 240px; min-width:0; }
        .pef-av-wrap { position:relative; flex-shrink:0; }
        .pef-av, .pef-av-fb { width:clamp(78px,20vw,104px); height:clamp(78px,20vw,104px); border-radius:24px; object-fit:cover; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:clamp(1.9rem,7vw,2.5rem); color:#fff; background:rgba(255,255,255,.18); border:3px solid rgba(255,255,255,.35); }
        .pef-cam { position:absolute; bottom:-6px; right:-6px; width:34px; height:34px; border-radius:50%; background:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,.25); }
        .pef-name { margin:0 0 .35rem; font-size:clamp(1.4rem,5vw,1.95rem); font-weight:800; line-height:1.15; overflow-wrap:anywhere; }
        .pef-role { display:inline-block; font-size:.85rem; font-weight:600; background:rgba(255,255,255,.2); padding:.2rem .7rem; border-radius:999px; }
        .pef-email { margin:.5rem 0 0; opacity:.9; font-size:.85rem; overflow-wrap:anywhere; }
        .pef-hbtn { display:inline-flex; align-items:center; gap:.5rem; padding:.7rem 1.3rem; border-radius:11px; font-weight:600; font-size:.88rem; cursor:pointer; border:1px solid rgba(255,255,255,.3); background:rgba(255,255,255,.18); color:#fff; backdrop-filter:blur(8px); transition:background .15s; }
        .pef-hbtn:hover { background:rgba(255,255,255,.3); }
        .pef-hbtn--solid { background:#fff; color:var(--primary); border:none; }
        .pef-liens { position:relative; z-index:1; margin-top:1.3rem; padding-top:1.1rem; border-top:1px solid rgba(255,255,255,.25); }
        .pef-liens-title { display:flex; align-items:center; gap:.45rem; font-weight:700; font-size:.98rem; }
        .pef-liens-sub { margin:.2rem 0 .7rem; opacity:.85; font-size:.8rem; }
        .pef-chip-link { display:inline-flex; align-items:center; gap:.4rem; padding:.4rem .85rem; border-radius:999px; background:rgba(255,255,255,.22); border:1px solid rgba(255,255,255,.35); color:#fff; text-decoration:none; font-size:.83rem; font-weight:600; }
        .pef-chip-edit { display:flex; align-items:center; gap:.4rem; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); border-radius:10px; padding:.35rem .7rem; }
        .pef-chip-edit input { background:transparent; border:none; outline:none; color:#fff; font-size:.84rem; width:150px; }
        .pef-chip-edit input::placeholder { color:rgba(255,255,255,.7); }

        .pef-cols { display:grid; grid-template-columns:1fr; gap:1.25rem; align-items:start; }
        @media (min-width:1024px) { .pef-cols { grid-template-columns: 1.5fr 1fr; } }
        .pef-col { display:flex; flex-direction:column; gap:1.25rem; min-width:0; }
        .pef-card { background:var(--surface-color); border:1px solid var(--border-color); border-radius:18px; padding:1.6rem; box-shadow:0 4px 18px -14px rgba(0,0,0,.2); }
        .pef-card-title { display:flex; align-items:center; gap:.55rem; margin:0 0 1.25rem; font-size:1.05rem; font-weight:800; color:var(--secondary); }
        .pef-card-title svg { color:var(--primary); }
        .pef-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem 1.1rem; }
        .pef-field { display:flex; flex-direction:column; gap:.4rem; min-width:0; }
        .pef-field.full { grid-column:1 / -1; }
        .pef-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--secondary); opacity:.7; }
        .pef-value { padding:.7rem .9rem; border-radius:11px; background:var(--bg-color); border:1px solid var(--border-color); font-size:.95rem; font-weight:600; color:var(--text-color); min-height:1.2rem; word-break:break-word; }
        .pef-empty { font-style:italic; font-weight:500; opacity:.45; }
        .pef-input { width:100%; padding:.7rem .9rem; border-radius:11px; border:1.5px solid var(--border-color); background:var(--bg-color); font-size:.95rem; color:var(--text-color); outline:none; box-sizing:border-box; transition:border-color .15s, box-shadow .15s; }
        .pef-input:focus { border-color:var(--primary); background:var(--surface-color); box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
        .pef-input.has-err { border-color:#d93838; }
        .pef-inline-err { display:flex; align-items:center; gap:4px; font-size:.78rem; color:#d93838; }
        .pef-check { grid-column:1 / -1; display:flex; align-items:center; gap:.6rem; font-size:.92rem; color:var(--text-color); }
        .pef-badge { display:inline-block; padding:.25rem .7rem; border-radius:999px; font-size:.8rem; font-weight:700; background:color-mix(in srgb, var(--primary) 13%, transparent); color:var(--primary); }
      `}</style>

      {/* ── Header ── */}
      <div className="pef-header">
        <div className="pef-h-top">
          <div className="pef-id">
            <div className="pef-av-wrap">
              {formData.avatar
                ? <img src={formData.avatar} alt={`Photo de ${formData.firstName}`} className="pef-av" onError={(e) => { e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }} />
                : <div className="pef-av-fb">{formData.firstName ? formData.firstName.charAt(0).toUpperCase() : '?'}</div>}
              {isEditing && (
                <button type="button" className="pef-cam" onClick={() => fileInputRef.current?.click()} title="Changer la photo">
                  <Camera size={16} style={{ color: 'var(--primary)' }} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0])} disabled={uploading} style={{ display: 'none' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 className="pef-name">{formData.firstName} {formData.lastName}</h1>
              <span className="pef-role">{roleLabel}</span>
              <p className="pef-email">{user?.email}</p>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button className="pef-hbtn" onClick={handleEdit}><Edit2 size={16} /> Modifier le profil</button>
            ) : (
              <div style={{ display: 'flex', gap: '.7rem' }}>
                <button className="pef-hbtn" onClick={handleCancel}><X size={16} /> Annuler</button>
                <button type="submit" form="profile-form" className="pef-hbtn pef-hbtn--solid" disabled={loading}><Save size={16} /> {loading ? 'Enregistrement…' : 'Enregistrer'}</button>
              </div>
            )}
          </div>
        </div>

        {/* Liens */}
        <div className="pef-liens">
          <div className="pef-liens-title"><Link2 size={17} /> Liens</div>
          <p className="pef-liens-sub">Vos réseaux et votre portfolio en ligne.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
            {HEADER_SOCIAL.map(({ key, label, Icon }) => {
              const url = formData.socialLinks?.[key];
              if (isEditing) {
                return (
                  <div key={key} className="pef-chip-edit">
                    <Icon size={15} />
                    <input type="url" placeholder={label} value={formData.socialLinks?.[key] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: e.target.value } }))} />
                  </div>
                );
              }
              return url ? (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="pef-chip-link"><Icon size={15} /> {label}</a>
              ) : null;
            })}
            {!isEditing && HEADER_SOCIAL.every(({ key }) => !formData.socialLinks?.[key]) && (
              <span style={{ fontSize: '.82rem', opacity: .75 }}>Aucun lien renseigné.</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <form onSubmit={handleSubmit} noValidate id="profile-form">
        <div className={showPortfolio ? 'pef-cols' : ''}>
          <div className="pef-col">
            {/* Personal */}
            {card(User, 'Informations personnelles', (
              <>
                {field('Prénom', 'firstName', { error: true })}
                {field('Nom', 'lastName', { error: true })}
                {field('Téléphone', 'phone', { type: 'tel', placeholder: '+212 6XX XXX XXX', full: true })}
                {field('Biographie', 'bio', { type: 'textarea', placeholder: 'Racontez-nous brièvement votre parcours…', full: true })}
              </>
            ))}

            {/* Academic */}
            {showAcademic && card(GraduationCap, 'Informations académiques', (
              <>
                {field('École / Université', 'school', { placeholder: "Nom de l'établissement" })}
                {field("Domaine d'études", 'fieldOfStudy', { placeholder: 'ex: Informatique' })}
                {field("Niveau d'études", 'educationLevel', { options: EDUCATION_LEVEL_OPTIONS })}
                {field('Niveau', 'currentLevel', { options: LEVEL_OPTIONS })}
                {field('Date de début', 'academicYearStart', { type: 'date' })}
                {field('Date de fin', 'academicYearEnd', { type: 'date' })}
                <div className="pef-field">
                  <span className="pef-label">Groupe / Classe</span>
                  <div className="pef-value" style={{ opacity: .8 }}>{user?.studentProfile?.group || 'Non attribué — assigné par un instructeur ou un administrateur'}</div>
                </div>
                {isEditing ? (
                  <label className="pef-check">
                    <input type="checkbox" name="isSelfDirected" checked={formData.isSelfDirected} onChange={handleChange} style={{ width: 18, height: 18 }} />
                    Auto-formation (apprentissage en autonomie)
                  </label>
                ) : (
                  <div className="pef-field full">
                    <span className="pef-label">Auto-formation</span>
                    <div><span className="pef-badge">{formData.isSelfDirected ? 'Oui' : 'Non'}</span></div>
                  </div>
                )}
              </>
            ))}

            {/* Professional (employee learners) */}
            {showProfessional && card(Briefcase, 'Informations professionnelles', (
              <>
                {field('Entreprise', 'companyName', { placeholder: "Nom de l'entreprise" })}
                {field('Service / Département', 'department', { placeholder: 'ex: Ressources Humaines' })}
                {field('Poste', 'position', { placeholder: 'ex: Développeur' })}
                {field('Secteur', 'sector', { placeholder: 'ex: Technologie' })}
                {field("Années d'expérience", 'experienceYears', { options: EXPERIENCE_OPTIONS, full: true })}
              </>
            ))}

            {/* Self-directed */}
            {showSelfDirected && card(BookOpen, "Objectifs d'apprentissage", (
              <>
                {field('Niveau', 'currentLevel', { options: LEVEL_OPTIONS })}
                {field("Domaines d'intérêt", 'interests', { type: 'textarea', placeholder: 'ex: Développement web, Data Science, Design', full: true })}
                {field("Objectif d'apprentissage", 'learningObjective', { type: 'textarea', placeholder: 'Décrivez ce que vous souhaitez accomplir…', full: true })}
              </>
            ))}

            {/* Instructor */}
            {user?.role === 'instructor' && card(Briefcase, 'Informations professionnelles', (
              <>
                {field("Domaine d'expertise", 'expertiseDomain', { placeholder: 'ex: Développement Web' })}
                {field('Spécialité', 'specialization', { placeholder: 'ex: React & Node.js' })}
                {field("Années d'expérience", 'experienceYears', { options: EXPERIENCE_OPTIONS })}
                {field("Mode d'enseignement", 'teachingMode', { options: TEACHING_MODE_OPTIONS })}
                {field('Organisation / Entreprise', 'organization', { placeholder: "Nom de l'organisation", full: true })}
              </>
            ))}
          </div>

          {/* Right: portfolio */}
          {showPortfolio && (
            <div className="pef-col">
              <PortfolioEditor value={portfolio} isEditing={isEditing} onChange={setPortfolio} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
