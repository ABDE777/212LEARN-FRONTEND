import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, BookOpen, CheckCircle } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { CourseCardSkeleton } from '../components/SkeletonLoader';

export default function Catalog() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });


  const { courses, loading: coursesLoading, error: coursesError } = useCourses(filters);
  const { categories } = useCategories();
  const { addToCart, loading: cartLoading, items: cartItems } = useCart();
  const { addToWishlist, loading: wishlistLoading, items: wishlistItems } = useWishlist();

  // Derive sets of course IDs already in cart / wishlist for O(1) lookup
  const cartCourseIds = new Set(
    cartItems.map((item) => item.course?.id ?? item.courseId ?? item.id)
  );
  // Courses the signed-in learner is already enrolled in — so we can show
  // "Déjà inscrit" and block adding them to the cart.
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  useEffect(() => {
    if (!user || isAdmin) { setEnrolledCourseIds(new Set()); return; }
    let active = true;
    (async () => {
      try {
        const res = await api.get('/enrollments');
        const list = res.data?.data?.enrollments || res.data?.enrollments || [];
        const ids = new Set(list.map((e) => e.course?.id ?? e.courseId).filter(Boolean));
        if (active) setEnrolledCourseIds(ids);
      } catch {
        if (active) setEnrolledCourseIds(new Set());
      }
    })();
    return () => { active = false; };
  }, [user, isAdmin]);

  const wishlistCourseIds = new Set(
    wishlistItems.map((item) => item.course?.id ?? item.courseId ?? item.id)
  );

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', level: '', search: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
            Catalogue des cours
          </h1>
          <p style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>
            Explorez nos cours et commencez votre parcours d'apprentissage
          </p>
        </div>

        {/* Search and Filters - Always visible horizontal bar */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 280px', position: 'relative', minWidth: '200px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--secondary)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                background: 'var(--surface-color)',
                color: 'var(--text-color)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category filter */}
          <div style={{ flex: '0 1 220px', minWidth: '160px' }}>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                background: 'var(--surface-color)',
                color: filters.category ? 'var(--text-color)' : 'var(--secondary)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'auto',
              }}
            >
              <option value="">Toutes les catégories</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level filter */}
          <div style={{ flex: '0 1 190px', minWidth: '140px' }}>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                background: 'var(--surface-color)',
                color: filters.level ? 'var(--text-color)' : 'var(--secondary)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'auto',
              }}
            >
              <option value="">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>

          {/* Clear filters */}
          {(filters.category || filters.level || filters.search) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--secondary)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error-color)'; e.currentTarget.style.borderColor = 'var(--error-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              ✕ Effacer
            </button>
          )}
        </div>

        {/* Error State */}
        {coursesError && (
          <Card variant="default" padding="2rem" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--error-color)' }}>{coursesError}</p>
          </Card>
        )}

        {/* Course Grid */}
        {coursesLoading ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '2rem' 
          }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <CourseCardSkeleton key={idx} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card variant="default" padding="3rem" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
              Aucun cours trouvé
            </h3>
            <p style={{ color: 'var(--secondary)' }}>
              Essayez d'ajuster vos filtres de recherche
            </p>
          </Card>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '2rem' 
          }}>
            {Array.isArray(courses) && courses.map((course) => (
              <Link 
                key={course.id} 
                to={`/courses/${course.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card variant="elevated" style={{ height: '100%', transition: 'transform 0.2s ease' }}>
                  {/* Thumbnail Banner */}
                  <div
                    style={{
                      height: '170px',
                      background: course.thumbnail
                        ? `url(${course.thumbnail}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1B4B5A 0%, #2A6F84 55%, #C1652F 100%)',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {!course.thumbnail && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={40} color="rgba(255,255,255,0.35)" />
                      </div>
                    )}
                    <span style={{
                      position: 'absolute', bottom: '0.6rem', right: '0.6rem',
                      background: 'rgba(27,75,90,0.88)', backdropFilter: 'blur(6px)',
                      color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '9999px',
                      fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)',
                    }}>
                      {course.price === 0 || !course.price ? 'GRATUIT' : `${course.price} MAD`}
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      background: 'var(--bg-color)', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--secondary)'
                    }}>
                      {course.category?.name || 'Informatique'}
                    </span>
                  </div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)', fontSize: '1.2rem' }}>
                    {course.title}
                  </h3>
                  <p style={{ 
                    color: 'var(--secondary)', 
                    fontSize: '0.95rem', 
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {course.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {course.price === 0 ? 'Gratuit' : `${course.price} MAD`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                      {course.level && (
                        <span style={{ textTransform: 'capitalize' }}>
                          {course.level === 'beginner' ? 'Débutant' : 
                           course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(() => {
                        const enrolled = enrolledCourseIds.has(course.id);
                        const inCart = cartCourseIds.has(course.id);
                        const inWishlist = wishlistCourseIds.has(course.id);
                        const cartDisabled = enrolled || inCart;
                        return (
                          <>
                            <Button
                              variant={cartDisabled ? 'ghost' : 'primary'}
                              style={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                ...(cartDisabled && {
                                  opacity: 0.65,
                                  cursor: 'not-allowed',
                                  background: 'var(--border-color)',
                                  color: 'var(--secondary)',
                                  border: '1px solid var(--border-color)'
                                })
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!cartDisabled) addToCart(course.id);
                              }}
                              disabled={cartLoading || cartDisabled}
                            >
                              {enrolled ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
                              {enrolled ? 'Déjà inscrit' : inCart ? 'Déjà au panier' : 'Panier'}
                            </Button>
                            <Button 
                              variant={inWishlist ? 'ghost' : 'outline'}
                              style={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                ...(inWishlist && {
                                  opacity: 0.65,
                                  cursor: 'not-allowed',
                                  background: 'var(--border-color)',
                                  color: 'var(--secondary)',
                                  border: '1px solid var(--border-color)'
                                })
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!inWishlist) addToWishlist(course.id);
                              }}
                              disabled={wishlistLoading || inWishlist}
                            >
                              <Heart size={16} />
                              {inWishlist ? 'Déjà en souhaits' : 'Souhaits'}
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
