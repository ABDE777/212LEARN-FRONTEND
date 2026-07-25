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
      // API returns { upcoming: [], past: [] } or a flat array
      if (Array.isArray(data)) {
        setMeetings(data);
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

  const createMeeting = async ({ title, meetingUrl, meetingDate }) => {
    const response = await api.post(`/courses/${courseId}/meetings`, {
      title,
      meetingUrl,
      meetingDate,
    });
    await fetchMeetings();
    return response.data?.data?.meeting || response.data?.data || response.data;
  };

  return { meetings, loading, error, fetchMeetings, createMeeting };
}
