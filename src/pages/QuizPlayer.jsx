import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useQuizAttempts } from '../hooks/useProgress';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function QuizPlayer() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitQuizAttempt, loading: submitting, error: submitError } = useQuizAttempts();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockQuiz = {
          _id: quizId,
          title: 'Quiz: Introduction à la Programmation',
          description: 'Testez vos connaissances sur les bases de la programmation',
          timeLimit: 15, // minutes
          passingScore: 70,
          questions: [
            {
              _id: 'q1',
              question: 'Qu\'est-ce qu\'une variable en programmation ?',
              options: [
                { id: 'a', text: 'Un conteneur pour stocker des données' },
                { id: 'b', text: 'Une fonction mathématique' },
                { id: 'c', text: 'Un type de données' },
                { id: 'd', text: 'Une boucle' }
              ],
              correctAnswer: 'a'
            },
            {
              _id: 'q2',
              question: 'Quel symbole est utilisé pour l\'assignation dans la plupart des langages ?',
              options: [
                { id: 'a', text: '=' },
                { id: 'b', text: '==' },
                { id: 'c', text: '===' },
                { id: 'd', text: ':=' }
              ],
              correctAnswer: 'a'
            },
            {
              _id: 'q3',
              question: 'Qu\'est-ce qu\'une fonction ?',
              options: [
                { id: 'a', text: 'Une variable globale' },
                { id: 'b', text: 'Un bloc de code réutilisable' },
                { id: 'c', text: 'Un type de données' },
                { id: 'd', text: 'Une condition' }
              ],
              correctAnswer: 'b'
            },
            {
              _id: 'q4',
              question: 'Quelle structure permet de répéter du code ?',
              options: [
                { id: 'a', text: 'If/else' },
                { id: 'b', text: 'Switch' },
                { id: 'c', text: 'Boucle (loop)' },
                { id: 'd', text: 'Variable' }
              ],
              correctAnswer: 'c'
            },
            {
              _id: 'q5',
              question: 'Qu\'est-ce qu\'un tableau (array) ?',
              options: [
                { id: 'a', text: 'Une seule valeur' },
                { id: 'b', text: 'Une collection ordonnée de valeurs' },
                { id: 'c', text: 'Une fonction' },
                { id: 'd', text: 'Une condition' }
              ],
              correctAnswer: 'b'
            }
          ]
        };
        
        setQuiz(mockQuiz);
        setTimeLeft(mockQuiz.timeLimit * 60); // Convert to seconds
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      const result = await submitQuizAttempt(quizId, answers);
      setResults(result);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--error-color)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>
          <Button variant="outline" onClick={() => navigate(`/learn/${courseId}/lesson/intro`)}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p>Quiz non trouvé</p>
          <Button variant="outline" onClick={() => navigate(`/learn/${courseId}/lesson/intro`)}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link 
            to={`/learn/${courseId}/lesson/intro`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--secondary)', 
              textDecoration: 'none',
              marginBottom: '2rem'
            }}
          >
            <ChevronLeft size={20} />
            Retour au cours
          </Link>

          <Card variant="default" padding="3rem" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%',
              background: passed ? 'var(--success-color)' : 'var(--error-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <span style={{ fontSize: '3rem', fontWeight: 700, color: '#fff' }}>
                {score}%
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: passed ? 'var(--success-color)' : 'var(--error-color)' }}>
              {passed ? 'Félicitations !' : 'Essayez encore'}
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '2rem' }}>
              {passed 
                ? 'Vous avez réussi le quiz !' 
                : `Vous devez obtenir au moins ${quiz.passingScore}% pour réussir.`}
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {quiz.questions.length}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Questions</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>
                  {quiz.questions.filter(q => answers[q._id] === q.correctAnswer).length}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Correctes</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error-color)' }}>
                  {quiz.questions.filter(q => answers[q._id] !== q.correctAnswer).length}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Incorrectes</div>
              </div>
            </div>

            <Button 
              variant={passed ? 'primary' : 'secondary'}
              size="large"
              onClick={() => {
                setAnswers({});
                setCurrentQuestion(0);
                setShowResults(false);
                setTimeLeft(quiz.timeLimit * 60);
              }}
            >
              {!passed ? 'Réessayer le quiz' : 'Continuer le cours'}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link 
            to={`/learn/${courseId}/lesson/intro`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--secondary)', 
              textDecoration: 'none'
            }}
          >
            <ChevronLeft size={20} />
            Quitter le quiz
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
            <Clock size={20} />
            <span style={{ fontWeight: 600, color: timeLeft < 60 ? 'var(--error-color)' : 'inherit' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Quiz Info */}
        <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
            {quiz.title}
          </h1>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            {quiz.description}
          </p>
          
          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              <span>Question {currentQuestion + 1} sur {quiz.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ 
              height: '8px', 
              background: 'var(--border-color)', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: 'var(--primary)', 
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </Card>

        {/* Question */}
        <Card variant="elevated" padding="2rem" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', color: 'var(--text-color)' }}>
            {currentQ.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentQ.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(currentQ._id, option.id)}
                style={{
                  padding: '1rem 1.5rem',
                  border: answers[currentQ._id] === option.id 
                    ? '2px solid var(--primary)' 
                    : '2px solid var(--border-color)',
                  borderRadius: '12px',
                  background: answers[currentQ._id] === option.id 
                    ? 'var(--bg-color)' 
                    : 'var(--surface-color)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  border: answers[currentQ._id] === option.id 
                    ? '2px solid var(--primary)' 
                    : '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {answers[currentQ._id] === option.id && (
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
                  )}
                </div>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Précédent
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!answers[currentQ._id] || submitting}
              loading={submitting}
            >
              Soumettre le quiz
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              disabled={!answers[currentQ._id]}
            >
              Suivant
            </Button>
          )}
        </div>

        {submitError && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px',
            color: '#c33'
          }}>
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}
