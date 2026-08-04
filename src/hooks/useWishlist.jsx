import { useState, useCallback } from 'react';
import api from '../services/api';

export function useWishlist() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/wishlist');
      const data = response.data?.data || {};
      setWishlist(data.wishlist || data);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to fetch wishlist';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/wishlist', { courseId });
      await fetchWishlist();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to add to wishlist';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/wishlist/${courseId}`);
      await fetchWishlist();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to remove from wishlist';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { wishlist, fetchWishlist, addToWishlist, removeFromWishlist, loading, error };
}
