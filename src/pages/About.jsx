import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Heart, Zap, Globe, Quote, ArrowRight, MapPin,
  Lightbulb, Handshake, Eye, Flag, Users
} from 'lucide-react';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import aboutAnimation from '../lotties/Education2.json';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import BackgroundBlobs from '../components/about/BackgroundBlobs';
import SectionDivider from '../components/about/SectionDivider';
import GlowCard from '../components/about/GlowCard';
import { usePublicTestimonials } from '../hooks/usePublicTestimonials';
import LoadingSpinner from '../components/LoadingSpinner';

const BG_SAND = '#F5EDE4';
const BG_WHITE = '#ffffff';
const BG_CTA = '#C1652F';

function About() {
  const { testimonials, loading: testimonialsLoading } = usePublicTestimonials();

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
    },
    {
      icon: Heart,
      title: 'Proximité humaine',
      desc: 'Derrière chaque cours : des instructeurs, des lives et un suivi — pas seulement des vidéos anonymes.',
    },
    {
      icon: Zap,
      title: 'Pratique avant tout',
      desc: 'Exercices, projets et évaluations pour transformer la théorie en compétences concrètes.',
    },
    {
      icon: Globe,
      title: 'Accessibilité',
      desc: 'Apprendre depuis chez soi, à son rythme, avec une interface simple et un parcours compréhensible.',
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

  // Q&A optimized for answer engines (AEO): concise, factual, keyword-rich.
  const faqs = [
    {
      q: "Qu'est-ce que 212Learn ?",
      a: "212Learn est une plateforme d'apprentissage en ligne marocaine (e-learning) proposant des cours interactifs en programmation, technologie et design. La plateforme propose des sessions live en cohorte animées par des instructeurs, des quiz, un suivi de progression et des certificats. Le contenu est principalement en français.",
    },
    {
      q: "Quels sujets peut-on apprendre sur 212Learn ?",
      a: "On y apprend la programmation et le développement web, la technologie et les compétences numériques, ainsi que le design et l'UX/UI. Le catalogue est filtrable par catégorie, niveau (débutant, intermédiaire, avancé) et langue.",
    },
    {
      q: "212Learn est-il adapté au Maroc ?",
      a: "Oui. 212Learn est conçu pour le Maroc et l'Afrique francophone : contenu en français et paiements locaux (Wafacash, virement bancaire), en plus des cours gratuits accessibles directement.",
    },
    {
      q: "Y a-t-il des cours en direct (live) ?",
      a: "Oui. 212Learn propose des sessions live en cohorte : des classes virtuelles animées en direct par les instructeurs, avec des groupes d'étudiants par cours. Les sessions enregistrées sont ajoutées au programme du cours pour être revues plus tard.",
    },
    {
      q: "Obtient-on un certificat à la fin d'un cours ?",
      a: "Oui. Les apprenants suivent leur progression, gagnent des badges via des quiz interactifs et reçoivent un certificat de réussite à la fin d'un cours.",
    },
    {
      q: "Comment s'inscrire à un cours ?",
      a: "Parcourez le catalogue, ouvrez un cours, puis inscrivez-vous : les cours gratuits donnent un accès immédiat, et les cours payants passent par un paiement (Wafacash ou virement). Vous suivez ensuite les leçons, quiz et sessions live depuis votre tableau de bord étudiant.",
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="about-page">
      <SEOHead
        title="À propos"
        description="212Learn est une plateforme e-learning marocaine : cours en ligne de programmation, technologie et design, sessions live en cohorte, quiz et certificats, en français."
      />
      <StructuredData data={faqSchema} id="faq-schema" />
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
            <svg className="about-hero-ring" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(193,101,47,0.25)" strokeWidth="1.5" strokeDasharray="6 8" />
              <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(27,75,90,0.18)" strokeWidth="1" strokeDasharray="4 10" />
            </svg>
            <div className="about-lottie-frame">
              <Lottie animationData={aboutAnimation} loop />
            </div>
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

          <div className="about-milestone-grid" style={{ gridTemplateColumns: '1fr' }}>
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

      {/* Valeurs */}
      <section className="section-animate about-section-pad about-section-sand about-section-relative">
        <BackgroundBlobs />
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow muted">Ce qui nous guide</span>
            <h2>Nos valeurs</h2>
            <p>Les principes que nous appliquons dans le produit, la pédagogie et le support.</p>
          </div>

          <div className="about-values-grid card-stagger">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <GlowCard
                  key={value.title}
                  centered
                  icon={<Icon size={28} />}
                  title={value.title}
                  description={value.desc}
                />
              );
            })}
          </div>
        </div>
        <SectionDivider fill={BG_WHITE} flip={true} />
      </section>

      {/* Témoignages */}
      <section className="section-animate about-testimonials about-section-white about-section-relative">
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

      {/* FAQ — visible content mirrored by FAQPage JSON-LD for answer engines */}
      <section className="section-animate about-section-pad about-section-white about-section-relative">
        <div className="about-section-inner" style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2>Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
            {faqs.map((f) => (
              <details
                key={f.q}
                style={{
                  background: 'var(--surface-color, #fff)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: '1rem 1.25rem',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-color)', fontSize: '1rem', listStyle: 'none' }}>
                  {f.q}
                </summary>
                <p style={{ marginTop: '0.75rem', color: 'var(--secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
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
