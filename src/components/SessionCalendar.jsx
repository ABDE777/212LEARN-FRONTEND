import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, Clock, Pencil, Trash2, X, Zap } from 'lucide-react';

function SessionCalendar({ meetings, onMeetingClick, onEditMeeting, onDeleteMeeting, readOnly = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMeetingsForDate = (date) => {
    if (!meetings || meetings.length === 0) return [];
    // Use local date string to avoid timezone issues
    const formatDateLocal = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const dateStr = formatDateLocal(date);
    return meetings.filter(meeting => {
      const meetingDate = formatDateLocal(new Date(meeting.meetingDate));
      return meetingDate === dateStr;
    });
  };

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    if (onMeetingClick) {
      onMeetingClick(meeting);
    }
  };

  const handleEdit = () => {
    if (onEditMeeting) {
      onEditMeeting(selectedMeeting);
      setSelectedMeeting(null);
    }
  };

  const handleDelete = () => {
    if (onDeleteMeeting && window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      onDeleteMeeting(selectedMeeting.id);
      setSelectedMeeting(null);
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} style={{
          minHeight: '100px',
          border: '1px solid var(--border-color)',
          background: '#f9f9f9',
        }} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateMeetings = getMeetingsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          style={{
            minHeight: '100px',
            border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            padding: '0.5rem',
            background: isToday ? 'rgba(193,101,47,0.12)' : '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s',
            position: 'relative',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isToday ? 'rgba(193,101,47,0.18)' : '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.background = isToday ? 'rgba(193,101,47,0.12)' : '#fff'}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: isToday ? 700 : 400,
              color: isToday ? '#fff' : 'var(--text-color)',
              ...(isToday && {
                background: 'var(--primary)',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }),
            }}>
              {day}
            </div>
            {isToday && (
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Aujourd'hui
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {dateMeetings.slice(0, 3).map(meeting => (
              <div
                key={meeting.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMeetingClick(meeting);
                }}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: meeting.status === 'LIVE' ? '#28a745' : 
                             meeting.status === 'COMPLETED' ? '#6c757d' : 
                             'rgba(193,101,47,0.15)',
                  color: meeting.status === 'LIVE' ? '#fff' : 
                         meeting.status === 'COMPLETED' ? '#fff' : 
                         'var(--primary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'transform 0.1s',
                  border: meeting.status === 'LIVE' ? '2px solid #28a745' : 
                         meeting.status === 'COMPLETED' ? '2px solid #6c757d' : 
                         '2px solid var(--primary)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {new Date(meeting.meetingDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {meeting.title}
              </div>
            ))}
            {dateMeetings.length > 3 && (
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--secondary)',
                fontStyle: 'italic',
              }}>
                +{dateMeetings.length - 3} autres
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {monthNames[month]} {year}
          </h2>
          <button
            type="button"
            onClick={goToToday}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              color: 'var(--secondary)',
            }}
          >
            Aujourd'hui
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={goToPreviousMonth}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        background: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        marginBottom: '0',
      }}>
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              padding: '0.75rem',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--secondary)',
              background: '#fff',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        background: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        borderTop: 'none',
      }}>
        {renderCalendarDays()}
      </div>

      {/* Meeting Detail Drawer */}
      {selectedMeeting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '450px',
              maxWidth: '90vw',
              background: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Détails de la session
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} style={{ color: 'var(--secondary)' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-color)' }}>
                {selectedMeeting.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                  <CalendarIcon size={16} />
                  {new Date(selectedMeeting.meetingDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                  <Clock size={16} />
                  {new Date(selectedMeeting.meetingDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedMeeting.status === 'LIVE' ? 'rgba(40,167,69,0.15)' :
                             selectedMeeting.status === 'COMPLETED' ? 'rgba(108,117,125,0.15)' :
                             'rgba(193,101,47,0.15)',
                  color: selectedMeeting.status === 'LIVE' ? '#28a745' :
                         selectedMeeting.status === 'COMPLETED' ? '#6c757d' :
                         'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'inline-block',
                  width: 'fit-content',
                }}>
                  {selectedMeeting.status === 'LIVE' ? 'En direct' :
                   selectedMeeting.status === 'COMPLETED' ? 'Terminée' :
                   'Planifiée'}
                </div>
                {selectedMeeting.recordingUrl && (
                  <a
                    href={selectedMeeting.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--secondary)',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    <Video size={16} />
                    Voir le replay
                  </a>
                )}
              </div>
            </div>
            {!readOnly && selectedMeeting.status === 'SCHEDULED' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleEdit}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Pencil size={16} />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(220,53,69,0.1)',
                    color: '#dc3545',
                    border: '1px solid rgba(220,53,69,0.3)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            )}
            {!readOnly && selectedMeeting.status === 'SCHEDULED' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onMeetingClick) {
                      onMeetingClick({ ...selectedMeeting, action: 'start' });
                    }
                    setSelectedMeeting(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Zap size={16} />
                  Démarrer la session
                </button>
              </div>
            )}
            {selectedMeeting.status === 'LIVE' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onMeetingClick) {
                      onMeetingClick(selectedMeeting);
                    }
                    setSelectedMeeting(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Video size={16} />
                  Rejoindre la classe
                </button>
              </div>
            )}
            {!readOnly && selectedMeeting.status === 'LIVE' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onMeetingClick) onMeetingClick(selectedMeeting);
                    setSelectedMeeting(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Zap size={16} />
                  Rejoindre la classe
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionCalendar;
