import { useState } from 'react';
import {
  User, Mail, Phone, Edit2, X, Check, LogOut, GraduationCap, Briefcase,
  Camera, Lock, Trash2, AlertTriangle, Shield, CalendarClock, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ROLE_LABEL = { student: 'Étudiant', instructor: 'Instructeur', admin: 'Administrateur', employee: 'Employé' };
const EXPERIENCE_LABEL = { '<1': "Moins d'un an", '1-2': '1–2 ans', '3-5': '3–5 ans', '6-10': '6–10 ans', '>10': 'Plus de 10 ans' };
const TEACHING_MODE_LABEL = { online: 'En ligne', 'in-person': 'Présentiel', hybrid: 'Les deux' };

/** A single definition row: label on the left, value on the right, divider below. */
function Row({ label, value }) {
  return (
    <div className="pf-row">
      <span className="pf-row-label">{label}</span>
      <span className="pf-row-value">
        {value || <em className="pf-empty">Non renseigné</em>}
      </span>
    </div>
  );
}

/** An editable definition row (renders an input/textarea/select in the value cell). */
function EditRow({ label, children }) {
  return (
    <div className="pf-row pf-row--edit">
      <span className="pf-row-label">{label}</span>
      <div className="pf-row-field">{children}</div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, updateProfile, changePassword, deleteAccount, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
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
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) return setPasswordError('Les mots de passe ne correspondent pas');
    if (passwordData.newPassword.length < 8) return setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
    setPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Mot de passe modifié avec succès');
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
        .pf-page { max-width: 1080px; margin: 0 auto; padding: 2.25rem 1.25rem 4rem; }
        .pf-layout { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 1.5rem; align-items: start; }
        .pf-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 18px; box-shadow: 0 6px 22px -16px rgba(0,0,0,0.25); }

        /* ── Sidebar ── */
        .pf-side { position: sticky; top: 90px; padding: 1.75rem; text-align: center; }
        .pf-avatar-wrap { position: relative; width: 116px; height: 116px; margin: 0 auto .95rem; }
        .pf-avatar, .pf-avatar-fb {
          width: 116px; height: 116px; border-radius: 50%; object-fit: cover; display: flex; align-items: center;
          justify-content: center; font-size: 2.6rem; font-weight: 800; color: #fff;
          background: linear-gradient(135deg, var(--secondary), var(--primary));
          box-shadow: 0 8px 22px -10px rgba(193,101,47,0.5);
        }
        .pf-cam { position: absolute; bottom: 4px; right: 4px; width: 34px; height: 34px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid var(--surface-color); transition: transform .15s ease; }
        .pf-cam:hover { transform: scale(1.08); }
        .pf-name { margin: 0; font-size: 1.35rem; font-weight: 800; color: var(--text-color); line-height: 1.2; }
        .pf-role { display: inline-flex; align-items: center; gap: .35rem; margin-top: .55rem; padding: .3rem .8rem; border-radius: 999px; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, transparent); }
        .pf-side-contacts { margin-top: 1.4rem; padding-top: 1.4rem; border-top: 1px solid var(--border-color); display: grid; gap: .85rem; text-align: left; }
        .pf-contact { display: flex; align-items: center; gap: .7rem; font-size: .9rem; color: var(--text-color); min-width: 0; }
        .pf-contact svg { color: var(--primary); flex-shrink: 0; }
        .pf-contact span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pf-side-actions { margin-top: 1.4rem; display: grid; gap: .6rem; }

        /* ── Sections ── */
        .pf-section { padding: 1.6rem 1.75rem; margin-bottom: 1.5rem; }
        .pf-section:last-child { margin-bottom: 0; }
        .pf-sec-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; margin-bottom: .4rem; border-bottom: 2px solid var(--border-color); }
        .pf-sec-title { display: flex; align-items: center; gap: .6rem; font-size: 1.05rem; font-weight: 800; color: var(--secondary); margin: 0; }
        .pf-row { display: flex; align-items: center; gap: 1rem; padding: .95rem .25rem; border-bottom: 1px solid var(--border-color); }
        .pf-row:last-child { border-bottom: none; }
        .pf-row--edit { align-items: flex-start; }
        .pf-row-label { flex: 0 0 40%; max-width: 190px; font-size: .82rem; font-weight: 600; color: var(--secondary); opacity: .78; }
        .pf-row-value { flex: 1; text-align: right; font-size: .98rem; font-weight: 600; color: var(--text-color); word-break: break-word; }
        .pf-row-field { flex: 1; }
        .pf-empty { font-style: italic; font-weight: 500; color: var(--secondary); opacity: .45; }

        /* ── Inputs / buttons ── */
        .pf-input { width: 100%; padding: .7rem .9rem; border-radius: 11px; border: 1.5px solid var(--border-color); font-size: .95rem; color: var(--text-color); background: var(--bg-color); transition: border-color .15s ease, box-shadow .15s ease; box-sizing: border-box; }
        .pf-input:focus { outline: none; border-color: var(--primary); background: var(--surface-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
        .pf-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; padding: .65rem 1.1rem; border-radius: 11px; font-weight: 600; font-size: .88rem; cursor: pointer; border: none; transition: opacity .15s ease, transform .15s ease, background .15s ease; }
        .pf-btn:hover { transform: translateY(-1px); }
        .pf-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .pf-btn--primary { background: var(--primary); color: #fff; }
        .pf-btn--ghost { background: transparent; color: var(--text-color); border: 1px solid var(--border-color); }
        .pf-btn--danger { background: #d93838; color: #fff; }
        .pf-btn--sm { padding: .5rem .9rem; font-size: .82rem; }
        .pf-edit-actions { display: flex; gap: .7rem; margin-top: 1.1rem; }
        .pf-danger { margin-top: 1.5rem; padding: 1.15rem 1.35rem; border-radius: 14px; background: color-mix(in srgb, #d93838 7%, transparent); border: 1px solid color-mix(in srgb, #d93838 28%, transparent); }

        @media (max-width: 860px) {
          .pf-layout { grid-template-columns: 1fr; }
          .pf-side { position: static; }
        }
        @media (max-width: 520px) {
          .pf-row { flex-direction: column; align-items: flex-start; gap: .3rem; }
          .pf-row-value { text-align: left; }
          .pf-row-label { flex-basis: auto; }
        }
      `}</style>

      <div className="pf-page">
        <div className="pf-layout">
          {/* ── Left: profile sidebar ─────────────────────────────── */}
          <aside className="pf-card pf-side">
            <div className="pf-avatar-wrap">
              {user?.avatar
                ? <img src={user.avatar} alt={`Photo de ${user.firstName}`} className="pf-avatar" />
                : <div className="pf-avatar-fb">{initials}</div>}
              <label className="pf-cam" title="Changer la photo" style={{ opacity: avatarLoading ? 0.6 : 1 }}>
                {avatarLoading ? <span style={{ fontSize: '.7rem' }}>…</span> : <Camera size={16} />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={avatarLoading} style={{ display: 'none' }} />
              </label>
            </div>

            <h1 className="pf-name">{user?.firstName} {user?.lastName}</h1>
            <span className="pf-role"><RoleIcon size={13} /> {ROLE_LABEL[user?.role] || 'Membre'}</span>

            <div className="pf-side-contacts">
              {user?.email && <div className="pf-contact"><Mail size={16} /><span>{user.email}</span></div>}
              {user?.phone && <div className="pf-contact"><Phone size={16} /><span>{user.phone}</span></div>}
              {memberSince && <div className="pf-contact"><CalendarClock size={16} /><span>Membre depuis {memberSince}</span></div>}
            </div>

            <div className="pf-side-actions">
              {!isEditing && <button className="pf-btn pf-btn--primary" onClick={handleEdit}><Edit2 size={15} /> Modifier le profil</button>}
              <button className="pf-btn pf-btn--ghost" onClick={logout}><LogOut size={15} /> Se déconnecter</button>
            </div>
          </aside>

          {/* ── Right: detail sections ────────────────────────────── */}
          <main>
            {/* Personal info */}
            <section className="pf-card pf-section">
              <div className="pf-sec-head">
                <h2 className="pf-sec-title"><User size={18} /> Informations personnelles</h2>
                {!isEditing && <button className="pf-btn pf-btn--ghost pf-btn--sm" onClick={handleEdit}><Edit2 size={14} /> Modifier</button>}
              </div>

              {isEditing ? (
                <>
                  <EditRow label="Prénom"><input className="pf-input" name="firstName" value={editData.firstName} onChange={handleChange} /></EditRow>
                  <EditRow label="Nom"><input className="pf-input" name="lastName" value={editData.lastName} onChange={handleChange} /></EditRow>
                  <EditRow label="Téléphone"><input className="pf-input" name="phone" value={editData.phone} onChange={handleChange} placeholder="+212 6 00 00 00 00" /></EditRow>
                  <EditRow label="Biographie"><textarea className="pf-input" name="bio" rows={4} value={editData.bio} onChange={handleChange} style={{ resize: 'vertical' }} /></EditRow>
                  <div className="pf-edit-actions">
                    <button className="pf-btn pf-btn--primary" onClick={handleSave} disabled={loading}><Check size={15} /> {loading ? 'Enregistrement…' : 'Enregistrer'}</button>
                    <button className="pf-btn pf-btn--ghost" onClick={() => setIsEditing(false)} disabled={loading}><X size={15} /> Annuler</button>
                  </div>
                </>
              ) : (
                <>
                  <Row label="Prénom" value={user?.firstName} />
                  <Row label="Nom" value={user?.lastName} />
                  <Row label="Email" value={user?.email} />
                  <Row label="Téléphone" value={user?.phone} />
                  <Row label="Biographie" value={user?.bio} />
                </>
              )}
            </section>

            {/* Role-specific info */}
            {profile && (
              <section className="pf-card pf-section">
                <div className="pf-sec-head">
                  <h2 className="pf-sec-title">
                    {isStudent ? <GraduationCap size={18} /> : <Briefcase size={18} />}
                    {isStudent ? 'Informations académiques' : 'Informations professionnelles'}
                  </h2>
                  {canEditProfile && !isEditingProfile && <button className="pf-btn pf-btn--ghost pf-btn--sm" onClick={handleEditProfile}><Edit2 size={14} /> Modifier</button>}
                </div>

                {isEditingProfile && canEditProfile ? (
                  <>
                    <EditRow label="Spécialisation"><input className="pf-input" name="specialization" value={editProfileData.specialization} onChange={handleProfileChange} /></EditRow>
                    <EditRow label="Organisation / Entreprise"><input className="pf-input" name="organization" value={editProfileData.organization} onChange={handleProfileChange} /></EditRow>
                    <EditRow label="Années d'expérience">
                      <select className="pf-input" name="experienceYears" value={editProfileData.experienceYears} onChange={handleProfileChange}>
                        <option value="">Sélectionner…</option>
                        <option value="<1">Moins d'un an</option>
                        <option value="1-2">1–2 ans</option>
                        <option value="3-5">3–5 ans</option>
                        <option value="6-10">6–10 ans</option>
                        <option value=">10">Plus de 10 ans</option>
                      </select>
                    </EditRow>
                    <EditRow label="Mode d'enseignement">
                      <select className="pf-input" name="teachingMode" value={editProfileData.teachingMode} onChange={handleProfileChange}>
                        <option value="">Sélectionner…</option>
                        <option value="online">En ligne</option>
                        <option value="in-person">Présentiel</option>
                        <option value="hybrid">Les deux</option>
                      </select>
                    </EditRow>
                    <div className="pf-edit-actions">
                      <button className="pf-btn pf-btn--primary" onClick={handleSaveProfile} disabled={profileLoading}><Check size={15} /> {profileLoading ? 'Enregistrement…' : 'Enregistrer'}</button>
                      <button className="pf-btn pf-btn--ghost" onClick={() => setIsEditingProfile(false)} disabled={profileLoading}><X size={15} /> Annuler</button>
                    </div>
                  </>
                ) : isStudent ? (
                  <>
                    <Row label="Établissement" value={profile.school} />
                    <Row label="Filière / Spécialité" value={profile.fieldOfStudy} />
                    <Row label="Niveau d'étude" value={profile.educationLevel} />
                    <Row
                      label="Année de formation"
                      value={profile.academicYearStart
                        ? `${String(profile.academicYearStart).slice(0, 10)}${profile.academicYearEnd ? ` → ${String(profile.academicYearEnd).slice(0, 10)}` : ''}`
                        : ''}
                    />
                    <Row label="Groupe / Classe" value={profile.group} />
                  </>
                ) : (
                  <>
                    <Row label="Spécialisation" value={profile.specialization} />
                    <Row label="Organisation / Entreprise" value={profile.organization} />
                    <Row label="Années d'expérience" value={EXPERIENCE_LABEL[profile.experienceYears] || (profile.experienceYears ? `${profile.experienceYears} ans` : '')} />
                    <Row label="Mode d'enseignement" value={TEACHING_MODE_LABEL[profile.teachingMode]} />
                  </>
                )}
              </section>
            )}

            {/* Security */}
            <section className="pf-card pf-section">
              <div className="pf-sec-head">
                <h2 className="pf-sec-title"><Lock size={18} /> Sécurité</h2>
                {!isChangingPassword && (
                  <button className="pf-btn pf-btn--ghost pf-btn--sm" onClick={() => setIsChangingPassword(true)}>
                    <Lock size={14} /> Changer le mot de passe <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <div style={{ padding: '1.1rem 0 .3rem' }}>
                  {passwordError && (
                    <div style={{ padding: '.7rem 1rem', background: 'color-mix(in srgb, #d93838 10%, transparent)', border: '1px solid color-mix(in srgb, #d93838 30%, transparent)', borderRadius: '10px', color: '#c0392b', marginBottom: '1rem', fontSize: '.88rem' }}>
                      {passwordError}
                    </div>
                  )}
                  <div style={{ display: 'grid', gap: '.9rem', maxWidth: '420px' }}>
                    <div><div className="pf-row-label" style={{ marginBottom: '.4rem' }}>Mot de passe actuel</div><input className="pf-input" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))} /></div>
                    <div><div className="pf-row-label" style={{ marginBottom: '.4rem' }}>Nouveau mot de passe</div><input className="pf-input" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} /></div>
                    <div><div className="pf-row-label" style={{ marginBottom: '.4rem' }}>Confirmer le mot de passe</div><input className="pf-input" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} /></div>
                    <div className="pf-edit-actions" style={{ marginTop: '.2rem' }}>
                      <button className="pf-btn pf-btn--primary" onClick={handlePasswordChange} disabled={passwordLoading}><Check size={15} /> {passwordLoading ? 'Modification…' : 'Modifier'}</button>
                      <button className="pf-btn pf-btn--ghost" onClick={() => { setIsChangingPassword(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }} disabled={passwordLoading}><X size={15} /> Annuler</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pf-danger">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.9rem' }}>
                  <AlertTriangle size={20} style={{ color: '#d93838', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 700, color: '#c0392b' }}>Zone de danger</h4>
                    <p style={{ margin: '.15rem 0 0', fontSize: '.83rem', color: 'var(--secondary)', opacity: .8 }}>La suppression de votre compte est irréversible.</p>
                  </div>
                </div>
                <button className="pf-btn pf-btn--danger" onClick={handleDeleteAccount}><Trash2 size={15} /> Supprimer mon compte</button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
