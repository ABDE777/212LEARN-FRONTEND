import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import loginAnimation from '../lotties/login.json';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(formData.email, formData.password);
      const dashboardPath = getDashboardPath(user?.role);
      navigate(dashboardPath);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        
        {/* Left Section: Lottie Animation */}
        <div className="auth-lottie">
          <Lottie 
            animationData={loginAnimation} 
            loop={true} 
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {/* Right Section: Form */}
        <div className="auth-form-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 500 }}>
              <ArrowLeft size={20} />
              Retour
            </Link>
            <img src={logoImg} alt="212LEARN Logo" style={{ height: '120px', objectFit: 'contain' }} />
          </div>

          <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Bon retour</h1>
          <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
            Connectez-vous pour poursuivre votre apprentissage.
          </p>

          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse e-mail</label>
              <input
                type="email"
                className="form-control"
                placeholder="etudiant@212learn.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                required
              />
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
        </div>

      </div>
    </div>
  );
}
