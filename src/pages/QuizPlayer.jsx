import { useParams, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useQuiz } from '../hooks/useInstructorCourses';
import { useQuizAttempts } from '../hooks/useProgress';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function QuizPlayer() {
  const { courseId, quizId } = useParams();
  const { quiz, loading, error: loadError } = useQuiz(quizId);
  const { submitQuizAttempt, loading: submitting, error: submitError } = useQuizAttempts();

  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const startTimeRef = useRef(Date.now());

  const questions = quiz?.questions || [];
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (questionId, optionText) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionText }));
  };

  const handleSubmit = async () => {
    if (!quiz || answeredCount === 0) return;

    const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const answersArray = questions
      .filter(q => answers[q.id])
      .map(q => ({ questionId: q.id, selectedAnswer: answers[q.id] }));

    try {
      const result = await submitQuizAttempt(quizId, { answers: answersArray, duration });
      setResults(result);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResults(null);
    setShowResults(false);
    startTimeRef.current = Date.now();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (loadError) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--error-color)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{loadError}</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
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
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  if (quiz.validationStatus && quiz.validationStatus !== 'approved') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#b26a00" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Quiz non disponible</h2>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            Ce quiz n'a pas encore été publié par l'instructeur.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  if (showResults && results) {
    const percentage = results.percentage || `${Math.round(results.score)}%`;
    const passed = results.passed;
    const incorrectCount = Math.max(0, results.totalCount - results.correctCount);

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link
            to={`/learn/${courseId}/lesson/intro`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', textDecoration: 'none', marginBottom: '2rem' }}
          >
            <ChevronLeft size={20} />
            Retour au cours
          </Link>

          <Card variant="default" padding="3rem" style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: passed ? 'var(--success-color)' : 'var(--error-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff' }}>
                {percentage}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: passed ? 'var(--success-color)' : 'var(--error-color)' }}>
              {passed ? 'Félicitations !' : 'Essayez encore'}
            </h1>

            <p style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '2rem' }}>
              {passed
                ? 'Vous avez réussi le quiz !'
                : 'Vous devez obtenir au moins 60% pour réussir le quiz.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{results.totalCount}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Questions</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{results.correctCount}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Correctes</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error-color)' }}>{incorrectCount}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Incorrectes</div>
              </div>
              {results.duration != null && (
                <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
                    {Math.floor(results.duration / 60)}:{String(results.duration % 60).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Durée</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '1rem' }}>
                Détail des réponses
              </h3>
              {(results.breakdown || []).map((item, idx) => (
                <div key={item.questionId || idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    {item.isCorrect ? <CheckCircle size={18} color="var(--success-color)" style={{ flexShrink: 0, marginTop: '2px' }} /> : <XCircle size={18} color="var(--error-color)" style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.92rem' }}>{idx + 1}. {item.statement}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                        Votre réponse : <span style={{ fontWeight: 600, color: item.isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>{item.selectedAnswer || '—'}</span>
                      </p>
                      {!item.isCorrect && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                          Bonne réponse : <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{item.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {!passed && (
                <Button variant="secondary" size="large" onClick={handleRetry}>
                  Réessayer le quiz
                </Button>
              )}
              <Button variant="primary" size="large" onClick={() => window.history.back()}>
                Continuer le cours
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card variant="default" padding="2rem" style={{ textAlign: 'center' }}>
          <p>Ce quiz ne contient aucune question pour le moment.</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / totalCount) * 100;

  // Anti-cheat: block copy / cut / right-click and text selection while taking
  // the quiz, so question statements and options can't be lifted out. (Not
  // foolproof — a determined user can still screenshot — but stops casual copy.)
  const blockCopy = (e) => { e.preventDefault(); return false; };

  return (
    <div
      onCopy={blockCopy}
      onCut={blockCopy}
      onContextMenu={blockCopy}
      style={{
        minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem',
        userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link
            to={`/learn/${courseId}/lesson/intro`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', textDecoration: 'none' }}
          >
            <ChevronLeft size={20} />
            Quitter le quiz
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
            <Clock size={18} />
            <span style={{ fontWeight: 600 }}>
              {answeredCount}/{totalCount} répondues
            </span>
          </div>
        </div>

        <Card variant="default" padding="2rem" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
            {quiz.title}
          </h1>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              <span>Question {currentQuestion + 1} sur {totalCount}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="2rem" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', color: 'var(--text-color)' }}>
            {currentQ.statement}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(currentQ.options || []).map((option) => {
              const selected = answers[currentQ.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQ.id, option)}
                  style={{
                    padding: '1rem 1.5rem',
                    border: selected ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                    borderRadius: '12px',
                    background: selected ? 'var(--bg-color)' : 'var(--surface-color)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    border: selected ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {selected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />}
                  </div>
                  <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Précédent
          </Button>

          {currentQuestion === totalCount - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={answeredCount < totalCount || submitting}
              loading={submitting}
            >
              Soumettre le quiz
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion(prev => Math.min(totalCount - 1, prev + 1))}
              disabled={!answers[currentQ.id]}
            >
              Suivant <ChevronRight size={18} style={{ marginLeft: '0.25rem' }} />
            </Button>
          )}
        </div>

        {totalCount > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: currentQuestion === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: answers[q.id] ? 'var(--primary)' : '#fff',
                  color: answers[q.id] ? '#fff' : 'var(--secondary)',
                  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        {answeredCount < totalCount && (
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)' }}>
            Répondez à toutes les questions ({answeredCount}/{totalCount}) pour soumettre le quiz.
          </p>
        )}

        {submitError && (
          <div style={{
            marginTop: '1rem', padding: '1rem', background: '#fee',
            border: '1px solid #fcc', borderRadius: '8px', color: '#c33',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <AlertCircle size={18} />
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}
