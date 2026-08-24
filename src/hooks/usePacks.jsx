import { useState, useEffect, useCallback } from 'react';
import api, { unwrap } from '../services/api';

const errMsg = (err, fallback) =>
  err.response?.data?.error?.message || err.response?.data?.message || fallback;

/**
 * Public/admin pack catalog. `all=true` (admin) lists drafts too; otherwise only
 * published packs are returned by the backend.
 */
export function usePacks({ enabled = true } = {}) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/packs', { skipCache: true });
      setPacks(unwrap(res)?.packs || []);
    } catch (err) {
      setError(errMsg(err, 'Impossible de charger les packs.'));
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchPacks();
  }, [enabled, fetchPacks]);

  return { packs, loading, error, refetch: fetchPacks };
}

/** A single pack by id (published for everyone, drafts for admins). */
export function usePack(id) {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPack = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/packs/${id}`, { skipCache: true });
      setPack(unwrap(res)?.pack || null);
    } catch (err) {
      setError(errMsg(err, 'Pack introuvable.'));
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPack(); }, [fetchPack]);

  return { pack, loading, error, refetch: fetchPack };
}

/** Admin write operations + student purchase + revenue helpers. */
export function usePackActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn, fallback) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(errMsg(err, fallback));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Admin CRUD ──
  const createPack = (payload) => run(
    async () => unwrap(await api.post('/packs', payload)), 'Échec de la création du pack.');
  const updatePack = (id, payload) => run(
    async () => unwrap(await api.patch(`/packs/${id}`, payload)), 'Échec de la mise à jour du pack.');
  const deletePack = (id) => run(
    async () => unwrap(await api.delete(`/packs/${id}`)), 'Échec de la suppression du pack.');

  // ── Student purchase ──
  const requestPurchase = (packId, provider) => run(
    async () => unwrap(await api.post('/pack-payments/request', { packId, provider })),
    'Échec de la demande d\'achat.');

  const submitPurchase = ({ paymentReference, provider, mtcn, rib, receiptFile }) => run(async () => {
    const fd = new FormData();
    fd.append('paymentReference', paymentReference);
    if (provider === 'transfer') fd.append('rib', rib);
    else fd.append('mtcn', mtcn);
    if (receiptFile) fd.append('receipt', receiptFile);
    const res = await api.post('/pack-payments/submit', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  }, 'Échec de la soumission de la preuve de paiement.');

  // ── Admin verification ──
  const getPendingPurchases = (status = 'all') => run(
    async () => unwrap(await api.get(`/pack-payments/pending?status=${status}`, { skipCache: true })),
    'Impossible de charger les achats de packs.');
  const verifyPurchase = (purchaseId, action, notes = '') => run(
    async () => unwrap(await api.patch('/pack-payments/verify', { purchaseId, action, notes })),
    'Échec de la validation.');

  return {
    loading, error,
    createPack, updatePack, deletePack,
    requestPurchase, submitPurchase,
    getPendingPurchases, verifyPurchase,
  };
}

/** Instructor's own pack earnings (admins may pass an instructorId). */
export function useInstructorEarnings({ instructorId, enabled = true } = {}) {
  const [data, setData] = useState({ summary: null, shares: [] });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = instructorId ? `?instructorId=${instructorId}` : '';
      const res = await api.get(`/instructor/earnings${q}`, { skipCache: true });
      const payload = unwrap(res) || {};
      setData({ summary: payload.summary || null, shares: payload.shares || [] });
    } catch (err) {
      setError(errMsg(err, 'Impossible de charger les revenus.'));
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => { if (enabled) fetchEarnings(); }, [enabled, fetchEarnings]);

  return { ...data, loading, error, refetch: fetchEarnings };
}

/** Admin payout report over all pack revenue shares. */
export function useRevenueShares({ enabled = true } = {}) {
  const [data, setData] = useState({ totals: null, instructors: [], shares: [] });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchShares = useCallback(async (status = '') => {
    setLoading(true);
    setError(null);
    try {
      const q = status ? `?status=${status}` : '';
      const res = await api.get(`/admin/revenue-shares${q}`, { skipCache: true });
      const payload = unwrap(res) || {};
      setData({
        totals: payload.totals || null,
        instructors: payload.instructors || [],
        shares: payload.shares || [],
      });
    } catch (err) {
      setError(errMsg(err, 'Impossible de charger le rapport de revenus.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const markPaidOut = async ({ shareIds, instructorId }) => {
    const res = await api.patch('/admin/revenue-shares/payout', { shareIds, instructorId });
    return unwrap(res);
  };

  useEffect(() => { if (enabled) fetchShares(); }, [enabled, fetchShares]);

  return { ...data, loading, error, refetch: fetchShares, markPaidOut };
}
