import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // /admin/overview is the consolidated, briefly-cached snapshot (stats +
      // pendingKycCount + recentUsers). We read the same `stats` shape as the
      // old /admin/stats, so this is a drop-in with fewer round-trips + caching.
      const response = await api.get('/admin/overview');
      // Backend returns: { success: true, data: { stats: {...}, ... } }
      const payload = response.data?.data?.stats ?? response.data?.data ?? null;
      setStats(payload);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
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
