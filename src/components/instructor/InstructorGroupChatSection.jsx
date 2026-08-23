import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../../services/api';
import GroupChatRoom from '../GroupChatRoom';
import LoadingSpinner from '../LoadingSpinner';

export default function InstructorGroupChatSection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // /groups is admin-only; instructors get the groups they lead via /mine.
        const res = await api.get('/groups/mine');
        const list = res.data?.data?.groups || res.data?.data || [];
        setGroups(list);
        if (list.length > 0) setSelectedGroup(list[0]);
      } catch (err) {
        console.warn('Error fetching instructor groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner /></div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={22} style={{ color: 'var(--primary)' }} /> Espace Discussion Groupe & Modération IA
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.92rem' }}>
          Consultez et répondez aux messages de vos groupes d'étudiants. Tous les messages sont filtrés par IA contre les propos inappropriés.
        </p>
      </div>

      {groups.length > 0 ? (
        <>
          {/* Group Selector Pills */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {groups.map((g) => {
              const gId = g.id;
              const isSelected = selectedGroup && selectedGroup.id === gId;
              return (
                <button
                  key={gId}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
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
                  💬 {g.name || 'Groupe'}
                </button>
              );
            })}
          </div>

          {selectedGroup && (
            <GroupChatRoom
              groupId={selectedGroup.id}
              groupName={selectedGroup.name}
              formateurName={selectedGroup.formateur ? `${selectedGroup.formateur.firstName} ${selectedGroup.formateur.lastName || ''}` : 'Vous (Formateur)'}
            />
          )}
        </>
      ) : (
        <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Aucune classe attribuée</h3>
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Dès qu'une classe ou un groupe d'étudiants vous sera attribué, votre espace de chat s'affichera ici.
          </p>
        </div>
      )}
    </div>
  );
}
