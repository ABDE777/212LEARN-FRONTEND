import { useState } from 'react';
import {
  User, Mail, FileText, Edit2, X, Check, LogOut, Phone, GraduationCap,
  Briefcase, Building, Calendar, Camera, Lock, Trash2, AlertTriangle,
  Shield, CalendarClock, BookOpen, Layers, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ROLE_LABEL = {
  student: 'Étudiant',
  instructor: 'Instructeur',
  admin: 'Administrateur',
  employee: 'Employé',
};

const EXPERIENCE_LABEL = {
  '<1': "Moins d'un an", '1-2': '1–2 ans', '3-5': '3–5 ans',
  '6-10': '6–10 ans', '>10': 'Plus de 10 ans',
};

const TEACHING_MODE_LABEL = { online: 'En ligne', 'in-person': 'Présentiel', hybrid: 'Les deux' };

/** Read-only info tile — a labeled value with an icon, styled as an intentional card (not a form input). */
function InfoTile({ icon: Icon, label, value, full }) {
  return (
    <div className="pf-tile" style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div className="pf-tile-icon"><Icon size={18} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="pf-tile-label">{label}</div>
        <div className="pf-tile-value">{value || <span style={{ color: 'var(--secondary)', opacity: 0.5 }}>Non renseigné</span>}</div>
      </div>
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
  const [editData, setEditData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', bio: user?.bio || '' });
  const [editProfileData, setEditProfileData] = useState({
    ...(user?.role === 'student' ? {
      school: user?.profile?.school || '', fieldOfStudy: user?.profile?.fieldOfStudy || '',
      educationLevel: user?.profile?.educationLevel || '', academicYear: user?.profile?.academicYear || '', group: user?.profile?.group || '',
    } : user?.role === 'instructor' ? {
      specialization: user?.profile?.specialization || '', organization: user?.profile?.organization || '',
      experienceYears: user?.profile?.experienceYears || '', teachingMode: user?.profile?.teachingMode || '',
    } : {}),
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const profile = user?.profile;
  const isStudent = user?.role === 'student';
  const canEditProfile = user?.role === 'instructor' || user?.role === 'admin';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null;

  const handleLogout = () => logout();

  const handleEdit = () => {
    setEditData({ firstName: user?.firstName || '', lastName: user?.lastName || '', bio: user?.bio || '' });
    setIsEditing(true);
  };
  const handleCancel = () => setIsEditing(false);
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setEditProfileData({
      ...(user?.role === 'student' ? {
        school: user?.profile?.school || '', fieldOfStudy: user?.profile?.fieldOfStudy || '',
        educationLevel: user?.profile?.educationLevel || '', academicYear: user?.profile?.academicYear || '', group: user?.profile?.group || '',
      } : user?.role === 'instructor' ? {
        specialization: user?.profile?.specialization || '', organization: user?.profile?.organization || '',
        experienceYears: user?.profile?.experienceYears || '', teachingMode: user?.profile?.teachingMode || '',
      } : {}),
    });
    setIsEditingProfile(true);
  };
  const handleCancelProfile = () => setIsEditingProfile(false);
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await updateProfile(editProfileData);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile info:', err);
    } finally {
      setProfileLoading(false);
    }
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Erreur lors du téléchargement de l\'avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Mot de passe modifié avec succès');
    } catch (err) {
      setPasswordError(err.response?.data?.error?.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    try {
      await deleteAccount();
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Erreur lors de la suppression du compte');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <style>{`
        .pf-wrap { max-width: 960px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
        .pf-hero {
          position: relative; border-radius: 24px; overflow: hidden;
          background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
          color: #fff; padding: 2rem; box-shadow: 0 20px 40px -20px rgba(27,75,90,0.55);
        }
        .pf-hero::after {
          content: ''; position: absolute; top: -60px; right: -40px; width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%); pointer-events: none;
        }
        .pf-hero-row { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; position: relative; z-index: 1; }
        .pf-avatar-ring {
          position: relative; flex-shrink: 0; width: 108px; height: 108px; border-radius: 50%;
          padding: 4px; background: rgba(255,255,255,0.25); backdrop-filter: blur(4px);
        }
        .pf-avatar, .pf-avatar-fallback {
          width: 100px; height: 100px; border-radius: 50%; object-fit: cover; display: flex;
          align-items: center; justify-content: center; font-size: 2.4rem; font-weight: 800;
          background: rgba(255,255,255,0.15); color: #fff;
        }
        .pf-cam {
          position: absolute; bottom: 2px; right: 2px; width: 34px; height: 34px; border-radius: 50%;
          background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 3px solid var(--surface-color); transition: transform .15s ease;
        }
        .pf-cam:hover { transform: scale(1.08); }
        .pf-pill {
          display: inline-flex; align-items: center; gap: .4rem; padding: .3rem .8rem; border-radius: 999px;
          background: rgba(255,255,255,0.18); font-size: .78rem; font-weight: 700; letter-spacing: .02em;
          text-transform: uppercase; backdrop-filter: blur(4px);
        }
        .pf-chip {
          display: inline-flex; align-items: center; gap: .45rem; padding: .4rem .75rem; border-radius: 999px;
          background: rgba(255,255,255,0.14); font-size: .85rem; font-weight: 500; color: #fff;
        }
        .pf-hero-btn {
          display: inline-flex; align-items: center; gap: .5rem; padding: .6rem 1.1rem; border-radius: 12px;
          background: rgba(255,255,255,0.16); color: #fff; border: 1px solid rgba(255,255,255,0.3);
          font-weight: 600; font-size: .88rem; cursor: pointer; transition: background .15s ease;
        }
        .pf-hero-btn:hover { background: rgba(255,255,255,0.28); }
        .pf-section {
          background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 20px;
          padding: 1.75rem; margin-top: 1.5rem; box-shadow: 0 4px 18px -12px rgba(0,0,0,0.18);
        }
        .pf-section-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .pf-section-title { display: flex; align-items: center; gap: .6rem; font-size: 1.1rem; font-weight: 700; color: var(--secondary); margin: 0; }
        .pf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; }
        .pf-tile {
          display: flex; align-items: flex-start; gap: .85rem; padding: 1rem 1.1rem; border-radius: 14px;
          background: var(--bg-color); border: 1px solid var(--border-color); transition: transform .15s ease, box-shadow .15s ease;
        }
        .pf-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -12px rgba(0,0,0,0.25); }
        .pf-tile-icon {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary);
        }
        .pf-tile-label { font-size: .7rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--secondary); opacity: .7; margin-bottom: .25rem; }
        .pf-tile-value { font-size: 1rem; font-weight: 600; color: var(--text-color); word-break: break-word; line-height: 1.5; }
        .pf-field label { display: block; font-size: .78rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--secondary); opacity: .8; margin-bottom: .45rem; }
        .pf-input {
          width: 100%; padding: .8rem 1rem; border-radius: 12px; border: 1.5px solid var(--border-color);
          font-size: 1rem; color: var(--text-color); background: var(--surface-color); transition: border-color .15s ease, box-shadow .15s ease; box-sizing: border-box;
        }
        .pf-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
        .pf-btn { display: inline-flex; align-items: center; gap: .5rem; padding: .65rem 1.25rem; border-radius: 12px; font-weight: 600; font-size: .9rem; cursor: pointer; border: none; transition: opacity .15s ease, transform .15s ease; }
        .pf-btn:hover { transform: translateY(-1px); }
        .pf-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .pf-btn-primary { background: var(--primary); color: #fff; }
        .pf-btn-ghost { background: transparent; color: var(--text-color); border: 1px solid var(--border-color); }
        .pf-btn-danger { background: #d93838; color: #fff; }
        .pf-danger-card { padding: 1.25rem 1.5rem; background: color-mix(in srgb, #d93838 8%, transparent); border: 1px solid color-mix(in srgb, #d93838 30%, transparent); border-radius: 16px; }
        @media (max-width: 560px) { .pf-hero { padding: 1.5rem; } .pf-hero-row { gap: 1rem; } }
      `}</style>

      <div className="pf-wrap">
        {/* ── Hero header ─────────────────────────────────────────── */}
        <div className="pf-hero">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem', position: 'relative', zIndex: 1 }}>
            <button className="pf-hero-btn" onClick={handleLogout}>
              <LogOut size={16} /> Se déconnecter
            </button>
          </div>
          <div className="pf-hero-row">
            <div className="pf-avatar-ring">
              {user?.avatar
                ? <img src={user.avatar} alt={`Photo de ${user.firstName}`} className="pf-avatar" />
                : <div className="pf-avatar-fallback">{initials}</div>}
              <label className="pf-cam" title="Changer la photo" style={{ opacity: avatarLoading ? 0.6 : 1 }}>
                {avatarLoading ? <span style={{ fontSize: '.7rem' }}>…</span> : <Camera size={16} />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={avatarLoading} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <span className="pf-pill">
                {isStudent ? <GraduationCap size={13} /> : user?.role === 'admin' ? <Shield size={13} /> : <Briefcase size={13} />}
                {ROLE_LABEL[user?.role] || 'Membre'}
              </span>
              <h1 style={{ margin: '.6rem 0 .7rem', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.15 }}>
                {user?.firstName} {user?.lastName}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
                {user?.email && <span className="pf-chip"><Mail size={14} /> {user.email}</span>}
                {user?.phone && <span className="pf-chip"><Phone size={14} /> {user.phone}</span>}
                {memberSince && <span className="pf-chip"><CalendarClock size={14} /> Depuis {memberSince}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Identity / About ────────────────────────────────────── */}
        <div className="pf-section">
          <div className="pf-section-head">
            <h2 className="pf-section-title"><User size={20} /> Informations personnelles</h2>
            {!isEditing && (
              <button className="pf-btn pf-btn-primary" onClick={handleEdit}><Edit2 size={16} /> Modifier</button>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              <div className="pf-grid">
                <div className="pf-field">
                  <label>Prénom</label>
                  <input className="pf-input" name="firstName" value={editData.firstName} onChange={handleChange} />
                </div>
                <div className="pf-field">
                  <label>Nom</label>
                  <input className="pf-input" name="lastName" value={editData.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="pf-field">
                <label>Biographie</label>
                <textarea className="pf-input" name="bio" rows={4} value={editData.bio} onChange={handleChange} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button className="pf-btn pf-btn-primary" onClick={handleSave} disabled={loading}>
                  <Check size={16} /> {loading ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button className="pf-btn pf-btn-ghost" onClick={handleCancel} disabled={loading}><X size={16} /> Annuler</button>
              </div>
            </div>
          ) : (
            <div className="pf-grid">
              <InfoTile icon={User} label="Prénom" value={user?.firstName} />
              <InfoTile icon={User} label="Nom" value={user?.lastName} />
              <InfoTile icon={Mail} label="Email" value={user?.email} />
              <InfoTile icon={Phone} label="Téléphone" value={user?.phone} />
              <InfoTile icon={FileText} label="Biographie" value={user?.bio} full />
            </div>
          )}
        </div>

        {/* ── Role-specific info ──────────────────────────────────── */}
        {profile && (
          <div className="pf-section">
            <div className="pf-section-head">
              <h2 className="pf-section-title">
                {isStudent ? <GraduationCap size={20} /> : <Briefcase size={20} />}
                {isStudent ? 'Informations académiques' : 'Informations professionnelles'}
              </h2>
              {canEditProfile && !isEditingProfile && (
                <button className="pf-btn pf-btn-primary" onClick={handleEditProfile}><Edit2 size={16} /> Modifier</button>
              )}
            </div>

            {isEditingProfile && canEditProfile ? (
              <div style={{ display: 'grid', gap: '1.1rem' }}>
                <div className="pf-grid">
                  <div className="pf-field">
                    <label>Spécialisation</label>
                    <input className="pf-input" name="specialization" value={editProfileData.specialization || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="pf-field">
                    <label>Organisation / Entreprise</label>
                    <input className="pf-input" name="organization" value={editProfileData.organization || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="pf-field">
                    <label>Années d'expérience</label>
                    <select className="pf-input" name="experienceYears" value={editProfileData.experienceYears || ''} onChange={handleProfileChange}>
                      <option value="">Sélectionner…</option>
                      <option value="<1">Moins d'un an</option>
                      <option value="1-2">1–2 ans</option>
                      <option value="3-5">3–5 ans</option>
                      <option value="6-10">6–10 ans</option>
                      <option value=">10">Plus de 10 ans</option>
                    </select>
                  </div>
                  <div className="pf-field">
                    <label>Mode d'enseignement</label>
                    <select className="pf-input" name="teachingMode" value={editProfileData.teachingMode || ''} onChange={handleProfileChange}>
                      <option value="">Sélectionner…</option>
                      <option value="online">En ligne</option>
                      <option value="in-person">Présentiel</option>
                      <option value="hybrid">Les deux</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.75rem' }}>
                  <button className="pf-btn pf-btn-primary" onClick={handleSaveProfile} disabled={profileLoading}>
                    <Check size={16} /> {profileLoading ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                  <button className="pf-btn pf-btn-ghost" onClick={handleCancelProfile} disabled={profileLoading}><X size={16} /> Annuler</button>
                </div>
              </div>
            ) : (
              <div className="pf-grid">
                {isStudent ? (
                  <>
                    <InfoTile icon={Building} label="Établissement" value={profile.school} />
                    <InfoTile icon={BookOpen} label="Filière / Spécialité" value={profile.fieldOfStudy} />
                    <InfoTile icon={GraduationCap} label="Niveau d'étude" value={profile.educationLevel} />
                    <InfoTile
                      icon={Calendar}
                      label="Année de formation"
                      value={profile.academicYearStart
                        ? `${String(profile.academicYearStart).slice(0, 10)}${profile.academicYearEnd ? ` → ${String(profile.academicYearEnd).slice(0, 10)}` : ''}`
                        : ''}
                    />
                    <InfoTile icon={Layers} label="Groupe / Classe" value={profile.group} />
                  </>
                ) : (
                  <>
                    <InfoTile icon={Briefcase} label="Spécialisation" value={profile.specialization} />
                    <InfoTile icon={Building} label="Organisation / Entreprise" value={profile.organization} />
                    <InfoTile icon={Calendar} label="Années d'expérience" value={EXPERIENCE_LABEL[profile.experienceYears] || (profile.experienceYears ? `${profile.experienceYears} ans` : '')} />
                    <InfoTile icon={ShieldCheck} label="Mode d'enseignement" value={TEACHING_MODE_LABEL[profile.teachingMode]} />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Security ────────────────────────────────────────────── */}
        <div className="pf-section">
          <h2 className="pf-section-title" style={{ marginBottom: '1.25rem' }}><Lock size={20} /> Sécurité</h2>

          {!isChangingPassword ? (
            <button className="pf-btn pf-btn-ghost" onClick={() => setIsChangingPassword(true)}>
              <Lock size={16} /> Changer le mot de passe
            </button>
          ) : (
            <div style={{ padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              {passwordError && (
                <div style={{ padding: '.7rem 1rem', background: 'color-mix(in srgb, #d93838 10%, transparent)', border: '1px solid color-mix(in srgb, #d93838 30%, transparent)', borderRadius: '10px', color: '#c0392b', marginBottom: '1rem', fontSize: '.9rem' }}>
                  {passwordError}
                </div>
              )}
              <div style={{ display: 'grid', gap: '1rem', maxWidth: '420px' }}>
                <div className="pf-field">
                  <label>Mot de passe actuel</label>
                  <input className="pf-input" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label>Nouveau mot de passe</label>
                  <input className="pf-input" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label>Confirmer le mot de passe</label>
                  <input className="pf-input" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '.75rem', marginTop: '.25rem' }}>
                  <button className="pf-btn pf-btn-primary" onClick={handlePasswordChange} disabled={passwordLoading}>
                    <Check size={16} /> {passwordLoading ? 'Modification…' : 'Modifier'}
                  </button>
                  <button className="pf-btn pf-btn-ghost" onClick={() => { setIsChangingPassword(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }} disabled={passwordLoading}>
                    <X size={16} /> Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pf-danger-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '1rem' }}>
              <AlertTriangle size={22} style={{ color: '#d93838', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '.98rem', fontWeight: 700, color: '#c0392b' }}>Zone de danger</h4>
                <p style={{ margin: '.2rem 0 0', fontSize: '.85rem', color: 'var(--secondary)', opacity: .8 }}>
                  La suppression de votre compte est irréversible.
                </p>
              </div>
            </div>
            <button className="pf-btn pf-btn-danger" onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
