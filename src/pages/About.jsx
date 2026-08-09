import React from 'react';
import { BookOpen, Users, Award, Compass, Target, Heart, Zap, Globe, CheckCircle, Quote } from 'lucide-react';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import aboutAnimation from '../lotties/Education2.json';
import Navbar from '../components/Navbar';
import { usePublicStats } from '../hooks/usePublicStats';
import LoadingSpinner from '../components/LoadingSpinner';

function About() {
  const { stats, loading: statsLoading } = usePublicStats();

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

  const values = [
    {
      icon: <Target size={32} color="#C1652F" />,
      title: "Excellence",
      desc: "Nous nous engageons à fournir un contenu de la plus haute qualité, régulièrement mis à jour."
    },
    {
      icon: <Heart size={32} color="#C1652F" />,
      title: "Passion",
      desc: "Notre amour pour l'éducation nous pousse à créer des expériences d'apprentissage inspirantes."
    },
    {
      icon: <Zap size={32} color="#C1652F" />,
      title: "Innovation",
      desc: "Nous intégrons les dernières technologies pour rendre l'apprentissage plus efficace."
    },
    {
      icon: <Globe size={32} color="#C1652F" />,
      title: "Accessibilité",
      desc: "L'éducation de qualité doit être accessible à tous, partout et à tout moment."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Benali",
      role: "Développeuse Fullstack",
      text: "212Learn m'a permis de transitionner vers le développement web en seulement 6 mois. Les cours sont excellents et la communauté très supportive.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
    },
    {
      name: "Ahmed Tazi",
      role: "Data Scientist",
      text: "La qualité des formations est exceptionnelle. J'ai pu acquérir des compétences en data science qui m'ont permis d'obtenir mon emploi actuel.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
    },
    {
      name: "Fatima Zahra",
      role: "Étudiante en informatique",
      text: "Grâce aux sessions live et au suivi personnalisé, j'ai pu progresser rapidement. Les instructeurs sont vraiment disponibles et pédagogues.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
    }
  ];

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      <Navbar />
      {/* Hero Section */}
      <header className="about-hero">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap', padding: '4rem 2rem' }}>
          <div style={{ flex: '1 1 480px', textAlign: 'left' }}>
            <span className="about-badge">Notre Mission</span>
            <h1 className="about-title" style={{ textAlign: 'left' }}>Apprendre sans limites avec 212Learn</h1>
            <p className="about-subtitle" style={{ textAlign: 'left', margin: 0 }}>
              Une plateforme éducative moderne, conçue pour connecter les meilleurs instructeurs avec des étudiants passionnés désireux d'acquérir de nouvelles compétences.
            </p>
          </div>
          <div style={{ 
            flex: '1 1 360px', 
            maxWidth: '460px', 
            background: 'var(--bg-color)', 
            padding: '1.5rem', 
            borderRadius: '28px', 
            boxShadow: 'var(--neu-shadow-raised)', 
            border: '1px solid rgba(255, 255, 255, 0.7)',
            margin: '0 auto'
          }}>
            <Lottie animationData={aboutAnimation} loop={true} />
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '4rem 2rem', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.3rem', marginBottom: '3rem', fontWeight: 800 }}>Nos réalisations</h2>
          {statsLoading ? (
            <div style={{ textAlign: 'center' }}><LoadingSpinner /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f093fb' }}>{`+${stats?.totalUsers || 0}`}</div>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Étudiants Actifs</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#43e97b' }}>{`+${stats?.totalCourses || 0}`}</div>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Cours Disponibles</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#4facfe' }}>{`+${stats?.totalInstructors || 0}`}</div>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Instructeurs Experts</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fee140' }}>{`${stats?.satisfactionRate || 98}%`}</div>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Taux de Satisfaction</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cards Section */}
      <section className="about-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }}>
          <h2 className="section-section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Pourquoi choisir notre plateforme ?</h2>
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
        </div>
      </section>

      {/* Our Story Section */}
      <section style={{ background: 'var(--surface-color)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Notre Histoire</span>
              <h2 style={{ fontSize: '2.3rem', fontWeight: 800, margin: '0.5rem 0 1.5rem', color: 'var(--text-color)' }}>
                Nés de la passion pour l'éducation
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                212Learn est né d'une vision simple mais puissante : rendre l'éducation de qualité accessible à tous au Maroc et dans la francophonie.
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Fondée par des passionnés de technologie et d'éducation, notre plateforme a grandi pour devenir une référence dans l'apprentissage en ligne, avec des milliers d'étudiants qui nous font confiance chaque jour.
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', lineHeight: 1.8 }}>
                Notre mission continue d'évoluer, mais notre engagement reste le même : offrir la meilleure expérience d'apprentissage possible.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {[
                { number: '2024', label: 'Année de création' },
                { number: '100%', label: 'Engagement qualité' },
                { number: '24/7', label: 'Support disponible' },
                { number: '∞', label: 'Apprentissage continu' }
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  background: '#fff', 
                  padding: '2rem', 
                  borderRadius: '16px', 
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.number}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '5rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-color)' }}>
            Nos Valeurs
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Les principes qui guident chacune de nos actions et décisions
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {values.map((value, idx) => (
              <div key={idx} style={{ 
                background: 'var(--bg-color)', 
                padding: '2rem', 
                borderRadius: '20px', 
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  background: 'rgba(193, 101, 47, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem' 
                }}>
                  {value.icon}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-color)' }}>{value.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '5rem 2rem', background: 'var(--surface-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-color)' }}>
            Ce que disent nos étudiants
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Découvrez les témoignages de ceux qui ont transformé leur carrière avec 212Learn
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} style={{ 
                background: '#fff', 
                padding: '2rem', 
                borderRadius: '20px',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}>
                <Quote size={32} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', color: 'var(--text-color)', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-color)' }}>{testimonial.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, var(--primary) 0%, #d46b28 100%)', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Prêt à commencer votre parcours ?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.95, marginBottom: '2rem' }}>
            Rejoignez des milliers d'étudiants et commencez à apprendre dès aujourd'hui
          </p>
          <a 
            href="/courses" 
            style={{ 
              display: 'inline-block', 
              padding: '1rem 2.5rem', 
              background: '#fff', 
              color: 'var(--primary)', 
              textDecoration: 'none', 
              fontWeight: 700, 
              fontSize: '1.1rem', 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            Explorer les cours
          </a>
        </div>
      </section>
    </div>
  );
}

export default About;
