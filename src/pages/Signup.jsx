import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import signupAnimation from '../lotties/Sign up.json';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft, GraduationCap, User, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: null, // 'learner' or 'instructor'
    // Learner situation
    learnerSituation: null, // 'student', 'employee', 'both', 'self_directed'
    // Student fields
    school: '',
    fieldOfStudy: '',
    educationLevel: '',
    customEducationLevel: '',
    academicYearStart: '',
    academicYearEnd: '',
    // Employee fields
    companyName: '',
    department: '',
    position: '',
    sector: '',
    experienceYears: '',
    // Self-directed fields
    interests: '',
    learningObjective: '',
    currentLevel: '',
    // Instructor situation
    instructorSituation: null, // 'employed', 'freelance', 'unemployed'
    // Instructor fields
    specialization: '',
    organization: '',
    teachingMode: '',
    teachingDomains: '',
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard'; // Both student and employee go to student dashboard
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis.';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis.';
    }
    if (!formData.email.trim()) {
      errors.email = 'L\'adresse e-mail est requise.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Veuillez entrer une adresse e-mail valide.';
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Veuillez entrer un numéro de téléphone valide.';
    }
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'La confirmation du mot de passe est requise.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3A = () => {
    const errors = {};
    
    if (!formData.learnerSituation) {
      errors.learnerSituation = 'Veuillez sélectionner votre situation.';
      setValidationErrors(errors);
      return false;
    }

    // Student-specific validation
    if (formData.learnerSituation === 'student' || formData.learnerSituation === 'both') {
      if (!formData.school.trim()) {
        errors.school = 'L\'établissement est requis.';
      }
      if (!formData.fieldOfStudy.trim()) {
        errors.fieldOfStudy = 'La filère est requise.';
      }
      if (!formData.educationLevel) {
        errors.educationLevel = 'Le niveau d\'étude est requis.';
      }
      if (formData.educationLevel === 'Autre' && !formData.customEducationLevel.trim()) {
        errors.customEducationLevel = 'Veuillez préciser votre niveau d\'étude.';
      }
      if (!formData.academicYearStart) {
        errors.academicYearStart = 'La date de début est requise.';
      }
      if (!formData.academicYearEnd) {
        errors.academicYearEnd = 'La date de fin est requise.';
      }
    }

    // Employee-specific validation
    if (formData.learnerSituation === 'employee' || formData.learnerSituation === 'both') {
      if (!formData.companyName.trim()) {
        errors.companyName = 'Le nom de l\'entreprise est requis.';
      }
      if (!formData.position.trim()) {
        errors.position = 'Le poste est requis.';
      }
      if (!formData.sector.trim()) {
        errors.sector = 'Le secteur est requis.';
      }
      if (!formData.experienceYears) {
        errors.experienceYears = 'Les années d\'expérience sont requises.';
      }
    }

    // Self-directed validation
    if (formData.learnerSituation === 'self_directed') {
      if (!formData.interests.trim()) {
        errors.interests = 'Les domaines d\'intérêt sont requis.';
      }
      if (!formData.learningObjective.trim()) {
        errors.learningObjective = 'L\'objectif d\'apprentissage est requis.';
      }
      if (!formData.currentLevel) {
        errors.currentLevel = 'Le niveau actuel est requis.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3B = () => {
    const errors = {};
    
    if (!formData.instructorSituation) {
      errors.instructorSituation = 'Veuillez sélectionner votre situation professionnelle.';
      setValidationErrors(errors);
      return false;
    }

    if (!formData.specialization.trim()) {
      errors.specialization = 'Le domaine d\'expertise est requis.';
    }
    if (!formData.experienceYears) {
      errors.experienceYears = 'Les années d\'expérience sont requises.';
    }
    if (!formData.teachingMode) {
      errors.teachingMode = 'Le mode d\'enseignement est requis.';
    }
    if (!formData.teachingDomains.trim()) {
      errors.teachingDomains = 'Les domaines d\'enseignement sont requis.';
    }

    // Company/organization only required for employed instructors
    if (formData.instructorSituation === 'employed') {
      if (!formData.organization.trim()) {
        errors.organization = 'L\'organisation est requise.';
      }
      if (!formData.position.trim()) {
        errors.position = 'Le poste est requis.';
      }
      if (!formData.sector.trim()) {
        errors.sector = 'Le secteur est requis.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    setError(null);
    setValidationErrors({});

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (formData.role) {
        setStep(3);
      } else {
        setError('Veuillez sélectionner un profil.');
      }
    } else if (step === 3) {
      if (formData.role === 'learner') {
        if (validateStep3A()) {
          setStep(4);
        }
      } else if (formData.role === 'instructor') {
        if (validateStep3B()) {
          setStep(4);
        }
      }
    }
  };

  const handleBack = () => {
    setError(null);
    setValidationErrors({});
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role === 'instructor' ? 'instructor' : 'student', // Both learner types go as 'student' role
        phone: formData.phone.trim() || undefined,
      };

      if (formData.role === 'learner') {
        payload.studentProfile = {
          situation: formData.learnerSituation,
          school: formData.school.trim() || undefined,
          fieldOfStudy: formData.fieldOfStudy.trim() || undefined,
          educationLevel: formData.educationLevel === 'Autre' ? formData.customEducationLevel.trim() : formData.educationLevel,
          academicYearStart: formData.academicYearStart || undefined,
          academicYearEnd: formData.academicYearEnd || undefined,
          companyName: formData.companyName.trim() || undefined,
          department: formData.department.trim() || undefined,
          position: formData.position.trim() || undefined,
          sector: formData.sector.trim() || undefined,
          experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
          interests: formData.interests.trim() || undefined,
          learningObjective: formData.learningObjective.trim() || undefined,
          currentLevel: formData.currentLevel || undefined,
          isSelfDirected: formData.learnerSituation === 'self_directed',
        };
      } else if (formData.role === 'instructor') {
        payload.instructorProfile = {
          situation: formData.instructorSituation,
          specialization: formData.specialization.trim(),
          organization: formData.organization.trim() || undefined,
          department: formData.department.trim() || undefined,
          position: formData.position.trim() || undefined,
          sector: formData.sector.trim() || undefined,
          experienceYears: parseInt(formData.experienceYears),
          teachingMode: formData.teachingMode,
          teachingDomains: formData.teachingDomains.trim() || undefined,
        };
      }

      const newUser = await signup(payload);
      const dashboardPath = getDashboardPath(newUser?.role || formData.role);
      navigate(dashboardPath);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.";
      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        setError('Cette adresse e-mail est déjà utilisée.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { id: 1, label: 'Compte' },
      { id: 2, label: 'Profil' },
      { id: 3, label: 'Informations' },
      { id: 4, label: 'Confirmation' },
    ];
    return steps;
  };

  const renderStep1 = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Créer votre compte</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Remplissez vos informations pour commencer.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Prénom</label>
          <input
            type="text"
            className="form-control"
            placeholder="Jean"
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            style={validationErrors.firstName ? { borderColor: 'var(--error-color)' } : {}}
          />
          {validationErrors.firstName && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.firstName}</div>}
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Nom</label>
          <input
            type="text"
            className="form-control"
            placeholder="Dupont"
            value={formData.lastName}
            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            style={validationErrors.lastName ? { borderColor: 'var(--error-color)' } : {}}
          />
          {validationErrors.lastName && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.lastName}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Adresse e-mail</label>
        <input
          type="email"
          className="form-control"
          placeholder="etudiant@212learn.com"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          style={validationErrors.email ? { borderColor: 'var(--error-color)' } : {}}
        />
        {validationErrors.email && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.email}</div>}
      </div>

      <div className="form-group">
        <label>Numéro de téléphone</label>
        <input
          type="tel"
          className="form-control"
          placeholder="+212 6 XX XX XX XX"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          style={validationErrors.phone ? { borderColor: 'var(--error-color)' } : {}}
        />
        {validationErrors.phone && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.phone}</div>}
      </div>

      <div className="form-group">
        <label>Mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            style={validationErrors.password ? { borderColor: 'var(--error-color)', paddingRight: '40px' } : { paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {validationErrors.password && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.password}</div>}
      </div>

      <div className="form-group">
        <label>Confirmer le mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            style={validationErrors.confirmPassword ? { borderColor: 'var(--error-color)', paddingRight: '40px' } : { paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {validationErrors.confirmPassword && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.confirmPassword}</div>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Votre profil</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Quel profil correspond le mieux à votre situation ?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div
          onClick={() => setFormData({ ...formData, role: 'learner' })}
          style={{
            padding: '2rem',
            border: `2px solid ${formData.role === 'learner' ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            cursor: 'pointer',
            background: formData.role === 'learner' ? 'rgba(27,75,90,0.05)' : '#fff',
            transition: 'all 0.2s ease',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.role === 'learner' ? 'var(--primary)' : 'var(--border-color)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Apprenant</h3>
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Je souhaite apprendre, développer mes compétences et suivre des formations.
          </p>
        </div>

        <div
          onClick={() => setFormData({ ...formData, role: 'instructor' })}
          style={{
            padding: '2rem',
            border: `2px solid ${formData.role === 'instructor' ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            cursor: 'pointer',
            background: formData.role === 'instructor' ? 'rgba(27,75,90,0.05)' : '#fff',
            transition: 'all 0.2s ease',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.role === 'instructor' ? 'var(--primary)' : 'var(--border-color)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Instructeur / Formateur</h3>
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Je souhaite partager mes connaissances, enseigner et accompagner les apprenants.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3A = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Votre situation actuelle</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Sélectionnez votre situation pour continuer.
      </p>

      {!formData.learnerSituation ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'student' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.learnerSituation === 'student' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'student' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'student' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Étudiant</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'employee' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.learnerSituation === 'employee' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'employee' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'employee' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Employé</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'both' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.learnerSituation === 'both' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'both' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'both' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓💼</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Étudiant + Employé</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'self_directed' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.learnerSituation === 'self_directed' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'self_directed' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'self_directed' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>En auto-formation</h3>
          </div>
        </div>
      ) : (
        <>
          {validationErrors.learnerSituation && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{validationErrors.learnerSituation}</div>}
          
          {/* Student Fields */}
          {(formData.learnerSituation === 'student' || formData.learnerSituation === 'both') && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>🎓 Informations de formation</h3>
              <div className="form-group">
                <label>Établissement</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: ISFO Sidi Maarouf"
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                  style={validationErrors.school ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.school && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.school}</div>}
              </div>

              <div className="form-group">
                <label>Filière / Spécialité</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Développement Digital"
                  value={formData.fieldOfStudy}
                  onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  style={validationErrors.fieldOfStudy ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.fieldOfStudy && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.fieldOfStudy}</div>}
              </div>

              <div className="form-group">
                <label>Niveau d'étude</label>
                <select
                  className="form-control"
                  value={formData.educationLevel}
                  onChange={e => setFormData({ ...formData, educationLevel: e.target.value, customEducationLevel: '' })}
                  style={validationErrors.educationLevel ? { borderColor: 'var(--error-color)' } : {}}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="Collège">Collège</option>
                  <option value="Lycée">Lycée</option>
                  <option value="Bac">Bac</option>
                  <option value="Bac+1">Bac+1</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+4">Bac+4</option>
                  <option value="Bac+5">Bac+5</option>
                  <option value="Autre">Autre</option>
                </select>
                {validationErrors.educationLevel && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.educationLevel}</div>}
              </div>

              {formData.educationLevel === 'Autre' && (
                <div className="form-group">
                  <label>Précisez votre niveau d'étude</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Doctorat, Formation professionnelle..."
                    value={formData.customEducationLevel}
                    onChange={e => setFormData({ ...formData, customEducationLevel: e.target.value })}
                    style={validationErrors.customEducationLevel ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.customEducationLevel && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.customEducationLevel}</div>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date de début</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.academicYearStart}
                    onChange={e => setFormData({ ...formData, academicYearStart: e.target.value })}
                    style={validationErrors.academicYearStart ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.academicYearStart && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.academicYearStart}</div>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date de fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.academicYearEnd}
                    onChange={e => setFormData({ ...formData, academicYearEnd: e.target.value })}
                    style={validationErrors.academicYearEnd ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.academicYearEnd && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.academicYearEnd}</div>}
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
                  <strong>Groupe / Classe:</strong> Non attribué
                </p>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                  Votre groupe sera attribué ultérieurement par un instructeur ou un administrateur.
                </p>
              </div>
            </div>
          )}

          {/* Employee Fields */}
          {(formData.learnerSituation === 'employee' || formData.learnerSituation === 'both') && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>💼 Informations professionnelles</h3>
              <div className="form-group">
                <label>Nom de l'entreprise</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: ABC Maroc"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  style={validationErrors.companyName ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.companyName && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.companyName}</div>}
              </div>

              <div className="form-group">
                <label>Service / Département</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: IT"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Poste / Fonction</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Développeur Web"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  style={validationErrors.position ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.position && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.position}</div>}
              </div>

              <div className="form-group">
                <label>Domaine / Secteur d'activité</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Technologie"
                  value={formData.sector}
                  onChange={e => setFormData({ ...formData, sector: e.target.value })}
                  style={validationErrors.sector ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.sector && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.sector}</div>}
              </div>

              <div className="form-group">
                <label>Années d'expérience</label>
                <select
                  className="form-control"
                  value={formData.experienceYears}
                  onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                  style={validationErrors.experienceYears ? { borderColor: 'var(--error-color)' } : {}}
                >
                  <option value="">Sélectionnez votre expérience</option>
                  <option value="1">Moins d'un an</option>
                  <option value="2">1–2 ans</option>
                  <option value="4">3–5 ans</option>
                  <option value="8">6–10 ans</option>
                  <option value="11">Plus de 10 ans</option>
                </select>
                {validationErrors.experienceYears && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.experienceYears}</div>}
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
                  Groupe non attribué — il sera attribué par un instructeur ou un administrateur.
                </p>
              </div>
            </div>
          )}

          {/* Self-directed Fields */}
          {formData.learnerSituation === 'self_directed' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>📚 Votre apprentissage</h3>
              <div className="form-group">
                <label>Domaine(s) d'intérêt</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Développement Web, Intelligence Artificielle, Cybersécurité"
                  value={formData.interests}
                  onChange={e => setFormData({ ...formData, interests: e.target.value })}
                  style={validationErrors.interests ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.interests && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.interests}</div>}
              </div>

              <div className="form-group">
                <label>Objectif d'apprentissage</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Je souhaite apprendre React et devenir développeur frontend."
                  value={formData.learningObjective}
                  onChange={e => setFormData({ ...formData, learningObjective: e.target.value })}
                  style={validationErrors.learningObjective ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.learningObjective && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.learningObjective}</div>}
              </div>

              <div className="form-group">
                <label>Niveau actuel</label>
                <select
                  className="form-control"
                  value={formData.currentLevel}
                  onChange={e => setFormData({ ...formData, currentLevel: e.target.value })}
                  style={validationErrors.currentLevel ? { borderColor: 'var(--error-color)' } : {}}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
                {validationErrors.currentLevel && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.currentLevel}</div>}
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
                  Groupe non attribué — il sera attribué ultérieurement par un instructeur ou un administrateur.
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setFormData({ ...formData, learnerSituation: null })}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            Changer de situation
          </button>
        </>
      )}
    </div>
  );

  const renderStep3B = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Votre situation professionnelle</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Sélectionnez votre situation pour continuer.
      </p>

      {!formData.instructorSituation ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div
            onClick={() => setFormData({ ...formData, instructorSituation: 'employed' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.instructorSituation === 'employed' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.instructorSituation === 'employed' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.instructorSituation === 'employed' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👔</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Employé / En poste</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, instructorSituation: 'freelance' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.instructorSituation === 'freelance' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.instructorSituation === 'freelance' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.instructorSituation === 'freelance' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Freelance / Indépendant</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, instructorSituation: 'unemployed' })}
            style={{
              padding: '2rem',
              border: `2px solid ${formData.instructorSituation === 'unemployed' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.instructorSituation === 'unemployed' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.instructorSituation === 'unemployed' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Sans emploi</h3>
          </div>
        </div>
      ) : (
        <>
          {validationErrors.instructorSituation && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{validationErrors.instructorSituation}</div>}

          {/* Common Instructor Fields */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Expertise professionnelle</h3>

            {formData.instructorSituation === 'employed' && (
              <>
                <div className="form-group">
                  <label>Nom de l'entreprise / Organisation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 212Learn"
                    value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    style={validationErrors.organization ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.organization && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.organization}</div>}
                </div>

                <div className="form-group">
                  <label>Service / Département</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: IT"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Poste / Fonction</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Lead Developer"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    style={validationErrors.position ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.position && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.position}</div>}
                </div>

                <div className="form-group">
                  <label>Domaine / Secteur d'activité</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Technologie"
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    style={validationErrors.sector ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.sector && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.sector}</div>}
                </div>
              </>
            )}

            <div className="form-group">
              <label>Domaine d'expertise</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Développement Web"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                style={validationErrors.specialization ? { borderColor: 'var(--error-color)' } : {}}
              />
              {validationErrors.specialization && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.specialization}</div>}
            </div>

            <div className="form-group">
              <label>Spécialité</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: React & Node.js"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Années d'expérience</label>
              <select
                className="form-control"
                value={formData.experienceYears}
                onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                style={validationErrors.experienceYears ? { borderColor: 'var(--error-color)' } : {}}
              >
                <option value="">Sélectionnez votre expérience</option>
                <option value="1">Moins d'un an</option>
                <option value="2">1–2 ans</option>
                <option value="4">3–5 ans</option>
                <option value="8">6–10 ans</option>
                <option value="11">Plus de 10 ans</option>
              </select>
              {validationErrors.experienceYears && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.experienceYears}</div>}
            </div>

            <div className="form-group">
              <label>Domaines / Matières enseignés</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: JavaScript, React, Node.js"
                value={formData.teachingDomains}
                onChange={e => setFormData({ ...formData, teachingDomains: e.target.value })}
                style={validationErrors.teachingDomains ? { borderColor: 'var(--error-color)' } : {}}
              />
              {validationErrors.teachingDomains && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.teachingDomains}</div>}
            </div>
          </div>

          {/* Common Teaching Mode */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Mode d'enseignement</h3>
            <div className="form-group">
              <select
                className="form-control"
                value={formData.teachingMode}
                onChange={e => setFormData({ ...formData, teachingMode: e.target.value })}
                style={validationErrors.teachingMode ? { borderColor: 'var(--error-color)' } : {}}
              >
                <option value="">Sélectionnez le mode d'enseignement</option>
                <option value="online">En ligne</option>
                <option value="in-person">Présentiel</option>
                <option value="both">Les deux</option>
              </select>
              {validationErrors.teachingMode && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.teachingMode}</div>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, instructorSituation: null })}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            Changer de situation
          </button>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Vérifiez vos informations</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Confirmez vos informations avant de créer votre compte.
      </p>

      <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Compte</h3>
        <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
          <p style={{ margin: 0 }}><strong>Prénom:</strong> {formData.firstName}</p>
          <p style={{ margin: 0 }}><strong>Nom:</strong> {formData.lastName}</p>
          <p style={{ margin: 0 }}><strong>Email:</strong> {formData.email}</p>
          {formData.phone && <p style={{ margin: 0 }}><strong>Téléphone:</strong> {formData.phone}</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Profil</h3>
        <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
          {formData.role === 'learner' ? (
            <>
              <p style={{ margin: 0 }}>🎓 Apprenant</p>
              <p style={{ margin: '0.5rem 0 0 0' }}><strong>Situation:</strong> {
                formData.learnerSituation === 'student' ? 'Étudiant' :
                formData.learnerSituation === 'employee' ? 'Employé' :
                formData.learnerSituation === 'both' ? 'Étudiant + Employé' :
                'En auto-formation'
              }</p>
            </>
          ) : (
            <>
              <p style={{ margin: 0 }}>👨‍🏫 Instructeur / Formateur</p>
              <p style={{ margin: '0.5rem 0 0 0' }}><strong>Situation:</strong> {
                formData.instructorSituation === 'employed' ? 'Employé / En poste' :
                formData.instructorSituation === 'freelance' ? 'Freelance / Indépendant' :
                'Sans emploi'
              }</p>
            </>
          )}
        </div>
      </div>

      {formData.role === 'learner' && formData.learnerSituation && (
        <>
          {(formData.learnerSituation === 'student' || formData.learnerSituation === 'both') && (
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Formation</h3>
              <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
                <p style={{ margin: 0 }}><strong>Établissement:</strong> {formData.school}</p>
                <p style={{ margin: 0 }}><strong>Filière:</strong> {formData.fieldOfStudy}</p>
                <p style={{ margin: 0 }}><strong>Niveau:</strong> {formData.educationLevel}</p>
                <p style={{ margin: 0 }}><strong>Période:</strong> {formData.academicYearStart} à {formData.academicYearEnd}</p>
              </div>
            </div>
          )}

          {(formData.learnerSituation === 'employee' || formData.learnerSituation === 'both') && (
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Professionnel</h3>
              <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
                <p style={{ margin: 0 }}><strong>Entreprise:</strong> {formData.companyName}</p>
                <p style={{ margin: 0 }}><strong>Poste:</strong> {formData.position}</p>
                <p style={{ margin: 0 }}><strong>Secteur:</strong> {formData.sector}</p>
                <p style={{ margin: 0 }}><strong>Expérience:</strong> {formData.experienceYears} ans</p>
              </div>
            </div>
          )}

          {formData.learnerSituation === 'self_directed' && (
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Apprentissage</h3>
              <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
                <p style={{ margin: 0 }}><strong>Intérêts:</strong> {formData.interests}</p>
                <p style={{ margin: 0 }}><strong>Objectif:</strong> {formData.learningObjective}</p>
                <p style={{ margin: 0 }}><strong>Niveau actuel:</strong> {formData.currentLevel}</p>
              </div>
            </div>
          )}

          <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Groupe</h3>
            <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}><strong>Statut:</strong> Non attribué</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Votre groupe sera attribué ultérieurement par un instructeur ou un administrateur.</p>
            </div>
          </div>
        </>
      )}

      {formData.role === 'instructor' && formData.instructorSituation && (
        <>
          <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Expertise</h3>
            <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}><strong>Domaine d'expertise:</strong> {formData.specialization}</p>
              <p style={{ margin: 0 }}><strong>Spécialité:</strong> {formData.specialization}</p>
              <p style={{ margin: 0 }}><strong>Expérience:</strong> {formData.experienceYears} ans</p>
              <p style={{ margin: 0 }}><strong>Domaines enseignés:</strong> {formData.teachingDomains}</p>
              <p style={{ margin: 0 }}><strong>Mode d'enseignement:</strong> {
                formData.teachingMode === 'online' ? 'En ligne' :
                formData.teachingMode === 'in-person' ? 'Présentiel' : 'Les deux'
              }</p>
            </div>
          </div>

          {formData.instructorSituation === 'employed' && (
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Professionnel</h3>
              <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
                <p style={{ margin: 0 }}><strong>Organisation:</strong> {formData.organization}</p>
                <p style={{ margin: 0 }}><strong>Poste:</strong> {formData.position}</p>
                <p style={{ margin: 0 }}><strong>Secteur:</strong> {formData.sector}</p>
              </div>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setStep(3)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'transparent',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          cursor: 'pointer',
          color: 'var(--secondary)',
          fontWeight: 500,
        }}
      >
        <ChevronLeft size={18} /> Modifier
      </button>
    </div>
  );

  return (
    <div className="auth-layout" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: '380px', height: '380px',
        background: 'radial-gradient(circle, rgba(193,101,47,0.09) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'blobFloat 11s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-40px',
        width: '280px', height: '280px',
        background: 'radial-gradient(circle, rgba(27,75,90,0.07) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'blobFloat 9s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <div className="auth-container" style={{ animation: 'scaleIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
        
        {/* Left Section: Form */}
        <div className="auth-form-wrapper" style={{ animation: 'slideInLeft 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 500 }}>
              <ArrowLeft size={20} />
              Retour
            </Link>
            <img src={logoImg} alt="212LEARN Logo" style={{ height: '80px', objectFit: 'contain' }} />
          </div>

          {/* Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
            {getProgressSteps().map((s, index) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontWeight: step === s.id ? 700 : 400, 
                  color: step === s.id ? 'var(--primary)' : 'var(--secondary)' 
                }}>
                  {s.id}
                </span>
                <span>{s.label}</span>
                {index < getProgressSteps().length - 1 && <span style={{ color: 'var(--border-color)' }}>──</span>}
              </div>
            ))}
          </div>

          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>{error}</div>}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && formData.role === 'learner' && renderStep3A()}
          {step === 3 && formData.role === 'instructor' && renderStep3B()}
          {step === 4 && renderStep4()}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {step > 1 && step !== 4 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <ChevronLeft size={18} /> Retour
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                Continuer <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            )}
          </div>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Vous avez déjà un compte ? <Link to="/login" style={{ fontWeight: 600 }}>Se connecter</Link>
          </p>
        </div>

        {/* Right Section: Lottie Animation */}
        <div className="auth-lottie">
          <Lottie 
            animationData={signupAnimation} 
            loop={true} 
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

      </div>
    </div>
  );
}
