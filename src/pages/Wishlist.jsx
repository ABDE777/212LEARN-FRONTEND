import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

export default function Wishlist() {
  const { wishlist, fetchWishlist, removeFromWishlist, loading, error } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = async (courseId) => {
    await addToCart(courseId);
    // Optionally remove from wishlist after adding to cart
    await removeFromWishlist(courseId);
  };

  if (loading && !wishlist) {
    return <LoadingSpinner />;
  }

  const wishlistItems = wishlist?.items || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Heart size={36} color="var(--error-color)" fill="var(--error-color)" />
          Ma Liste de Souhaits
        </h1>

        {error && (
          <div style={{ padding: '1rem', background: 'var(--error-color)', color: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <Card variant="default" padding="3rem" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Heart size={64} color="var(--secondary)" opacity={0.5} />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
              Votre liste de souhaits est vide
            </h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
              Sauvegardez les cours qui vous intéressent pour plus tard.
            </p>
            <Link to="/courses" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Explorer les cours</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {wishlistItems.map((item) => {
              const course = item.course;
              if (!course) return null;
              
              return (
                <Card key={item.id} variant="elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {course.thumbnail ? (
                    <div
                      style={{
                        height: '180px',
                        background: `url(${course.thumbnail}) center/cover`,
                        borderRadius: '12px 12px 0 0',
                        marginBottom: '1rem'
                      }}
                    />
                  ) : (
                    <div style={{ height: '180px', background: 'var(--border-color)', borderRadius: '12px 12px 0 0', marginBottom: '1rem' }} />
                  )}
                  
                  <div style={{ padding: '0 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
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
                      <Button 
                        variant="ghost" 
                        onClick={() => removeFromWishlist(course.id)}
                        disabled={loading}
                        style={{ padding: '4px', color: 'var(--error-color)' }}
                        title="Retirer"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>

                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)', fontSize: '1.2rem' }}>
                      <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {course.title}
                      </Link>
                    </h3>

                    <p style={{ 
                      color: 'var(--secondary)', 
                      fontSize: '0.95rem', 
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
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
                      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', textTransform: 'capitalize' }}>
                        {course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : course.level === 'advanced' ? 'Avancé' : 'Tous niveaux'}
                      </span>
                    </div>

                    <Button 
                      variant="primary" 
                      style={{ width: '100%' }}
                      onClick={() => handleAddToCart(course.id)}
                      disabled={cartLoading}
                    >
                      Ajouter au panier
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
