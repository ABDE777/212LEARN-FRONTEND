import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook to fetch paginated Audit Logs (GET /api/v1/admin/audit-logs)
 */
export function useAdminAuditLogs(initialPage = 1, initialLimit = 20) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async (page = initialPage, limit = initialLimit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/audit-logs', {
        params: { page, limit },
      });
      const data = response.data?.data || response.data;
      setLogs(data.logs || []);
      if (response.data?.meta?.pagination) {
        setPagination(response.data.meta.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Impossible de charger le journal d\'audit.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [initialPage, initialLimit]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return { logs, pagination, loading, error, refreshAuditLogs: fetchAuditLogs };
}

/**
 * Hook to fetch System Health & Diagnostics (GET /api/v1/diagnostics or /api/v1/admin/diagnostics)
 */
export function useSystemDiagnostics() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/diagnostics');
      setDiagnostics(response.data?.data || response.data);
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
      setError('Impossible de charger l\'état du système.');
      setDiagnostics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  return { diagnostics, loading, error, refreshDiagnostics: fetchDiagnostics };
}
