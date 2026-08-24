import { useState, useEffect } from 'react';
import api from '../services/api';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * GET with a few retries for transient failures. The homepage fires several API
 * calls at once and is often the first request after a serverless cold start, so
 * a single miss must not leave a section permanently empty. Only network errors
 * and 5xx are retried; a 4xx is a real client error and returned immediately.
 */
const getWithRetry = async (url, attempts = 3) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await api.get(url, i > 0 ? { skipCache: true } : undefined);
    } catch (err) {
      const status = err.response?.status;
      if (status && status < 500) throw err; // don't retry 4xx
      lastErr = err;
      if (i < attempts - 1) await sleep(600 * (i + 1));
    }
  }
  throw lastErr;
};

export function useCourses(filters = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.level) params.append('level', filters.level);
        if (filters.search) params.append('search', filters.search);

        const response = await getWithRetry(`/courses?${params.toString()}`);
        if (cancelled) return;
        setCourses(response.data?.data?.courses || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch courses:', err);
        // No fake fallback data: show a clear error and an empty list.
        setError('Impossible de charger les cours. Le serveur est temporairement indisponible. Réessayez plus tard.');
        setCourses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCourses();
    return () => { cancelled = true; };
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
