import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import signupAnimation from '../lotties/Sign up.json';
import logoImg from '../assets/navbarlogo.png';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signup } = useAuth();
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
      const newUser = await signup(formData);
      const dashboardPath = getDashboardPath(newUser?.role || formData.role);
      navigate(dashboardPath);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Échec de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        
        {/* Left Section: Form */}
        <div className="auth-form-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 500 }}>
              <ArrowLeft size={20} />
              Retour
            </Link>
            <img src={logoImg} alt="212LEARN Logo" style={{ height: '120px', objectFit: 'contain' }} />
          </div>

          <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Rejoignez 212LEARN</h1>
          <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
            Créez un compte pour libérer votre potentiel.
          </p>

          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', background: '#fff0f0', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #fcc' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Prénom</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Nom</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
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

            <div className="form-group">
              <label>Je suis un(e)...</label>
              <select 
                className="form-control"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="STUDENT">Étudiant(e)</option>
                <option value="INSTRUCTOR">Professeur</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Création du compte...' : "S'inscrire"}
            </button>
          </form>

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
