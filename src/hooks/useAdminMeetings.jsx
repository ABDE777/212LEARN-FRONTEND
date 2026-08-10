import { useState, useCallback } from 'react';
import api from '../services/api';

export function useAdminMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/meetings');
      const data = response.data?.data;
      if (Array.isArray(data?.meetings)) {
        setMeetings(data.meetings);
      } else if (Array.isArray(data)) {
        setMeetings(data);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error('Failed to fetch admin meetings:', err);
      setError('Impossible de charger les sessions.');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMeeting = async (meetingId) => {
    const response = await api.delete(`/meetings/${meetingId}`);
    await fetchMeetings();
    return response.data;
  };

  const updateMeeting = async (meetingId, { title, meetingDate }) => {
    const response = await api.patch(`/meetings/${meetingId}`, {
      title,
      meetingDate,
    });
    await fetchMeetings();
    return response.data?.data?.meeting || response.data?.data || response.data;
  };

  return { meetings, loading, error, fetchMeetings, deleteMeeting, updateMeeting };
}
