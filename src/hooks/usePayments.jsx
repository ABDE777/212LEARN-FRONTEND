import { useState } from 'react';
import api from '../services/api';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckoutSession = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/payments/checkout-session', { courseId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create checkout session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCheckoutSession, loading, error };
}
