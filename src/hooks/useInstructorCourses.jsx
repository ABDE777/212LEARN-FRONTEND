import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useInstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCourses = async () => {
      try {
        // Filter by the logged-in instructor's user ID so only their courses are returned
        const response = await api.get('/courses', {
          params: { instructorId: user.id, limit: 100 },
        });
        setCourses(response.data?.data?.courses || []);
      } catch (err) {
        console.error('Failed to fetch instructor courses:', err);
        setError('Impossible de charger vos cours.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  return { courses, loading, error };
}

export function useCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCourse = async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/courses', courseData);
      return response.data.data.course;
    } catch (err) {
      console.error('Failed to create course:', err);
      setError('Impossible de créer le cours. Veuillez réessayer.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCourse, loading, error };
}
