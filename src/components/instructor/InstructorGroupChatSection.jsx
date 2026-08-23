import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../../services/api';
import GroupChatRoom from '../GroupChatRoom';
import LoadingSpinner from '../LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const SEEN_KEY = '212learn_chat_seen';

const loadSeen = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
};
const saveSeen = (map) => {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(map)); } catch { /* ignore */ }
};

export default function InstructorGroupChatSection() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [unread, setUnread] = useState({}); // { [groupId]: number }
  const seenRef = useRef(loadSeen());

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

  // Count unread messages per group (newer than last seen, not sent by me).
  const refreshUnread = useCallback(async () => {
    if (!groups.length || !user?.id) return;
    const results = await Promise.all(
      groups.map(async (g) => {
        try {
          const res = await api.get(`/groups/${g.id}/messages`);
          const msgs = res.data?.data || [];
          const seenAt = seenRef.current[g.id] ? new Date(seenRef.current[g.id]).getTime() : 0;
          const count = msgs.filter(
            (m) => m.senderId !== user.id && m.status === 'approved' && new Date(m.createdAt).getTime() > seenAt,
          ).length;
          return [g.id, count];
        } catch {
          return [g.id, 0];
        }
      }),
    );
    setUnread(Object.fromEntries(results));
  }, [groups, user?.id]);

  useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, 15000);
    return () => clearInterval(t);
  }, [refreshUnread]);

  // Opening a group marks it seen and clears its badge.
  const openGroup = (g) => {
    setSelectedGroup(g);
    seenRef.current = { ...seenRef.current, [g.id]: new Date().toISOString() };
    saveSeen(seenRef.current);
    setUnread((u) => ({ ...u, [g.id]: 0 }));
  };

  // Keep the currently open group marked as seen as new messages arrive.
  useEffect(() => {
    if (!selectedGroup) return;
    seenRef.current = { ...seenRef.current, [selectedGroup.id]: new Date().toISOString() };
    saveSeen(seenRef.current);
  }, [selectedGroup, unread]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner /></div>;

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={22} style={{ color: 'var(--primary)' }} /> Espace Discussion Groupe & Modération IA
          {totalUnread > 0 && (
            <span style={{ background: 'var(--error-color, #dc3545)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, borderRadius: '999px', padding: '0.1rem 0.5rem', minWidth: '20px', textAlign: 'center' }}>
              {totalUnread}
            </span>
          )}
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
              const badge = unread[gId] || 0;
              return (
                <button
                  key={gId}
                  type="button"
                  onClick={() => openGroup(g)}
                  style={{
                    position: 'relative',
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  💬 {g.name || 'Groupe'}
                  {badge > 0 && (
                    <span style={{ background: 'var(--error-color, #dc3545)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, borderRadius: '999px', padding: '0.05rem 0.4rem', minWidth: '18px', textAlign: 'center' }}>
                      {badge}
                    </span>
                  )}
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
