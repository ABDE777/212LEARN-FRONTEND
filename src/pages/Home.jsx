import { Link, useNavigate } from 'react-router-dom';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import heroAnimation from '../lotties/Hero section.json';
import { BookOpen, Users, Video, Code, Database, Globe, Award, User } from 'lucide-react';
import logoImg from '../assets/Logo.png';
import { useCategories } from '../hooks/useCategories';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import AnimatedLogo from '../components/AnimatedLogo';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { categories, loading, error } = useCategories();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === 'INSTRUCTOR') return '/instructor/dashboard';
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  // Flatten nested categories into a single array
  const flattenCategories = (cats) => {
    let result = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children));
      }
    }
    return result;
  };

  const allCategories = flattenCategories(categories || []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('programmation') || name.includes('code') || name.includes('développement')) return Code;
    if (name.includes('base de données') || name.includes('data')) return Database;
    if (name.includes('web') || name.includes('internet') || name.includes('réseau')) return Globe;
    if (name.includes('vidéo') || name.includes('conférence')) return Video;
    if (name.includes('pédagogique') || name.includes('suivi')) return Users;
    return BookOpen;
  };

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Floating Background Objects */}
        <div className="floating-objects">
          <div className="floating-circle" style={{ top: '10%', left: '5%', width: '80px', height: '80px', background: 'var(--primary)', opacity: 0.15 }}></div>
          <div className="floating-circle" style={{ top: '60%', left: '10%', width: '60px', height: '60px', background: 'var(--accent)', opacity: 0.2, animationDelay: '-2s' }}></div>
          <div className="floating-circle" style={{ top: '30%', right: '15%', width: '100px', height: '100px', background: 'var(--secondary)', opacity: 0.1, animationDelay: '-4s' }}></div>
          <div className="floating-circle" style={{ bottom: '20%', right: '8%', width: '70px', height: '70px', background: 'var(--primary)', opacity: 0.12, animationDelay: '-1s' }}></div>
        </div>

        <div className="hero-left">
          {/* Logo on the left of all text */}
          {/* <img src={logoImg} alt="212LEARN Logo" className="hero-logo" /> */}

          <AnimatedLogo  size={450} />
          <div className="hero-text-wrapper">
            <h1 className="hero-title">
              Élevez votre parcours <span style={{ color: 'var(--primary)' }}>d'apprentissage</span>.
            </h1>
            <p className="hero-desc">
              La plateforme d'e-learning ultime conçue pour vous accompagner tout au long de votre cursus en informatique. Apprenez, connectez-vous et grandissez.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
                Commencer
              </Link>
              <Link to="/courses" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1.1rem', background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                Parcourir le catalogue
              </Link>
            </div>
          </div>
        </div>
        
        <div className="hero-right">
          {/* Decorative background blob */}
          <div style={{ 
            position: 'absolute', 
            width: '400px', 
            height: '400px', 
            background: 'var(--primary)', 
            opacity: 0.1, 
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(50px)',
            zIndex: 0
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '550px' }}>
            <Lottie animationData={heroAnimation} loop={true} />
          </div>
        </div>
      </section>

      {/* Features / Categories Marquee */}
      <section style={{ background: 'var(--surface-color)', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        {/* Floating Objects */}
        <div className="floating-objects">
          <div className="floating-circle" style={{ top: '15%', left: '3%', width: '90px', height: '90px', background: 'var(--accent)', opacity: 0.12, animationDelay: '-3s' }}></div>
          <div className="floating-circle" style={{ top: '70%', left: '8%', width: '50px', height: '50px', background: 'var(--primary)', opacity: 0.18, animationDelay: '-1s' }}></div>
          <div className="floating-circle" style={{ top: '20%', right: '5%', width: '75px', height: '75px', background: 'var(--secondary)', opacity: 0.08, animationDelay: '-5s' }}></div>
          <div className="floating-circle" style={{ bottom: '10%', right: '12%', width: '65px', height: '65px', background: 'var(--accent)', opacity: 0.14, animationDelay: '-2s' }}></div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', position: 'relative', zIndex: 1 }}>
          Explorer les catégories
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'var(--error-color)', padding: '0 2rem' }}>{error}</div>
        ) : (() => {
          /* Build the list of cards — real API data or static fallback */
          const FALLBACK = [
            { id: 'f1', name: 'Informatique',      description: 'Algorithmes, structures de données et fondamentaux.', icon: 'BookOpen' },
            { id: 'f2', name: 'Visioconférences',  description: 'Sessions interactives avec vos professeurs.', icon: 'Video' },
            { id: 'f3', name: 'Suivi pédagogique', description: 'Retours directs via le portail des devoirs.', icon: 'Users' },
            { id: 'f4', name: 'Développement Web', description: 'HTML, CSS, JavaScript, React, Node.js.', icon: 'Globe' },
            { id: 'f5', name: 'Base de données',   description: 'SQL, NoSQL, optimisation de requêtes.', icon: 'Database' },
          ];
          const cards = (allCategories && allCategories.length > 0 ? allCategories : FALLBACK);
          /* Duplicate for seamless infinite loop */
          const loop = [...cards, ...cards];

          return (
            <div className="cat-marquee-wrapper">
              {/* Left fade */}
              <div className="cat-fade cat-fade-left" />
              {/* Right fade */}
              <div className="cat-fade cat-fade-right" />

              {/* Scrolling track */}
              <div className="cat-marquee-track">
                {loop.map((category, idx) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <Link
                      key={`${category.id}-${idx}`}
                      to={`/courses?category=${category.id}`}
                      className="cat-card"
                    >
                      <div className="cat-card-icon">
                        <Icon size={28} color="var(--primary)" />
                      </div>
                      <h3 className="cat-card-title">{category.name}</h3>
                      <p className="cat-card-desc">
                        {category.description || 'Explorez nos cours dans cette catégorie'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <style>{`
          /* ── Marquee container ── */
          .cat-marquee-wrapper {
            position: relative;
            overflow: hidden;
          }

          /* ── Scrolling track ── */
          .cat-marquee-track {
            display: flex;
            gap: 1.5rem;
            width: max-content;
            animation: catScroll 32s linear infinite;
            padding: 0.5rem 0 1.5rem;
          }

          /* Pause on hover */
          .cat-marquee-wrapper:hover .cat-marquee-track {
            animation-play-state: paused;
          }

          @keyframes catScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          /* ── Individual card ── */
          .cat-card {
            flex-shrink: 0;
            width: 220px;
            padding: 1.75rem 1.5rem;
            background: #fff;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            box-shadow: var(--shadow-sm);
            text-decoration: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.6rem;
          }

          .cat-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-md);
            border-color: var(--primary);
          }

          .cat-card-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: rgba(193, 101, 47, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.25s;
          }

          .cat-card:hover .cat-card-icon {
            background: var(--primary);
          }

          .cat-card:hover .cat-card-icon svg {
            color: #fff !important;
          }

          .cat-card-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-color);
            margin: 0;
            line-height: 1.3;
          }

          .cat-card-desc {
            font-size: 0.8rem;
            color: var(--secondary);
            margin: 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* ── Side fades ── */
          .cat-fade {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 120px;
            z-index: 2;
            pointer-events: none;
          }

          .cat-fade-left {
            left: 0;
            background: linear-gradient(to right, var(--surface-color) 0%, transparent 100%);
          }

          .cat-fade-right {
            right: 0;
            background: linear-gradient(to left, var(--surface-color) 0%, transparent 100%);
          }

          /* ── Respect reduced-motion preference ── */
          @media (prefers-reduced-motion: reduce) {
            .cat-marquee-track {
              animation: none;
              flex-wrap: wrap;
              width: 100%;
              padding: 0 2rem 1.5rem;
            }
            .cat-fade { display: none; }
          }
        `}</style>
      </section>

      {/* Why Choose Us Section */}
      <section style={{ padding: '5rem 2rem', background: '#fff', position: 'relative', overflow: 'hidden', color: 'var(--text-color)' }}>
        {/* Floating Objects for Why Choose Us Section */}
        <div className="floating-objects">
          <div className="floating-circle" style={{ top: '10%', left: '6%', width: '85px', height: '85px', background: 'var(--primary)', opacity: 0.08, animationDelay: '-4s' }}></div>
          <div className="floating-circle" style={{ top: '65%', left: '10%', width: '55px', height: '55px', background: 'var(--accent)', opacity: 0.12, animationDelay: '-2s' }}></div>
          <div className="floating-circle" style={{ top: '25%', right: '7%', width: '95px', height: '95px', background: 'var(--secondary)', opacity: 0.06, animationDelay: '-6s' }}></div>
          <div className="floating-circle" style={{ bottom: '15%', right: '10%', width: '60px', height: '60px', background: 'var(--primary)', opacity: 0.1, animationDelay: '-3s' }}></div>
        </div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>


          <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem', color: 'var(--text-color)' }}>Pourquoi nous choisir ?</h2>
          <p style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '1.1rem', color: 'var(--secondary)' }}>Des fonctionnalités pensées pour votre réussite</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '2rem' 
          }}>
            <div className="why-choose-card" style={{ 
              background: 'var(--surface-color)', 
              borderRadius: '20px', 
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <BookOpen size={40} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Cours structurés</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: '1.6' }}>Apprenez avec des programmes pédagogiques clairs et adaptés aux cursus OFPPT.</p>
            </div>

            <div className="why-choose-card" style={{ 
              background: 'var(--surface-color)', 
              borderRadius: '20px', 
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <Video size={40} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Visioconférences live</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: '1.6' }}>Rejoignez des séances interactives avec vos professeurs via Teams ou Google Meet.</p>
            </div>

            <div className="why-choose-card" style={{ 
              background: 'var(--surface-color)', 
              borderRadius: '20px', 
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <Users size={40} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Suivi personnalisé</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: '1.6' }}>Obtenez des retours constructifs sur vos devoirs et progrès pédagogiques.</p>
            </div>

            <div className="why-choose-card" style={{ 
              background: 'var(--surface-color)', 
              borderRadius: '20px', 
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <Award size={40} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Gamification</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: '1.6' }}>Gagnez des points, badges et streaks pour motiver votre apprentissage quotidien.</p>
            </div>
          </div>
        </div>
      </section>
      
      <style>{`
        .why-choose-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }
      `}</style>
    </div>
  );
}
