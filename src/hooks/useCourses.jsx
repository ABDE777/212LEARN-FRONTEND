import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCourses(filters = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.level) params.append('level', filters.level);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/courses?${params.toString()}`);
        setCourses(response.data.data.courses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        // No fake fallback data: show a clear error and an empty list.
        setError('Impossible de charger les cours. Le serveur est temporairement indisponible. Réessayez plus tard.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters.category, filters.level, filters.search]);

  return { courses, loading, error };
}

export function useCourse(courseId) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data.data.course);
      } catch (err) {
        console.error('Failed to fetch course:', err);
        // No fake fallback data: surface the error instead of a placeholder course.
        setError('Impossible de charger le cours. Le serveur est temporairement indisponible. Réessayez plus tard.');
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return { course, loading, error };
}

export function useCourseCurriculum(courseId) {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/courses/${courseId}/curriculum`);
        setCurriculum(response.data.data);
      } catch (err) {
        console.error('Failed to fetch curriculum:', err);
        // No fake fallback data: surface the error instead of a placeholder program.
        setError('Impossible de charger le programme. Le serveur est temporairement indisponible. Réessayez plus tard.');
        setCurriculum(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCurriculum();
    }
  }, [courseId]);

  return { curriculum, loading, error };
}
