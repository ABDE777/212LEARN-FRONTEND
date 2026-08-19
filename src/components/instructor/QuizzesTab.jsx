import { useState } from 'react';
import { Brain, HelpCircle, Pencil, Save, Trash2, X } from 'lucide-react';
import { useCourseQuizzes, useCreateQuiz, useGenerateAiQuiz, useAddQuizQuestion, useQuiz, useUpdateQuiz, useDeleteQuiz, useUpdateQuestion, useDeleteQuestion, useCourseCurriculum } from '../../hooks/useInstructorCourses';
import LoadingSpinner from '../LoadingSpinner';

export default function QuizzesTab({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [viewingQuizId, setViewingQuizId] = useState(null);

  const [aiLessonId, setAiLessonId] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(5);

  const [newQuestionQuizId, setNewQuestionQuizId] = useState('');
  const [questionStatement, setQuestionStatement] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);
  const [questionCorrect, setQuestionCorrect] = useState('');

  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizEditTitle, setQuizEditTitle] = useState('');

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQStatement, setEditQStatement] = useState('');
  const [editQOptions, setEditQOptions] = useState(['', '', '', '']);
  const [editQCorrect, setEditQCorrect] = useState('');

  const [quizMsg, setQuizMsg] = useState(null);

  const { curriculum, loading: currLoading } = useCourseCurriculum(selectedCourseId);
  const { quizzes, loading: quizzesLoading, refreshQuizzes } = useCourseQuizzes(selectedCourseId);
  const { createQuiz, loading: createLoading, error: createError } = useCreateQuiz();
  const { generateQuiz, loading: genLoading, error: genError } = useGenerateAiQuiz();
  const { addQuestion, loading: addQLoading, error: addQError } = useAddQuizQuestion();
  const { quiz: viewingQuiz, loading: viewingLoading, error: viewingError, refreshQuiz } = useQuiz(viewingQuizId);
  const { updateQuiz, error: updateQuizError } = useUpdateQuiz();
  const { deleteQuiz, loading: deleteQuizLoading } = useDeleteQuiz();
  const { updateQuestion, error: updateQuestionError } = useUpdateQuestion();
  const { deleteQuestion, loading: deleteQuestionLoading } = useDeleteQuestion();

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const allLessons = curriculum.flatMap(sec =>
    (sec.lessons || []).map(les => ({
      id: les.id || les._id,
      label: `${sec.title || sec.name} — ${les.title || les.name || 'Leçon'}`,
    }))
  );

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedLessonId || !quizTitle.trim()) return;
    try {
      await createQuiz(selectedLessonId, quizTitle.trim());
      setQuizTitle('');
      setSelectedLessonId('');
      setQuizMsg({ type: 'success', text: 'Quiz créé avec succès.' });
      await refreshQuizzes();
    } catch {}
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiLessonId || !aiTitle.trim() || !aiPrompt.trim()) return;
    try {
      await generateQuiz(aiLessonId, { title: aiTitle.trim(), prompt: aiPrompt.trim(), questionCount: aiCount });
      setAiTitle('');
      setAiPrompt('');
      setAiCount(5);
      setAiLessonId('');
      setQuizMsg({ type: 'success', text: 'Quiz généré avec succès.' });
      await refreshQuizzes();
    } catch {}
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionQuizId || !questionStatement.trim() || questionOptions.some(o => !o.trim()) || !questionCorrect.trim()) return;
    try {
      await addQuestion(newQuestionQuizId, {
        statement: questionStatement.trim(),
        options: questionOptions.map(o => o.trim()),
        correctAnswer: questionCorrect.trim(),
      });
      setQuestionStatement('');
      setQuestionOptions(['', '', '', '']);
      setQuestionCorrect('');
      setQuizMsg({ type: 'success', text: 'Question ajoutée avec succès.' });
    } catch {}
  };

  const handleOptionChange = (idx, val) => {
    setQuestionOptions(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleQuizStatusChange = async (quizId, status) => {
    try {
      await updateQuiz(quizId, { validationStatus: status });
      setQuizMsg({ type: 'success', text: `Statut du quiz défini sur "${status}".` });
      await refreshQuizzes();
      if (viewingQuizId === quizId) await refreshQuiz();
    } catch {}
  };

  const startEditQuiz = (quiz) => {
    setEditingQuizId(quiz.id);
    setQuizEditTitle(quiz.title || '');
  };

  const handleSaveQuizTitle = async (e) => {
    e.preventDefault();
    if (!editingQuizId || !quizEditTitle.trim()) return;
    try {
      await updateQuiz(editingQuizId, { title: quizEditTitle.trim() });
      setEditingQuizId(null);
      setQuizMsg({ type: 'success', text: 'Titre du quiz mis à jour.' });
      await refreshQuizzes();
      if (viewingQuizId === editingQuizId) await refreshQuiz();
    } catch {}
  };

  const handleDeleteQuiz = async (quiz) => {
    const confirmed = window.confirm(`Supprimer le quiz "${quiz.title}" et toutes ses questions ?`);
    if (!confirmed) return;
    try {
      await deleteQuiz(quiz.id);
      if (viewingQuizId === quiz.id) setViewingQuizId(null);
      setQuizMsg({ type: 'success', text: 'Quiz supprimé avec succès.' });
      await refreshQuizzes();
    } catch {}
  };

  const startEditQuestion = (q) => {
    const opts = q.options || [];
    setEditingQuestionId(q.id);
    setEditQStatement(q.statement || '');
    setEditQOptions(opts.length === 4 ? [...opts] : [...opts, ...Array(4 - opts.length).fill('')].slice(0, 4));
    setEditQCorrect(q.correctAnswer || '');
  };

  const handleEditOptionChange = (idx, val) => {
    setEditQOptions(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestionId || !editQStatement.trim() || editQOptions.some(o => !o.trim()) || !editQCorrect.trim()) return;
    try {
      await updateQuestion(editingQuestionId, {
        statement: editQStatement.trim(),
        options: editQOptions.map(o => o.trim()),
        correctAnswer: editQCorrect.trim(),
      });
      setEditingQuestionId(null);
      setQuizMsg({ type: 'success', text: 'Question mise à jour avec succès.' });
      await refreshQuiz();
    } catch {}
  };

  const handleDeleteQuestion = async (question) => {
    const confirmed = window.confirm('Supprimer cette question ?');
    if (!confirmed) return;
    try {
      await deleteQuestion(question.id);
      setQuizMsg({ type: 'success', text: 'Question supprimée avec succès.' });
      await refreshQuiz();
    } catch {}
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Quiz</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Créez, modifiez et gérez des quiz pour vos cours.
        </p>
      </div>

      {quizMsg && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: quizMsg.type === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${quizMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          color: quizMsg.type === 'success' ? '#155724' : '#721c24',
        }}>
          <span>{quizMsg.text}</span>
          <button onClick={() => setQuizMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>×</button>
        </div>
      )}
      {(updateQuizError || updateQuestionError) && (
        <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {updateQuizError || updateQuestionError}
        </div>
      )}

      {/* Course selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {courses.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setSelectedCourseId(c.id); setSelectedLessonId(''); setAiLessonId(''); setNewQuestionQuizId(''); setViewingQuizId(null); setEditingQuizId(null); setEditingQuestionId(null); setQuizMsg(null); }}
            style={{
              padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${selectedCourseId === c.id ? 'var(--primary)' : 'var(--border-color)'}`,
              background: selectedCourseId === c.id ? 'rgba(193,101,47,0.08)' : 'transparent',
              color: selectedCourseId === c.id ? 'var(--primary)' : 'var(--secondary)',
              transition: 'all 0.15s',
            }}
          >
            {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}
          </button>
        ))}
      </div>

      {/* View quiz detail */}
      {viewingQuizId && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--primary)', borderRadius: '12px', background: 'rgba(193,101,47,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
              {viewingQuiz ? viewingQuiz.title : 'Chargement...'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {viewingQuiz && (
                <select
                  className="form-control"
                  value={viewingQuiz.validationStatus || 'draft'}
                  onChange={e => handleQuizStatusChange(viewingQuiz.id, e.target.value)}
                  style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                >
                  <option value="draft">draft</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              )}
              {viewingQuiz && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuiz(viewingQuiz)}
                  disabled={deleteQuizLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                    border: '1px solid #f5c6cb', background: '#f8d7da', color: '#721c24', cursor: deleteQuizLoading ? 'wait' : 'pointer',
                  }}
                >
                  <Trash2 size={13} /> Supprimer
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingQuizId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Fermer
              </button>
            </div>
          </div>
          {viewingLoading && <LoadingSpinner />}
          {!viewingLoading && viewingError && (
            <p style={{ color: 'var(--error-color)', fontSize: '0.9rem' }}>{viewingError}</p>
          )}
          {!viewingLoading && !viewingError && !viewingQuiz && (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucune donnée reçue pour ce quiz.</p>
          )}
          {!viewingLoading && viewingQuiz && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
                Statut : <span style={{ fontWeight: 600, color: viewingQuiz.validationStatus === 'approved' ? 'var(--success-color)' : viewingQuiz.validationStatus === 'rejected' ? 'var(--error-color)' : '#b26a00' }}>
                  {viewingQuiz.validationStatus}
                </span>
                {' · '}{(viewingQuiz.questions || []).length} question{(viewingQuiz.questions || []).length !== 1 ? 's' : ''}
              </p>
              {(viewingQuiz.questions || []).length === 0 && (
                <p style={{ color: 'var(--secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>Aucune question pour l'instant.</p>
              )}
              {(viewingQuiz.questions || []).map((q, idx) => (
                editingQuestionId === q.id ? (
                  <div key={q.id || idx} style={{ padding: '1rem', border: '1.5px solid var(--primary)', borderRadius: '8px', marginBottom: '0.75rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary)' }}>Modifier la question</p>
                      <button type="button" onClick={() => setEditingQuestionId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.82rem' }}>Annuler</button>
                    </div>
                    <form onSubmit={handleSaveQuestion}>
                      <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Question *</label>
                        <input type="text" className="form-control" value={editQStatement} onChange={e => setEditQStatement(e.target.value)} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        {editQOptions.map((opt, oi) => (
                          <div key={oi} className="form-group" style={{ margin: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.8rem', color: 'var(--secondary)' }}>Option {oi + 1} *</label>
                            <input type="text" className="form-control" value={opt} onChange={e => handleEditOptionChange(oi, e.target.value)} required />
                          </div>
                        ))}
                      </div>
                      <div className="form-group" style={{ margin: 0, marginBottom: '1rem', maxWidth: '400px' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Bonne réponse *</label>
                        <select className="form-control" value={editQCorrect} onChange={e => setEditQCorrect(e.target.value)} required>
                          <option value="">-- Choisir la bonne réponse --</option>
                          {editQOptions.filter(o => o.trim()).map((opt, oi) => (
                            <option key={oi} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={!editQStatement.trim() || editQOptions.some(o => !o.trim()) || !editQCorrect.trim()}
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Enregistrer
                      </button>
                    </form>
                  </div>
                ) : (
                  <div key={q.id || idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.92rem' }}>{idx + 1}. {q.statement}</p>
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button type="button" onClick={() => startEditQuestion(q)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)', cursor: 'pointer' }}>
                          <Pencil size={12} /> Modifier
                        </button>
                        <button type="button" onClick={() => handleDeleteQuestion(q)} disabled={deleteQuestionLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: '1px solid #f5c6cb', background: '#fff', color: 'var(--error-color)', cursor: deleteQuestionLoading ? 'wait' : 'pointer' }}>
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', background: opt === q.correctAnswer ? 'rgba(52,168,83,0.1)' : 'var(--bg-color)', border: `1px solid ${opt === q.correctAnswer ? 'var(--success-color)' : 'var(--border-color)'}`, color: opt === q.correctAnswer ? 'var(--success-color)' : 'var(--text-color)' }}>
                          {opt} {opt === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Create quiz manually */}
        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <HelpCircle size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)' }}>Créer un quiz</h3>
          </div>
          {createError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{createError}</p>}
          <form onSubmit={handleCreateQuiz}>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Leçon *</label>
              <select
                className="form-control"
                value={selectedLessonId}
                onChange={e => setSelectedLessonId(e.target.value)}
                required
                disabled={currLoading}
              >
                <option value="">{currLoading ? 'Chargement...' : '-- Sélectionner une leçon --'}</option>
                {allLessons.map(les => (
                  <option key={les.id} value={les.id}>{les.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Titre du quiz *</label>
              <input
                type="text"
                className="form-control"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="ex: Quiz React Hooks"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={createLoading || !selectedLessonId || !quizTitle.trim()} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              {createLoading ? 'Création...' : 'Créer le quiz'}
            </button>
          </form>
        </div>

        {/* AI generate */}
        <div style={{ padding: '1.5rem', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', background: 'rgba(124,58,237,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={18} color="#7C3AED" />
            <h3 style={{ fontSize: '1rem', color: '#7C3AED' }}>Générer avec l'IA</h3>
          </div>
          {genError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{genError}</p>}
          <form onSubmit={handleAiGenerate}>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Leçon *</label>
              <select
                className="form-control"
                value={aiLessonId}
                onChange={e => setAiLessonId(e.target.value)}
                required
                disabled={currLoading}
              >
                <option value="">{currLoading ? 'Chargement...' : '-- Sélectionner une leçon --'}</option>
                {allLessons.map(les => (
                  <option key={les.id} value={les.id}>{les.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Titre du quiz *</label>
              <input
                type="text"
                className="form-control"
                value={aiTitle}
                onChange={e => setAiTitle(e.target.value)}
                placeholder="ex: Quiz JavaScript avancé"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Prompt / consignes *</label>
              <textarea
                className="form-control"
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Décrivez le contenu du quiz..."
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0, marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Nombre de questions</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={20}
                value={aiCount}
                onChange={e => setAiCount(parseInt(e.target.value) || 5)}
              />
            </div>
            <button type="submit" disabled={genLoading || !aiLessonId || !aiTitle.trim() || !aiPrompt.trim()} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: genLoading || !aiLessonId || !aiTitle.trim() || !aiPrompt.trim() ? 0.6 : 1 }}>
              {genLoading ? 'Génération...' : 'Générer avec l\'IA'}
            </button>
          </form>
        </div>
      </div>

      {/* Add question */}
      <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Ajouter une question</h3>
        {addQError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{addQError}</p>}
        <form onSubmit={handleAddQuestion}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Quiz *</label>
              <select className="form-control" value={newQuestionQuizId} onChange={e => setNewQuestionQuizId(e.target.value)} required>
                <option value="">-- Sélectionner un quiz --</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.questionCount || 0} questions)</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Question *</label>
              <input type="text" className="form-control" value={questionStatement} onChange={e => setQuestionStatement(e.target.value)} placeholder="Quelle est la bonne réponse ?" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {questionOptions.map((opt, idx) => (
              <div key={idx} className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.8rem', color: 'var(--secondary)' }}>Option {idx + 1} *</label>
                <input type="text" className="form-control" value={opt} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} required />
              </div>
            ))}
          </div>
          <div className="form-group" style={{ margin: 0, marginBottom: '1rem', maxWidth: '400px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem' }}>Bonne réponse *</label>
            <select className="form-control" value={questionCorrect} onChange={e => setQuestionCorrect(e.target.value)} required>
              <option value="">-- Choisir la bonne réponse --</option>
              {questionOptions.filter(o => o.trim()).map((opt, idx) => (
                <option key={idx} value={opt.trim()}>{opt.trim()}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={addQLoading || !newQuestionQuizId || !questionStatement.trim() || questionOptions.some(o => !o.trim()) || !questionCorrect.trim()} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            {addQLoading ? 'Ajout...' : 'Ajouter la question'}
          </button>
        </form>
      </div>

      {/* Existing quizzes list */}
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          Quiz existants {selectedCourse ? `— ${selectedCourse.title}` : ''}
        </h3>
        {quizzesLoading && <LoadingSpinner />}
        {!quizzesLoading && quizzes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            <HelpCircle size={28} style={{ color: 'var(--secondary)', opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun quiz pour ce cours.</p>
          </div>
        )}
        {!quizzesLoading && quizzes.length > 0 && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {quizzes.map(quiz => (
              <div key={quiz.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#fff', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  {editingQuizId === quiz.id ? (
                    <form onSubmit={handleSaveQuizTitle} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={quizEditTitle}
                        onChange={e => setQuizEditTitle(e.target.value)}
                        autoFocus
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.88rem' }}
                      />
                      <button type="submit" disabled={!quizEditTitle.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        <Save size={13} /> OK
                      </button>
                      <button type="button" onClick={() => setEditingQuizId(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: 'transparent', color: 'var(--secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <X size={13} /> Annuler
                      </button>
                    </form>
                  ) : (
                    <p style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.2rem' }}>{quiz.title}</p>
                  )}
                  <p style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
                    {quiz.lessonTitle || 'Leçon'} {quiz.sectionTitle ? `· ${quiz.sectionTitle}` : ''} · {quiz.questionCount || 0} question{(quiz.questionCount || 0) !== 1 ? 's' : ''}
                    {' · '}
                    <span style={{ color: quiz.validationStatus === 'approved' ? 'var(--success-color)' : quiz.validationStatus === 'rejected' ? 'var(--error-color)' : '#b26a00', fontWeight: 600 }}>
                      {quiz.validationStatus}
                    </span>
                  </p>
                  {quiz.lastAttempt && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                      Dernière tentative : {quiz.lastAttempt.score}%
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <select
                    className="form-control"
                    value={quiz.validationStatus || 'draft'}
                    onChange={e => handleQuizStatusChange(quiz.id, e.target.value)}
                    style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    title="Changer le statut"
                  >
                    <option value="draft">draft</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => editingQuizId === quiz.id ? setEditingQuizId(null) : startEditQuiz(quiz)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff', color: 'var(--text-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <Pencil size={13} /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingQuizId(quiz.id)}
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--primary)', borderRadius: '8px', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Voir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz)}
                    disabled={deleteQuizLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #f5c6cb', borderRadius: '8px', background: '#fff', color: 'var(--error-color)', cursor: deleteQuizLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
