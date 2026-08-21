import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export function useAdminInstructorFinancials(enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/analytics/instructors');
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch instructor financials:', err);
      setError('Impossible de charger les données financières des formateurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchFinancials();
    }
  }, [enabled, fetchFinancials]);

  return {
    rawSummary: data?.summary || null,
    rawInstructors: data?.instructors || [],
    loading,
    error,
    refetch: fetchFinancials,
  };
}

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
