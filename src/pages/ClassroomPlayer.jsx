import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Lock, Menu, X, HelpCircle } from 'lucide-react';
import { useCourseCurriculum } from '../hooks/useCourses';
import { useLessonProgress } from '../hooks/useProgress';
import { useCourseQuizzes } from '../hooks/useInstructorCourses';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import LessonAssignments from '../components/LessonAssignments';
import { useAuth } from '../context/AuthContext';

// Resources only carry { type, url } — no stored name. Derive a readable
// label from the file name in the URL, falling back to a typed French label.
const RESOURCE_TYPE_LABELS = { pdf: 'Document PDF', video: 'Vidéo', image: 'Image', link: 'Lien externe', file: 'Fichier' };
function resourceLabel(resource) {
  if (resource.name || resource.title) return resource.name || resource.title;
  try {
    const path = decodeURIComponent(new URL(resource.url).pathname);
    const file = path.split('/').pop();
    if (file && file.includes('.')) return file;
  } catch {
    // url isn't absolute — ignore and fall through to the type label
  }
  return RESOURCE_TYPE_LABELS[resource.type] || 'Ressource';
}

export default function ClassroomPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { curriculum, loading, error } = useCourseCurriculum(courseId);
  const { updateProgress, loading: progressLoading } = useLessonProgress();
  const { quizzes, loading: quizzesLoading } = useCourseQuizzes(courseId);
  
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  const approvedQuizzes = (quizzes || []).filter(q => q.validationStatus === 'approved');

  useEffect(() => {
    if (curriculum && lessonId) {
      // Find current lesson across all sections
      for (const section of curriculum.sections) {
        const lesson = section.lessons?.find(l => l.id === lessonId);
        if (lesson) {
          setCurrentLesson({ ...lesson, sectionTitle: section.title });
          break;
        }
      }
    }
  }, [curriculum, lessonId]);

  const handleLessonClick = (lesson) => {
    if (lesson.isLocked) return;
    navigate(`/learn/${courseId}/lesson/${lesson.id}`);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    
    try {
      await updateProgress(lessonId, { completed: true, progressPercentage: 100 });
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      
      // Auto-navigate to next lesson
      navigateToNextLesson();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const navigateToNextLesson = () => {
    if (!curriculum) return;
    
    for (let i = 0; i < curriculum.sections.length; i++) {
      const section = curriculum.sections[i];
      const lessonIndex = section.lessons?.findIndex(l => l.id === lessonId);
      
      if (lessonIndex !== -1 && lessonIndex < section.lessons.length - 1) {
        // Next lesson in same section
        const nextLesson = section.lessons[lessonIndex + 1];
        navigate(`/learn/${courseId}/lesson/${nextLesson.id}`);
        return;
      }
      
      if (lessonIndex !== -1 && i < curriculum.sections.length - 1) {
        // First lesson of next section
        const nextSection = curriculum.sections[i + 1];
        if (nextSection.lessons?.length > 0) {
          navigate(`/learn/${courseId}/lesson/${nextSection.lessons[0].id}`);
          return;
        }
      }
    }
  };

  const navigateToPreviousLesson = () => {
    if (!curriculum) return;
    
    for (let i = 0; i < curriculum.sections.length; i++) {
      const section = curriculum.sections[i];
      const lessonIndex = section.lessons?.findIndex(l => l.id === lessonId);
      
      if (lessonIndex !== -1 && lessonIndex > 0) {
        // Previous lesson in same section
        const prevLesson = section.lessons[lessonIndex - 1];
        navigate(`/learn/${courseId}/lesson/${prevLesson.id}`);
        return;
      }
      
      if (lessonIndex !== -1 && i > 0) {
        // Last lesson of previous section
        const prevSection = curriculum.sections[i - 1];
        if (prevSection.lessons?.length > 0) {
          navigate(`/learn/${courseId}/lesson/${prevSection.lessons[prevSection.lessons.length - 1].id}`);
          return;
        }
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>
          <Link to="/student/dashboard" style={{ textDecoration: 'none' }}>
            Retour au tableau de bord
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '1rem 1.5rem', 
        alignItems: 'center',
        background: 'var(--surface-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/student/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              212LEARN
            </div>
          </Link>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
            {currentLesson?.sectionTitle}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Curriculum */}
        <div style={{ 
          width: sidebarOpen ? '350px' : '0',
          background: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          display: sidebarOpen ? 'block' : 'none'
        }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Programme</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {curriculum?.sections?.map((section, sectionIndex) => (
              <div key={section.id} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 600, 
                  color: 'var(--text-color)', 
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Section {sectionIndex + 1}: {section.title}
                </h4>
                <div>
                  {section.lessons?.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrent = lesson.id === lessonId;
                    
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: lesson.isLocked ? 'not-allowed' : 'pointer',
                          background: isCurrent ? 'var(--bg-color)' : 'transparent',
                          marginBottom: '0.5rem',
                          opacity: lesson.isLocked ? 0.5 : 1
                        }}
                      >
                        {lesson.isLocked ? (
                          <Lock size={16} color="var(--secondary)" />
                        ) : isCompleted ? (
                          <CheckCircle size={16} color="var(--success-color)" />
                        ) : (
                          <PlayCircle size={16} color="var(--primary)" />
                        )}
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: isCurrent ? 'var(--primary)' : 'var(--text-color)',
                          fontWeight: isCurrent ? 600 : 400,
                          flex: 1
                        }}>
                          {lesson.title}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                          {lesson.duration || '10 min'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quizzes section */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: 'var(--secondary)' }}>Quiz</h3>
              {quizzesLoading && <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Chargement...</p>}
              {!quizzesLoading && approvedQuizzes.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                  Aucun quiz publié pour ce cours.
                </p>
              )}
              {approvedQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  onClick={() => navigate(`/learn/${courseId}/quiz/${quiz.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    background: 'var(--bg-color)', marginBottom: '0.5rem',
                  }}
                >
                  <HelpCircle size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-color)', flex: 1 }}>
                    {quiz.title}
                  </span>
                  {quiz.lastAttempt && (
                    <span style={{ fontSize: '0.8rem', color: quiz.lastAttempt.score >= 60 ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 600 }}>
                      {quiz.lastAttempt.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Video Player */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Toggle Sidebar Button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'fixed',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                padding: '0.75rem',
                cursor: 'pointer',
                zIndex: 50,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Menu size={20} color="var(--secondary)" />
            </button>
          )}

          {currentLesson ? (
            <>
              {/* Video Player */}
              <div style={{ 
                background: '#000', 
                aspectRatio: '16/9', 
                maxHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentLesson.videoUrl ? (
                  <video
                    src={currentLesson.videoUrl}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    autoPlay
                  />
                ) : currentLesson.type === 'pdf' ? (
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <FileText size={64} style={{ marginBottom: '1rem' }} />
                    <p>Document PDF</p>
                    <a 
                      href={currentLesson.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#fff', textDecoration: 'underline' }}
                    >
                      Ouvrir le PDF
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <PlayCircle size={64} style={{ marginBottom: '1rem' }} />
                    <p>Contenu non disponible</p>
                  </div>
                )}
              </div>

              {/* Lesson Info and Controls */}
              <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                    {currentLesson.title}
                  </h1>
                  <p style={{ color: 'var(--secondary)', fontSize: '1rem' }}>
                    {currentLesson.description || 'Aucune description disponible'}
                  </p>
                </div>

                {/* Navigation Controls */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: 'var(--surface-color)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <button
                    onClick={navigateToPreviousLesson}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'var(--secondary)',
                      fontWeight: 500
                    }}
                  >
                    <ChevronLeft size={20} />
                    Leçon précédente
                  </button>

                  <button
                    onClick={handleMarkComplete}
                    disabled={progressLoading || completedLessons.has(lessonId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 2rem',
                      background: completedLessons.has(lessonId) ? 'var(--success-color)' : 'var(--primary)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: progressLoading ? 'not-allowed' : 'pointer',
                      color: '#fff',
                      fontWeight: 600,
                      opacity: progressLoading ? 0.6 : 1
                    }}
                  >
                    {completedLessons.has(lessonId) ? (
                      <>
                        <CheckCircle size={20} />
                        Complété
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Marquer comme terminé
                      </>
                    )}
                  </button>

                  <button
                    onClick={navigateToNextLesson}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'var(--secondary)',
                      fontWeight: 500
                    }}
                  >
                    Leçon suivante
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Lesson Resources */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <Card variant="default" padding="1.5rem" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Ressources</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {currentLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'var(--bg-color)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'var(--primary)',
                            fontWeight: 500
                          }}
                        >
                          <FileText size={18} />
                          {resourceLabel(resource)}
                        </a>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Assignments for this lesson (submit + view grade) */}
                <LessonAssignments lessonId={lessonId} />
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Leçon non trouvée</p>
              <Link to="/student/dashboard" style={{ textDecoration: 'none' }}>
                Retour au tableau de bord
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
