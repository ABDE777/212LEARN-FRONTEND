import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Heart } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import { CourseCardSkeleton } from '../components/SkeletonLoader';

export default function Catalog() {
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { courses, loading: coursesLoading, error: coursesError } = useCourses(filters);
  const { categories, loading: categoriesLoading } = useCategories();
  const { addToCart, loading: cartLoading, items: cartItems } = useCart();
  const { addToWishlist, loading: wishlistLoading, items: wishlistItems } = useWishlist();

  // Derive sets of course IDs already in cart / wishlist for O(1) lookup
  const cartCourseIds = new Set(
    cartItems.map((item) => item.course?.id ?? item.courseId ?? item.id)
  );
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

        {/* Search and Filters */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--secondary)'
                }} 
              />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)',
                  background: 'var(--surface-color)'
                }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Filter size={20} />
              Filtres
            </Button>
            {(filters.category || filters.level || filters.search) && (
              <Button variant="ghost" onClick={clearFilters}>
                Effacer
              </Button>
            )}
          </div>

          {showFilters && (
            <Card variant="default" padding="1.5rem" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-body)',
                      background: 'var(--surface-color)'
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--secondary)' }}>
                    Niveau
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-body)',
                      background: 'var(--surface-color)'
                    }}
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>
              </div>
            </Card>
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
                  {course.thumbnail && (
                    <div
                      style={{
                        height: '180px',
                        background: `url(${course.thumbnail}) center/cover`,
                        borderRadius: '12px',
                        marginBottom: '1rem'
                      }}
                    />
                  )}
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
                        {course.price === 0 ? 'Gratuit' : `${course.price}€`}
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(() => {
                      const inCart = cartCourseIds.has(course.id);
                      const inWishlist = wishlistCourseIds.has(course.id);
                      return (
                        <>
                          <Button 
                            variant={inCart ? 'ghost' : 'primary'}
                            style={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '0.5rem',
                              ...(inCart && {
                                opacity: 0.65,
                                cursor: 'not-allowed',
                                background: 'var(--border-color)',
                                color: 'var(--secondary)',
                                border: '1px solid var(--border-color)'
                              })
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!inCart) addToCart(course.id);
                            }}
                            disabled={cartLoading || inCart}
                          >
                            <ShoppingCart size={16} />
                            {inCart ? 'Déjà au panier' : 'Panier'}
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
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
