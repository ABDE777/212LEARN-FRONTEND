import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import loginAnimation from '../lotties/login.json';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft, ShieldCheck, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const OTP_EXPIRY_SECONDS = 15 * 60; // 15 minutes

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OTP restore step state
  const [restoreStep, setRestoreStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);

  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const { login, loginWithToken, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  // Countdown timer for OTP
  useEffect(() => {
    if (!restoreStep) return;
    setSecondsLeft(OTP_EXPIRY_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [restoreStep]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getDashboardPath = (role) => {
    const r = role?.toUpperCase();
    if (r === 'INSTRUCTOR') return '/instructor/dashboard';
    if (r === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  // ── Normal login ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
      const data = res.data;

      if (data.requiresRestore) {
        // Switch to OTP step
        setRestoreStep(true);
        setOtp(['', '', '', '', '', '']);
        return;
      }

      // Normal login success
      if (typeof loginWithToken === 'function') {
        loginWithToken(data.token, data.data?.user);
      } else {
        const user = await login(formData.email, formData.password);
        navigate(getDashboardPath(user?.role));
        return;
      }
      navigate(getDashboardPath(data.data?.user?.role));
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      setError(msg || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit handling ────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Submit OTP to restore account ─────────────────────────────────────────
  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Veuillez entrer le code complet à 6 chiffres.'); return; }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await api.post('/auth/restore-account', { email: formData.email, otp: code });
      const data = res.data;
      if (typeof loginWithToken === 'function') {
        loginWithToken(data.token, data.data?.user);
      }
      navigate(getDashboardPath(data.data?.user?.role));
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      setOtpError(msg || 'Code invalide ou expiré. Veuillez réessayer.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP (re-trigger login to generate new OTP) ─────────────────────
  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError(null);
    try {
      await api.post('/auth/login', { email: formData.email, password: formData.password });
      setOtp(['', '', '', '', '', '']);
      setSecondsLeft(OTP_EXPIRY_SECONDS);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
      }, 1000);
      otpRefs.current[0]?.focus();
    } catch {
      setOtpError("Impossible de renvoyer le code. Vérifiez votre mot de passe.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-80px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(193,101,47,0.1) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'blobFloat 10s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-60px',
        width: '320px', height: '320px',
        background: 'radial-gradient(circle, rgba(27,75,90,0.08) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'blobFloat 13s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <div className="auth-container" style={{ animation: 'scaleIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Left Section: Lottie Animation */}
        <div className="auth-lottie" style={{ animation: 'slideInLeft 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
          <Lottie
            animationData={loginAnimation}
            loop={true}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {/* Right Section: Form */}
        <div className="auth-form-wrapper" style={{ animation: 'slideInRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            {restoreStep ? (
              <button
                onClick={() => { setRestoreStep(false); setOtpError(null); clearInterval(timerRef.current); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 500, fontSize: '0.95rem' }}
              >
                <ArrowLeft size={20} /> Retour
              </button>
            ) : (
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 500 }}>
                <ArrowLeft size={20} /> Retour
              </Link>
            )}
            <img src={logoImg} alt="212LEARN Logo" style={{ height: '120px', objectFit: 'contain' }} />
          </div>

          {/* ── OTP Restore Step ─────────────────────────────────────────── */}
          {restoreStep ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius: '50%', padding: '10px', display: 'flex' }}>
                  <ShieldCheck size={24} color="#fff" />
                </div>
                <h1 style={{ color: 'var(--primary)', margin: 0 }}>Restaurer votre compte</h1>
              </div>
              <p style={{ marginBottom: '0.5rem', color: 'var(--secondary)', fontSize: '0.95rem' }}>
                Votre compte a été désactivé. Un code de vérification à <strong>6 chiffres</strong> a été envoyé à&nbsp;
                <strong>{formData.email}</strong>.
              </p>
              <p style={{ marginBottom: '2rem', color: secondsLeft < 60 ? '#e53e3e' : 'var(--secondary)', fontSize: '0.88rem', fontWeight: 500 }}>
                {secondsLeft > 0 ? `⏱ Code valable encore ${formatTime(secondsLeft)}` : '⚠️ Code expiré — renvoyez-en un nouveau.'}
              </p>

              {otpError && (
                <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>
                  {otpError}
                </div>
              )}

              <form onSubmit={handleRestoreSubmit}>
                {/* 6-digit OTP input */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }} onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: '52px', height: '60px', textAlign: 'center', fontSize: '1.6rem', fontWeight: 700,
                        border: digit ? '2px solid #6c63ff' : '2px solid #ddd',
                        borderRadius: '10px', outline: 'none', transition: 'border-color 0.2s',
                        background: digit ? '#f3f0ff' : '#fafafa', color: '#1a1a2e',
                      }}
                      autoFocus={i === 0}
                      disabled={secondsLeft === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={otpLoading || secondsLeft === 0}
                >
                  {otpLoading ? 'Restauration en cours...' : '✓ Restaurer et se connecter'}
                </button>
              </form>

              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.6rem', background: 'none',
                  border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer',
                  color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 500,
                }}
              >
                <RefreshCcw size={15} />
                {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
              </button>
            </>
          ) : (
            /* ── Normal Login Step ──────────────────────────────────────── */
            <>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Bon retour</h1>
              <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
                Connectez-vous pour poursuivre votre apprentissage.
              </p>

              {error && (
                <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Adresse e-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="etudiant@212learn.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>

              <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Vous n'avez pas de compte ? <Link to="/signup" style={{ fontWeight: 600 }}>Créez-en un</Link>
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
