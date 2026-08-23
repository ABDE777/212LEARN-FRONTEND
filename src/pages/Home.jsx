import { Link } from 'react-router-dom';
import TinderSwipeCategories from '../components/TinderSwipeCategories';
import { useEffect } from 'react';
import {
  BookOpen, Users, Globe, Award,
  ArrowRight, GraduationCap, ShieldCheck, PlayCircle, Laptop,
  ClipboardCheck, MonitorPlay, Info
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useCourses } from '../hooks/useCourses';
import { usePublicStats } from '../hooks/usePublicStats';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import bannerImg from '../assets/banner.png';

export default function Home() {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const { courses } = useCourses({ limit: 6 });
  const { stats, loading: statsLoading } = usePublicStats();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
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

  const flattenCategories = (cats) => {
    let result = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children?.length > 0) result = result.concat(flattenCategories(cat.children));
    }
    return result;
  };

  const allCategories = flattenCategories(categories || []);

  // Only real courses from the API — no demo/hardcoded fallback (avoids showing
  // fake courses when the catalog is empty or the server is down).
  const featuredCourses = (courses || []).slice(0, 3);

  const audience = [
    {
      icon: GraduationCap,
      title: 'Étudiants en informatique',
      desc: 'Renforcez vos cours universitaires avec des modules pratiques, des quiz et un suivi clair de votre progression.',
    },
    {
      icon: Laptop,
      title: 'Autodidactes & reconversions',
      desc: 'Suivez un parcours structuré à votre rythme pour passer d’un débutant motivé à un profil prêt pour le marché.',
    },
    {
      icon: Users,
      title: 'Instructeurs & formateurs',
      desc: 'Publiez vos cours, animez des sessions live et accompagnez vos apprenants depuis un espace dédié.',
    },
  ];

  const platformFeatures = [
    {
      icon: MonitorPlay,
      title: 'Cours vidéo + live',
      desc: 'Regardez des leçons à la demande et rejoignez des classes virtuelles pour poser vos questions en direct.',
    },
    {
      icon: ClipboardCheck,
      title: 'Quiz & devoirs',
      desc: 'Validez ce que vous apprenez avec des évaluations, des rendus et un retour pédagogique.',
    },
    {
      icon: PlayCircle,
      title: 'Espace étudiant',
      desc: 'Retrouvez vos inscriptions, votre progression, vos notes et vos ressources au même endroit.',
    },
    {
      icon: Award,
      title: 'Attestations de réussite',
      desc: 'Terminez un parcours et obtenez une attestation pour valoriser vos compétences.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      {/* Hero Section — 212Learn Brand Hero */}
      <section className="about-hero-section-3">
        <div className="about-hero-container">
          <div className="about-hero-relative">
            {/* Top Bar with Brand Badge & Quick Links */}
            <div className="hero-top-bar">
              <div className="hero-brand-tag">
                <span className="star-icon">✱</span>
                <span className="tag-text">212LEARN — L'ÉCOLE EN LIGNE DU NUMÉRIQUE</span>
              </div>
              <div className="hero-social-links">
                <Link to="/courses" className="social-icon-btn" title="Catalogue des cours">
                  <BookOpen size={16} color="var(--primary)" />
                </Link>
                <Link to="/about" className="social-icon-btn" title="À propos de 212Learn">
                  <Info size={16} color="var(--secondary)" />
                </Link>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="LinkedIn">
                  <Globe size={16} color="var(--primary)" />
                </a>
              </div>
            </div>

            {/* Inverted Clipped Visual Banner */}
            <figure className="hero-clipped-figure">
              <svg className="hero-svg-clip" width="100%" height="100%" viewBox="0 0 100 40">
                <defs>
                  <clipPath id="clip-inverted-212" clipPathUnits="objectBoundingBox">
                    <path d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z" />
                  </clipPath>
                </defs>

                <image
                  clipPath="url(#clip-inverted-212)"
                  preserveAspectRatio="xMidYMid slice"
                  width="100%"
                  height="100%"
                  href={bannerImg}
                  xlinkHref={bannerImg}
                />
              </svg>
            </figure>

            {/* Embedded Live Stats */}
            <div className="hero-stats-row">
              <div className="hero-stat-pill">
                <span className="stat-num">+100</span>
                <span className="stat-txt">Cours & Formations</span>
                <span className="stat-sep">|</span>
              </div>
              <div className="hero-stat-pill">
                <span className="stat-num">+2 500</span>
                <span className="stat-txt">Apprenants Inscrits</span>
              </div>

              <div className="hero-stat-pill-right">
                <div className="stat-pill-large">
                  <span className="stat-num">98%</span>
                  <span className="stat-txt-upper">SATISFACTION</span>
                </div>
                <div className="stat-pill-sub">
                  <span className="stat-num">100%</span>
                  <span className="stat-txt">En Français & Adapté au Maroc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="hero-grid-content">
            <div className="hero-left-col">
              <h1 className="hero-cut-title">
                Façonnez vos compétences numériques pour bâtir votre avenir.
              </h1>
              <div className="hero-two-paragraphs">
                <p>
                  212Learn est la plateforme d’apprentissage en ligne marocaine dédiée aux métiers du futur. 
                  Développement web, Data Science, Cybersécurité et Design UX/UI : apprenez avec des programmes structurés et révisés.
                </p>
                <p>
                  Suivez des leçons vidéo immersives, participez à des sessions live animées par des experts du secteur, 
                  réalisez des projets concrets et obtenez des certificats valorisants pour votre carrière.
                </p>
              </div>
            </div>

            <div className="hero-right-col">
              <div className="hero-cta-box">
                <div className="hero-brand-accent">212LEARN</div>
                <div className="hero-brand-subtitle">Plateforme E-Learning Marocaine</div>
                <p className="hero-cta-prompt">
                  Prêt à transformer vos idées en projets réels et à propulser votre carrière tech ?
                </p>

                {isAuthenticated ? (
                  <Link to={getDashboardPath(user?.role)} className="hero-cta-button">
                    MON ESPACE <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/courses" className="hero-cta-button">
                    VOIR LE CATALOGUE <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preuve sociale légère — Accueil */}
      <section className="home-stats-section">
        <div className="home-stats-grid">
          {statsLoading ? (
            <LoadingSpinner />
          ) : (
            [
              { icon: <GraduationCap size={26} color="#f093fb" />, number: `+${stats?.totalUsers || 0}`, label: 'Apprenants inscrits' },
              { icon: <BookOpen size={26} color="#43e97b" />, number: `+${stats?.totalCourses || 0}`, label: 'Cours au catalogue' },
              { icon: <Users size={26} color="#4facfe" />, number: `+${stats?.totalInstructors || 0}`, label: 'Instructeurs' },
              { icon: <ShieldCheck size={26} color="#fee140" />, number: `${stats?.satisfactionRate || 98}%`, label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="home-stat-card">
                <div className="home-stat-icon">
                  {s.icon}
                </div>
                <div className="home-stat-number">{s.number}</div>
                <div className="home-stat-label">{s.label}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pour qui — Accueil oriente le visiteur */}
      <section className="section-animate home-section-padding" style={{ background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Pour qui ?
            </span>
            <h2 className="home-section-title" style={{ fontWeight: 800, margin: '0.4rem 0 0.75rem', color: 'var(--text-color)' }}>
              Une plateforme pensée pour apprendre et enseigner
            </h2>
            <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '1.05rem', maxWidth: '640px', marginInline: 'auto', lineHeight: 1.6 }}>
              Que vous cherchiez un cours, un parcours complet ou un outil pour former, 212Learn vous donne un point d&apos;entrée clair.
            </p>
          </div>
          <div className="audience-grid">
            {audience.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="audience-card">
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(193,101,47,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: 'var(--secondary)' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-color)', opacity: 0.85 }}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Domaines / catalogue */}
      <section className="section-animate" style={{ background: 'var(--surface-color)', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        {catLoading ? (
          <LoadingSpinner />
        ) : catError ? (
          <div style={{ textAlign: 'center', color: 'var(--error-color)', padding: '0 2rem' }}>{catError}</div>
        ) : (() => {
          const FALLBACK = [
            { id: 'f1', name: 'Programmation', description: 'Algorithmes, Java, Python, C++.' },
            { id: 'f2', name: 'Développement Web', description: 'HTML, CSS, React, Node.js.' },
            { id: 'f3', name: 'Bases de Données', description: 'SQL, PostgreSQL, modélisation.' },
            { id: 'f4', name: 'Sessions Live', description: 'Classes virtuelles avec instructeurs.' },
            { id: 'f5', name: 'Projets pratiques', description: 'Exercices et cas concrets.' },
          ];
          const cards = allCategories.length > 0 ? allCategories : FALLBACK;

          return (
            <TinderSwipeCategories 
              categories={cards}
              onSelectCategory={(category) => window.location.href = `/courses?category=${category.id}`}
            />
          );
        })()}
      </section>

      {/* Cours phares — hidden entirely when there are no real courses */}
      {featuredCourses.length > 0 && (
      <section className="section-animate home-section-padding" style={{ background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Commencer ici
              </span>
              <h2 className="home-section-title" style={{ fontWeight: 800, margin: '0.3rem 0 0', color: 'var(--text-color)' }}>
                Cours populaires
              </h2>
            </div>
            <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
              Tout le catalogue <ArrowRight size={18} />
            </Link>
          </div>

          <div className="popular-courses-grid">
            {featuredCourses.map((c) => (
              <div key={c.id} className="popular-course-card">
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
                    <Link to={`/courses/${c.id}`} style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                      Voir le cours
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Comment ça marche */}
      <section className="section-animate home-section-padding" style={{ background: 'var(--surface-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            En 3 étapes
          </span>
          <h2 className="home-section-title" style={{ fontWeight: 800, margin: '0.4rem 0 3rem', color: 'var(--text-color)' }}>
            Comment démarrer sur 212Learn
          </h2>

          <div className="steps-grid">
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscription gratuite. Vous accédez à votre tableau de bord étudiant (ou instructeur).' },
              { step: '02', title: 'Choisissez un cours', desc: 'Parcourez le catalogue, consultez le programme, puis inscrivez-vous au parcours qui vous convient.' },
              { step: '03', title: 'Apprenez et validez', desc: 'Suivez les vidéos et lives, faites les quiz et devoirs, puis obtenez votre attestation.' },
            ].map((st) => (
              <div key={st.step} className="step-card">
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

      {/* Ce que vous trouvez sur la plateforme */}
      <section className="section-animate home-section-padding" style={{ background: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sur la plateforme
            </span>
            <h2 className="home-section-title" style={{ fontWeight: 800, margin: '0.4rem 0 0.75rem', color: 'var(--text-color)' }}>
              Tout ce qu&apos;il faut pour progresser
            </h2>
            <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '1.05rem', maxWidth: '560px', marginInline: 'auto' }}>
              Des outils concrets — pas seulement des vidéos isolées.
            </p>
          </div>

          <div className="card-stagger features-grid">
            {platformFeatures.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="why-choose-card feature-card"
              >
                <div className="feature-card-icon">
                  <Icon size={30} color="#fff" />
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem', color: 'var(--secondary)', fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: '0.93rem', color: 'var(--text-color)', lineHeight: '1.65', opacity: 0.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lien doux vers À propos + CTA */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-color)' }}>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto 2rem',
            textAlign: 'center',
            padding: '0 1rem 2rem',
          }}
        >
          <p style={{ margin: '0 0 0.75rem', color: 'var(--secondary)', fontSize: '1rem' }}>
            Envie d&apos;en savoir plus sur notre projet et nos valeurs ?
          </p>
          <Link to="/about" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            Découvrir qui nous sommes <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
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
          }}
        >
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px', color: '#fff' }}>
            Prêt à choisir votre premier cours ?
          </h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '620px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Créez un compte, ouvrez le catalogue et commencez dès aujourd&apos;hui — à votre rythme.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to={getDashboardPath(user?.role)} style={{ padding: '14px 32px', borderRadius: '16px', background: '#fff', color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                Mon espace →
              </Link>
            ) : (
              <Link to="/signup" style={{ padding: '14px 32px', borderRadius: '16px', background: '#fff', color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                Créer un compte
              </Link>
            )}
            <Link to="/courses" style={{ padding: '14px 28px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(6px)' }}>
              Ouvrir le catalogue
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .why-choose-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(193,101,47,0.15), var(--neu-shadow-raised-lg);
        }
        .why-choose-card:hover > div:first-child {
          transform: scale(1.08) rotate(-3deg);
        }
      `}</style>
    </div>
  );
}
