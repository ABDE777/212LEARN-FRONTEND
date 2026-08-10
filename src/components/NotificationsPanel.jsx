import { useState } from 'react';
import { Bell, X, Check, Clock, User, BookOpen, Heart, ShoppingCart, Award } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsPanel({ userId, onClose }) {
  const { notifications, loading, error, markAsRead, markAllAsRead, unreadCount } = useNotifications(userId);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'enrollment': return <BookOpen size={18} />;
      case 'wishlist': return <Heart size={18} />;
      case 'cart': return <ShoppingCart size={18} />;
      case 'achievement': return <Award size={18} />;
      case 'user': return <User size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'enrollment': return '#3b82f6';
      case 'wishlist': return '#ec4899';
      case 'cart': return '#f59e0b';
      case 'achievement': return '#10b981';
      case 'user': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return notifDate.toLocaleDateString('fr-FR');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: '#fff',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={20} color="var(--primary)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '0.4rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--secondary)',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={markAllAsRead}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={14} />
            Tout marquer comme lu
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
            Chargement...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error-color)' }}>
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Bell size={48} style={{ opacity: 0.3, color: 'var(--secondary)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
              Aucune notification
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: notification.read ? 'var(--bg-color)' : 'rgba(59, 130, 246, 0.05)',
                  border: notification.read ? '1px solid var(--border-color)' : '1px solid rgba(59, 130, 246, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: `${getNotificationColor(notification.type)}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: getNotificationColor(notification.type),
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                      {notification.title}
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--secondary)', lineHeight: 1.4 }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                      <Clock size={12} />
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
