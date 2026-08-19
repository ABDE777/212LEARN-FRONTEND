import React, { useState, useEffect } from 'react';
import { Trash2, Search, Eye, MessageSquare, RefreshCw, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ModalPortal from './ModalPortal';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact');
      setMessages(res.data?.data || []);
    } catch (err) {
      console.warn('Error fetching contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/contact/${id}/status`, { status: newStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Error updating status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.warn('Error deleting message:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'unread'
        ? m.status === 'unread' || !m.status
        : m.status === filterStatus;

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q));

    return matchesFilter && matchesQuery;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread' || !m.status).length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;

  return (
    <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary, #C1652F)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={22} /> Messages de Contact Client
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--secondary, #1B4B5A)', fontSize: '0.86rem' }}>
            Gérez les demandes et messages envoyés depuis la page Contact
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--secondary)',
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>Total Messages</span>
          <h3 style={{ fontSize: '1.6rem', margin: '0.2rem 0 0 0', color: 'var(--text-color)' }}>{messages.length}</h3>
        </div>

        <div style={{ background: 'rgba(193, 101, 47, 0.08)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(193, 101, 47, 0.2)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Non Lus (Nouveaux)</span>
          <h3 style={{ fontSize: '1.6rem', margin: '0.2rem 0 0 0', color: 'var(--primary)' }}>{unreadCount}</h3>
        </div>

        <div style={{ background: '#dcfce7', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>Répondus</span>
          <h3 style={{ fontSize: '1.6rem', margin: '0.2rem 0 0 0', color: '#166534' }}>{repliedCount}</h3>
        </div>
      </div>

      {/* Search & Filter controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, sujet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.3rem',
              fontSize: '0.88rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'unread', 'read', 'replied'].map((st) => {
            const labels = { all: 'Tous', unread: 'Non lus', read: 'Lus', replied: 'Répondus' };
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary, #C1652F)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Data Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--secondary)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Statut</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Nom & Email</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Téléphone</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Sujet</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Date</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((m) => {
                const isUnread = m.status === 'unread' || !m.status;
                const isReplied = m.status === 'replied';

                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isUnread ? 'rgba(193, 101, 47, 0.03)' : '#ffffff',
                      transition: 'background 0.12s ease',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isUnread ? '#fee2e2' : isReplied ? '#dcfce7' : '#e2e8f0',
                          color: isUnread ? '#991b1b' : isReplied ? '#166534' : '#475569',
                        }}
                      >
                        {isUnread ? 'Non lu' : isReplied ? 'Répondu' : 'Lu'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>{m.name}</div>
                      <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>{m.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--secondary)' }}>{m.phone || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-color)' }}>{m.subject}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessage(m);
                            if (isUnread) handleUpdateStatus(m.id, 'read');
                          }}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                          title="Voir le message"
                        >
                          <Eye size={14} /> Voir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                  {loading ? 'Chargement des messages...' : 'Aucun message de contact trouvé.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Message Modal Drawer */}
      <AnimatePresence>
        {selectedMessage && (
          <ModalPortal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                width: '100%',
                maxWidth: '600px',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Sujet: {selectedMessage.subject}
                  </span>
                  <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', color: 'var(--text-color)' }}>
                    Message de {selectedMessage.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                <div style={{ marginBottom: '0.35rem' }}><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--primary)' }}>{selectedMessage.email}</a></div>
                <div style={{ marginBottom: '0.35rem' }}><strong>Téléphone:</strong> {selectedMessage.phone || 'Non renseigné'}</div>
                <div><strong>Date d'envoi:</strong> {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: 'var(--secondary)' }}>Contenu du message:</h4>
                <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {selectedMessage.status !== 'replied' ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Check size={16} /> Marquer comme répondu
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'unread')}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: 'var(--secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Marquer comme non lu
                  </button>
                )}

                <a
                  href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject)}`}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary, #C1652F)',
                    color: '#ffffff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Send size={15} /> Répondre par Email
                </a>
              </div>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
