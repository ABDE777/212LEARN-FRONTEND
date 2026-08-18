import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft, User, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle, Loader, Check, X, Trophy, Video, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CountryPhonePicker, { DEFAULT_COUNTRIES } from '../components/CountryPhonePicker';

// Reassurance messages shown while the account is being created. Registration is
// a single request (no real progress signal), so instead of a fake % we advance
// through these and hold on the last one until the response resolves.
const SUBMIT_STAGES = [
  'Validation de vos informations…',
  'Création de votre compte…',
  'Préparation de votre espace…',
  'Presque terminé…',
];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitStage, setSubmitStage] = useState(0);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [phoneStatus, setPhoneStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRIES[0]); // 🇲🇦 Maroc (+212)
  const [localPhone, setLocalPhone] = useState('');
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const handleLocalPhoneChange = (code, rawDigits) => {
    // Strip non-digits and leading zeros for clean international formatting
    const digitsOnly = rawDigits.replace(/\D/g, '');
    const cleanDigits = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
    setLocalPhone(rawDigits);
    if (cleanDigits) {
      setFormData((prev) => ({ ...prev, phone: `${code}${cleanDigits}` }));
    } else {
      setFormData((prev) => ({ ...prev, phone: '' }));
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading) {
      setSubmitStage(0);
      return undefined;
    }
    const id = setInterval(() => {
      setSubmitStage((s) => Math.min(s + 1, SUBMIT_STAGES.length - 1));
    }, 1200);
    return () => clearInterval(id);
  }, [loading]);

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
    expertiseDomain: '',
    specialization: '',
    organization: '',
    teachingMode: '',
    teachingDomains: '',
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Live Email availability check effect
  useEffect(() => {
    const rawEmail = formData.email?.trim() || '';
    if (!rawEmail) {
      setEmailStatus(null);
      return undefined;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      setEmailStatus('invalid');
      return undefined;
    }

    setEmailStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-email?email=${encodeURIComponent(rawEmail)}`, {
          validateStatus: (status) => status < 500,
        });
        if (res.status === 200) {
          if (res.data.exists || !res.data.available) {
            setEmailStatus('taken');
          } else {
            setEmailStatus('available');
          }
        } else {
          setEmailStatus(null);
        }
      } catch {
        setEmailStatus(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Live Phone availability check effect
  useEffect(() => {
    const rawPhone = formData.phone?.trim() || '';
    if (!rawPhone) {
      setPhoneStatus(null);
      return undefined;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(rawPhone)) {
      setPhoneStatus('invalid');
      return undefined;
    }

    setPhoneStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-phone?phone=${encodeURIComponent(rawPhone)}`, {
          validateStatus: (status) => status < 500,
        });
        if (res.status === 200) {
          if (res.data.exists || !res.data.available) {
            setPhoneStatus('taken');
          } else {
            setPhoneStatus('available');
          }
        } else {
          setPhoneStatus(null);
        }
      } catch {
        setPhoneStatus(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.phone]);

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard'; // Both student and employee go to student dashboard
  };

  // ── Pure error computations (no state writes) so we can re-check live ──────
  const computeStep1Errors = () => {
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
    } else if (emailStatus === 'taken') {
      errors.email = 'Cette adresse e-mail est déjà utilisée.';
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Veuillez entrer un numéro de téléphone valide.';
    } else if (phoneStatus === 'taken') {
      errors.phone = 'Ce numéro de téléphone est déjà utilisé.';
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
    return errors;
  };

  const validateStep1 = () => {
    const errors = computeStep1Errors();
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const computeStep3AErrors = () => {
    const errors = {};

    if (!formData.learnerSituation) {
      errors.learnerSituation = 'Veuillez sélectionner votre situation.';
      return errors;
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
      if (!formData.currentLevel) {
        errors.currentLevel = 'Le niveau est requis.';
      }
    }

    // Employee-specific validation
    if (formData.learnerSituation === 'employee' || formData.learnerSituation === 'both') {
      if (!formData.companyName.trim()) {
        errors.companyName = 'Le nom de l\'entreprise est requis.';
      }
      if (!formData.department.trim()) {
        errors.department = 'Le service / département est requis.';
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

    return errors;
  };

  const validateStep3A = () => {
    const errors = computeStep3AErrors();
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const computeStep3BErrors = () => {
    const errors = {};

    if (!formData.instructorSituation) {
      errors.instructorSituation = 'Veuillez sélectionner votre situation professionnelle.';
      return errors;
    }

    if (!formData.expertiseDomain.trim()) {
      errors.expertiseDomain = 'Le domaine d\'expertise est requis.';
    }
    if (!formData.specialization.trim()) {
      errors.specialization = 'La spécialité est requise.';
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

    return errors;
  };

  const validateStep3B = () => {
    const errors = computeStep3BErrors();
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Live feedback: once a step's errors are shown, drop each one as soon as the
  // user fixes that field — so validation reacts within every step, not only
  // when Continue is pressed. Never surfaces *new* errors before Continue.
  useEffect(() => {
    setValidationErrors((prev) => {
      const shownKeys = Object.keys(prev);
      if (shownKeys.length === 0) return prev;
      const fresh = step === 1 ? computeStep1Errors()
        : step === 3 && formData.role === 'learner' ? computeStep3AErrors()
        : step === 3 && formData.role === 'instructor' ? computeStep3BErrors()
        : {};
      const next = {};
      for (const k of shownKeys) {
        if (fresh[k]) next[k] = fresh[k];
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, step]);

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
      // Map the form's display values to the backend's canonical tokens.
      const EXPERIENCE_MAP = { '1': '<1', '2': '1-2', '4': '3-5', '8': '6-10', '11': '>10' };
      const EDUCATION_MAP = {
        'Collège': 'college', 'Lycée': 'lycee', 'Bac': 'bac',
        'Bac+1': 'bac+1', 'Bac+2': 'bac+2', 'Bac+3': 'bac+3',
        'Bac+4': 'bac+4', 'Bac+5': 'bac+5', 'Autre': 'autre',
      };
      const TEACHING_MODE_MAP = { 'online': 'online', 'in-person': 'onsite', 'both': 'hybrid' };
      const LEARNER_SITUATION_MAP = {
        student: 'student', employee: 'employee', both: 'student_employee', self_directed: 'self_directed',
      };

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
          situation: LEARNER_SITUATION_MAP[formData.learnerSituation] || formData.learnerSituation,
          school: formData.school.trim() || undefined,
          fieldOfStudy: formData.fieldOfStudy.trim() || undefined,
          // Backend stores a fixed enum; a free-text "Autre" detail has no column, so we send 'autre'.
          educationLevel: EDUCATION_MAP[formData.educationLevel] || undefined,
          academicYearStart: formData.academicYearStart || undefined,
          academicYearEnd: formData.academicYearEnd || undefined,
          companyName: formData.companyName.trim() || undefined,
          department: formData.department.trim() || undefined,
          position: formData.position.trim() || undefined,
          sector: formData.sector.trim() || undefined,
          experienceYears: EXPERIENCE_MAP[formData.experienceYears] || formData.experienceYears,
          interests: formData.interests.trim() || undefined,
          learningObjective: formData.learningObjective.trim() || undefined,
          currentLevel: formData.currentLevel || undefined,
          isSelfDirected: formData.learnerSituation === 'self_directed',
        };
      } else if (formData.role === 'instructor') {
        const mappedExperience = EXPERIENCE_MAP[formData.experienceYears];
        payload.instructorProfile = {
          situation: formData.instructorSituation,
          expertiseDomain: formData.expertiseDomain.trim(),
          specialization: formData.specialization.trim(),
          organization: formData.organization.trim() || undefined,
          department: formData.department.trim() || undefined,
          position: formData.position.trim() || undefined,
          sector: formData.sector.trim() || undefined,
          experienceYears: mappedExperience || formData.experienceYears,
          teachingMode: TEACHING_MODE_MAP[formData.teachingMode] || formData.teachingMode,
          teachingDomains: formData.teachingDomains.trim() || undefined,
        };
      }

      const newUser = await signup(payload);
      const finalRole = (newUser?.role || formData.role || '').toUpperCase();
      // Instructors aren't active until an admin approves them: send them to the
      // locked "pending approval" screen instead of the dashboard.
      if (finalRole === 'INSTRUCTOR') {
        navigate('/instructor/pending');
      } else {
        navigate(getDashboardPath(newUser?.role || formData.role));
      }
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

  const pwd = formData.password || '';
  const pwdRules = {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_-]/.test(pwd),
  };

  const pwdPassedCount = Object.values(pwdRules).filter(Boolean).length;
  
  const getPwdStrength = () => {
    if (pwdPassedCount <= 1) return { label: 'Faible', color: '#e53e3e', width: '25%' };
    if (pwdPassedCount <= 3) return { label: 'Moyen', color: '#dd6b20', width: '60%' };
    if (pwdPassedCount === 4) return { label: 'Fort', color: '#38a169', width: '80%' };
    return { label: 'Très fort', color: '#319795', width: '100%' };
  };

  const pwdStrength = getPwdStrength();

  const isStep1Valid = Boolean(
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.email?.trim() &&
    emailStatus === 'available' &&
    formData.password &&
    formData.password.length >= 8 &&
    formData.confirmPassword === formData.password &&
    phoneStatus !== 'taken' &&
    (formData.phone ? /^\+?[\d\s-]{10,}$/.test(formData.phone.trim()) : true)
  );

  const renderStep1 = () => (
    <div>
      <h2 style={{ marginBottom: '0.35rem', color: 'var(--primary)' }}>Créer votre compte</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
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
          style={
            emailStatus === 'taken' || validationErrors.email
              ? { borderColor: 'var(--error-color)' }
              : emailStatus === 'available'
              ? { borderColor: '#2e7d32' }
              : {}
          }
        />
        {emailStatus === 'checking' && (
          <div style={{ color: 'var(--secondary)', fontSize: '0.78rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Loader size={12} className="spin" /> Vérification de la disponibilité...
          </div>
        )}
        {emailStatus === 'taken' && (
          <div style={{ color: '#d32f2f', fontSize: '0.78rem', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <X size={13} /> Cette adresse e-mail est déjà utilisée
          </div>
        )}
        {emailStatus === 'available' && (
          <div style={{ color: '#2e7d32', fontSize: '0.78rem', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Check size={13} /> Adresse e-mail disponible
          </div>
        )}
        {validationErrors.email && emailStatus !== 'taken' && (
          <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.email}</div>
        )}
      </div>

      <div className="form-group">
        <label>Numéro de téléphone</label>
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'stretch' }}>
          {/* Searchable Country Code Picker */}
          <CountryPhonePicker
            selectedCountry={selectedCountry}
            onChange={(countryObj) => {
              setSelectedCountry(countryObj);
              handleLocalPhoneChange(countryObj.code, localPhone);
            }}
          />

          {/* Local Phone Input */}
          <input
            type="tel"
            className="form-control"
            placeholder="6 12 34 56 78"
            value={localPhone}
            onChange={(e) => handleLocalPhoneChange(selectedCountry.code, e.target.value)}
            style={{
              flex: 1,
              borderColor:
                phoneStatus === 'taken' || validationErrors.phone
                  ? 'var(--error-color)'
                  : phoneStatus === 'available'
                  ? '#2e7d32'
                  : undefined,
            }}
          />
        </div>
        {phoneStatus === 'checking' && (
          <div style={{ color: 'var(--secondary)', fontSize: '0.78rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Loader size={12} className="spin" /> Vérification du numéro...
          </div>
        )}
        {phoneStatus === 'taken' && (
          <div style={{ color: '#d32f2f', fontSize: '0.78rem', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <X size={13} /> Ce numéro de téléphone est déjà utilisé
          </div>
        )}
        {phoneStatus === 'available' && (
          <div style={{ color: '#2e7d32', fontSize: '0.78rem', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Check size={13} /> Numéro de téléphone disponible ({formData.phone})
          </div>
        )}
        {validationErrors.phone && phoneStatus !== 'taken' && (
          <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.phone}</div>
        )}
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

        {/* Live Password Strength Meter & Checklist */}
        {pwd.length > 0 && (
          <div style={{ marginTop: '0.45rem', padding: '0.55rem 0.75rem', background: 'rgba(27,75,90,0.04)', borderRadius: '10px', border: '1px solid rgba(27,75,90,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--secondary)' }}>Sécurité du mot de passe:</span>
              <span style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.45rem' }}>
              <div style={{ height: '100%', width: pwdStrength.width, background: pwdStrength.color, transition: 'all 0.3s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem 0.4rem', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: pwdRules.minLength ? '#2e7d32' : '#888' }}>
                {pwdRules.minLength ? <Check size={12} /> : <X size={12} />} 8+ caractères
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: pwdRules.hasUpper ? '#2e7d32' : '#888' }}>
                {pwdRules.hasUpper ? <Check size={12} /> : <X size={12} />} Majuscule (A-Z)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: pwdRules.hasNumber ? '#2e7d32' : '#888' }}>
                {pwdRules.hasNumber ? <Check size={12} /> : <X size={12} />} Chiffre (0-9)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: pwdRules.hasSpecial ? '#2e7d32' : '#888' }}>
                {pwdRules.hasSpecial ? <Check size={12} /> : <X size={12} />} Caractère spécial (!@#...)
              </div>
            </div>
          </div>
        )}

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

        {/* Live Confirm Password Match Indicator */}
        {formData.confirmPassword.length > 0 && (
          <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: formData.confirmPassword === pwd ? '#2e7d32' : '#d32f2f' }}>
            {formData.confirmPassword === pwd ? (
              <><Check size={13} /> Les mots de passe correspondent</>
            ) : (
              <><X size={13} /> Les mots de passe ne correspondent pas</>
            )}
          </div>
        )}

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
          onClick={() => {
            setFormData((prev) => ({ ...prev, role: 'learner' }));
            setStep(3);
          }}
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
            Je souhaite développer mes compétences et suivre des formations.
          </p>
        </div>

        <div
          onClick={() => {
            setFormData((prev) => ({ ...prev, role: 'instructor' }));
            setStep(3);
          }}
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
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Formateur</h3>
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Je souhaite enseigner et accompagner les apprenants.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3A = () => (
    <div>
      <h2 style={{ marginBottom: '0.35rem', color: 'var(--primary)', fontSize: '1.4rem' }}>Votre situation actuelle</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--secondary)', fontSize: '0.88rem' }}>
        Sélectionnez votre situation pour continuer.
      </p>

      {!formData.learnerSituation ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'student' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.learnerSituation === 'student' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'student' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'student' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🎓</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Étudiant</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'employee' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.learnerSituation === 'employee' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'employee' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'employee' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>💼</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Employé</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'both' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.learnerSituation === 'both' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'both' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'both' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🎓💼</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Étudiant + Employé</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, learnerSituation: 'self_directed' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.learnerSituation === 'self_directed' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.learnerSituation === 'self_directed' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.learnerSituation === 'self_directed' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📚</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>En auto-formation</h3>
          </div>
        </div>
      ) : (
        <>
          {validationErrors.learnerSituation && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{validationErrors.learnerSituation}</div>}
          
          {/* Student Fields */}
          {(formData.learnerSituation === 'student' || formData.learnerSituation === 'both') && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginBottom: '0.65rem', color: 'var(--primary)', fontSize: '1.1rem' }}>🎓 Informations de formation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.45rem 0.85rem' }}>
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
                      placeholder="Ex: Doctorat, Formation..."
                      value={formData.customEducationLevel}
                      onChange={e => setFormData({ ...formData, customEducationLevel: e.target.value })}
                      style={validationErrors.customEducationLevel ? { borderColor: 'var(--error-color)' } : {}}
                    />
                    {validationErrors.customEducationLevel && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.customEducationLevel}</div>}
                  </div>
                )}

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
                  <label>Niveau</label>
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
              </div>
            </div>
          )}

          {/* Employee Fields */}
          {(formData.learnerSituation === 'employee' || formData.learnerSituation === 'both') && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginBottom: '0.65rem', color: 'var(--primary)', fontSize: '1.1rem' }}>💼 Informations professionnelles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.45rem 0.85rem' }}>
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
                    style={validationErrors.department ? { borderColor: 'var(--error-color)' } : {}}
                  />
                  {validationErrors.department && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.department}</div>}
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
      <h2 style={{ marginBottom: '0.35rem', color: 'var(--primary)', fontSize: '1.4rem' }}>Votre situation professionnelle</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--secondary)', fontSize: '0.88rem' }}>
        Sélectionnez votre situation pour continuer.
      </p>

      {!formData.instructorSituation ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => setFormData({ ...formData, instructorSituation: 'employed' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.instructorSituation === 'employed' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.instructorSituation === 'employed' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.instructorSituation === 'employed' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>👔</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Employé / En poste</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, instructorSituation: 'freelance' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.instructorSituation === 'freelance' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.instructorSituation === 'freelance' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.instructorSituation === 'freelance' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>💻</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Freelance / Indépendant</h3>
          </div>

          <div
            onClick={() => setFormData({ ...formData, instructorSituation: 'unemployed' })}
            style={{
              padding: '1.25rem 1rem',
              border: `2px solid ${formData.instructorSituation === 'unemployed' ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              background: formData.instructorSituation === 'unemployed' ? 'rgba(27,75,90,0.05)' : '#fff',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = formData.instructorSituation === 'unemployed' ? 'var(--primary)' : 'var(--border-color)'}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🔎</div>
            <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Sans emploi</h3>
          </div>
        </div>
      ) : (
        <>
          {validationErrors.instructorSituation && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{validationErrors.instructorSituation}</div>}

          {/* Common Instructor Fields */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.65rem', color: 'var(--primary)', fontSize: '1.1rem' }}>Expertise professionnelle</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.45rem 0.85rem' }}>
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
                  value={formData.expertiseDomain}
                  onChange={e => setFormData({ ...formData, expertiseDomain: e.target.value })}
                  style={validationErrors.expertiseDomain ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.expertiseDomain && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.expertiseDomain}</div>}
              </div>

              <div className="form-group">
                <label>Spécialité</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: React & Node.js"
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  style={validationErrors.specialization ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.specialization && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.specialization}</div>}
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
                <label>Domaines d'enseignement souhaités</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: HTML, CSS, JavaScript, React"
                  value={formData.teachingDomains}
                  onChange={e => setFormData({ ...formData, teachingDomains: e.target.value })}
                  style={validationErrors.teachingDomains ? { borderColor: 'var(--error-color)' } : {}}
                />
                {validationErrors.teachingDomains && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.teachingDomains}</div>}
              </div>

              <div className="form-group">
                <label>Mode d'enseignement préféré</label>
                <select
                  className="form-control"
                  value={formData.teachingMode}
                  onChange={e => setFormData({ ...formData, teachingMode: e.target.value })}
                  style={validationErrors.teachingMode ? { borderColor: 'var(--error-color)' } : {}}
                >
                  <option value="online">En ligne</option>
                  <option value="in-person">Présentiel</option>
                  <option value="hybrid">Les deux (Hybride)</option>
                </select>
                {validationErrors.teachingMode && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{validationErrors.teachingMode}</div>}
              </div>
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
          {formData.phone && <p style={{ margin: 0 }}><strong>Téléphone:</strong> {formData.phone}</p>}
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
                <p style={{ margin: 0 }}><strong>Expérience:</strong> {
                  formData.experienceYears === '1' ? 'Moins d\'un an' :
                  formData.experienceYears === '2' ? '1–2 ans' :
                  formData.experienceYears === '4' ? '3–5 ans' :
                  formData.experienceYears === '8' ? '6–10 ans' :
                  formData.experienceYears === '11' ? 'Plus de 10 ans' :
                  formData.experienceYears
                }</p>
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
        </>
      )}

      {formData.role === 'instructor' && formData.instructorSituation && (
        <>
          <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>Expertise</h3>
            <div style={{ color: 'var(--secondary)', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}><strong>Domaine d'expertise:</strong> {formData.specialization}</p>
              <p style={{ margin: 0 }}><strong>Spécialité:</strong> {formData.specialization}</p>
              <p style={{ margin: 0 }}><strong>Expérience:</strong> {
                formData.experienceYears === '1' ? 'Moins d\'un an' :
                formData.experienceYears === '2' ? '1–2 ans' :
                formData.experienceYears === '4' ? '3–5 ans' :
                formData.experienceYears === '8' ? '6–10 ans' :
                formData.experienceYears === '11' ? 'Plus de 10 ans' :
                formData.experienceYears
              }</p>
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
            <img src={logoImg} alt="212LEARN Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </div>

          {/* Interactive Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--secondary)', flexWrap: 'wrap' }}>
            {getProgressSteps().map((s, index) => {
              const isCurrent = step === s.id;
              const isComplete = (
                (s.id === 1 && isStep1Valid) ||
                (s.id === 2 && Boolean(formData.role)) ||
                (s.id === 3 && ((formData.role === 'learner' && Boolean(formData.learnerSituation)) || (formData.role === 'instructor' && Boolean(formData.instructorSituation))))
              );
              const isNavigable = s.id <= step || isStep1Valid;

              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isNavigable || s.id <= step) {
                        setStep(s.id);
                      }
                    }}
                    style={{
                      background: isCurrent ? 'rgba(193, 101, 47, 0.08)' : isComplete ? 'rgba(22, 163, 74, 0.08)' : 'transparent',
                      border: 'none',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '8px',
                      cursor: isNavigable ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.38rem',
                      fontSize: '0.85rem',
                      fontWeight: isCurrent || isComplete ? 700 : 500,
                      color: isCurrent ? 'var(--primary)' : isComplete ? '#15803d' : '#94a3b8',
                      transition: 'all 0.15s ease',
                    }}
                    title={isNavigable ? `Étape ${s.id}: ${s.label} (${isComplete ? 'Validée' : isCurrent ? 'En cours' : 'À compléter'})` : ''}
                    onMouseEnter={(e) => {
                      if (isNavigable && !isCurrent && !isComplete) e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.color = isComplete ? '#15803d' : '#94a3b8';
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isCurrent
                          ? 'var(--primary)'
                          : isComplete
                          ? '#16a34a'
                          : '#e2e8f0',
                        color: isCurrent || isComplete ? '#ffffff' : '#64748b',
                        boxShadow: isComplete ? '0 2px 6px rgba(22,163,74,0.3)' : isCurrent ? '0 2px 6px rgba(193,101,47,0.3)' : 'none',
                      }}
                    >
                      {isComplete ? <Check size={12} strokeWidth={3} /> : s.id}
                    </span>
                    <span>{s.label}</span>
                  </button>
                  {index < getProgressSteps().length - 1 && (
                    <span style={{ color: isComplete ? '#16a34a' : 'var(--border-color)', opacity: isComplete ? 0.8 : 0.5, fontWeight: 700 }}>
                      ──
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>{error}</div>}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && formData.role === 'learner' && renderStep3A()}
          {step === 3 && formData.role === 'instructor' && renderStep3B()}
          {step === 4 && renderStep4()}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
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

            {step < 4 && step !== 2 && (
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading || (step === 1 && !isStep1Valid)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: (step === 1 && !isStep1Valid) ? '#cbd5e1' : 'var(--primary)',
                  cursor: (loading || (step === 1 && !isStep1Valid)) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: (step === 1 && !isStep1Valid) ? 0.6 : 1,
                  transition: 'all 0.25s ease',
                }}
              >
                Continuer <ChevronRight size={18} />
              </button>
            )}

            {step === 4 && (
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
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading && <Loader size={18} className="spin" />}
                {loading ? SUBMIT_STAGES[submitStage] : 'Créer mon compte'}
              </button>
            )}
          </div>

          {/* Indeterminate progress bar — shown while the account is being created */}
          {loading && (
            <div
              role="progressbar"
              aria-label="Création du compte en cours"
              style={{
                marginTop: '1rem',
                height: '4px',
                width: '100%',
                background: 'var(--border-color, #e2e8f0)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div className="progress-indeterminate" style={{ height: '100%', background: 'var(--primary)', borderRadius: '999px' }} />
            </div>
          )}

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Vous avez déjà un compte ? <Link to="/login" style={{ fontWeight: 600 }}>Se connecter</Link>
          </p>
        </div>

        {/* Right Section: Authentic 212Learn Live Dashboard Preview */}
        <div className="auth-dashboard-preview">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mockup-212-dashboard"
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {/* Mockup Top Header Navbar */}
            <div className="mockup-navbar">
              <div className="mockup-brand">
                <span className="mockup-brand-logo">212</span>
                <span className="mockup-brand-text">212Learn</span>
              </div>
              <div className="mockup-nav-right">
                <span className="mockup-badge-live">En direct</span>
                <div className="mockup-avatar">
                  {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </div>

            {/* Mockup Layout Split: Sidebar + Main Area */}
            <div className="mockup-body-split">
              {/* Left Mini Sidebar */}
              <div className="mockup-sidebar">
                <div className="mockup-nav-item active" title="Tableau de bord">
                  <Trophy size={14} />
                </div>
                <div className="mockup-nav-item" title="Sessions Live">
                  <Video size={14} />
                </div>
                <div className="mockup-nav-item" title="Mon Profil">
                  <User size={14} />
                </div>
                <div className="mockup-nav-item" title="Sécurité">
                  <Lock size={14} />
                </div>
              </div>

              {/* Main Content Area */}
              <div className="mockup-main-area">
                {/* Welcome Heading */}
                <div className="mockup-welcome-head">
                  <h4 className="mockup-user-title">
                    Aperçu de votre compte {formData.role === 'instructor' ? 'Formateur' : 'Apprenant'} 👋
                  </h4>
                  <p className="mockup-user-sub">
                    Voici comment apparaîtra votre profil une fois votre compte créé.
                  </p>
                </div>

                {/* Live User Profile Card */}
                <div className="mockup-profile-card">
                  <div className="mockup-profile-row">
                    <div className="mockup-profile-avatar">
                      {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="mockup-profile-details">
                      <span className="profile-name">
                        {formData.firstName || formData.lastName
                          ? `${formData.firstName} ${formData.lastName}`.trim()
                          : 'Votre Nom & Prénom'}
                      </span>
                      <span className="profile-email">
                        {formData.email ? formData.email : 'votre.email@212learn.com'}
                      </span>
                    </div>
                    <span className="profile-role-tag">
                      {formData.role === 'instructor' ? 'Formateur' : 'Apprenant'}
                    </span>
                  </div>

                  {/* Secondary info fields if entered */}
                  {(formData.phone || formData.school || formData.companyName) && (
                    <div className="mockup-profile-meta">
                      {formData.phone && <div><strong>Tél:</strong> {formData.phone}</div>}
                      {formData.school && <div><strong>Établissement:</strong> {formData.school}</div>}
                      {formData.companyName && <div><strong>Entreprise:</strong> {formData.companyName}</div>}
                    </div>
                  )}
                </div>

                {/* Included Onboarding Advantages Checklist */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.75rem 0.85rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Avantages de votre espace 212Learn:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>Accès illimité aux cours & ateliers</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>Classes virtuelles & Sessions Live</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>Certificats officiels de complétion</span>
                    </div>
                  </div>
                </div>

                {/* Live Readiness Indicator */}
                <div className="mockup-readiness-bar">
                  <div className="readiness-row">
                    <span>Création du compte</span>
                    <span className="readiness-percent">
                      {step === 1 ? (isStep1Valid ? '35%' : '15%') : step === 2 ? '55%' : step === 3 ? '85%' : '100%'}
                    </span>
                  </div>
                  <div className="readiness-track">
                    <motion.div
                      className="readiness-fill"
                      animate={{
                        width: step === 1 ? (isStep1Valid ? '35%' : '15%') : step === 2 ? '55%' : step === 3 ? '85%' : '100%',
                      }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
