import { useState, useEffect } from 'react';
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

export function useAdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data.data.courses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Impossible de charger les cours.');
        setCourses([
          { id: '1', title: 'Introduction à Python', status: 'draft' },
          { id: '2', title: 'Développement Web', status: 'published' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
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
