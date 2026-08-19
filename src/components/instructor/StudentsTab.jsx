import { useState } from 'react';
import { Mail, Search, Users } from 'lucide-react';
import { useCourseStudents } from '../../hooks/useCourseStudents';
import LoadingSpinner from '../LoadingSpinner';

export default function StudentsTab({ courses }) {
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || '');
  const [search, setSearch] = useState('');
  const { students, loading, error } = useCourseStudents(activeCourseId);

  const filtered = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const email = (s.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Mes étudiants</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Consultez les étudiants inscrits à vos cours.
        </p>
      </div>

      {/* Course filter pills */}
      {courses.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {courses.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActiveCourseId(c.id); setSearch(''); }}
              style={{
                padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${activeCourseId === c.id ? 'var(--primary)' : 'var(--border-color)'}`,
                background: activeCourseId === c.id ? 'rgba(193,101,47,0.08)' : 'transparent',
                color: activeCourseId === c.id ? 'var(--primary)' : 'var(--secondary)',
                transition: 'all 0.15s',
              }}
            >
              {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', opacity: 0.6 }} />
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(193,101,47,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Users size={28} color="var(--primary)" />
          </div>
          <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            {students.length === 0 ? 'Aucun étudiant inscrit' : 'Aucun résultat'}
          </h3>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            {students.length === 0
              ? "Aucun étudiant n'est encore inscrit à ce cours."
              : 'Aucun étudiant ne correspond à votre recherche.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Nom</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Date d'inscription</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => (
                <tr key={student.id || idx}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {student.firstName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {student.firstName || ''} {student.lastName || ''}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} />
                      {student.email || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                    {student.enrolledAt
                      ? new Date(student.enrolledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
          {filtered.length} étudiant{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''} sur {students.length}
        </p>
      )}
    </div>
  );
}
