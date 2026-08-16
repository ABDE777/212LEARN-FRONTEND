import { useState, useRef, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Code, Database, Globe, Video, Users } from 'lucide-react';

export default function TinderSwipeCategories({ categories = [], onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setSlideDirection] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const cardRef = useRef(null);
  const autoPlayRef = useRef(null);

  const handleNext = (isAuto = false) => {
    if (!isAuto) stopAutoPlay();
    setSlideDirection('slide-left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
      setSlideDirection('');
    }, 250);
  };

  const handlePrev = () => {
    stopAutoPlay();
    setSlideDirection('slide-right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
      setSlideDirection('');
    }, 250);
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    stopAutoPlay();
    setIsDragging(true);
    setStartX(e.clientX);
    setDragX(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setDragX(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Swipe threshold
    if (dragX > 50) {
      handlePrev();
      setDragX(0);
    } else if (dragX < -50) {
      handleNext();
      setDragX(0);
    } else {
      // Spring back animation
      setDragX(0);
    }
  };

  const handleTouchStart = (e) => {
    stopAutoPlay();
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragX(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    setDragX(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragX > 50) {
      handlePrev();
      setDragX(0);
    } else if (dragX < -50) {
      handleNext();
      setDragX(0);
    } else {
      // Spring back animation
      setDragX(0);
    }
  };

  const currentCategory = categories[currentIndex];
  const nextCategory = categories[(currentIndex + 1) % categories.length];

  const getCategoryIcon = (category) => {
    // Use icon from backend if available
    if (category?.icon) {
      const iconMap = {
        'Code': Code,
        'Database': Database,
        'Globe': Globe,
        'Video': Video,
        'Users': Users,
        'BookOpen': BookOpen
      };
      return iconMap[category.icon] || BookOpen;
    }
    
    // Fallback to name-based logic
    const name = (category?.name || category?.title)?.toLowerCase() || '';
    if (name.includes('programmation') || name.includes('code') || name.includes('développement')) return Code;
    if (name.includes('base de données') || name.includes('data')) return Database;
    if (name.includes('web') || name.includes('internet') || name.includes('réseau')) return Globe;
    if (name.includes('vidéo') || name.includes('conférence')) return Video;
    if (name.includes('pédagogique') || name.includes('suivi')) return Users;
    return BookOpen;
  };

  const CurrentIcon = getCategoryIcon(currentCategory);
  const NextIcon = getCategoryIcon(nextCategory);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && categories.length > 0) {
      autoPlayRef.current = setInterval(() => {
        handleNext(true); // Pass true to indicate this is auto-play
      }, 2000); // Change every 2 seconds
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex]);

  // Stop auto-play on interaction
  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
  };

  // Resume auto-play on mouse leave
  const resumeAutoPlay = () => {
    setIsAutoPlaying(true);
  };

  // Nothing to render without categories (guard placed after all hooks so
  // the hook call order stays stable across renders — rules-of-hooks).
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div 
      style={{ padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}
      onMouseEnter={stopAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* En-tête de section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.875rem',
          borderRadius: '9999px',
          background: '#FEF3C7',
          color: '#92400E',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Sparkles size={14} style={{ color: '#B45309' }} />
          Catalogue interactif
        </span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginTop: '0.75rem' }}>
          Explorez nos domaines
        </h2>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.5rem' }}>
          Glissez ou utilisez les flèches pour découvrir chaque domaine à votre rythme.
        </p>
      </div>

      {/* Conteneur des cartes façon Tinder */}
      <div style={{ position: 'relative', width: '100%', height: '360px', margin: '0 auto' }}>
        
        {/* Carte arrière (effet de pile) */}
        <div style={{
          position: 'absolute',
          width: '90%',
          maxWidth: '380px',
          height: '320px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '1.5rem',
          border: '1px solid #FDE68A',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: -1,
          opacity: 0.6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem',
          margin: '0 auto',
          left: '50%',
          transform: 'translateX(-50%) scale(0.95) translateY(16px)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '1rem',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B45309'
          }}>
            <NextIcon size={24} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
              {nextCategory?.name || nextCategory?.title}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {nextCategory?.description || 'Explorez les cours de cette catégorie.'}
            </p>
          </div>
        </div>

        {/* Carte active (Swipeable) */}
        <div 
          ref={cardRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'absolute',
            width: '100%',
            maxWidth: '400px',
            height: '340px',
            background: '#FFFFFF',
            borderRadius: '1.5rem',
            border: '2px solid rgba(251, 191, 36, 0.5)',
            boxShadow: '0 20px 40px -15px rgba(193, 101, 47, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem',
            textAlign: 'left',
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            cursor: isDragging ? 'grabbing' : 'grab',
            margin: '0 auto',
            left: '50%',
            transform: `translateX(calc(-50% + ${dragX}px)) rotate(${dragX * 0.05}deg)`,
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '1rem',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B45309',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <CurrentIcon size={28} />
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              background: '#FFFBEB',
              color: '#B45309',
              border: '1px solid #FDE68A'
            }}>
              {currentIndex + 1} / {categories.length}
            </span>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              {currentCategory?.name || currentCategory?.title}
            </h3>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {currentCategory?.description || 'Découvrez nos formations spécialisées pour progresser efficacement.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => onSelectCategory && onSelectCategory(currentCategory)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#C1652F',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <span>Voir les cours</span>
              <ArrowRight size={18} />
            </button>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
              Glissez ou cliquez 👉
            </span>
          </div>
        </div>

      </div>

      {/* Boutons de contrôle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        <button
          onClick={handlePrev}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #FDE68A',
            color: '#475569',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          aria-label="Précédent"
        >
          <ChevronLeft size={26} />
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {categories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                height: '10px',
                borderRadius: '9999px',
                transition: 'all 0.3s',
                background: currentIndex === idx ? '#C1652F' : '#FDE68A',
                width: currentIndex === idx ? '32px' : '10px',
                cursor: 'pointer',
                border: 'none'
              }}
              aria-label={`Aller à la diapositive ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#C1652F',
            color: '#FFFFFF',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            border: 'none'
          }}
          aria-label="Suivant"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
}
