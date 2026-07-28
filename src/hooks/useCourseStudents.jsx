import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useCourseStudents(courseId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${courseId}/students`);
      setStudents(response.data?.data?.students || response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch course students:', err);
      setError('Impossible de charger les étudiants de ce cours.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refreshStudents: fetchStudents };
}
