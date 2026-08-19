import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Clock, Award, Loader } from 'lucide-react';
import { useAssignments } from '../hooks/useAssignments';
import { useAssignmentSubmissions } from '../hooks/useProgress';
import Card from './Card';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* One assignment row: shows the student's submission status, or a submit form. */
function AssignmentItem({ assignment, onSubmitted }) {
  const { submitAssignment, loading, error } = useAssignmentSubmissions();
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Backend returns the student's own submission (if any) in `submissions`.
  const submission = assignment.submissions?.[0] || null;
  const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate);
  const graded = submission && submission.grade != null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!file) {
      setLocalError('Veuillez sélectionner un fichier.');
      return;
    }
    try {
      await submitAssignment(assignment.id, file);
      setFile(null);
      onSubmitted?.();
    } catch {
      // error surfaced via hook's `error`
    }
  };

  return (
    <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FileText size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.05rem' }}>{assignment.title}</h4>
          {assignment.description && (
            <p style={{ margin: '0.35rem 0 0', color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {assignment.description}
            </p>
          )}
          {assignment.dueDate && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: isOverdue && !submission ? 'var(--error-color)' : 'var(--secondary)' }}>
              <Clock size={14} />
              Date limite : {formatDate(assignment.dueDate)}{isOverdue && !submission ? ' (dépassée)' : ''}
            </p>
          )}
        </div>
      </div>

      {submission ? (
        /* Already submitted — show status + grade/feedback if graded */
        <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', borderRadius: '10px', background: graded ? 'rgba(40,167,69,0.08)' : 'rgba(27,75,90,0.06)', border: `1px solid ${graded ? 'rgba(40,167,69,0.3)' : 'var(--border-color)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: graded ? 'var(--success-color)' : 'var(--secondary)' }}>
            <CheckCircle size={16} />
            {graded ? 'Corrigé' : 'Rendu — en attente de correction'}
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--secondary)' }}>
            Envoyé le {formatDate(submission.submittedAt)}
            {submission.fileUrl && (
              <> · <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Voir mon fichier</a></>
            )}
          </p>
          {graded && (
            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '1.15rem', color: submission.grade >= 50 ? 'var(--success-color)' : 'var(--error-color)' }}>
                {submission.grade}/100
              </span>
            </div>
          )}
          {graded && submission.feedback && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>
              <strong>Retour du formateur :</strong> {submission.feedback}
            </p>
          )}
        </div>
      ) : isOverdue ? (
        <div style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', borderRadius: '10px', background: '#fff3cd', border: '1px solid #ffc107', color: '#856404', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          La date limite est dépassée. Ce devoir ne peut plus être rendu.
        </div>
      ) : (
        /* Submit form */
        <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="file"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setLocalError(null); }}
            style={{ flex: '1 1 240px', fontSize: '0.88rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? <Loader size={16} className="spin" /> : <Upload size={16} />}
            {loading ? 'Envoi…' : 'Rendre le devoir'}
          </button>
          {(localError || error) && (
            <p style={{ width: '100%', margin: 0, color: 'var(--error-color)', fontSize: '0.85rem' }}>
              {localError || error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

/* Devoirs section shown inside a lesson in the classroom player. */
export default function LessonAssignments({ lessonId }) {
  const { assignments, loading, error, refetch } = useAssignments(lessonId);

  // Nothing to show for a lesson without assignments — keep the player clean.
  if (loading || error || !Array.isArray(assignments) || assignments.length === 0) return null;

  return (
    <Card variant="default" padding="1.5rem" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={20} /> Devoirs
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assignments.map((a) => (
          <AssignmentItem key={a.id} assignment={a} onSubmitted={refetch} />
        ))}
      </div>
    </Card>
  );
}
