import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, UserPlus, UserMinus, Loader } from 'lucide-react';
import { useCourseGroups } from '../../hooks/useCourseGroups';
import { useCourseStudents } from '../../hooks/useCourseStudents';

/**
 * Instructor self-service groups: pick one of your courses, create groups on it,
 * and assign your enrolled students to a group. Backed by the instructor-scoped
 * endpoints (POST /groups, GET /courses/:id/groups, /groups/:id/students).
 */
export default function InstructorGroupsTab({ courses }) {
  const [courseId, setCourseId] = useState(courses?.[0]?.id || '');
  const { getCourseGroups, createGroup, getGroupStudents, addStudentToGroup, removeStudentFromGroup, loading } = useCourseGroups();
  const { students: courseStudents } = useCourseStudents(courseId);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [newName, setNewName] = useState('');
  const [msg, setMsg] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadGroups = useCallback(async (cid) => {
    if (!cid) { setGroups([]); return; }
    try { setGroups(await getCourseGroups(cid)); } catch { setGroups([]); }
  }, [getCourseGroups]);

  useEffect(() => { loadGroups(courseId); setSelectedGroup(null); setGroupStudents([]); }, [courseId, loadGroups]);

  const openGroup = async (g) => {
    setSelectedGroup(g);
    try {
      const data = await getGroupStudents(g.id);
      setGroupStudents(data?.students || []);
    } catch { setGroupStudents([]); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!newName.trim() || !courseId) return;
    try {
      await createGroup(courseId, newName.trim());
      setNewName('');
      setMsg({ type: 'success', text: 'Groupe créé.' });
      await loadGroups(courseId);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || 'Échec de la création du groupe.' });
    }
  };

  const assignedIds = new Set(groupStudents.map((s) => s.id ?? s.userId));
  const assignable = courseStudents.filter((s) => !assignedIds.has(s.id));

  const handleAdd = async (userId) => {
    if (!selectedGroup) return;
    setBusyId(userId); setMsg(null);
    try {
      await addStudentToGroup(selectedGroup.id, userId);
      await openGroup(selectedGroup);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || "Échec de l'ajout." });
    } finally { setBusyId(null); }
  };

  const handleRemove = async (userId) => {
    if (!selectedGroup) return;
    setBusyId(userId); setMsg(null);
    try {
      await removeStudentFromGroup(selectedGroup.id, userId);
      await openGroup(selectedGroup);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || 'Échec du retrait.' });
    } finally { setBusyId(null); }
  };

  const name = (s) => `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Étudiant';

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem' }}>Mes groupes</h2>
      <p style={{ color: 'var(--secondary)', marginTop: 0 }}>
        Créez des groupes pour vos cours et affectez-y vos étudiants inscrits.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', margin: '1rem 0 1.5rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Cours</span>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={selStyle}>
            {(courses || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Nouveau groupe</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du groupe" style={{ ...selStyle, minWidth: 200 }} />
          </label>
          <button type="submit" disabled={loading || !newName.trim()} style={btnPrimary}>
            <Plus size={15} /> Créer
          </button>
        </form>
      </div>

      {msg && (
        <div style={{ padding: '0.6rem 1rem', borderRadius: 8, marginBottom: '1rem', background: msg.type === 'success' ? '#e8f5e9' : '#ffebee', color: msg.type === 'success' ? '#2e7d32' : '#c62828', fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Groups list */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> Groupes ({groups.length})
          </div>
          {groups.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.88rem', margin: 0 }}>Aucun groupe pour ce cours.</p>
          ) : groups.map((g) => (
            <button
              key={g.id}
              onClick={() => openGroup(g)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: selectedGroup?.id === g.id ? 'var(--bg-color)' : '#fff', fontWeight: 600, color: 'var(--text-color)' }}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Selected group members + assignment */}
        <div>
          {!selectedGroup ? (
            <p style={{ color: 'var(--secondary)' }}>Sélectionnez un groupe pour gérer ses membres.</p>
          ) : (
            <>
              <h3 style={{ margin: '0 0 0.75rem', color: 'var(--secondary)' }}>{selectedGroup.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Panel title={`Membres (${groupStudents.length})`}>
                  {groupStudents.length === 0 ? <Empty text="Aucun membre." /> : groupStudents.map((s) => (
                    <Row key={s.id ?? s.userId} label={name(s)} sub={s.email}
                      action={<IconBtn busy={busyId === (s.id ?? s.userId)} onClick={() => handleRemove(s.id ?? s.userId)} danger><UserMinus size={15} /></IconBtn>} />
                  ))}
                </Panel>
                <Panel title={`À ajouter (${assignable.length})`}>
                  {assignable.length === 0 ? <Empty text="Tous les étudiants sont affectés." /> : assignable.map((s) => (
                    <Row key={s.id} label={name(s)} sub={s.email}
                      action={<IconBtn busy={busyId === s.id} onClick={() => handleAdd(s.id)}><UserPlus size={15} /></IconBtn>} />
                  ))}
                </Panel>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const selStyle = { padding: '0.5rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.9rem', background: '#fff', color: 'var(--text-color)' };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.55rem 1rem', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' };

function Panel({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--secondary)' }}>{title}</div>
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}
function Row({ label, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0.55rem 0.85rem', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub || ''}</div>
      </div>
      {action}
    </div>
  );
}
function IconBtn({ children, onClick, busy, danger }) {
  return (
    <button type="button" onClick={onClick} disabled={busy}
      style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-color)', background: danger ? '#fff5f5' : '#f5faf5', color: danger ? '#c62828' : '#2e7d32', cursor: busy ? 'wait' : 'pointer' }}>
      {busy ? <Loader size={14} className="spin" /> : children}
    </button>
  );
}
function Empty({ text }) {
  return <p style={{ padding: '0.85rem', margin: 0, color: 'var(--secondary)', fontSize: '0.84rem' }}>{text}</p>;
}
