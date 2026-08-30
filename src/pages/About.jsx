import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Heart, Zap, Globe, Quote, ArrowRight, MapPin,
  Lightbulb, Handshake, Eye, Flag, Users
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimatedLogo from '../components/AnimatedLogo';
import { initialsAvatar } from '../utils/avatarPlaceholder';
import SEOHead from '../components/SEOHead';
import BackgroundBlobs from '../components/about/BackgroundBlobs';
import SectionDivider from '../components/about/SectionDivider';
import GlowCard from '../components/about/GlowCard';
import { usePublicTestimonials } from '../hooks/usePublicTestimonials';
import { usePublicInstructors } from '../hooks/usePublicInstructors';
import LoadingSpinner from '../components/LoadingSpinner';
import CoverflowCarousel from '../components/CoverflowCarousel';
import TeamShowcase from '../components/TeamShowcase';

const BG_SAND = '#F5EDE4';
const BG_WHITE = '#ffffff';

const DEFAULT_INSTRUCTOR_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&h=640&fit=crop&q=80',
    alt: 'Dr. Sofia Benali',
    title: 'Dr. Sofia Benali',
    subtitle: 'Lead AI Researcher & Instructor',
    meta: [
      { label: 'Spécialité', value: 'Machine Learning & Python' },
      { label: 'Expérience', value: '9+ ans en R&D Tech' },
      { label: 'Vérification', value: '✔ Formateur Vérifié' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=640&fit=crop&q=80',
    alt: 'Karim Mansouri',
    title: 'Karim Mansouri',
    subtitle: 'Principal Cloud Architect',
    meta: [
      { label: 'Spécialité', value: 'React, Node.js & AWS' },
      { label: 'Expérience', value: '12 ans d’expérience' },
      { label: 'Vérification', value: '✔ Formateur Vérifié' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=640&fit=crop&q=80',
    alt: 'Amine El Amrani',
    title: 'Amine El Amrani',
    subtitle: 'Senior Cyber Security Consultant',
    meta: [
      { label: 'Spécialité', value: 'Ethical Hacking & Linux' },
      { label: 'Expérience', value: '8 ans d’expérience' },
      { label: 'Vérification', value: '✔ Formateur Vérifié' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&h=640&fit=crop&q=80',
    alt: 'Nadia Tazi',
    title: 'Nadia Tazi',
    subtitle: 'Head of Product Design',
    meta: [
      { label: 'Spécialité', value: 'Figma, Design Systems & UX' },
      { label: 'Expérience', value: '7 ans d’expérience' },
      { label: 'Vérification', value: '✔ Formateur Vérifié' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&h=640&fit=crop&q=80',
    alt: 'Youssef Chraibi',
    title: 'Youssef Chraibi',
    subtitle: 'Staff DevOps & Database Engineer',
    meta: [
      { label: 'Spécialité', value: 'PostgreSQL, Docker & CI/CD' },
      { label: 'Expérience', value: '10+ ans d’expérience' },
      { label: 'Vérification', value: '✔ Formateur Vérifié' },
    ],
  },
];

function About() {
  const { testimonials, loading: testimonialsLoading } = usePublicTestimonials();
  const { instructors, loading: instructorsLoading } = usePublicInstructors();

  // Map real database instructors to Coverflow Carousel slides with maximum trust fields
  const instructorSlides = instructors.length > 0
    ? instructors.map((inst) => {
        const name = `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || 'Instructeur';
        const profile = inst.instructorProfile || {};

        const position = profile.position || inst.position;
        const organization = profile.organization || inst.organization;
        const specialization = profile.specialization || inst.specialization;
        const expertiseDomain = profile.expertiseDomain || inst.expertiseDomain;
        const experienceYears = profile.experienceYears || inst.experienceYears;

        // Build position & organization subtitle
        const subtitleText = position && organization
          ? `${position} @ ${organization}`
          : organization
          ? `${specialization || expertiseDomain || 'Formateur'} @ ${organization}`
          : specialization || expertiseDomain || inst.bio || 'Formateur 212Learn';

        // Build specialty & experience labels from signup DB fields
        const mainSkill = specialization || expertiseDomain || (Array.isArray(inst.skills) && inst.skills.length > 0 ? inst.skills.join(', ') : 'Technologies Numériques');
        const expText = experienceYears ? `${experienceYears} ans d’exp.` : 'Formateur Vérifié';
        const courseCount = inst.coursesInstructed?.length || 1;

        return {
          src: inst.avatar || initialsAvatar(name),
          alt: name,
          title: name,
          subtitle: subtitleText,
          meta: [
            { label: 'Spécialité', value: mainSkill },
            { label: 'Expérience', value: expText },
            { label: 'Formations', value: `${courseCount} Cours publiés` },
          ],
        };
      })
    : DEFAULT_INSTRUCTOR_SLIDES;

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

  const missionVision = [
    {
      icon: Flag,
      label: 'Mission',
      title: 'Rendre l’informatique accessible',
      text: 'Offrir aux apprenants francophones — au Maroc et ailleurs — des formations claires, suivies et utiles pour avancer dans leurs études ou leur carrière.',
    },
    {
      icon: Eye,
      label: 'Vision',
      title: 'Une référence de confiance',
      text: 'Devenir la plateforme de référence où étudiants et formateurs se rencontrent pour apprendre l’informatique avec sérieux, proximité et qualité.',
    },
  ];

  const storyBeats = [
    {
      year: 'Pourquoi « 212 »',
      text: '212 est l’indicatif téléphonique du Maroc. Notre nom ancre le projet dans son territoire tout en s’ouvrant à toute la francophonie.',
    },
    {
      year: 'Le constat',
      text: 'Beaucoup de ressources en ligne sont dispersées, en anglais uniquement, ou sans vrai accompagnement. Les étudiants avaient besoin d’un lieu unique, structuré et en français.',
    },
    {
      year: 'La réponse',
      text: '212Learn regroupe cours, classes virtuelles, quiz et suivi dans une même plateforme — pensée pour les réalités locales (niveaux, langue, rythme, accessibilité).',
    },
  ];

  const values = [
    {
      icon: Target,
      title: 'Exigence pédagogique',
      desc: 'Des programmes structurés, des objectifs clairs et un contenu révisé pour rester utile et à jour.',
      accent: 'linear-gradient(135deg, #C1652F 0%, #E8A33D 100%)',
    },
    {
      icon: Heart,
      title: 'Proximité humaine',
      desc: 'Derrière chaque cours : des instructeurs, des lives et un suivi — pas seulement des vidéos anonymes.',
      accent: 'linear-gradient(135deg, #1B4B5A 0%, #2A6F84 100%)',
    },
    {
      icon: Zap,
      title: 'Pratique avant tout',
      desc: 'Exercices, projets et évaluations pour transformer la théorie en compétences concrètes.',
      accent: 'linear-gradient(135deg, #E8A33D 0%, #C1652F 100%)',
    },
    {
      icon: Globe,
      title: 'Accessibilité',
      desc: 'Apprendre depuis chez soi, à son rythme, avec une interface simple et un parcours compréhensible.',
      accent: 'linear-gradient(135deg, #1B4B5A 0%, #C1652F 100%)',
    },
  ];

  const whoWeServe = [
    {
      icon: Users,
      title: 'Les apprenants',
      desc: 'Étudiants, autodidactes et personnes en reconversion qui veulent un cadre sérieux pour progresser en informatique.',
    },
    {
      icon: Lightbulb,
      title: 'Les instructeurs',
      desc: 'Formateurs et professionnels qui souhaitent transmettre leur savoir avec les bons outils (cours, live, devoirs).',
    },
    {
      icon: Handshake,
      title: 'La communauté',
      desc: 'Un écosystème où l’on apprend ensemble — questions, feedback, et progression partagée.',
    },
  ];

  return (
    <div className="about-page">
      <SEOHead
        title="À propos"
        description="212Learn est une plateforme e-learning marocaine : cours en ligne de programmation, technologie et design, sessions live en cohorte, quiz et certificats, en français."
      />
      <Navbar />

      {/* Hero */}
      <section className="about-hero-modern">
        <BackgroundBlobs />
        <div className="floating-objects" aria-hidden="true">
          <div className="floating-circle" style={{ top: '12%', left: '6%', width: '80px', height: '80px', background: 'var(--primary)', opacity: 0.16, animationDuration: '7s' }} />
          <div className="floating-circle" style={{ bottom: '18%', right: '10%', width: '70px', height: '70px', background: 'var(--accent)', opacity: 0.2, animationDelay: '-2s' }} />
        </div>

        <div className="about-hero-inner">
          <div className="about-hero-copy anim-slide-left">
            <span className="about-eyebrow">
              <MapPin size={14} />
              À propos de 212Learn
            </span>
            <h1>
              Nous construisons une école en ligne{' '}
              <span style={{ color: 'var(--primary)' }}>ancrée au Maroc</span>, ouverte à la francophonie.
            </h1>
            <p>
              212Learn n’est pas seulement un catalogue de vidéos : c’est un projet éducatif né
              d’un besoin réel — apprendre l’informatique en français, avec un cadre clair et un suivi humain.
            </p>
            <div className="about-hero-actions">
              <Link to="/courses" className="btn-primary about-micro-btn" style={{ padding: '14px 28px', borderRadius: '14px' }}>
                Voir nos formations
              </Link>
              <Link
                to="/"
                className="btn-secondary about-micro-btn"
                style={{
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.75)',
                  color: 'var(--text-color)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                Retour à l’accueil
              </Link>
            </div>
          </div>

          <div className="about-hero-visual anim-slide-right">
            <div className="about-lottie-glow" aria-hidden="true" />
            <AnimatedLogo size={380} />
          </div>
        </div>
        <SectionDivider fill={BG_WHITE} flip={true} />
      </section>

      {/* Mission & Vision */}
      <section className="section-animate about-section-pad about-section-white about-section-relative">
        <BackgroundBlobs variant="cool" />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">Notre boussole</span>
            <h2>Mission & vision</h2>
            <p>Ce que nous voulons accomplir — et où nous voulons aller.</p>
          </div>

          <div className="about-mission-grid">
            {missionVision.map(({ icon: Icon, label, title, text }) => (
              <GlowCard
                key={label}
                icon={<Icon size={26} />}
                label={label}
                title={title}
                description={text}
              />
            ))}
          </div>
        </div>
        <SectionDivider fill={BG_SAND} flip={true} />
      </section>

      {/* Histoire */}
      <section className="section-animate about-story about-section-sand about-section-relative">
        <BackgroundBlobs />
        <div className="about-container about-story-grid">
          <div>
            <span className="about-eyebrow muted">Notre histoire</span>
            <h2>D’un constat local à une plateforme ouverte</h2>
            <p>
              Le projet 212Learn est né au Maroc, porté par des personnes convaincues que
              la qualité pédagogique ne doit pas dépendre d’un campus physique ni d’une barrière de langue.
            </p>
            <p>
              Nous avons conçu une plateforme où l’on peut s’inscrire à un cours, suivre des leçons,
              rejoindre un live, rendre un devoir et mesurer sa progression — sans se perdre entre dix outils différents.
            </p>
            <p style={{ marginBottom: 0 }}>
              Aujourd’hui, nous continuons à faire grandir ce projet avec la même exigence :
              utile, lisible, et proche des apprenants.
            </p>
          </div>

          <div className="about-milestone-grid">
            {storyBeats.map((beat) => (
              <GlowCard
                key={beat.year}
                label={beat.year}
                description={beat.text}
              />
            ))}
          </div>
        </div>
        <SectionDivider fill={BG_WHITE} flip={true} />
      </section>

      {/* Qui nous servons */}
      <section className="section-animate about-section-pad about-section-white about-section-relative">
        <BackgroundBlobs variant="cool" />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">Notre public</span>
            <h2>Pour qui existons-nous ?</h2>
            <p>Trois publics, un même engagement : faire progresser les compétences numériques.</p>
          </div>

          <div className="about-audience-grid">
            {whoWeServe.map(({ icon: Icon, title, desc }) => (
              <GlowCard
                key={title}
                icon={<Icon size={26} />}
                title={title}
                description={desc}
              />
            ))}
          </div>
        </div>
        <SectionDivider fill={BG_SAND} flip={true} />
      </section>

      {/* Valeurs — Creative Bento Cards */}
      <section className="section-animate about-section-pad about-section-sand about-section-relative">
        <BackgroundBlobs />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">Ce qui nous guide</span>
            <h2>Nos valeurs</h2>
            <p>Les principes que nous appliquons dans le produit, la pédagogie et le support.</p>
          </div>

          <div className="creative-values-grid card-stagger">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="creative-value-card">
                  <div className="value-card-glow-bar" style={{ background: v.accent }} />
                  <div className="value-card-top">
                    <span className="value-number-badge" style={{ background: v.accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      0{idx + 1}
                    </span>
                    <div className="value-icon-wrapper" style={{ background: v.accent }}>
                      <Icon size={24} color="#fff" />
                    </div>
                  </div>
                  <h3 className="value-card-title">{v.title}</h3>
                  <p className="value-card-desc">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
        <SectionDivider fill={BG_WHITE} flip={true} />
      </section>

      {/* Nos Formateurs — Coverflow 3D Carousel */}
      <section className="section-animate about-section-pad about-section-white about-section-relative">
        <BackgroundBlobs variant="cool" />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">L’expertise pédagogique</span>
            <h2>Nos Formateurs & Mentors</h2>
            <p>Des professionnels passionnés qui vous accompagnent avec des cours complets et des sessions live.</p>
          </div>

          <div style={{ margin: '2rem 0 1rem 0', width: '100%' }}>
            {instructorsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div>
            ) : (
              <CoverflowCarousel
                slides={instructorSlides}
                cardWidth="clamp(190px, 24vw, 290px)"
                showCaption
                showPagination
                showNavigation
                label="Formateurs 212Learn"
              />
            )}
          </div>
        </div>
        <SectionDivider fill="#ffffff" flip={true} />
      </section>

      {/* Fondateurs & Équipe Dirigeante (Admins / Leadership) */}
      <section className="section-animate about-team-showcase about-section-relative" style={{ background: '#ffffff', padding: '4rem 1.5rem 3rem' }}>
        <BackgroundBlobs variant="warm" />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">Fondateurs & Administrateurs</span>
            <h2>L’équipe dirigeante de 212Learn</h2>
            <p>Découvrez les passionnés et décideurs qui conçoivent, développent et administrent la plateforme.</p>
          </div>
          <TeamShowcase />
        </div>
        <SectionDivider fill={BG_SAND} flip={false} />
      </section>

      {/* Témoignages */}
      <section className="section-animate about-testimonials about-section-sand about-section-relative">
        <BackgroundBlobs variant="cool" />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">Ils nous font confiance</span>
            <h2>La voix de notre communauté</h2>
            <p>Des retours d’apprenants qui utilisent 212Learn au quotidien.</p>
          </div>

          {testimonialsLoading ? (
            <div style={{ textAlign: 'center' }}><LoadingSpinner /></div>
          ) : testimonials.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--secondary)' }}>
              Les témoignages apparaîtront ici dès qu’ils seront publiés.
            </p>
          ) : (
            <div className="about-testimonial-grid card-stagger">
              {testimonials.map((testimonial) => {
                const name = `${testimonial.user?.firstName || ''} ${testimonial.user?.lastName || ''}`.trim() || 'Apprenant';
                const initial = testimonial.user?.firstName?.[0] || 'A';
                return (
                  <article key={testimonial.id} className="about-testimonial-card about-glass-panel">
                    <Quote size={28} className="about-quote-icon" />
                    <p>&ldquo;{testimonial.comment}&rdquo;</p>
                    <div className="about-testimonial-author">
                      {testimonial.user?.avatar ? (
                        <img src={testimonial.user.avatar} alt={name} />
                      ) : (
                        <span className="about-avatar-fallback">{initial}</span>
                      )}
                      <div>
                        <strong>{name}</strong>
                        <span>{testimonial.course?.title || 'Communauté 212Learn'}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <SectionDivider gradient={{ from: 'var(--primary)', to: '#d46b28' }} flip={true} />
      </section>

      {/* CTA */}
        <section className="about-cta">
          <div className="about-cta-inner">
            <h2>Rejoignez l’aventure 212Learn</h2>
            <p>
              Que vous soyez apprenant ou instructeur, vous faites partie de ce que nous construisons.
              Commencez par explorer le catalogue — ou créez votre compte.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="about-cta-btn about-micro-btn">
                Créer un compte
                <ArrowRight size={18} />
              </Link>
              <Link to="/courses" className="about-cta-ghost about-micro-btn">
                Parcourir les cours
              </Link>
            </div>
          </div>
        </section>
    </div>
  );
}

export default About;
