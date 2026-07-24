import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2, FileText, Video, Upload, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCurriculumBuilder } from '../hooks/useCurriculumBuilder';
import { useInstructorAssignments, useSubmissions } from '../hooks/useInstructorAssignments';

export default function InstructorCourseManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('curriculum');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/instructor/dashboard')} 
          className="btn-secondary" 
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Manage Course</h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('curriculum')}
            style={{ 
              background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, 
              color: activeTab === 'curriculum' ? 'var(--primary)' : 'var(--secondary)',
              cursor: 'pointer', borderBottom: activeTab === 'curriculum' ? '2px solid var(--primary)' : 'none',
              paddingBottom: '0.5rem'
            }}
          >
            Curriculum Builder
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            style={{ 
              background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, 
              color: activeTab === 'assignments' ? 'var(--primary)' : 'var(--secondary)',
              cursor: 'pointer', borderBottom: activeTab === 'assignments' ? '2px solid var(--primary)' : 'none',
              paddingBottom: '0.5rem'
            }}
          >
            Assignments & Grading
          </button>
        </div>

        {activeTab === 'curriculum' && <CurriculumBuilder courseId={id} />}
        {activeTab === 'assignments' && <AssignmentsManager courseId={id} />}
      </div>
    </div>
  );
}

function CurriculumBuilder({ courseId }) {
  const { 
    curriculum, loading, error, fetchCurriculum, 
    createSection, deleteSection, createLesson, deleteLesson, addResource, deleteResource 
  } = useCurriculumBuilder(courseId);

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [newLessonData, setNewLessonData] = useState({ sectionId: null, title: '', type: 'video' });
  const [uploadingResource, setUploadingResource] = useState(null);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle) return;
    await createSection(newSectionTitle);
    setNewSectionTitle('');
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLessonData.title || !newLessonData.sectionId) return;
    await createLesson(newLessonData.sectionId, { title: newLessonData.title, type: newLessonData.type });
    setNewLessonData({ sectionId: null, title: '', type: 'video' });
  };

  const handleResourceUpload = async (lessonId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResource(lessonId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await addResource(lessonId, formData);
    } catch (err) {
      alert('Failed to upload resource');
    } finally {
      setUploadingResource(null);
    }
  };

  if (loading && curriculum.length === 0) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div>
      <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="New Section Title" 
          value={newSectionTitle} 
          onChange={(e) => setNewSectionTitle(e.target.value)} 
          required 
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Section
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {curriculum.map((section) => (
          <div key={section.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
            <div 
              style={{ padding: '1rem 1.5rem', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleSection(section.id)}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{section.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
                {expandedSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedSections[section.id] && (
              <div style={{ padding: '1.5rem' }}>
                {section.lessons && section.lessons.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
                    {section.lessons.map(lesson => (
                      <li key={lesson.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {lesson.type === 'video' ? <Video size={18} color="var(--primary)" /> : <FileText size={18} color="var(--primary)" />}
                          <span style={{ fontWeight: 500 }}>{lesson.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                            <Upload size={16} /> Add Resource
                            <input type="file" style={{ display: 'none' }} onChange={(e) => handleResourceUpload(lesson.id, e)} />
                          </label>
                          {uploadingResource === lesson.id && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Uploading...</span>}
                          <button onClick={() => deleteLesson(lesson.id)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>No lessons in this section.</p>
                )}

                {newLessonData.sectionId === section.id ? (
                  <form onSubmit={handleAddLesson} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="text" className="form-control" placeholder="Lesson Title" value={newLessonData.title} onChange={e => setNewLessonData({...newLessonData, title: e.target.value})} required style={{ flex: 1 }} />
                    <select className="form-control" value={newLessonData.type} onChange={e => setNewLessonData({...newLessonData, type: e.target.value})} style={{ width: 'auto' }}>
                      <option value="video">Video</option>
                      <option value="text">Text/Article</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                    <button type="button" onClick={() => setNewLessonData({ sectionId: null, title: '', type: 'video' })} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setNewLessonData({ sectionId: section.id, title: '', type: 'video' })} 
                    style={{ background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '0.75rem', width: '100%', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={16} /> Add Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentsManager({ courseId }) {
  // In a real app we'd fetch all lessons for a course, then fetch assignments.
  // For simplicity here, we assume the user provides a lesson ID to view its assignments, 
  // or we fetch the curriculum and aggregate assignments.
  const { curriculum, fetchCurriculum } = useCurriculumBuilder(courseId);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  
  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const lessons = curriculum.reduce((acc, section) => {
    if (section.lessons) {
      acc.push(...section.lessons);
    }
    return acc;
  }, []);

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>Select a lesson to manage assignments</h3>
      <select 
        className="form-control" 
        value={selectedLessonId} 
        onChange={(e) => setSelectedLessonId(e.target.value)}
        style={{ marginBottom: '2rem', maxWidth: '400px' }}
      >
        <option value="">-- Choose Lesson --</option>
        {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
      </select>

      {selectedLessonId && <AssignmentList lessonId={selectedLessonId} />}
    </div>
  );
}

function AssignmentList({ lessonId }) {
  const { assignments, loading, fetchAssignments, createAssignment } = useInstructorAssignments(lessonId);
  const [newTitle, setNewTitle] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  useEffect(() => {
    fetchAssignments();
    setSelectedAssignmentId(null);
  }, [fetchAssignments, lessonId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    await createAssignment({ title: newTitle, description: 'Nouvel exercice' });
    setNewTitle('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      <div>
        <h4 style={{ marginBottom: '1rem' }}>Assignments</h4>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" className="form-control" placeholder="Assignment Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem' }}><Plus size={16} /></button>
        </form>
        {loading && <LoadingSpinner />}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {assignments.map(a => (
            <li 
              key={a.id} 
              onClick={() => setSelectedAssignmentId(a.id)}
              style={{ 
                padding: '1rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                marginBottom: '0.5rem', 
                cursor: 'pointer',
                background: selectedAssignmentId === a.id ? 'var(--bg-color)' : '#fff',
                borderColor: selectedAssignmentId === a.id ? 'var(--primary)' : 'var(--border-color)'
              }}
            >
              <strong>{a.title}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {selectedAssignmentId ? (
          <SubmissionsList assignmentId={selectedAssignmentId} />
        ) : (
          <div style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--secondary)' }}>
            Select an assignment to grade submissions
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionsList({ assignmentId }) {
  const { submissions, loading, fetchSubmissions, gradeSubmission } = useSubmissions(assignmentId);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions, assignmentId]);

  const handleGrade = async (subId, e) => {
    e.preventDefault();
    const grade = e.target.grade.value;
    const feedback = e.target.feedback.value;
    await gradeSubmission(subId, { grade: Number(grade), feedback });
    alert('Graded successfully!');
  };

  return (
    <div>
      <h4 style={{ marginBottom: '1rem' }}>Submissions</h4>
      {loading && <LoadingSpinner />}
      {!loading && submissions.length === 0 && <p style={{ color: 'var(--secondary)' }}>No submissions yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submissions.map(sub => (
          <div key={sub.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
            <p><strong>Student ID:</strong> {sub.studentId}</p>
            <p><strong>File:</strong> <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View Submission</a></p>
            
            <form onSubmit={(e) => handleGrade(sub.id, e)} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Grade (0-100)</label>
                  <input name="grade" type="number" className="form-control" defaultValue={sub.grade || ''} min="0" max="100" required />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Feedback</label>
                  <input name="feedback" type="text" className="form-control" defaultValue={sub.feedback || ''} placeholder="Good job!" />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Submit Grade</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
