import { useState, useMemo } from 'react';
import {
  User, Mail, Phone, Edit2, X, Check, LogOut, GraduationCap, Briefcase,
  Camera, Trash2, AlertTriangle, Shield, CalendarClock, BadgeCheck,
  Building, BookOpen, Layers, Clock, Sparkles, KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ROLE_LABEL = { student: 'Étudiant', instructor: 'Instructeur', admin: 'Administrateur', employee: 'Employé' };
const EXPERIENCE_LABEL = { '<1': "Moins d'un an", '1-2': '1–2 ans', '3-5': '3–5 ans', '6-10': '6–10 ans', '>10': 'Plus de 10 ans' };
const TEACHING_MODE_LABEL = { online: 'En ligne', 'in-person': 'Présentiel', hybrid: 'Les deux' };

/** Small circular progress ring (profile completion). */
function Ring({ percent, size = 52 }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} title={`Profil complété à ${percent}%`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-color)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth="5"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 800, color: 'var(--primary)' }}>
        {percent}%
      </span>
    </div>
  );
}

/** Field with a leading icon chip, small label, and value below. */
function Field({ icon: Icon, label, value }) {
  return (
    <div className="pf-field-card">
      <div className="pf-field-ic"><Icon size={17} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="pf-field-label">{label}</div>
        <div className="pf-field-value">{value || <em className="pf-empty">Non renseigné</em>}</div>
      </div>
    </div>
  );
}

