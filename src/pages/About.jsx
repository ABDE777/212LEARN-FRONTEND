import React from 'react';
import { BookOpen, Users, Award, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';

function About() {
  const cards = [
    {
      icon: <BookOpen size={28} />,
      title: "Cours de Qualité",
      desc: "Accédez à une large sélection de cours dispensés par des professionnels qualifiés et passionnés dans divers domaines."
    },
    {
      icon: <Users size={28} />,
      title: "Communauté Active",
      desc: "Échangez avec d'autres étudiants et instructeurs, collaborez sur des projets et progressez ensemble au quotidien."
    },
    {
      icon: <Award size={28} />,
      title: "Certifications Validées",
      desc: "Valorisez vos compétences et donnez un élan à votre carrière avec des certificats reconnus à la fin de vos formations."
    },
    {
      icon: <Compass size={28} />,
      title: "Apprentissage Flexible",
      desc: "Étudiez à votre propre rythme, où que vous soyez, grâce à notre plateforme optimisée pour tous vos appareils."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      <Navbar />
      {/* Hero Section */}
      <header className="about-hero">
        <span className="about-badge">Notre Mission</span>
        <h1 className="about-title">Apprendre sans limites avec 212Learn</h1>
        <p className="about-subtitle">
          Une plateforme éducative moderne, conçue pour connecter les meilleurs instructeurs avec des étudiants passionnés désireux d'acquérir de nouvelles compétences.
        </p>
      </header>

      {/* Cards Section */}
      <section className="about-section">
        <h2 className="section-section-title">Pourquoi choisir notre plateforme ?</h2>
        <div className="about-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="about-card">
              <div className="about-card-icon-wrapper">
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">15K+</div>
            <div className="stat-label">Étudiants Actifs</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">200+</div>
            <div className="stat-label">Cours Disponibles</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Instructeurs Experts</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Taux de Satisfaction</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
