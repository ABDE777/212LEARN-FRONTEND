import { useState } from 'react';
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
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: null,
    // Student profile
    school: '',
    fieldOfStudy: '',
    educationLevel: '',
    academicYear: '',
    group: '',
    // Instructor profile
    specialization: '',
    organization: '',
    experienceYears: '',
    teachingMode: ''
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
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
    
    if (!formData.school.trim()) {
      errors.school = 'L\'établissement est requis.';
    }
    if (!formData.fieldOfStudy.trim()) {
      errors.fieldOfStudy = 'La filère est requise.';
    }
    if (!formData.educationLevel) {
      errors.educationLevel = 'Le niveau d\'étude est requis.';
    }
    if (!formData.academicYear.trim()) {
      errors.academicYear = 'L\'année de formation est requise.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3B = () => {
    const errors = {};
    
    if (!formData.specialization.trim()) {
      errors.specialization = 'La spécialisation est requise.';
    }
    if (!formData.experienceYears) {
      errors.experienceYears = 'Les années d\'expérience sont requises.';
    }
    if (!formData.teachingMode) {
      errors.teachingMode = 'Le mode d\'enseignement est requis.';
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
        setError('Veuillez sélectionner un rôle.');
      }
    } else if (step === 3) {
      if (formData.role === 'student') {
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
        role: formData.role,
        phone: formData.phone.trim() || undefined,
      };

      if (formData.role === 'student') {
        payload.studentProfile = {
          school: formData.school.trim(),
          fieldOfStudy: formData.fieldOfStudy.trim(),
          educationLevel: formData.educationLevel,
          academicYear: formData.academicYear.trim(),
          group: formData.group.trim() || undefined,
        };
      } else if (formData.role === 'instructor') {
        payload.instructorProfile = {
          specialization: formData.specialization.trim(),
          organization: formData.organization.trim() || undefined,
          experienceYears: parseInt(formData.experienceYears),
          teachingMode: formData.teachingMode,
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
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Vous êtes...</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Choisissez votre rôle pour continuer.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div
          onClick={() => setFormData({ ...formData, role: 'student' })}
          style={{
            padding: '2rem',
            border: `2px solid ${formData.role === 'student' ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            cursor: 'pointer',
            background: formData.role === 'student' ? 'rgba(27,75,90,0.05)' : '#fff',
            transition: 'all 0.2s ease',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.role === 'student' ? 'var(--primary)' : 'var(--border-color)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Étudiant(e)</h3>
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Apprenez, développez vos compétences et suivez votre progression.
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
            Partagez vos connaissances, créez des cours et accompagnez les apprenants.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3A = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Votre formation</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Parlez-nous de votre parcours académique.
      </p>

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
          onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
          style={validationErrors.educationLevel ? { borderColor: 'var(--error-color)' } : {}}
        >
          <option value="">Sélectionnez votre niveau</option>
          <option value="Niveau lycée">Niveau lycée</option>
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

      <div className="form-group">
        <label>Année de formation</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex: 2025-2026"
          value={formData.academicYear}
          onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
          style={validationErrors.academicYear ? { borderColor: 'var(--error-color)' } : {}}
        />
        {validationErrors.academicYear && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.academicYear}</div>}
      </div>

      <div className="form-group">
        <label>Groupe / Classe (optionnel)</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex: DDI203"
          value={formData.group}
          onChange={e => setFormData({ ...formData, group: e.target.value })}
        />
      </div>
    </div>
  );

  const renderStep3B = () => (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Votre profil professionnel</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
        Parlez-nous de votre expertise.
      </p>

      <div className="form-group">
        <label>Spécialité / Domaine d'expertise</label>
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
        <label>Organisation / Entreprise (optionnel)</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex: 212Learn"
          value={formData.organization}
          onChange={e => setFormData({ ...formData, organization: e.target.value })}
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
          <option value="1">0–1 an</option>
          <option value="2">2–3 ans</option>
          <option value="4">4–5 ans</option>
          <option value="8">6–10 ans</option>
          <option value="11">10+ ans</option>
        </select>
        {validationErrors.experienceYears && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.experienceYears}</div>}
      </div>

      <div className="form-group">
        <label>Mode d'enseignement</label>
        <select
          className="form-control"
          value={formData.teachingMode}
          onChange={e => setFormData({ ...formData, teachingMode: e.target.value })}
          style={validationErrors.teachingMode ? { borderColor: 'var(--error-color)' } : {}}
        >
          <option value="">Sélectionnez le mode</option>
          <option value="online">En ligne</option>
          <option value="in-person">Présentiel</option>
          <option value="hybrid">Les deux</option>
        </select>
        {validationErrors.teachingMode && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.teachingMode}</div>}
      </div>
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
          {formData.phone && <p style={{ margin: 0 }}><strong>Téléphone:</strong> {formData.phone}</p>}
          <p style={{ margin: 0 }}><strong>Rôle:</strong> {formData.role === 'student' ? '🎓 Étudiant(e)' : '👨‍🏫 Instructeur / Formateur'}</p>
        </div>
      </div>

      {formData.role === 'student' && (
        <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Formation</h3>
          <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
            <p style={{ margin: 0 }}><strong>Établissement:</strong> {formData.school}</p>
            <p style={{ margin: 0 }}><strong>Filière:</strong> {formData.fieldOfStudy}</p>
            <p style={{ margin: 0 }}><strong>Niveau:</strong> {formData.educationLevel}</p>
            <p style={{ margin: 0 }}><strong>Année:</strong> {formData.academicYear}</p>
            {formData.group && <p style={{ margin: 0 }}><strong>Groupe:</strong> {formData.group}</p>}
          </div>
        </div>
      )}

      {formData.role === 'instructor' && (
        <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Profil professionnel</h3>
          <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
            <p style={{ margin: 0 }}><strong>Spécialisation:</strong> {formData.specialization}</p>
            {formData.organization && <p style={{ margin: 0 }}><strong>Organisation:</strong> {formData.organization}</p>}
            <p style={{ margin: 0 }}><strong>Expérience:</strong> {formData.experienceYears} ans</p>
            <p style={{ margin: 0 }}><strong>Mode d'enseignement:</strong> {formData.teachingMode === 'online' ? 'En ligne' : formData.teachingMode === 'in-person' ? 'Présentiel' : 'Les deux'}</p>
          </div>
        </div>
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
          {step === 3 && formData.role === 'student' && renderStep3A()}
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
