import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User, Save, Camera, AlertCircle, Edit2, X, GraduationCap, Briefcase, BookOpen,
  Code2, Globe, AtSign, Mail, Phone, Award, Languages as LanguagesIcon,
  Sparkles, FileText, Building, Calendar, Clock, Layers,
} from 'lucide-react';
import api from '../services/api';
import PortfolioEditor from './PortfolioEditor';

// Social links shown in the profile header. Keys match socialLinks.
const HEADER_SOCIAL = [
  { key: 'linkedin', label: 'LinkedIn', Icon: Briefcase },
  { key: 'github', label: 'GitHub', Icon: Code2 },
  { key: 'website', label: 'Site web', Icon: Globe },
  { key: 'twitter', label: 'Twitter / X', Icon: AtSign },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'Sélectionnez votre niveau' },
  { value: 'beginner', label: 'Débutant' }, { value: 'intermediate', label: 'Intermédiaire' }, { value: 'advanced', label: 'Avancé' },
];
const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Sélectionnez votre expérience' },
  { value: '<1', label: "Moins d'un an" }, { value: '1-2', label: '1–2 ans' }, { value: '3-5', label: '3–5 ans' },
  { value: '6-10', label: '6–10 ans' }, { value: '>10', label: 'Plus de 10 ans' },
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
const LANG_LEVEL_LABEL = { basic: 'Basique', intermediate: 'Intermédiaire', fluent: 'Courant', native: 'Natif' };
const optLabel = (options, value) => options.find((o) => o.value === value)?.label || '';
const isoDate = (v) => (v ? String(v).slice(0, 10) : '');
const frDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');

const learnerFields = (sp = {}) => ({
  school: sp?.school || '', fieldOfStudy: sp?.fieldOfStudy || '', educationLevel: sp?.educationLevel || '',
  academicYearStart: isoDate(sp?.academicYearStart), academicYearEnd: isoDate(sp?.academicYearEnd),
  currentLevel: sp?.currentLevel || '', isSelfDirected: sp?.isSelfDirected || false,
  companyName: sp?.companyName || '', department: sp?.department || '', position: sp?.position || '',
  sector: sp?.sector || '', experienceYears: sp?.experienceYears || '', interests: sp?.interests || '', learningObjective: sp?.learningObjective || '',
});
const instructorFields = (ip = {}) => ({
  expertiseDomain: ip?.expertiseDomain || '', specialization: ip?.specialization || '',
  organization: ip?.organization || '', experienceYears: ip?.experienceYears || '', teachingMode: ip?.teachingMode || '',
});
const portfolioFields = (u = {}) => ({
  skills: u?.skills || [], languages: u?.languages || [], certifications: u?.certifications || [], diplomas: u?.diplomas || [], socialLinks: u?.socialLinks || {},
});

