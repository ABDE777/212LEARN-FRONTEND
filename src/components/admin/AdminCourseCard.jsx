import { Award, Folder, Loader, Pencil, ShieldCheck, Trash2, User } from 'lucide-react';
import { getCourseInstructorLabel } from './adminCourseHelpers';


export default function AdminCourseCard({
  course,
  onPublish,
  publishLoading,
  onEdit,
  onDelete,
  deleteLoading,
  isDraft = false,
}) {
  const levelLabel = course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : course.level === 'advanced' ? 'Avancé' : (course.level || 'Général');


  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'var(--neu-shadow-raised)',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
      }}
    >
      {/* Course Banner Top */}
      <div
        style={{
          height: '110px',
          background: course.thumbnail || course.imageUrl
            ? `url(${course.thumbnail || course.imageUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1B4B5A 0%, #2A6F84 50%, #C1652F 100%)',
          position: 'relative',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Price Tag */}
        <span
          style={{
            background: 'rgba(27, 75, 90, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {course.price ? `${course.price} MAD` : 'GRATUIT'}
        </span>

        {/* Status Badge */}
        {(() => {
          const statusLower = (course.status || 'draft').toLowerCase();
          const badgeBg = statusLower === 'published'
            ? 'rgba(40, 167, 69, 0.9)'
            : statusLower === 'archived'
            ? 'rgba(108, 117, 125, 0.9)'
            : 'rgba(232, 163, 61, 0.9)';
          const badgeLabel = statusLower === 'published'
            ? 'Publié'
            : statusLower === 'archived'
            ? 'Archivé'
            : 'Brouillon';

          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: badgeBg,
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              {badgeLabel}
            </span>
          );
        })()}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.4rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category & Level Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.65rem',
              borderRadius: '8px',
              background: 'rgba(193, 101, 47, 0.08)',
              color: 'var(--primary)',
            }}
          >
            <Folder size={12} />
            {course.category?.name || 'Général'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.65rem',
              borderRadius: '8px',
              background: 'rgba(27, 75, 90, 0.08)',
              color: 'var(--secondary)',
            }}
          >
            <Award size={12} />
            {levelLabel}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--secondary)',
            marginBottom: '0.5rem',
            lineHeight: 1.35,
          }}
        >
          {course.title}
        </h3>

        {/* Description Excerpt */}
        {course.description && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-color)',
              opacity: 0.75,
              marginBottom: '1rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description}
          </p>
        )}

        {/* Instructor Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-color)',
            borderRadius: '12px',
            boxShadow: 'var(--neu-shadow-inset-sm)',
            marginBottom: '1.25rem',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            <User size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {course.instructors && course.instructors.length > 1 
                ? `${course.instructors.length} instructeurs`
                : getCourseInstructorLabel(course)
              }
            </span>
            {course.instructors && course.instructors.length > 1 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {course.instructors.map(i => i.user ? `${i.user.firstName} ${i.user.lastName}` : 'Inconnu').join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(43, 38, 34, 0.06)' }}>
          {isDraft && (
            <button
              type="button"
              onClick={() => onPublish(course.id)}
              disabled={publishLoading}
              className="btn-primary"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                fontSize: '0.82rem',
              }}
            >
              {publishLoading ? <Loader size={14} className="spin" /> : <ShieldCheck size={14} />}
              Publier
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(course)}
            style={{
              flex: isDraft ? '0 0 auto' : 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: 'var(--bg-color)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: 'var(--neu-shadow-raised-sm)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Pencil size={14} />
            Modifier
          </button>

            <button
              type="button"
              onClick={() => onDelete(course.id, course.title)}
              disabled={deleteLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(220, 53, 69, 0.08)',
                color: '#dc3545',
                border: '1px solid rgba(220, 53, 69, 0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={14} />
              {deleteLoading ? '...' : ''}
            </button>
          </div>
      </div>
    </div>
  );
}
