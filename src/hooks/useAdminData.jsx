import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Impossible de charger les utilisateurs.');
        setUsers([
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'student' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'instructor' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export function useAdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await api.get('/users', {
          params: { role: 'instructor', limit: 100, order: 'asc', sort: 'firstName' },
        });
        setInstructors(response.data?.data?.users || []);
      } catch (err) {
        console.error('Failed to fetch instructors:', err);
        setError('Impossible de charger les instructeurs.');
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  return { instructors, loading, error };
}

export function useAdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/courses', { params: { limit: 100 } });
      setCourses(response.data?.data?.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Impossible de charger les cours.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refreshCourses: fetchCourses };
}

export function useAdminCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCourse = async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/courses', courseData);
      return response.data?.data?.course || response.data?.data;
    } catch (err) {
      console.error('Failed to create course:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de créer le cours.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCourse, loading, error };
}

export function usePublishCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const publishCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/courses/${courseId}/publish`);
      return response.data;
    } catch (err) {
      console.error('Failed to publish course:', err);
      setError('Impossible de publier le cours.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { publishCourse, loading, error };
}
