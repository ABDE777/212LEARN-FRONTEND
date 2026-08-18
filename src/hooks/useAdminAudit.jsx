import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook to fetch paginated Audit Logs (GET /api/v1/admin/audit-logs).
 * Accepts optional filters (action, resource, role, search, startDate, endDate)
 * which are forwarded as query params. The backend also returns the distinct
 * action/resource values, exposed here as `filterOptions` for the dropdowns.
 */
export function useAdminAuditLogs(initialPage = 1, initialLimit = 20) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filterOptions, setFilterOptions] = useState({ actions: [], resources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async (page = initialPage, limit = initialLimit, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Drop empty/`all` filter values so they don't clutter the query string.
      const params = { page, limit };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') params[k] = v;
      });
      const response = await api.get('/admin/audit-logs', { params });
      const data = response.data?.data || response.data;
      setLogs(data.logs || []);
      if (data.filters) setFilterOptions(data.filters);
      if (response.data?.meta?.pagination) {
        setPagination(response.data.meta.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Impossible de charger le journal d\'activité.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [initialPage, initialLimit]);

  // Fetching is driven by the consumer (AuditLogsTab) so page + filter changes
  // trigger a single request; no auto-fetch on mount here.

  return { logs, pagination, filterOptions, loading, error, refreshAuditLogs: fetchAuditLogs };
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
