import { useState, useCallback } from 'react';
import api from '../services/api';

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data?.data?.stats || response.data?.data || null);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch admin stats:', err);
        setError('Impossible de charger les statistiques.');
      }
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, refreshStats: fetchStats };
}
