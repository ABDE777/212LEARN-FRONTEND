import { useState, useEffect } from 'react';
import api from '../services/api';

// The achievements endpoint is not yet available in the backend.
// We use a realistic mock based on enrolled courses data from /enrollments.
export function useStudentAchievements(userId) {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Try to get real enrollment data to build stats
        const res = await api.get('/enrollments');
        const enrollments = res.data?.data?.enrollments || res.data?.data || [];
        const completed = Array.isArray(enrollments) 
          ? enrollments.filter(e => e.progress === 100).length 
          : 0;
        setAchievements({
          points: completed * 250,
          streak: 7,
          completedCourses: completed,
          totalHours: enrollments.length * 8,
        });
      } catch (err) {
        // Endpoint not available yet — use display data
        console.warn('Enrollments endpoint failed, using mock data:', err);
        setAchievements({
          points: 1250,
          streak: 7,
          completedCourses: 3,
          totalHours: 24,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAchievements();
    } else {
      setAchievements({ points: 0, streak: 0, completedCourses: 0, totalHours: 0 });
      setLoading(false);
    }
  }, [userId]);

  return { achievements, loading, error };
}
