import { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Clock, Users, Star } from 'lucide-react';

export default function TinderSwipeCourses({ courses = [], onSelectCourse }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');

  if (!courses || courses.length === 0) {
    return null;
  }

  const handleNext = () => {
    setSlideDirection('slide-left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
      setSlideDirection('');
    }, 250);
  };

  const handlePrev = () => {
    setSlideDirection('slide-right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
      setSlideDirection('');
    }, 250);
  };

  const currentCourse = courses[currentIndex];
  const nextCourse = courses[(currentIndex + 1) % courses.length];

  return (
    <div className="py-16 px-4 w-full max-w-xl mx-auto text-center">
      {/* En-tête de section */}
      <div className="mb-10 space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-amber-600" />
          Cours populaires
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Cours phares</h2>
        <p className="text-slate-600 text-base">
          Découvrez nos formations les plus demandées par les apprenants.
        </p>
      </div>

      {/* Conteneur des cartes façon Tinder */}
      <div className="relative w-full h-[420px] mx-auto perspective-1000 flex items-center justify-center">
        
        {/* Carte arrière (effet de pile) */}
        <div className="absolute w-[90%] sm:w-[380px] h-[380px] bg-white/60 backdrop-blur-sm rounded-3xl border border-amber-100 shadow-md transform scale-95 translate-y-4 -z-10 opacity-60 flex flex-col justify-between p-6 mx-auto left-0 right-0">
          <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
            <BookOpen size={32} className="text-amber-600" />
          </div>
          <div className="text-left space-y-2">
            <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{nextCourse?.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock size={14} />
              <span>{nextCourse?.level || 'Tous niveaux'}</span>
            </div>
          </div>
        </div>

        {/* Carte active (Swipeable) */}
        <div 
          className={`absolute w-full sm:w-[400px] h-[400px] bg-white rounded-3xl border-2 border-amber-200/80 shadow-2xl flex flex-col justify-between p-6 text-left transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing mx-auto left-0 right-0 ${slideDirection}`}
          style={{
            boxShadow: '0 20px 40px -15px rgba(193, 101, 47, 0.25)',
          }}
        >
          {/* Image/Thumbnail */}
          <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center overflow-hidden">
            {currentCourse?.thumbnail ? (
              <img src={currentCourse.thumbnail} alt={currentCourse.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={40} className="text-amber-400" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {currentCourse?.level || 'Tous niveaux'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {currentIndex + 1} / {courses.length}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 line-clamp-2">
              {currentCourse?.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
              {currentCourse?.description || 'Découvrez cette formation pour progresser efficacement.'}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Users size={14} />
                <span>{currentCourse?.enrolledCount || 0} inscrits</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Star size={14} className="text-amber-500" />
                <span>{currentCourse?.rating || '4.8'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-[#C1652F]">
                {Number(currentCourse?.price) > 0 ? `${currentCourse.price} MAD` : 'Gratuit'}
              </span>
            </div>
            <button
              onClick={() => onSelectCourse && onSelectCourse(currentCourse)}
              className="inline-flex items-center gap-2 text-[#C1652F] font-bold hover:underline group"
            >
              <span>Voir le cours</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Boutons de contrôle */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={handlePrev}
          className="w-14 h-14 rounded-full bg-white border border-amber-200 text-slate-700 shadow-lg hover:bg-amber-50 hover:scale-105 flex items-center justify-center transition-all duration-300 focus:outline-none"
          aria-label="Précédent"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="flex gap-2">
          {courses.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-[#C1652F]' : 'w-2.5 bg-amber-200'
              }`}
              aria-label={`Aller au cours ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-14 h-14 rounded-full bg-[#C1652F] text-white shadow-xl hover:bg-[#a85324] hover:scale-105 flex items-center justify-center transition-all duration-300 focus:outline-none"
          aria-label="Suivant"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
}
