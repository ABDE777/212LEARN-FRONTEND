import { useState, useCallback } from 'react';
import api from '../services/api';

export function useTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPayment = async (courseId, couponCode = '') => {
    setLoading(true);
    setError(null);
    try {
      const payload = { courseId };
      if (couponCode) payload.couponCode = couponCode;
      const response = await api.post('/payments/transfer/request', payload);
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to request payment';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitTransferDetails = async (paymentReference, rib, transferReceiptFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('paymentReference', paymentReference);
      formData.append('rib', rib);
      if (transferReceiptFile) {
        formData.append('transferReceipt', transferReceiptFile);
      }

      const response = await api.post('/payments/transfer/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit transfer details';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingTransfers = useCallback(async (statusFilter = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter ? `/payments/transfer/pending?status=${statusFilter}` : '/payments/transfer/pending';
      const response = await api.get(url);
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to fetch transfers';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyTransferPayment = async (paymentId, action, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch('/payments/transfer/verify', { paymentId, action, notes });
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to verify transfer';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { requestPayment, submitTransferDetails, getPendingTransfers, verifyTransferPayment, loading, error };
}
