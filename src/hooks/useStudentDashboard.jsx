import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAutoFetch } from './useAutoFetch';

export function useStudentDashboardData(userId) {
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [badges, setBadges] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profilePromise = api.get('/users/me').catch(() => null);
      const achievementsPromise = userId ? api.get(`/users/${userId}/achievements`).catch(() => null) : Promise.resolve(null);
      const enrollmentsPromise = api.get('/enrollments').catch(() => null);

      const [profRes, achRes, enrRes] = await Promise.all([profilePromise, achievementsPromise, enrollmentsPromise]);

      if (profRes?.data?.data?.user) {
        setProfile(profRes.data.data.user);
      }

      const rawEnrollments = enrRes?.data?.data?.enrollments || enrRes?.data?.data || [];
      setEnrollments(Array.isArray(rawEnrollments) ? rawEnrollments : []);

      // Real achievements stats + earned badges (no fabrication).
      setAchievements(achRes?.data?.data?.stats || null);
      setBadges(achRes?.data?.data?.badges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les données de l\'étudiant.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load on mount, and refresh after any action (enroll, complete a lesson,
  // submit a quiz…) so the dashboard stays live without a page reload.
  useAutoFetch(loadData, true);

  return { profile, achievements, badges, enrollments, loading, error, refresh: loadData };
}

export function useStudentAchievements(userId) {
  const { achievements, loading, error } = useStudentDashboardData(userId);
  return { achievements, loading, error };
}
