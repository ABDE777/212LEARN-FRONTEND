import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, FileText, Trash2, AlertTriangle, ShieldCheck, RefreshCw, X, Paperclip, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CloudinaryImageUpload from './CloudinaryImageUpload';
import api from '../services/api';

export default function GroupChatRoom({ groupId, groupName, formateurName, onClose, chatBasePath }) {
  const { user } = useAuth();
  // Serves both group chats (/groups/:id) and course chats (/courses/:id) —
  // pass chatBasePath for the latter; otherwise it defaults to the group.
  const basePath = chatBasePath || `/groups/${groupId}`;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState(null); // { url, type, name }
  const [aiBlockedError, setAiBlockedError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`${basePath}/messages`);
      const data = res.data?.data || [];
      setMessages(data);
    } catch (err) {
      console.warn('Error fetching chat messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    if (groupId || chatBasePath) {
      fetchMessages();
      // Poll for new messages every 4 seconds for live chat feel
      const interval = setInterval(() => {
        fetchMessages(true);
      }, 4000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [groupId, chatBasePath, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !attachment) || sending) return;

    setSending(true);
    setAiBlockedError(null);

    try {
      const payload = {
        text: inputText.trim(),
        ...(attachment && {
          fileUrl: attachment.url,
          fileType: attachment.type,
          fileName: attachment.name,
        }),
      };

      const res = await api.post(`${basePath}/messages`, payload);

      if (res.data?.success) {
        setInputText('');
        setAttachment(null);
        await fetchMessages(true);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible d\'envoyer le message.';

      const isAiBlocked =
        err.response?.data?.code === 'AI_MODERATION_BLOCKED' ||
        errorMsg.toLowerCase().includes('modération ia') ||
        errorMsg.toLowerCase().includes('inapproprié');

      if (isAiBlocked) {
        setAiBlockedError(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      await api.delete(`${basePath}/messages/${messageId}`);
      await fetchMessages(true);
    } catch (err) {
      console.warn('Error deleting message:', err);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
        maxHeight: '85vh',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(27, 75, 90, 0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, var(--secondary, #1B4B5A) 0%, #0d2830 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(193, 101, 47, 0.25)',
              color: 'var(--primary, #C1652F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            💬
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>
              {groupName || 'Discussion du Groupe'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', opacity: 0.85, marginTop: '0.15rem' }}>
              <span>👨‍🏫 {formateurName || 'Formateur Groupe'}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#4ade80' }}>
                <ShieldCheck size={14} /> Modération IA Active (Groq)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => fetchMessages(false)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            title="Actualiser"
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}
              title="Fermer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* AI Moderation Alert Banner */}
      <AnimatePresence>
        {aiBlockedError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderBottom: '1px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
              <span>{aiBlockedError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiBlockedError(null)}
              style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Stream Area */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--secondary)' }}>
            <Loader size={24} className="spin" />
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--secondary)', maxWidth: '300px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-color)' }}>Aucun message pour l'instant</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4 }}>
              Posez vos questions, partagez vos travaux ou échangez avec le formateur et vos camarades !
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === user?.id || m.sender?.id === user?.id;
            const isInstructor = m.sender?.role === 'instructor' || m.sender?.role === 'formateur';
            const isDeleted = m.status === 'deleted';

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Sender Info Label */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginBottom: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                    {m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : 'Membre'}
                  </span>
                  {isInstructor && (
                    <span
                      style={{
                        background: 'rgba(193, 101, 47, 0.15)',
                        color: 'var(--primary, #C1652F)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}
                    >
                      Formateur 👨‍🏫
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Bubble Container */}
                <div
                  style={{
                    position: 'relative',
                    padding: '0.85rem 1.1rem',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isDeleted
                      ? '#f1f5f9'
                      : isMe
                      ? 'var(--primary, #C1652F)'
                      : '#ffffff',
                    color: isDeleted ? '#94a3b8' : isMe ? '#ffffff' : 'var(--text-color, #1A1A2E)',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    fontSize: '0.9rem',
                    lineHeight: 1.45,
                    fontStyle: isDeleted ? 'italic' : 'normal',
                  }}
                >
                  {/* Media Content */}
                  {m.fileUrl && !isDeleted && (
                    <div style={{ marginBottom: m.text ? '0.65rem' : 0 }}>
                      {m.fileType === 'image' || (m.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                        <img
                          src={m.fileUrl}
                          alt={m.fileName || 'Image jointe'}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '220px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            display: 'block',
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                        />
                      ) : m.fileType === 'video' || (m.fileUrl.match(/\.(mp4|webm|mov)$/i)) ? (
                        <video
                          controls
                          src={m.fileUrl}
                          style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '10px' }}
                        />
                      ) : (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 0.75rem',
                            background: isMe ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                            color: isMe ? '#fff' : 'var(--primary)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                          }}
                        >
                          <FileText size={16} /> {m.fileName || 'Télécharger la pièce jointe'}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Text message */}
                  {m.text && <div>{m.text}</div>}

                  {/* Delete Option for message owner */}
                  {isMe && !isDeleted && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(m.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Box */}
      {attachment && (
        <div
          style={{
            padding: '0.5rem 1rem',
            background: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
            <Paperclip size={15} />
            <span style={{ fontWeight: 600 }}>{attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Footer Input Controls */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '0.85rem 1rem',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {/* Attachment Upload Toggle Button */}
        <button
          type="button"
          onClick={() => setShowUploadModal(!showUploadModal)}
          style={{
            padding: '0.65rem',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: showUploadModal ? 'rgba(193, 101, 47, 0.1)' : '#ffffff',
            color: showUploadModal ? 'var(--primary)' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Joindre un fichier / une image / une vidéo"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          placeholder="Écrivez un message respectueux..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: '0.7rem 0.9rem',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            outline: 'none',
            fontSize: '0.9rem',
          }}
        />

        <button
          type="submit"
          disabled={sending || (!inputText.trim() && !attachment)}
          style={{
            padding: '0.7rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: sending || (!inputText.trim() && !attachment) ? '#cbd5e1' : 'var(--primary, #C1652F)',
            color: '#ffffff',
            fontWeight: 700,
            cursor: sending || (!inputText.trim() && !attachment) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          {sending ? <Loader size={16} className="spin" /> : <Send size={16} />}
        </button>
      </form>

      {/* Cloudinary File Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            padding: '1rem',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Sélectionner une image / fichier</span>
            <button type="button" onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <CloudinaryImageUpload
            onChange={(url) => {
              if (!url) return;
              const isVid = url.match(/\.(mp4|webm|mov)$/i);
              setAttachment({
                url,
                type: isVid ? 'video' : 'image',
                name: isVid ? 'Vidéo jointe' : 'Image jointe',
              });
              setShowUploadModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
