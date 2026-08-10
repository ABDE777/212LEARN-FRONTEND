import { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function PublicStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/public/statistics');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ opacity: 0.5 }}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  const statCards = [
    {
      icon: <Users size={32} />,
      value: stats?.totalStudents || 0,
      label: 'Étudiants',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      icon: <BookOpen size={32} />,
      value: stats?.totalCourses || 0,
      label: 'Cours',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      icon: <Award size={32} />,
      value: stats?.totalInstructors || 0,
      label: 'Instructeurs',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      icon: <CheckCircle size={32} />,
      value: stats?.totalCompletions || 0,
      label: 'Cours complétés',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
  ];

  return (
    <section style={{ padding: '4rem 2rem', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.75rem' }}>
            Nos statistiques
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Une plateforme en pleine croissance avec des milliers d'apprenants et de cours de qualité
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {statCards.map((card, index) => (
            <div
              key={index}
              style={{
                padding: '2rem',
                borderRadius: '20px',
                background: card.bg,
                border: `1px solid ${card.color}20`,
                textAlign: 'center',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#fff',
                }}
              >
                {card.icon}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <TrendingUp size={24} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Taux de satisfaction
              </h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
              {stats?.satisfactionRate || 95}%
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Basé sur les avis des étudiants
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Clock size={24} color="#3b82f6" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Temps d'apprentissage
              </h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>
              {stats?.totalLearningHours?.toLocaleString() || 0}h
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Cumul sur la plateforme
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Award size={24} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Certificats délivrés
              </h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>
              {stats?.totalCertificates?.toLocaleString() || 0}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Certificats de réussite
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
