import { useState } from 'react';
import { FileText, Check, X, Star, MessageSquare, Clock, Award } from 'lucide-react';
import { useAssignmentSubmissions } from '../hooks/useAssignments';

export default function AssignmentGrading({ assignmentId }) {
  const { submissions, loading, error, gradeSubmission } = useAssignmentSubmissions(assignmentId);
  const [gradingId, setGradingId] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');

  const handleSubmitGrade = async (submissionId) => {
    setGradeError('');
    
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
      setGradeError('La note doit être entre 0 et 20');
      return;
    }

    try {
      await gradeSubmission(submissionId, gradeNum, feedback);
      setGrade('');
      setFeedback('');
      setGradingId(null);
    } catch (err) {
      setGradeError(err.response?.data?.error?.message || 'Erreur lors de la notation');
    }
  };

  const getGradeColor = (g) => {
    if (g >= 16) return '#10b981';
    if (g >= 12) return '#3b82f6';
    if (g >= 10) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
          Soumissions
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--secondary)' }}>
          Noter les devoirs des étudiants
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
          Chargement...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error-color)' }}>
          {error}
        </div>
      )}

      {!loading && !error && submissions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          <FileText size={36} style={{ opacity: 0.3, color: 'var(--secondary)', marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Aucune soumission pour le moment
          </p>
        </div>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {submissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                padding: '1rem',
                background: 'var(--bg-color)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--primary)10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontWeight: 700,
                    }}
                  >
                    {submission.student?.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)' }}>
                      {submission.student?.firstName} {submission.student?.lastName}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      <Clock size={12} />
                      {formatDate(submission.submittedAt)}
                    </div>
                  </div>
                </div>
                {submission.grade !== null ? (
                  <div
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      background: `${getGradeColor(submission.grade)}15`,
                      color: getGradeColor(submission.grade),
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Award size={14} />
                    {submission.grade}/20
                  </div>
                ) : (
                  <button
                    onClick={() => setGradingId(submission.id)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Star size={14} />
                    Noter
                  </button>
                )}
              </div>

              {submission.content && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fff', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                  {submission.content}
                </div>
              )}

              {submission.feedback && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>
                    <MessageSquare size={14} />
                    Feedback
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>
                    {submission.feedback}
                  </p>
                </div>
              )}

              {gradingId === submission.id && (
                <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.35rem' }}>
                      Note (0-20)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="ex: 15.5"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.35rem' }}>
                      Feedback (optionnel)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Commentaires sur le travail..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                  {gradeError && (
                    <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{gradeError}</p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleSubmitGrade(submission.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Check size={14} />
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        setGradingId(null);
                        setGrade('');
                        setFeedback('');
                        setGradeError('');
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: 'var(--secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <X size={14} />
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
