import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data?.data?.coupons || response.data?.coupons || []);
    } catch (err) {
      setError('Failed to load coupons');
      console.error('Coupons error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      setCoupons(prev => [...prev, response.data?.data || response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to create coupon:', err);
      throw err;
    }
  };

  const updateCoupon = async (couponId, couponData) => {
    try {
      const response = await api.patch(`/coupons/${couponId}`, couponData);
      setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, ...couponData } : c));
      return response.data;
    } catch (err) {
      console.error('Failed to update coupon:', err);
      throw err;
    }
  };

  const deleteCoupon = async (couponId) => {
    try {
      await api.delete(`/coupons/${couponId}`);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      throw err;
    }
  };

  const validateCoupon = async (code) => {
    try {
      const response = await api.post('/coupons/validate', { code });
      return response.data;
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    loading,
    error,
    refetch: fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
  };
}
