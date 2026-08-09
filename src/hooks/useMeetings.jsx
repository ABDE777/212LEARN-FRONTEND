import { useState, useCallback } from 'react';
import api from '../services/api';

export function useMeetings(courseId) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${courseId}/meetings`);
      const data = response.data?.data;
      // API returns { meetings: [] } or a flat array
      if (Array.isArray(data)) {
        setMeetings(data);
      } else if (Array.isArray(data?.meetings)) {
        setMeetings(data.meetings);
      } else {
        const upcoming = data?.upcoming || [];
        const past = data?.past || [];
        setMeetings([...upcoming, ...past]);
      }
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
      setError('Impossible de charger les sessions.');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const createMeeting = async ({ title, meetingDate, durationMinutes = 60 }) => {
    const response = await api.post(`/courses/${courseId}/meetings`, {
      title,
      meetingDate,
      durationMinutes,
    });
    await fetchMeetings();
    return response.data?.data?.meeting || response.data?.data || response.data;
  };

  const startMeeting = async (meetingId) => {
    const response = await api.patch(`/meetings/${meetingId}/start`);
    await fetchMeetings();
    return response.data?.data?.meeting || response.data?.data || response.data;
  };

  const endMeeting = async (meetingId) => {
    const response = await api.patch(`/meetings/${meetingId}/end`);
    await fetchMeetings();
    return response.data?.data?.meeting || response.data?.data || response.data;
  };

  return { meetings, loading, error, fetchMeetings, createMeeting, startMeeting, endMeeting };
}
