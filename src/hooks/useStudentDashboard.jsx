import { useState, useEffect } from 'react';
import api from '../services/api';

export function useStudentDashboardData(userId) {
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [badges, setBadges] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Profile
        const profilePromise = api.get('/users/me').catch(() => null);
        // Fetch Achievements
        const achievementsPromise = userId ? api.get(`/users/${userId}/achievements`).catch(() => null) : Promise.resolve(null);
        // Fetch Enrollments
        const enrollmentsPromise = api.get('/enrollments').catch(() => null);

        const [profRes, achRes, enrRes] = await Promise.all([profilePromise, achievementsPromise, enrollmentsPromise]);

        if (!isMounted) return;

        // Process User Profile
        if (profRes?.data?.data?.user) {
          setProfile(profRes.data.data.user);
        }

        // Process Enrollments
        const rawEnrollments = enrRes?.data?.data?.enrollments || enrRes?.data?.data || [];
        const parsedEnrollments = Array.isArray(rawEnrollments) ? rawEnrollments : [];
        setEnrollments(parsedEnrollments);

        // Real achievements stats + earned badges (no fabrication).
        setAchievements(achRes?.data?.data?.stats || null);
        setBadges(achRes?.data?.data?.badges || []);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Impossible de charger les données de l\'étudiant.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { profile, achievements, badges, enrollments, loading, error };
}

export function useStudentAchievements(userId) {
  const { achievements, loading, error } = useStudentDashboardData(userId);
  return { achievements, loading, error };
}