export default function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const isLearner = user?.role === 'student' || user?.role === 'employee';
  const isInstructor = user?.role === 'instructor';
  const situation = user?.studentProfile?.situation || 'student';
  const showAcademic = isLearner && (situation === 'student' || situation === 'student_employee');
  const showProfessional = isLearner && (situation === 'employee' || situation === 'student_employee');
  const showSelfDirected = isLearner && situation === 'self_directed';
  const showPortfolio = isLearner || isInstructor;
  const roleLabel =
    isInstructor ? '👨‍🏫 Instructeur'
    : user?.role === 'admin' ? '🛡️ Administrateur'
    : !isLearner ? 'Utilisateur'
    : situation === 'employee' ? '💼 Employé'
    : situation === 'student_employee' ? '🎓 Étudiant & 💼 Employé'
    : situation === 'self_directed' ? '📚 Auto-formation'
    : '🎓 Étudiant';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '', avatar: user?.avatar || '',
    bio: user?.bio || '', phone: user?.phone || '', socialLinks: user?.socialLinks || {},
    ...(isLearner ? learnerFields(user?.studentProfile) : isInstructor ? instructorFields(user?.instructorProfile) : {}),
  });
  const [portfolio, setPortfolio] = useState(portfolioFields(user));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    let msg = '';
    if (name === 'firstName' && !value.trim()) msg = 'Le prénom est requis.';
    else if (name === 'lastName' && !value.trim()) msg = 'Le nom est requis.';
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return !msg;
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (isEditing && (name === 'firstName' || name === 'lastName')) validateField(name, value);
  };
  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || '', lastName: user?.lastName || '', avatar: user?.avatar || '',
      bio: user?.bio || '', phone: user?.phone || '', socialLinks: user?.socialLinks || {},
      ...(isLearner ? learnerFields(user?.studentProfile) : isInstructor ? instructorFields(user?.instructorProfile) : {}),
    });
    setPortfolio(portfolioFields(user));
    setIsEditing(true);
  };
  const handleCancel = () => { setIsEditing(false); setErrors({}); };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
    if (file.size > 5 * 1024 * 1024) return showError('L\'image ne doit pas dépasser 5 Mo.');
    setUploading(true); setUploadProgress(10);
    try {
      let finalAvatarUrl = '';
      try {
        const signRes = await api.post('/uploads/cloudinary-sign', { type: 'image', filename: file.name, mimetype: file.type });
        const sign = signRes.data?.data || signRes.data;
        if (sign?.uploadUrl) {
          const form = new FormData();
          form.append('file', file); form.append('api_key', sign.apiKey); form.append('timestamp', String(sign.timestamp));
          form.append('signature', sign.signature); form.append('folder', sign.folder); form.append('public_id', sign.public_id);
          const cloud = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 90) + 10); };
            xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.response)); else reject(new Error(`Upload Cloudinary échoué (${xhr.status})`)); };
            xhr.onerror = () => reject(new Error('Erreur réseau Cloudinary'));
            xhr.open('POST', sign.uploadUrl); xhr.send(form);
          });
          if (cloud?.secure_url) finalAvatarUrl = cloud.secure_url;
        }
      } catch (cloudErr) { console.warn('Cloudinary signature upload skipped, trying backend direct endpoint:', cloudErr); }
      if (!finalAvatarUrl) {
        const fd = new FormData(); fd.append('avatar', file);
        const res = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        finalAvatarUrl = res.data?.data?.avatarUrl || res.data?.data?.user?.avatar || res.data?.avatarUrl || res.data?.data?.avatar;
      }
      if (finalAvatarUrl) { setFormData((prev) => ({ ...prev, avatar: finalAvatarUrl })); showSuccess('Photo de profil mise à jour avec succès !'); }
      else { setFormData((prev) => ({ ...prev, avatar: URL.createObjectURL(file) })); showSuccess('Aperçu de la photo prêt. Cliquez sur Enregistrer pour valider.'); }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showError(err.message || 'Impossible d\'uploader l\'image.');
    } finally {
      setUploading(false); setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const okF = validateField('firstName', formData.firstName);
    const okL = validateField('lastName', formData.lastName);
    if (!okF || !okL) return showError('Veuillez corriger les erreurs du formulaire avant de soumettre.');
    let profilePayload = {};
    if (isLearner) {
      const academic = { school: formData.school, fieldOfStudy: formData.fieldOfStudy, educationLevel: formData.educationLevel, academicYearStart: formData.academicYearStart || undefined, academicYearEnd: formData.academicYearEnd || undefined, currentLevel: formData.currentLevel || undefined };
      const professional = { companyName: formData.companyName, department: formData.department, position: formData.position, sector: formData.sector, experienceYears: formData.experienceYears || undefined };
      const selfDirected = { interests: formData.interests, learningObjective: formData.learningObjective, currentLevel: formData.currentLevel || undefined };
      if (situation === 'student') profilePayload = academic;
      else if (situation === 'employee') profilePayload = professional;
      else if (situation === 'student_employee') profilePayload = { ...academic, ...professional };
      else if (situation === 'self_directed') profilePayload = selfDirected;
      else profilePayload = academic;
      profilePayload.isSelfDirected = formData.isSelfDirected;
    } else if (isInstructor) {
      profilePayload = { expertiseDomain: formData.expertiseDomain, specialization: formData.specialization, organization: formData.organization, experienceYears: formData.experienceYears, teachingMode: formData.teachingMode };
    }
    setLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName, lastName: formData.lastName, avatar: formData.avatar || null,
        bio: formData.bio || null, phone: formData.phone || null, ...profilePayload, ...(showPortfolio ? portfolio : {}),
      });
      showSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    } finally { setLoading(false); }
  };

  // ── EDIT helpers (functions, not components, so inputs keep focus) ──
  const field = (label, name, { type = 'text', options, placeholder, full, error } = {}) => {
    const val = formData[name] ?? '';
    let control;
    if (options) control = <select className="pf2-input" name={name} value={val} onChange={handleChange}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
    else if (type === 'textarea') control = <textarea className="pf2-input" name={name} value={val} onChange={handleChange} placeholder={placeholder} rows={4} style={{ resize: 'vertical' }} />;
    else control = <input className={`pf2-input${error && errors[name] ? ' has-err' : ''}`} type={type} name={name} value={val} onChange={handleChange} placeholder={placeholder} />;
    return (
      <div className={`pf2-field${full ? ' full' : ''}`} key={name}>
        <span className="pf2-elabel">{label}</span>
        {control}
        {error && errors[name] && <span className="pf2-err"><AlertCircle size={13} /> {errors[name]}</span>}
      </div>
    );
  };
  const editCard = (Icon, title, inner) => (
    <div className="pf2-card">
      <h3 className="pf2-card-title"><Icon size={18} /> {title}</h3>
      <div className="pf2-egrid">{inner}</div>
    </div>
  );

  // ── VIEW helpers ──
  const sp = user?.studentProfile || {};
  const ip = user?.instructorProfile || {};
  const detailItem = (Icon, label, value) => (value ? { Icon, label, value } : null);
  const details = (
    isInstructor ? [
      detailItem(Sparkles, "Domaine d'expertise", ip.expertiseDomain),
      detailItem(BookOpen, 'Spécialité', ip.specialization),
      detailItem(Building, 'Organisation', ip.organization),
      detailItem(Clock, "Années d'expérience", optLabel(EXPERIENCE_OPTIONS, ip.experienceYears)),
      detailItem(GraduationCap, "Mode d'enseignement", optLabel(TEACHING_MODE_OPTIONS, ip.teachingMode)),
    ] : showSelfDirected ? [
      detailItem(Sparkles, 'Niveau', optLabel(LEVEL_OPTIONS, sp.currentLevel)),
      detailItem(BookOpen, "Domaines d'intérêt", sp.interests),
      detailItem(GraduationCap, "Objectif d'apprentissage", sp.learningObjective),
    ] : [
      ...(showAcademic ? [
        detailItem(Building, 'École / Université', sp.school),
        detailItem(BookOpen, "Domaine d'études", sp.fieldOfStudy),
        detailItem(GraduationCap, "Niveau d'études", optLabel(EDUCATION_LEVEL_OPTIONS, sp.educationLevel)),
        detailItem(Sparkles, 'Niveau', optLabel(LEVEL_OPTIONS, sp.currentLevel)),
        detailItem(Calendar, 'Période', (sp.academicYearStart || sp.academicYearEnd) ? `${frDate(sp.academicYearStart)}${sp.academicYearEnd ? ` → ${frDate(sp.academicYearEnd)}` : ''}` : ''),
        detailItem(Layers, 'Groupe / Classe', sp.group),
      ] : []),
      ...(showProfessional ? [
        detailItem(Building, 'Entreprise', sp.companyName),
        detailItem(Layers, 'Département', sp.department),
        detailItem(Briefcase, 'Poste', sp.position),
        detailItem(Globe, 'Secteur', sp.sector),
        detailItem(Clock, "Années d'expérience", optLabel(EXPERIENCE_OPTIONS, sp.experienceYears)),
      ] : []),
    ]
  ).filter(Boolean);

  const skills = user?.skills || [];
  const languages = user?.languages || [];
  const certifications = user?.certifications || [];
  const diplomas = user?.diplomas || [];
  const hasSocials = HEADER_SOCIAL.some(({ key }) => user?.socialLinks?.[key]);

  const credCard = (Icon, row, orgField) => (
    <div className="pv-cred" key={`${row.title}-${row.year}`}>
      <div className="pv-cred-ic"><Icon size={17} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="pv-cred-title">{row.title || 'Sans titre'}</div>
        <div className="pv-cred-sub">{[row[orgField], row.year].filter(Boolean).join(' · ') || '—'}</div>
      </div>
      {row.fileUrl && <a className="pv-cred-link" href={row.fileUrl} target="_blank" rel="noopener noreferrer"><FileText size={14} /> Voir</a>}
    </div>
  );
  const emptyNote = (t) => <p className="pv-empty">{t}</p>;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .pf2-hero { position:relative; overflow:hidden; border-radius:22px; margin-bottom:1.5rem; color:#fff;
          background:linear-gradient(130deg, var(--secondary) 0%, var(--primary) 62%, var(--accent) 128%); padding:clamp(1.5rem,4vw,2.4rem); box-shadow:0 18px 46px -26px rgba(27,75,90,.55); }
        .pf2-hero::after { content:''; position:absolute; top:-80px; right:-40px; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,.2), transparent 70%); pointer-events:none; }
        .pf2-htop { position:relative; z-index:1; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.2rem; }
        .pf2-id { display:flex; align-items:center; gap:clamp(1rem,3vw,1.5rem); flex:1 1 260px; min-width:0; }
        .pf2-avw { position:relative; flex-shrink:0; }
        .pf2-av, .pf2-avfb { width:clamp(84px,20vw,112px); height:clamp(84px,20vw,112px); border-radius:26px; object-fit:cover; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:clamp(2rem,7vw,2.7rem); color:#fff; background:rgba(255,255,255,.18); border:3px solid rgba(255,255,255,.35); }
        .pf2-cam { position:absolute; bottom:-6px; right:-6px; width:34px; height:34px; border-radius:50%; background:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,.25); }
        .pf2-name { margin:0 0 .4rem; font-size:clamp(1.5rem,5vw,2.1rem); font-weight:800; line-height:1.12; overflow-wrap:anywhere; }
        .pf2-role { display:inline-block; font-size:.82rem; font-weight:600; background:rgba(255,255,255,.2); padding:.25rem .75rem; border-radius:999px; }
        .pf2-meta { display:flex; flex-wrap:wrap; gap:.5rem .9rem; margin-top:.7rem; }
        .pf2-mchip { display:inline-flex; align-items:center; gap:.4rem; font-size:.85rem; opacity:.95; overflow-wrap:anywhere; }
        .pf2-hbtn { display:inline-flex; align-items:center; gap:.5rem; padding:.7rem 1.25rem; border-radius:11px; font-weight:600; font-size:.87rem; cursor:pointer; border:1px solid rgba(255,255,255,.3); background:rgba(255,255,255,.18); color:#fff; backdrop-filter:blur(8px); transition:background .15s; }
        .pf2-hbtn:hover { background:rgba(255,255,255,.3); }
        .pf2-hbtn--solid { background:#fff; color:var(--primary); border:none; }
        .pf2-socials { position:relative; z-index:1; display:flex; flex-wrap:wrap; gap:.55rem; margin-top:1.15rem; }
        .pf2-slink { display:inline-flex; align-items:center; gap:.4rem; padding:.42rem .85rem; border-radius:999px; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.32); color:#fff; text-decoration:none; font-size:.82rem; font-weight:600; }
        .pf2-slink:hover { background:rgba(255,255,255,.32); }
        .pf2-chipedit { display:flex; align-items:center; gap:.4rem; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); border-radius:10px; padding:.35rem .7rem; }
        .pf2-chipedit input { background:transparent; border:none; outline:none; color:#fff; font-size:.83rem; width:150px; }
        .pf2-chipedit input::placeholder { color:rgba(255,255,255,.7); }

        /* Portfolio VIEW */
        .pv-grid { display:grid; grid-template-columns:1fr; gap:1.3rem; align-items:start; }
        @media (min-width:960px) { .pv-grid { grid-template-columns: 1.55fr 1fr; } }
        .pv-col { display:flex; flex-direction:column; gap:1.3rem; min-width:0; }
        .pv-sec { background:var(--surface-color); border:1px solid var(--border-color); border-radius:18px; padding:1.5rem 1.6rem; box-shadow:0 4px 18px -14px rgba(0,0,0,.2); }
        .pv-sec-title { display:flex; align-items:center; gap:.55rem; margin:0 0 1.1rem; font-size:.8rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--secondary); opacity:.85; }
        .pv-sec-title svg { color:var(--primary); }
        .pv-about { margin:0; font-size:1rem; line-height:1.7; color:var(--text-color); white-space:pre-wrap; }
        .pv-details { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:1.1rem 1.4rem; }
        .pv-item { display:flex; align-items:flex-start; gap:.75rem; }
        .pv-item-ic { flex-shrink:0; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--primary) 12%, transparent); color:var(--primary); }
        .pv-k { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--secondary); opacity:.65; margin-bottom:.18rem; }
        .pv-v { font-size:.98rem; font-weight:600; color:var(--text-color); word-break:break-word; line-height:1.4; }
        .pv-chips { display:flex; flex-wrap:wrap; gap:.5rem; }
        .pv-chip { display:inline-flex; align-items:center; gap:.35rem; padding:.42rem .85rem; border-radius:999px; font-size:.88rem; font-weight:600; color:var(--primary); background:color-mix(in srgb, var(--primary) 11%, transparent); border:1px solid color-mix(in srgb, var(--primary) 22%, transparent); }
        .pv-cred { display:flex; align-items:center; gap:.85rem; padding:.85rem 0; border-bottom:1px solid var(--border-color); }
        .pv-cred:last-child { border-bottom:none; }
        .pv-cred-ic { flex-shrink:0; width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--accent) 16%, transparent); color:var(--accent); }
        .pv-cred-title { font-size:.96rem; font-weight:700; color:var(--text-color); }
        .pv-cred-sub { font-size:.83rem; color:var(--secondary); opacity:.8; margin-top:.1rem; }
        .pv-cred-link { margin-left:auto; display:inline-flex; align-items:center; gap:.3rem; color:var(--primary); font-size:.83rem; font-weight:600; text-decoration:none; white-space:nowrap; }
        .pv-empty { margin:0; font-size:.9rem; color:var(--secondary); opacity:.6; font-style:italic; }
        .pv-badge { display:inline-block; padding:.25rem .7rem; border-radius:999px; font-size:.8rem; font-weight:700; background:color-mix(in srgb, var(--primary) 13%, transparent); color:var(--primary); }

        /* EDIT form */
        .pf2-cols { display:grid; grid-template-columns:1fr; gap:1.25rem; align-items:start; }
        @media (min-width:1024px) { .pf2-cols { grid-template-columns:1.5fr 1fr; } }
        .pf2-col { display:flex; flex-direction:column; gap:1.25rem; min-width:0; }
        .pf2-card { background:var(--surface-color); border:1px solid var(--border-color); border-radius:18px; padding:1.5rem; box-shadow:0 4px 18px -14px rgba(0,0,0,.2); }
        .pf2-card-title { display:flex; align-items:center; gap:.55rem; margin:0 0 1.1rem; font-size:1.02rem; font-weight:800; color:var(--secondary); }
        .pf2-card-title svg { color:var(--primary); }
        .pf2-egrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:1rem 1.1rem; }
        .pf2-field { display:flex; flex-direction:column; gap:.4rem; min-width:0; }
        .pf2-field.full { grid-column:1 / -1; }
        .pf2-elabel { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--secondary); opacity:.72; }
        .pf2-input { width:100%; padding:.7rem .9rem; border-radius:11px; border:1.5px solid var(--border-color); background:var(--bg-color); font-size:.95rem; color:var(--text-color); outline:none; box-sizing:border-box; transition:border-color .15s, box-shadow .15s; }
        .pf2-input:focus { border-color:var(--primary); background:var(--surface-color); box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
        .pf2-input.has-err { border-color:#d93838; }
        .pf2-err { display:flex; align-items:center; gap:4px; font-size:.78rem; color:#d93838; }
        .pf2-check { grid-column:1 / -1; display:flex; align-items:center; gap:.6rem; font-size:.92rem; color:var(--text-color); }
      `}</style>

      {/* ── Hero ── */}
      <div className="pf2-hero">
        <div className="pf2-htop">
          <div className="pf2-id">
            <div className="pf2-avw">
              {(isEditing ? formData.avatar : user?.avatar)
                ? <img src={isEditing ? formData.avatar : user?.avatar} alt={`Photo de ${user?.firstName}`} className="pf2-av" onError={(e) => { e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }} />
                : <div className="pf2-avfb">{(user?.firstName || '?').charAt(0).toUpperCase()}</div>}
              {isEditing && (
                <button type="button" className="pf2-cam" onClick={() => fileInputRef.current?.click()} title="Changer la photo"><Camera size={16} style={{ color: 'var(--primary)' }} /></button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0])} disabled={uploading} style={{ display: 'none' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 className="pf2-name">{(isEditing ? formData.firstName : user?.firstName)} {(isEditing ? formData.lastName : user?.lastName)}</h1>
              <span className="pf2-role">{roleLabel}</span>
              <div className="pf2-meta">
                {user?.email && <span className="pf2-mchip"><Mail size={14} /> {user.email}</span>}
                {(isEditing ? formData.phone : user?.phone) && <span className="pf2-mchip"><Phone size={14} /> {isEditing ? formData.phone : user?.phone}</span>}
              </div>
            </div>
          </div>
          <div>
            {!isEditing ? (
              <button className="pf2-hbtn" onClick={handleEdit}><Edit2 size={16} /> Modifier le profil</button>
            ) : (
              <div style={{ display: 'flex', gap: '.7rem' }}>
                <button className="pf2-hbtn" onClick={handleCancel}><X size={16} /> Annuler</button>
                <button type="submit" form="profile-form" className="pf2-hbtn pf2-hbtn--solid" disabled={loading}><Save size={16} /> {loading ? 'Enregistrement…' : 'Enregistrer'}</button>
              </div>
            )}
          </div>
        </div>

        {/* Social links: chips in view, inline inputs in edit */}
        {(isEditing || hasSocials) && (
          <div className="pf2-socials">
            {HEADER_SOCIAL.map(({ key, label, Icon }) => {
              if (isEditing) {
                return (
                  <div key={key} className="pf2-chipedit">
                    <Icon size={15} />
                    <input type="url" placeholder={label} value={formData.socialLinks?.[key] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: e.target.value } }))} />
                  </div>
                );
              }
              const url = user?.socialLinks?.[key];
              return url ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="pf2-slink"><Icon size={15} /> {label}</a> : null;
            })}
          </div>
        )}
      </div>

      {/* ── VIEW: portfolio presentation ── */}
      {!isEditing && (
        <div className="pv-grid">
          <div className="pv-col">
            {user?.bio && (
              <div className="pv-sec">
                <h3 className="pv-sec-title"><User size={15} /> À propos</h3>
                <p className="pv-about">{user.bio}</p>
              </div>
            )}
            <div className="pv-sec">
              <h3 className="pv-sec-title">{isInstructor ? <Briefcase size={15} /> : <GraduationCap size={15} />} {isInstructor ? 'Profil professionnel' : showProfessional && !showAcademic ? 'Parcours professionnel' : showSelfDirected ? "Objectifs d'apprentissage" : 'Parcours'}</h3>
              {details.length ? (
                <div className="pv-details">
                  {details.map((d, i) => (
                    <div className="pv-item" key={i}>
                      <div className="pv-item-ic"><d.Icon size={16} /></div>
                      <div style={{ minWidth: 0 }}><div className="pv-k">{d.label}</div><div className="pv-v">{d.value}</div></div>
                    </div>
                  ))}
                  {showAcademic && (
                    <div className="pv-item">
                      <div className="pv-item-ic"><Sparkles size={16} /></div>
                      <div><div className="pv-k">Auto-formation</div><div className="pv-v"><span className="pv-badge">{sp.isSelfDirected ? 'Oui' : 'Non'}</span></div></div>
                    </div>
                  )}
                </div>
              ) : emptyNote('Complétez votre profil pour afficher votre parcours ici.')}
            </div>
          </div>

          {showPortfolio && (
            <div className="pv-col">
              <div className="pv-sec">
                <h3 className="pv-sec-title"><Sparkles size={15} /> Compétences</h3>
                {skills.length ? <div className="pv-chips">{skills.map((s, i) => <span className="pv-chip" key={`${s}-${i}`}>{s}</span>)}</div> : emptyNote('Aucune compétence ajoutée.')}
              </div>
              <div className="pv-sec">
                <h3 className="pv-sec-title"><LanguagesIcon size={15} /> Langues</h3>
                {languages.length ? <div className="pv-chips">{languages.map((l, i) => <span className="pv-chip" key={i}><Globe size={13} /> {l.name}{l.level ? ` · ${LANG_LEVEL_LABEL[l.level] || l.level}` : ''}</span>)}</div> : emptyNote('Aucune langue ajoutée.')}
              </div>
              <div className="pv-sec">
                <h3 className="pv-sec-title"><Award size={15} /> Certificats</h3>
                {certifications.length ? certifications.map((r) => credCard(Award, r, 'issuer')) : emptyNote('Aucun certificat.')}
              </div>
              <div className="pv-sec">
                <h3 className="pv-sec-title"><GraduationCap size={15} /> Diplômes</h3>
                {diplomas.length ? diplomas.map((r) => credCard(GraduationCap, r, 'institution')) : emptyNote('Aucun diplôme.')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT: form ── */}
      {isEditing && (
        <form onSubmit={handleSubmit} noValidate id="profile-form">
          <div className={showPortfolio ? 'pf2-cols' : ''}>
            <div className="pf2-col">
              {editCard(User, 'Informations personnelles', (
                <>
                  {field('Prénom', 'firstName', { error: true })}
                  {field('Nom', 'lastName', { error: true })}
                  {field('Téléphone', 'phone', { type: 'tel', placeholder: '+212 6XX XXX XXX', full: true })}
                  {field('Biographie', 'bio', { type: 'textarea', placeholder: 'Racontez-nous brièvement votre parcours…', full: true })}
                </>
              ))}
              {showAcademic && editCard(GraduationCap, 'Informations académiques', (
                <>
                  {field('École / Université', 'school', { placeholder: "Nom de l'établissement" })}
                  {field("Domaine d'études", 'fieldOfStudy', { placeholder: 'ex: Informatique' })}
                  {field("Niveau d'études", 'educationLevel', { options: EDUCATION_LEVEL_OPTIONS })}
                  {field('Niveau', 'currentLevel', { options: LEVEL_OPTIONS })}
                  {field('Date de début', 'academicYearStart', { type: 'date' })}
                  {field('Date de fin', 'academicYearEnd', { type: 'date' })}
                  <label className="pf2-check">
                    <input type="checkbox" name="isSelfDirected" checked={formData.isSelfDirected} onChange={handleChange} style={{ width: 18, height: 18 }} />
                    Auto-formation (apprentissage en autonomie)
                  </label>
                </>
              ))}
              {showProfessional && editCard(Briefcase, 'Informations professionnelles', (
                <>
                  {field('Entreprise', 'companyName', { placeholder: "Nom de l'entreprise" })}
                  {field('Service / Département', 'department', { placeholder: 'ex: Ressources Humaines' })}
                  {field('Poste', 'position', { placeholder: 'ex: Développeur' })}
                  {field('Secteur', 'sector', { placeholder: 'ex: Technologie' })}
                  {field("Années d'expérience", 'experienceYears', { options: EXPERIENCE_OPTIONS, full: true })}
                </>
              ))}
              {showSelfDirected && editCard(BookOpen, "Objectifs d'apprentissage", (
                <>
                  {field('Niveau', 'currentLevel', { options: LEVEL_OPTIONS })}
                  {field("Domaines d'intérêt", 'interests', { type: 'textarea', placeholder: 'ex: Développement web, Data Science, Design', full: true })}
                  {field("Objectif d'apprentissage", 'learningObjective', { type: 'textarea', placeholder: 'Décrivez ce que vous souhaitez accomplir…', full: true })}
                </>
              ))}
              {isInstructor && editCard(Briefcase, 'Informations professionnelles', (
                <>
                  {field("Domaine d'expertise", 'expertiseDomain', { placeholder: 'ex: Développement Web' })}
                  {field('Spécialité', 'specialization', { placeholder: 'ex: React & Node.js' })}
                  {field("Années d'expérience", 'experienceYears', { options: EXPERIENCE_OPTIONS })}
                  {field("Mode d'enseignement", 'teachingMode', { options: TEACHING_MODE_OPTIONS })}
                  {field('Organisation / Entreprise', 'organization', { placeholder: "Nom de l'organisation", full: true })}
                </>
              ))}
            </div>
            {showPortfolio && (
              <div className="pf2-col">
                <PortfolioEditor value={portfolio} isEditing={isEditing} onChange={setPortfolio} />
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