/** Labeled edit control. */
function EditField({ label, children }) {
  return (
    <label className="pf-edit-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Profile() {
  const { user, logout, updateProfile, changePassword, deleteAccount, uploadAvatar } = useAuth();
  const [tab, setTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [editData, setEditData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', bio: user?.bio || '', phone: user?.phone || '' });
  const [editProfileData, setEditProfileData] = useState({
    specialization: user?.profile?.specialization || '', organization: user?.profile?.organization || '',
    experienceYears: user?.profile?.experienceYears || '', teachingMode: user?.profile?.teachingMode || '',
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const profile = user?.profile;
  const isStudent = user?.role === 'student';
  const canEditProfile = user?.role === 'instructor';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null;
  const RoleIcon = isStudent ? GraduationCap : user?.role === 'admin' ? Shield : Briefcase;

  // Profile-completion % from real, role-appropriate fields.
  const completion = useMemo(() => {
    const base = [user?.avatar, user?.firstName, user?.lastName, user?.email, user?.phone, user?.bio];
    const extra = isStudent
      ? [profile?.school, profile?.fieldOfStudy, profile?.educationLevel]
      : user?.role === 'instructor'
        ? [profile?.specialization, profile?.organization, profile?.experienceYears, profile?.teachingMode]
        : [];
    const all = [...base, ...extra];
    const filled = all.filter((v) => v != null && String(v).trim() !== '').length;
    return Math.round((filled / all.length) * 100);
  }, [user, profile, isStudent]);

  const handleEdit = () => {
    setEditData({ firstName: user?.firstName || '', lastName: user?.lastName || '', bio: user?.bio || '', phone: user?.phone || '' });
    setIsEditing(true);
  };
  const handleSave = async () => {
    setLoading(true);
    try { await updateProfile(editData); setIsEditing(false); }
    catch (err) { console.error('Error updating profile:', err); }
    finally { setLoading(false); }
  };
  const handleChange = (e) => { const { name, value } = e.target; setEditData((p) => ({ ...p, [name]: value })); };

  const handleEditProfile = () => {
    setEditProfileData({
      specialization: user?.profile?.specialization || '', organization: user?.profile?.organization || '',
      experienceYears: user?.profile?.experienceYears || '', teachingMode: user?.profile?.teachingMode || '',
    });
    setIsEditingProfile(true);
  };
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try { await updateProfile(editProfileData); setIsEditingProfile(false); }
    catch (err) { console.error('Error updating profile info:', err); }
    finally { setProfileLoading(false); }
  };
  const handleProfileChange = (e) => { const { name, value } = e.target; setEditProfileData((p) => ({ ...p, [name]: value })); };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try { await uploadAvatar(file); }
    catch (err) { console.error('Error uploading avatar:', err); alert('Erreur lors du téléchargement de l\'avatar'); }
    finally { setAvatarLoading(false); }
  };

  const handlePasswordChange = async () => {
    setPasswordError(''); setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) return setPasswordError('Les mots de passe ne correspondent pas');
    if (passwordData.newPassword.length < 8) return setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
    setPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Mot de passe modifié avec succès.');
    } catch (err) {
      setPasswordError(err.response?.data?.error?.message || 'Erreur lors de la modification du mot de passe');
    } finally { setPasswordLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    try { await deleteAccount(); }
    catch (err) { console.error('Error deleting account:', err); alert('Erreur lors de la suppression du compte'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <style>{`
        .pf-page { max-width: 920px; margin: 0 auto; padding: 2rem 1.15rem 4rem; }
        .pf-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 24px; box-shadow: 0 18px 50px -30px rgba(27,75,90,.5); overflow: hidden; }

        /* Cover + header */
        .pf-cover { position: relative; height: 150px; background: linear-gradient(120deg, var(--secondary) 0%, var(--primary) 60%, var(--accent) 130%); }
        .pf-cover::before { content:''; position:absolute; inset:0; background:
          radial-gradient(circle at 18% 120%, rgba(255,255,255,.28), transparent 45%),
          radial-gradient(circle at 82% -20%, rgba(255,255,255,.22), transparent 42%); }
        .pf-cover::after { content:''; position:absolute; inset:0; opacity:.5;
          background-image: linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
          background-size: 26px 26px; -webkit-mask-image: linear-gradient(180deg, transparent, #000); mask-image: linear-gradient(180deg, transparent, #000); }
        .pf-head { display: flex; align-items: flex-end; gap: 1.25rem; padding: 0 1.9rem 1.4rem; margin-top: -52px; position: relative; }
        .pf-avatar-wrap { position: relative; flex-shrink: 0; }
        .pf-avatar, .pf-avatar-fb { width: 116px; height: 116px; border-radius: 26px; object-fit: cover; display:flex; align-items:center; justify-content:center; font-size: 2.6rem; font-weight: 800; color:#fff;
          background: linear-gradient(135deg, var(--secondary), var(--primary)); border: 4px solid var(--surface-color); box-shadow: 0 10px 26px -12px rgba(0,0,0,.4); }
        .pf-cam { position:absolute; bottom:-4px; right:-4px; width:34px; height:34px; border-radius:50%; background: var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; border:3px solid var(--surface-color); transition: transform .15s ease; }
        .pf-cam:hover { transform: scale(1.08); }
        .pf-idz { flex: 1; min-width: 0; padding-bottom: .2rem; }
        .pf-name { display:flex; align-items:center; gap:.5rem; margin:0; font-size:1.5rem; font-weight:800; color:var(--text-color); line-height:1.15; flex-wrap: wrap; }
        .pf-verif { display:inline-flex; align-items:center; gap:.3rem; font-size:.72rem; font-weight:700; color: var(--success-color, #28a745); background: color-mix(in srgb, var(--success-color, #28a745) 14%, transparent); padding:.18rem .55rem; border-radius:999px; }
        .pf-role { display:inline-flex; align-items:center; gap:.35rem; margin-top:.5rem; padding:.28rem .75rem; border-radius:999px; font-size:.74rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; color:var(--primary); background: color-mix(in srgb, var(--primary) 12%, transparent); }
        .pf-head-side { display:flex; align-items:center; gap:1rem; flex-shrink:0; padding-bottom:.3rem; }

        /* Tabs */
        .pf-tabs { display:flex; gap:.3rem; padding:.35rem; margin: 0 1.9rem; background: var(--bg-color); border:1px solid var(--border-color); border-radius:14px; }
        .pf-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.6rem 1rem; border:none; border-radius:10px; background:transparent; color:var(--secondary); font-weight:700; font-size:.9rem; cursor:pointer; transition: all .18s ease; }
        .pf-tab.is-active { background: var(--surface-color); color: var(--primary); box-shadow: 0 4px 12px -6px rgba(0,0,0,.25); }
        .pf-body { padding: 1.6rem 1.9rem 2rem; }

        .pf-block { margin-top: 1.9rem; }
        .pf-block:first-child { margin-top: .4rem; }
        .pf-block-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
        .pf-block-title { display:flex; align-items:center; gap:.55rem; font-size:.82rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--secondary); opacity:.85; margin:0; }
        .pf-fields { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:.8rem; }
        .pf-field-card { display:flex; align-items:flex-start; gap:.8rem; padding:.95rem 1.05rem; border-radius:15px; background: var(--bg-color); border:1px solid var(--border-color); transition: transform .15s ease, box-shadow .15s ease; }
        .pf-field-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -14px rgba(0,0,0,.3); }
        .pf-field-ic { flex-shrink:0; width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; background: color-mix(in srgb, var(--primary) 13%, transparent); color: var(--primary); }
        .pf-field-label { font-size:.68rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--secondary); opacity:.65; margin-bottom:.22rem; }
        .pf-field-value { font-size:.98rem; font-weight:600; color:var(--text-color); word-break:break-word; line-height:1.45; }
        .pf-empty { font-style:italic; font-weight:500; opacity:.45; }
        .pf-bio { padding:1.1rem 1.25rem; border-radius:15px; background: var(--bg-color); border:1px solid var(--border-color); font-size:.98rem; line-height:1.65; color:var(--text-color); }

        /* Edit */
        .pf-edit { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); gap:1rem; }
        .pf-edit-field { display:flex; flex-direction:column; gap:.4rem; }
        .pf-edit-field > span { font-size:.74rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--secondary); opacity:.8; }
        .pf-edit-field.full { grid-column: 1 / -1; }
        .pf-input { width:100%; padding:.72rem .95rem; border-radius:12px; border:1.5px solid var(--border-color); font-size:.96rem; color:var(--text-color); background:var(--bg-color); transition:border-color .15s, box-shadow .15s; box-sizing:border-box; }
        .pf-input:focus { outline:none; border-color:var(--primary); background:var(--surface-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
        .pf-actions { display:flex; gap:.7rem; margin-top:1.15rem; }

        .pf-btn { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; padding:.6rem 1.05rem; border-radius:11px; font-weight:600; font-size:.86rem; cursor:pointer; border:none; transition: transform .15s ease, background .15s ease, opacity .15s ease; }
        .pf-btn:hover { transform: translateY(-1px); }
        .pf-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .pf-btn--primary { background: var(--primary); color:#fff; }
        .pf-btn--ghost { background: var(--surface-color); color: var(--text-color); border:1px solid var(--border-color); }
        .pf-btn--danger { background:#d93838; color:#fff; }
        .pf-btn--sm { padding:.45rem .85rem; font-size:.8rem; }

        .pf-alert { padding:.7rem 1rem; border-radius:11px; font-size:.88rem; margin-bottom:1rem; }
        .pf-alert--err { background: color-mix(in srgb, #d93838 10%, transparent); border:1px solid color-mix(in srgb, #d93838 30%, transparent); color:#c0392b; }
        .pf-alert--ok { background: color-mix(in srgb, var(--success-color,#28a745) 12%, transparent); border:1px solid color-mix(in srgb, var(--success-color,#28a745) 30%, transparent); color: var(--success-color,#1e7e34); }
        .pf-danger { margin-top:1.9rem; padding:1.2rem 1.4rem; border-radius:16px; background: color-mix(in srgb, #d93838 6%, transparent); border:1px solid color-mix(in srgb, #d93838 26%, transparent); }

        @media (max-width: 620px) {
          .pf-head { flex-direction: column; align-items: flex-start; }
          .pf-head-side { width:100%; justify-content: space-between; }
          .pf-tabs, .pf-body { margin-left:1rem; margin-right:1rem; }
          .pf-body { padding-left:1.1rem; padding-right:1.1rem; }
        }
      `}</style>

      <div className="pf-page">
        <div className="pf-card">
          {/* Cover + header */}
          <div className="pf-cover" />
          <div className="pf-head">
            <div className="pf-avatar-wrap">
              {user?.avatar
                ? <img src={user.avatar} alt={`Photo de ${user.firstName}`} className="pf-avatar" />
                : <div className="pf-avatar-fb">{initials}</div>}
              <label className="pf-cam" title="Changer la photo" style={{ opacity: avatarLoading ? .6 : 1 }}>
                {avatarLoading ? <span style={{ fontSize: '.7rem' }}>…</span> : <Camera size={16} />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={avatarLoading} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="pf-idz">
              <h1 className="pf-name">
                {user?.firstName} {user?.lastName}
                {user?.isVerified && <span className="pf-verif"><BadgeCheck size={13} /> Vérifié</span>}
              </h1>
              <span className="pf-role"><RoleIcon size={13} /> {ROLE_LABEL[user?.role] || 'Membre'}</span>
            </div>

            <div className="pf-head-side">
              <Ring percent={completion} />
              <button className="pf-btn pf-btn--ghost pf-btn--sm" onClick={logout}><LogOut size={15} /> Déconnexion</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="pf-tabs">
            <button className={`pf-tab ${tab === 'overview' ? 'is-active' : ''}`} onClick={() => setTab('overview')}><Sparkles size={16} /> Vue d'ensemble</button>
            <button className={`pf-tab ${tab === 'security' ? 'is-active' : ''}`} onClick={() => setTab('security')}><Shield size={16} /> Sécurité</button>
          </div>

          {/* ── Overview tab ── */}
          {tab === 'overview' && (
            <div className="pf-body">
              {/* Identity */}
              <div className="pf-block">
                <div className="pf-block-head">
                  <h2 className="pf-block-title"><User size={15} /> Coordonnées</h2>
                  {!isEditing && <button className="pf-btn pf-btn--ghost pf-btn--sm" onClick={handleEdit}><Edit2 size={14} /> Modifier</button>}
                </div>

                {isEditing ? (
                  <>
                    <div className="pf-edit">
                      <EditField label="Prénom"><input className="pf-input" name="firstName" value={editData.firstName} onChange={handleChange} /></EditField>
                      <EditField label="Nom"><input className="pf-input" name="lastName" value={editData.lastName} onChange={handleChange} /></EditField>
                      <EditField label="Téléphone"><input className="pf-input" name="phone" value={editData.phone} onChange={handleChange} placeholder="+212 6 00 00 00 00" /></EditField>
                      <label className="pf-edit-field full"><span>Biographie</span><textarea className="pf-input" name="bio" rows={4} value={editData.bio} onChange={handleChange} style={{ resize: 'vertical' }} /></label>
                    </div>
                    <div className="pf-actions">
                      <button className="pf-btn pf-btn--primary" onClick={handleSave} disabled={loading}><Check size={15} /> {loading ? 'Enregistrement…' : 'Enregistrer'}</button>
                      <button className="pf-btn pf-btn--ghost" onClick={() => setIsEditing(false)} disabled={loading}><X size={15} /> Annuler</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pf-fields">
                      <Field icon={Mail} label="Email" value={user?.email} />
                      <Field icon={Phone} label="Téléphone" value={user?.phone} />
                      {memberSince && <Field icon={CalendarClock} label="Membre depuis" value={memberSince} />}
                    </div>
                    <div style={{ marginTop: '.8rem' }} className="pf-bio">
                      {user?.bio || <em className="pf-empty">Ajoutez une biographie pour vous présenter.</em>}
                    </div>
                  </>
                )}
              </div>

              {/* Role-specific */}
              {profile && (
                <div className="pf-block">
                  <div className="pf-block-head">
                    <h2 className="pf-block-title">
                      {isStudent ? <GraduationCap size={15} /> : <Briefcase size={15} />}
                      {isStudent ? 'Parcours académique' : 'Profil professionnel'}
                    </h2>
                    {canEditProfile && !isEditingProfile && <button className="pf-btn pf-btn--ghost pf-btn--sm" onClick={handleEditProfile}><Edit2 size={14} /> Modifier</button>}
                  </div>

                  {isEditingProfile && canEditProfile ? (
                    <>
                      <div className="pf-edit">
                        <EditField label="Spécialisation"><input className="pf-input" name="specialization" value={editProfileData.specialization} onChange={handleProfileChange} /></EditField>
                        <EditField label="Organisation / Entreprise"><input className="pf-input" name="organization" value={editProfileData.organization} onChange={handleProfileChange} /></EditField>
                        <EditField label="Années d'expérience">
                          <select className="pf-input" name="experienceYears" value={editProfileData.experienceYears} onChange={handleProfileChange}>
                            <option value="">Sélectionner…</option>
                            <option value="<1">Moins d'un an</option><option value="1-2">1–2 ans</option>
                            <option value="3-5">3–5 ans</option><option value="6-10">6–10 ans</option><option value=">10">Plus de 10 ans</option>
                          </select>
                        </EditField>
                        <EditField label="Mode d'enseignement">
                          <select className="pf-input" name="teachingMode" value={editProfileData.teachingMode} onChange={handleProfileChange}>
                            <option value="">Sélectionner…</option>
                            <option value="online">En ligne</option><option value="in-person">Présentiel</option><option value="hybrid">Les deux</option>
                          </select>
                        </EditField>
                      </div>
                      <div className="pf-actions">
                        <button className="pf-btn pf-btn--primary" onClick={handleSaveProfile} disabled={profileLoading}><Check size={15} /> {profileLoading ? 'Enregistrement…' : 'Enregistrer'}</button>
                        <button className="pf-btn pf-btn--ghost" onClick={() => setIsEditingProfile(false)} disabled={profileLoading}><X size={15} /> Annuler</button>
                      </div>
                    </>
                  ) : (
                    <div className="pf-fields">
                      {isStudent ? (
                        <>
                          <Field icon={Building} label="Établissement" value={profile.school} />
                          <Field icon={BookOpen} label="Filière / Spécialité" value={profile.fieldOfStudy} />
                          <Field icon={GraduationCap} label="Niveau d'étude" value={profile.educationLevel} />
                          <Field icon={CalendarClock} label="Année de formation" value={profile.academicYearStart ? `${String(profile.academicYearStart).slice(0, 10)}${profile.academicYearEnd ? ` → ${String(profile.academicYearEnd).slice(0, 10)}` : ''}` : ''} />
                          <Field icon={Layers} label="Groupe / Classe" value={profile.group} />
                        </>
                      ) : (
                        <>
                          <Field icon={Briefcase} label="Spécialisation" value={profile.specialization} />
                          <Field icon={Building} label="Organisation / Entreprise" value={profile.organization} />
                          <Field icon={Clock} label="Années d'expérience" value={EXPERIENCE_LABEL[profile.experienceYears] || (profile.experienceYears ? `${profile.experienceYears} ans` : '')} />
                          <Field icon={GraduationCap} label="Mode d'enseignement" value={TEACHING_MODE_LABEL[profile.teachingMode]} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Security tab ── */}
          {tab === 'security' && (
            <div className="pf-body">
              <div className="pf-block" style={{ marginTop: '.4rem' }}>
                <h2 className="pf-block-title" style={{ marginBottom: '1rem' }}><KeyRound size={15} /> Mot de passe</h2>
                {passwordError && <div className="pf-alert pf-alert--err">{passwordError}</div>}
                {passwordSuccess && <div className="pf-alert pf-alert--ok">{passwordSuccess}</div>}
                <div className="pf-edit" style={{ maxWidth: 520 }}>
                  <label className="pf-edit-field full"><span>Mot de passe actuel</span><input className="pf-input" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))} /></label>
                  <EditField label="Nouveau mot de passe"><input className="pf-input" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} /></EditField>
                  <EditField label="Confirmer"><input className="pf-input" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} /></EditField>
                </div>
                <div className="pf-actions">
                  <button className="pf-btn pf-btn--primary" onClick={handlePasswordChange} disabled={passwordLoading}><Check size={15} /> {passwordLoading ? 'Modification…' : 'Mettre à jour'}</button>
                </div>
              </div>

              <div className="pf-danger">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '.9rem' }}>
                  <AlertTriangle size={20} style={{ color: '#d93838', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 700, color: '#c0392b' }}>Supprimer le compte</h4>
                    <p style={{ margin: '.15rem 0 0', fontSize: '.83rem', color: 'var(--secondary)', opacity: .8 }}>Cette action est définitive et irréversible.</p>
                  </div>
                </div>
                <button className="pf-btn pf-btn--danger" onClick={handleDeleteAccount}><Trash2 size={15} /> Supprimer mon compte</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
