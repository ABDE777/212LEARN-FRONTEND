import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import heroAnimation from '../lotties/Hero section.json';
import {
  BookOpen, Users, Video, Code, Database, Globe, Award, User, Zap,
  Star, ArrowRight, CheckCircle2, Sparkles, GraduationCap, ShieldCheck, PlayCircle
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useCourses } from '../hooks/useCourses';
import { usePublicStats } from '../hooks/usePublicStats';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedLogo from '../components/AnimatedLogo';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const { courses, loading: coursesLoading } = useCourses({ limit: 6 });
  const { stats, loading: statsLoading } = usePublicStats();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.section-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

  // Featured courses to show (up to 3 real courses, fallback if empty)
  const featuredCourses = courses && courses.length > 0 ? courses.slice(0, 3) : [
    {
      id: 'demo-1',
      title: 'Développement Web Fullstack avec React & Node.js',
      description: 'Maîtrisez les technologies modernes pour créer des applications web complètes et évolutives.',
      price: 299,
      level: 'Intermédiaire',
      category: { name: 'Développement Web' },
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    },
    {
      id: 'demo-2',
      title: 'Fondamentaux des Bases de Données SQL & PostgreSQL',
      description: 'Concevez, modélisez et optimisez vos bases de données relationnelles professionnelles.',
      price: 199,
      level: 'Débutant',
      category: { name: 'Base de données' },
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
    },
    {
      id: 'demo-3',
      title: 'Algorithmique & Structures de Données Avancées',
      description: 'Renforcez votre logique de programmation pour résoudre des problèmes complexes.',
      price: 249,
      level: 'Avancé',
      category: { name: 'Programmation' },
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      {/* ── 1. Hero Section ── */}
      <section className="hero-section">
        <div className="floating-objects">
          <div className="floating-circle" style={{ top: '10%', left: '5%', width: '90px', height: '90px', background: 'var(--primary)', opacity: 0.2, animationDelay: '0s', animationDuration: '7s' }}></div>
          <div className="floating-circle" style={{ top: '60%', left: '10%', width: '65px', height: '65px', background: 'var(--accent)', opacity: 0.25, animationDelay: '-2s', animationDuration: '5s' }}></div>
          <div className="floating-circle" style={{ top: '30%', right: '15%', width: '110px', height: '110px', background: 'var(--secondary)', opacity: 0.12, animationDelay: '-4s', animationDuration: '9s' }}></div>
          <div className="floating-circle" style={{ bottom: '20%', right: '8%', width: '75px', height: '75px', background: 'var(--primary)', opacity: 0.15, animationDelay: '-1s', animationDuration: '6s' }}></div>
          <div className="floating-blob" style={{ top: '20%', left: '20%', width: '280px', height: '280px', background: 'rgba(193, 101, 47, 0.09)', animationDelay: '0s' }}></div>
          <div className="floating-blob" style={{ bottom: '10%', right: '20%', width: '220px', height: '220px', background: 'rgba(27, 75, 90, 0.07)', animationDelay: '-4s' }}></div>
        </div>

        <div className="hero-left" style={{ zIndex: 1 }}>
          <AnimatedLogo size={420} />
          <div className="hero-text-wrapper">
            <div className="hero-trust-badge">
              <span className="badge-dot"></span>
              <Zap size={13} color="var(--primary)" />
              Plateforme officielle d'apprentissage 212LEARN
            </div>
            <h1 className="hero-title">
              Élevez votre parcours <span style={{ color: 'var(--primary)', textDecoration: 'underline', textDecorationColor: 'rgba(193,101,47,0.3)', textUnderlineOffset: '6px' }}>d'apprentissage</span>.
            </h1>
            <p className="hero-desc">
              La plateforme d'e-learning ultime conçue pour vous accompagner tout au long de votre cursus en informatique. Apprenez, connectez-vous et développez vos compétences.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to={getDashboardPath(user?.role)} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '16px' }}>
                  Accéder à mon espace →
                </Link>
              ) : (
                <Link to="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '16px' }}>
                  Commencer gratuitement
                </Link>
              )}
              <Link to="/courses" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.8)', color: 'var(--text-color)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', backdropFilter: 'blur(8px)', borderRadius: '16px' }}>
                Parcourir les cours
              </Link>
            </div>
          </div>
        </div>
        
        <div className="hero-right">
          <div style={{ 
            position: 'absolute', 
            width: '450px', 
            height: '450px', 
            background: 'radial-gradient(circle, rgba(193, 101, 47, 0.15) 0%, transparent 70%)', 
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            animation: 'blobFloat 8s ease-in-out infinite'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '550px' }}>
            <Lottie animationData={heroAnimation} loop={true} />
          </div>
        </div>
      </section>

      {/* ── 2. Key Stats Counter Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '3.5rem 2rem', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {statsLoading ? (
            <LoadingSpinner />
          ) : (
            [
              { icon: <GraduationCap size={28} color="#f093fb" />, number: `+${stats?.totalUsers || 0}`, label: 'Étudiants passionnés' },
              { icon: <BookOpen size={28} color="#43e97b" />, number: `+${stats?.totalCourses || 0}`, label: 'Cours & Formations' },
              { icon: <ShieldCheck size={28} color="#4facfe" />, number: `${stats?.satisfactionRate || 98}%`, label: 'Taux de satisfaction' },
              { icon: <Award size={28} color="#fee140" />, number: `+${stats?.totalInstructors || 0}`, label: 'Instructeurs certifiés' },
            ].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{s.number}</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── 3. Categories Marquee ── */}
      <section className="section-animate" style={{ background: 'var(--surface-color)', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="floating-objects">
          <div className="floating-circle" style={{ top: '15%', left: '3%', width: '90px', height: '90px', background: 'var(--accent)', opacity: 0.14, animationDelay: '-3s' }}></div>
          <div className="floating-circle" style={{ top: '70%', left: '8%', width: '50px', height: '50px', background: 'var(--primary)', opacity: 0.2, animationDelay: '-1s' }}></div>
          <div className="floating-circle" style={{ top: '20%', right: '5%', width: '75px', height: '75px', background: 'var(--secondary)', opacity: 0.09, animationDelay: '-5s' }}></div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.3rem', position: 'relative', zIndex: 1, fontWeight: 800 }}>
          Explorer nos domaines d'apprentissage
        </h2>

        {catLoading ? (
          <LoadingSpinner />
        ) : catError ? (
          <div style={{ textAlign: 'center', color: 'var(--error-color)', padding: '0 2rem' }}>{catError}</div>
        ) : (() => {
          const FALLBACK = [
            { id: 'f1', name: 'Informatique & Code', description: 'Algorithmes, Java, Python & C++.', icon: 'BookOpen' },
            { id: 'f2', name: 'Sessions Live Interactives', description: 'Rencontrez vos enseignants en direct.', icon: 'Video' },
            { id: 'f3', name: 'Suivi Pédagogique', description: 'Évaluation continue et devoirs.', icon: 'Users' },
            { id: 'f4', name: 'Développement Web', description: 'React, Node.js, HTML5, CSS3.', icon: 'Globe' },
            { id: 'f5', name: 'Bases de Données', description: 'PostgreSQL, SQL & NoSQL.', icon: 'Database' },
          ];
          const cards = (allCategories && allCategories.length > 0 ? allCategories : FALLBACK);
          const loop = [...cards, ...cards];

          return (
            <div className="cat-marquee-wrapper">
              <div className="cat-fade cat-fade-left" />
              <div className="cat-fade cat-fade-right" />
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
                        <Icon size={26} color="var(--primary)" />
                      </div>
                      <h3 className="cat-card-title">{category.name}</h3>
                      <p className="cat-card-desc">
                        {category.description || 'Explorez nos cours dans cette spécialité'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <style>{`
          .cat-marquee-wrapper { position: relative; overflow: hidden; }
          .cat-marquee-track {
            display: flex; gap: 1.5rem; width: max-content;
            animation: catScroll 32s linear infinite; padding: 0.5rem 0 1.5rem;
          }
          .cat-marquee-wrapper:hover .cat-marquee-track { animation-play-state: paused; }
          @keyframes catScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .cat-card {
            flex-shrink: 0; width: 230px; padding: 1.75rem 1.5rem; background: #fff;
            border: 1px solid var(--border-color); borderRadius: 20px; box-shadow: var(--shadow-sm);
            text-decoration: none; transition: all 0.25s ease; cursor: pointer;
            display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem;
          }
          .cat-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: var(--primary); }
          .cat-card-icon {
            width: 48px; height: 48px; borderRadius: 14px; background: rgba(193, 101, 47, 0.08);
            display: flex; align-items: center; justify-content: center; transition: background 0.25s;
          }
          .cat-card:hover .cat-card-icon { background: var(--primary); }
          .cat-card:hover .cat-card-icon svg { color: #fff !important; }
          .cat-card-title { font-size: 0.95rem; font-weight: 700; color: var(--text-color); margin: 0; }
          .cat-card-desc { font-size: 0.8rem; color: var(--secondary); margin: 0; line-height: 1.5; }
          .cat-fade { position: absolute; top: 0; bottom: 0; width: 120px; z-index: 2; pointer-events: none; }
          .cat-fade-left { left: 0; background: linear-gradient(to right, var(--surface-color) 0%, transparent 100%); }
          .cat-fade-right { right: 0; background: linear-gradient(to left, var(--surface-color) 0%, transparent 100%); }
        `}</style>
      </section>

      {/* ── 4. Featured Courses Showcase ── */}
      <section className="section-animate" style={{ padding: '5rem 2rem', background: '#fff', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🌟 Formations populaires
              </span>
              <h2 style={{ fontSize: '2.3rem', fontWeight: 800, margin: '0.3rem 0 0', color: 'var(--text-color)' }}>
                Découvrez nos cours phares
              </h2>
            </div>
            <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
              Voir tout le catalogue <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {featuredCourses.map((c) => (
              <div key={c.id} style={{
                background: 'var(--bg-color)',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--neu-shadow-raised-sm)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-sm)'; }}
              >
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {c.level || 'Tous niveaux'}
                  </span>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {c.category?.name || 'Informatique'}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0 0.6rem', color: 'var(--text-color)', lineHeight: 1.4 }}>
                      {c.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {Number(c.price) > 0 ? `${c.price} MAD` : 'Gratuit'}
                    </span>
                    <Link to={`/courses/${c.id}`} style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'opacity 0.2s' }}>
                      Détails →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. How It Works Process ── */}
      <section className="section-animate" style={{ padding: '5rem 2rem', background: 'var(--surface-color)', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🚀 Processus simple
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, margin: '0.4rem 0 3.5rem', color: 'var(--text-color)' }}>
            Comment fonctionne 212LEARN ?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative' }}>
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous en 30 secondes pour accéder immédiatement à votre tableau de bord personnel.' },
              { step: '02', title: 'Suivez vos cours & visios', desc: 'Accédez aux vidéos, exercices et séances en direct avec des instructeurs qualifiés.' },
              { step: '03', title: 'Validez vos compétences', desc: 'Passez les quiz, validez vos devoirs et obtenez vos attestations certifiées.' },
            ].map((st, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem 2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', textAlign: 'left', position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(193,101,47,0.15)', lineHeight: 1, marginBottom: '1rem' }}>
                  {st.step}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-color)' }}>{st.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', margin: 0, lineHeight: 1.6 }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Why Choose Us Section ── */}
      <section className="section-animate" style={{ padding: '5rem 2rem', background: '#fff', position: 'relative', overflow: 'hidden', color: 'var(--text-color)' }}>
        <div className="floating-objects">
          <div className="floating-circle" style={{ top: '10%', left: '6%', width: '85px', height: '85px', background: 'var(--primary)', opacity: 0.08, animationDelay: '-4s' }}></div>
          <div className="floating-circle" style={{ top: '65%', left: '10%', width: '55px', height: '55px', background: 'var(--accent)', opacity: 0.12, animationDelay: '-2s' }}></div>
          <div className="floating-circle" style={{ top: '25%', right: '7%', width: '95px', height: '95px', background: 'var(--secondary)', opacity: 0.06, animationDelay: '-6s' }}></div>
        </div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.3rem', color: 'var(--text-color)', fontWeight: 800 }}>
            Pourquoi nous choisir ?
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '1.1rem', color: 'var(--secondary)', opacity: 0.8 }}>
            Une expérience pédagogique complète et adaptée à vos ambitions
          </p>
          
          <div className="card-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <BookOpen size={38} color="#fff" />, title: 'Programme structuré', desc: 'Des contenus méthodiques et révisés par des experts en informatique.' },
              { icon: <Video size={38} color="#fff" />, title: 'Sessions Live', desc: 'Rejoignez vos cours interactifs en visioconférence directe.' },
              { icon: <Users size={38} color="#fff" />, title: 'Accompagnement continu', desc: 'Retours personnalisés sur vos rendus et suivi personnalisé.' },
              { icon: <Award size={38} color="#fff" />, title: 'Gamification & Badges', desc: 'Cumulez des points et récompenses pour mesurer vos progrès.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="why-choose-card" style={{ 
                background: 'var(--bg-color)', 
                borderRadius: '24px', 
                padding: '2.5rem 2rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.7)',
                transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease',
                boxShadow: 'var(--neu-shadow-raised)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ 
                  width: '75px', height: '75px', 
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                  borderRadius: '22px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 8px 20px rgba(193,101,47,0.3)',
                  transition: 'transform 0.3s ease'
                }}>
                  {icon}
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem', color: 'var(--secondary)', fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: '0.93rem', color: 'var(--text-color)', lineHeight: '1.65', opacity: 0.8 }}>{desc}</p>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--primary), var(--accent))', opacity: 0, transition: 'opacity 0.3s' }} className="card-accent-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Call To Action Banner ── */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-color)' }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, var(--primary) 0%, #d46b28 100%)',
          borderRadius: '32px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 20px 60px rgba(193,101,47,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Prêt à faire décoller vos compétences ?
          </h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Rejoignez des milliers d'apprenants et accédez immédiatement à l'ensemble des cours et ressources pédagogiques.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to={getDashboardPath(user?.role)} style={{ padding: '14px 32px', borderRadius: '16px', background: '#fff', color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                Accéder à mon espace →
              </Link>
            ) : (
              <Link to="/signup" style={{ padding: '14px 32px', borderRadius: '16px', background: '#fff', color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                Créer un compte gratuit
              </Link>
            )}
            <Link to="/courses" style={{ padding: '14px 28px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(6px)' }}>
              Découvrir les cours
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .why-choose-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(193,101,47,0.15), var(--neu-shadow-raised-lg);
        }
        .why-choose-card:hover .card-accent-line {
          opacity: 1 !important;
        }
        .why-choose-card:hover > div:first-child {
          transform: scale(1.08) rotate(-3deg);
        }
      `}</style>
    </div>
  );
}

