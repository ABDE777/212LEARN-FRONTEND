import { useState, useEffect } from 'react';
import api from '../services/api';

export function useInstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data.data.courses);
      } catch (err) {
        console.error('Failed to fetch instructor courses:', err);
        setError('Impossible de charger vos cours. Le serveur est temporairement indisponible.');
        setCourses([
          {
            id: '1',
            title: 'Introduction à la Programmation Python',
            status: 'published',
            enrolledCount: 1250,
            price: 49
          },
          {
            id: '2',
            title: 'Développement Web Complet',
            status: 'draft',
            enrolledCount: 0,
            price: 79
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
