import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export function usePublicStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/stats');
      const payload = response.data?.data ?? response.data ?? null;
      setStats(payload);
    } catch (err) {
      console.error('Failed to fetch public stats:', err);
      setError('Impossible de charger les statistiques.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refreshStats: fetchStats };
}
