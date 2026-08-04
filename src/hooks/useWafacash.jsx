import { useState, useCallback } from 'react';
import api from '../services/api';

export function useWafacash() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPayment = async (courseId, couponCode = '') => {
    setLoading(true);
    setError(null);
    try {
      const payload = { courseId };
      if (couponCode) payload.couponCode = couponCode;
      const response = await api.post('/payments/wafacash/request', payload);
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to request payment';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async (paymentReference, mtcn, receiptFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('paymentReference', paymentReference);
      formData.append('mtcn', mtcn);
      formData.append('receipt', receiptFile);

      // Using raw axios instance to send formData correctly, 
      // or our api wrapper will handle it if we set headers manually or let axios do it.
      // Axios automatically sets multipart/form-data when passing FormData.
      const response = await api.post('/payments/wafacash/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit payment proof';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/payments/wafacash/pending');
      // Unwrap backend envelope
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to fetch pending payments';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPayment = async (paymentId, action, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch('/payments/wafacash/verify', { paymentId, action, notes });
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to verify payment';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { requestPayment, submitProof, getPendingPayments, verifyPayment, loading, error };
}
