import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Home, BookOpen, ArrowLeft, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  const navigate = useNavigate();
  const orbitRef = useRef(null);

  useEffect(() => {
    let frame;
    let angle = 0;
    const animate = () => {
      angle += 0.4;
      if (orbitRef.current) {
        orbitRef.current.style.transform = `rotate(${angle}deg)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #F5EDE4)' }}>
      <SEOHead
        title="404 – Page introuvable"
        description="La page que vous cherchez n'existe pas sur 212Learn."
      />
      <Navbar />

      <div style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}>

        {/* 3D Neumorphic 404 display */}
        <div style={{
          position: 'relative',
          marginBottom: '3rem',
        }}>
          {/* Outer ring orbit */}
          <div
            ref={orbitRef}
            style={{
              position: 'absolute',
              inset: '-40px',
              borderRadius: '50%',
              border: '2px dashed rgba(193, 101, 47, 0.25)',
              pointerEvents: 'none',
            }}
          >
            {/* Orbiting dot */}
            <div style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--primary, #C1652F)',
              boxShadow: '0 0 10px rgba(193, 101, 47, 0.6)',
            }} />
          </div>

          {/* Main 404 card */}
          <div style={{
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'var(--bg-color, #F5EDE4)',
            boxShadow: 'var(--neu-shadow-raised-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Inner inset ring */}
            <div style={{
              width: '210px',
              height: '210px',
              borderRadius: '50%',
              boxShadow: 'var(--neu-shadow-inset)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '5.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, var(--primary, #C1652F), var(--accent, #E8A33D))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                letterSpacing: '-4px',
              }}>
                404
              </span>
            </div>
          </div>
        </div>

        {/* Message card */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          background: 'var(--bg-color, #F5EDE4)',
          boxShadow: 'var(--neu-shadow-raised)',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--bg-color, #F5EDE4)',
            boxShadow: 'var(--neu-shadow-raised-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--primary, #C1652F)',
          }}>
            <Search size={24} />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--secondary, #1B4B5A)',
            marginBottom: '0.75rem',
          }}>
            Page introuvable
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-color, #2B2622)',
            opacity: 0.7,
            lineHeight: 1.7,
            marginBottom: '0',
          }}>
            Oups ! La page que vous recherchez a peut-être été déplacée,
            supprimée ou n'a jamais existé.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <button
            id="btn-go-back-404"
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.75rem',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'var(--bg-color, #F5EDE4)',
              color: 'var(--text-color, #2B2622)',
              boxShadow: 'var(--neu-shadow-raised)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-inset)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
            }}
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <button
            id="btn-home-404"
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.75rem',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--primary, #C1652F), var(--accent, #E8A33D))',
              color: '#fff',
              boxShadow: '4px 4px 12px rgba(193, 101, 47, 0.4), -2px -2px 8px rgba(255,255,255,0.2)',
              transition: 'box-shadow 0.2s, transform 0.15s, opacity 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.92';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(1px)';
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Home size={18} />
            Accueil
          </button>

          <button
            id="btn-courses-404"
            onClick={() => navigate('/courses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.75rem',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'var(--bg-color, #F5EDE4)',
              color: 'var(--secondary, #1B4B5A)',
              boxShadow: 'var(--neu-shadow-raised)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-inset)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
            }}
          >
            <BookOpen size={18} />
            Voir les cours
          </button>
        </div>

        {/* Subtle floating particles */}
        {[
          { size: 14, top: '15%', left: '8%', delay: '0s', duration: '6s' },
          { size: 10, top: '70%', left: '5%', delay: '1.5s', duration: '8s' },
          { size: 18, top: '25%', right: '7%', delay: '0.5s', duration: '7s' },
          { size: 8, top: '65%', right: '10%', delay: '2s', duration: '5s' },
          { size: 12, top: '45%', left: '3%', delay: '3s', duration: '9s' },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: 'fixed',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: 'var(--bg-color, #F5EDE4)',
              boxShadow: 'var(--neu-shadow-raised-sm)',
              top: p.top,
              left: p.left,
              right: p.right,
              animation: `float404 ${p.duration} ${p.delay} ease-in-out infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float404 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          33% { transform: translateY(-18px) rotate(5deg); opacity: 1; }
          66% { transform: translateY(-8px) rotate(-3deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
