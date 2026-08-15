import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Admin platform settings, backed by GET/PATCH /admin/settings (the singleton
 * AppSetting row). `save(patch)` persists an allow-listed subset.
 */
export function useAdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/settings', { skipCache: true });
      setSettings(res.data?.data?.settings || res.data?.settings || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Impossible de charger les paramètres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const save = async (patch) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch('/admin/settings', patch);
      const updated = res.data?.data?.settings || res.data?.settings || null;
      if (updated) setSettings(updated);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || "Échec de l'enregistrement.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, error, saving, refetch: fetchSettings, save };
}
