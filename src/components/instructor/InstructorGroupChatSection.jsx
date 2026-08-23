import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import GroupChatRoom from '../GroupChatRoom';
import LoadingSpinner from '../LoadingSpinner';
import { useInstructorCourses } from '../../hooks/useInstructorCourses';
import { useAuth } from '../../context/AuthContext';

/**
 * Course discussion space for the instructor. One chat per course, shared with
 * every enrolled student (backed by /courses/:id/messages). Replaces the old
 * per-group chat.
 */
export default function InstructorGroupChatSection() {
  const { user } = useAuth();
  const { courses, loading } = useInstructorCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) setSelectedCourse(courses[0]);
  }, [courses, selectedCourse]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner /></div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={22} style={{ color: 'var(--primary)' }} /> Discussion du cours & Modération IA
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.92rem' }}>
          Un espace de discussion par cours, partagé avec les étudiants inscrits. Tous les messages sont filtrés par IA contre les propos inappropriés.
        </p>
      </div>

      {courses.length > 0 ? (
        <>
          {/* Course selector pills */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {courses.map((c) => {
              const isSelected = selectedCourse && selectedCourse.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourse(c)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: isSelected ? 'var(--primary)' : '#cbd5e1',
                    background: isSelected ? 'rgba(193, 101, 47, 0.08)' : '#ffffff',
                    color: isSelected ? 'var(--primary)' : 'var(--secondary)',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  💬 {c.title?.length > 32 ? `${c.title.slice(0, 32)}…` : (c.title || 'Cours')}
                </button>
              );
            })}
          </div>

          {selectedCourse && (
            <GroupChatRoom
              key={selectedCourse.id}
              chatBasePath={`/courses/${selectedCourse.id}`}
              groupName={selectedCourse.title}
              formateurName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Vous (Formateur)'}
            />
          )}
        </>
      ) : (
        <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Aucun cours</h3>
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Dès que vous aurez un cours, son espace de discussion s'affichera ici.
          </p>
        </div>
      )}
    </div>
  );
}
