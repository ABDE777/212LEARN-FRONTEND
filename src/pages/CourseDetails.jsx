import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, PlayCircle, CheckCircle } from 'lucide-react';
import { useCourse, useCourseCurriculum } from '../hooks/useCourses';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading: courseLoading, error: courseError } = useCourse(id);
  const { curriculum, loading: curriculumLoading } = useCourseCurriculum(id);

  if (courseLoading || curriculumLoading) {
    return <LoadingSpinner />;
  }

  if (courseError) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{courseError}</p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Retour au catalogue
          </Button>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p>Cours non trouvé</p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Retour au catalogue
          </Button>
        </Card>
      </div>
    );
  }

  const handleEnroll = () => {
    navigate(`/courses/${id}/checkout`);
  };

  // Calculate average rating from reviews
  const averageRating = course.reviews?.length 
    ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1) 
    : null;
  
  const handleStartLearning = () => {
    if (curriculum && curriculum.sections && curriculum.sections.length > 0) {
      const firstSection = curriculum.sections[0];
      if (firstSection.lessons && firstSection.lessons.length > 0) {
        const firstLesson = firstSection.lessons[0];
        navigate(`/learn/${id}/lesson/${firstLesson.id}`);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
          <Link to="/courses" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
            Catalogue
          </Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span>{course.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            {/* Course Header */}
            <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ 
                  background: 'var(--bg-color)', 
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--secondary)'
                }}>
                  {course.category?.name || 'Informatique'}
                </span>
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-color)' }}>
                {course.title}
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {course.description}
              </p>
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                  <Clock size={20} />
                  <span>{(course.duration / 60) || '10'}h de contenu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                  <Users size={20} />
                  <span>{course._count?.enrollments || 0} étudiants</span>
                </div>
                {averageRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                    <Star size={20} fill="var(--accent)" color="var(--accent)" />
                    <span>{averageRating} ({course._count?.reviews || 0} avis)</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                  <BookOpen size={20} />
                  <span style={{ textTransform: 'capitalize' }}>
                    {course.level === 'beginner' ? 'Débutant' : 
                     course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Curriculum */}
            <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                Programme du cours
              </h2>
              {curriculum?.sections?.map((section, sectionIndex) => (
                <div key={section.id} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    background: 'var(--bg-color)', 
                    padding: '1rem 1.5rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', margin: 0 }}>
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                      {section.lessons?.length || 0} leçons
                    </p>
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    {section.lessons?.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                      >
                        <PlayCircle size={18} color="var(--primary)" />
                        <span style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}>
                          {lesson.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>

            {/* Instructors */}
            {course.instructors?.length > 0 && (
              <Card variant="default" padding="2rem">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                  Votre instructeur
                </h2>
                {course.instructors.map((instructorData) => {
                  const instructor = instructorData.user;
                  return (
                    <div key={instructor.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                      {instructor.avatar && (
                        <img
                          src={instructor.avatar}
                          alt={`${instructor.firstName} ${instructor.lastName}`}
                          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                          {instructor.firstName} {instructor.lastName}
                        </h3>
                        <p style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
                          {instructor.bio || 'Expert en informatique avec plusieurs années d\'expérience.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card variant="elevated" padding="0" style={{ position: 'sticky', top: '2rem' }}>
              {course.thumbnail && (
                <div
                  style={{
                    height: '200px',
                    background: `url(${course.thumbnail}) center/cover`,
                    borderRadius: '16px 16px 0 0'
                  }}
                />
              )}
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                  </span>
                </div>
                
                <Button 
                  variant="primary" 
                  size="large" 
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={course.isEnrolled ? handleStartLearning : handleEnroll}
                >
                  {course.isEnrolled ? 'Continuer le cours' : "S'inscrire maintenant"}
                </Button>
                
                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                  Garantie satisfait ou remboursé 30 jours
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Ce cours comprend :</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.75rem', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                      ✓ {curriculum?.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0} heures de vidéo à la demande
                    </li>
                    <li style={{ marginBottom: '0.75rem', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                      ✓ Accès illimité
                    </li>
                    <li style={{ marginBottom: '0.75rem', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                      ✓ Accès sur mobile et TV
                    </li>
                    <li style={{ marginBottom: '0.75rem', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                      ✓ Certificat de complétion
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
