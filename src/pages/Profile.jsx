import { Link } from 'react-router-dom';

export default function Profile() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>Mon tableau de bord</h1>
        <button onClick={handleLogout} className="btn-secondary" style={{ background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
          Se déconnecter
        </button>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem', background: '#fff' }}>
        <h2>Bienvenue sur 212LEARN</h2>
        <p style={{ color: 'var(--secondary)' }}>Vos cours et votre progression apparaîtront ici.</p>
        
        <div style={{ marginTop: '2rem' }}>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
