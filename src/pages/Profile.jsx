import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, FileText, Edit2, X, Check, LogOut, Phone, GraduationCap, Briefcase, Building, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
  });
  const [editProfileData, setEditProfileData] = useState({
    ...(user?.role === 'student' ? {
      school: user?.profile?.school || '',
      fieldOfStudy: user?.profile?.fieldOfStudy || '',
      educationLevel: user?.profile?.educationLevel || '',
      academicYear: user?.profile?.academicYear || '',
      group: user?.profile?.group || '',
    } : user?.role === 'instructor' ? {
      specialization: user?.profile?.specialization || '',
      organization: user?.profile?.organization || '',
      experienceYears: user?.profile?.experienceYears || '',
      teachingMode: user?.profile?.teachingMode || '',
    } : {})
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const profile = user?.profile;
  const canEditProfile = user?.role === 'instructor' || user?.role === 'admin';

  const handleLogout = () => {
    logout();
  };

  const handleEdit = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setEditProfileData({
      ...(user?.role === 'student' ? {
        school: user?.profile?.school || '',
        fieldOfStudy: user?.profile?.fieldOfStudy || '',
        educationLevel: user?.profile?.educationLevel || '',
        academicYear: user?.profile?.academicYear || '',
        group: user?.profile?.group || '',
      } : user?.role === 'instructor' ? {
        specialization: user?.profile?.specialization || '',
        organization: user?.profile?.organization || '',
        experienceYears: user?.profile?.experienceYears || '',
        teachingMode: user?.profile?.teachingMode || '',
      } : {})
    });
    setIsEditingProfile(true);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      // TODO: Implement profile update API call
      // For now, just close edit mode
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile info:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
      
      <div style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '2rem', fontWeight: 700 }}>Mon Profil</h1>
          <button 
            onClick={handleLogout} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--surface-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </header>
        
        <div style={{ 
          background: '#fff', 
          padding: '2.5rem', 
          borderRadius: '20px', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
        }}>
          {/* Profile Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`Photo de profil de ${user.firstName}`}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--surface-color)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '3rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color)' }}>
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.95rem' }}>
                    {user?.role === 'instructor' ? 'Instructeur' : user?.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Edit2 size={18} />
                    Modifier le profil
                  </button>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    <Check size={18} />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      background: 'transparent',
                      color: 'var(--text-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    <X size={18} />
                    Annuler
                  </button>
                </div>
              ) : (
                user?.bio && (
                  <p style={{ color: 'var(--text-color)', fontSize: '1rem', lineHeight: '1.6' }}>
                    {user.bio}
                  </p>
                )
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* First Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    color: 'var(--text-color)',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={20} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                    {user?.firstName || '-'}
                  </span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    color: 'var(--text-color)',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={20} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                    {user?.lastName || '-'}
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Email
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                  {user?.email || '-'}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Téléphone
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                  {user?.phone || '-'}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Biographie
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    color: 'var(--text-color)',
                    resize: 'vertical',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FileText size={20} style={{ color: 'var(--primary)', marginTop: '0.25rem' }} />
                  <span style={{ fontSize: '1rem', color: 'var(--text-color)', lineHeight: '1.6' }}>
                    {user?.bio || 'Aucune biographie'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information Section */}
          {profile && (
            <div style={{ 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '2rem',
              marginTop: '2rem'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  color: 'var(--primary)', 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {user?.role === 'student' ? (
                    <>
                      <GraduationCap size={24} />
                      Informations académiques
                    </>
                  ) : (
                    <>
                      <Briefcase size={24} />
                      Informations professionnelles
                    </>
                  )}
                </h3>
                {canEditProfile && !isEditingProfile && (
                  <button
                    onClick={handleEditProfile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Edit2 size={18} />
                    Modifier
                  </button>
                )}
              </div>

              {isEditingProfile && canEditProfile && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: profileLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      opacity: profileLoading ? 0.6 : 1,
                    }}
                  >
                    <Check size={18} />
                    {profileLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={handleCancelProfile}
                    disabled={profileLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      background: 'transparent',
                      color: 'var(--text-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      cursor: profileLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    <X size={18} />
                    Annuler
                  </button>
                </div>
              )}

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {user?.role === 'student' ? (
                  <>
                    {/* School */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Établissement
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="school"
                          value={editProfileData.school}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Building size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.school || '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Field of Study */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Filière / Spécialité
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="fieldOfStudy"
                          value={editProfileData.fieldOfStudy}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileText size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.fieldOfStudy || '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Education Level */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Niveau d'étude
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="educationLevel"
                          value={editProfileData.educationLevel}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <GraduationCap size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.educationLevel || '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Academic Year */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Année de formation
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="academicYear"
                          value={editProfileData.academicYear}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Calendar size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.academicYear || '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Group */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Groupe / Classe
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="group"
                          value={editProfileData.group}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <User size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.group || '-'}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Specialization */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Spécialisation
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="specialization"
                          value={editProfileData.specialization}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Briefcase size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.specialization || '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Organization */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Organisation / Entreprise
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="text"
                          name="organization"
                          value={editProfileData.organization}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Building size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.organization || '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Experience */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Années d'expérience
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <input
                          type="number"
                          name="experienceYears"
                          value={editProfileData.experienceYears}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Calendar size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.experienceYears ? `${profile.experienceYears} ans` : '-'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Teaching Mode */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        Mode d'enseignement
                      </label>
                      {isEditingProfile && canEditProfile ? (
                        <select
                          name="teachingMode"
                          value={editProfileData.teachingMode}
                          onChange={handleProfileChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            color: 'var(--text-color)',
                            background: 'var(--surface-color)',
                          }}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="online">En ligne</option>
                          <option value="in-person">Présentiel</option>
                          <option value="hybrid">Les deux</option>
                        </select>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileText size={20} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                            {profile.teachingMode === 'online' ? 'En ligne' : 
                             profile.teachingMode === 'in-person' ? 'Présentiel' : 
                             profile.teachingMode === 'hybrid' ? 'Les deux' : '-'}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
