import { useState, useCallback } from 'react';
import api from '../services/api';

export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      const data = response.data?.data || {};
      setCart(data.cart || data);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to fetch cart';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/cart/items', { courseId });
      await fetchCart();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to add to cart';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to remove from cart';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete('/cart');
      await fetchCart();
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to clear cart';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async (code, courseId = null) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { code };
      if (courseId) payload.courseId = courseId;
      const response = await api.post('/coupons/validate', payload);
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to validate coupon';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cart, fetchCart, addToCart, removeFromCart, clearCart, validateCoupon, loading, error };
}
