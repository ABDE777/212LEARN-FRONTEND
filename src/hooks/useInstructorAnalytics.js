import { useState, useEffect } from 'react';
import api from '../services/api';

export function useInstructorAnalytics() {
  const [revenueData, setRevenueData] = useState(null);
  const [studentsData, setStudentsData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenue = async () => {
    try {
      const response = await api.get('/instructor/analytics/revenue');
      setRevenueData(response.data?.data || response.data);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/instructor/analytics/students');
      setStudentsData(response.data?.data || response.data);
    } catch (err) {
      console.error('Failed to fetch students data:', err);
    }
  };

  const fetchCompletion = async () => {
    try {
      const response = await api.get('/instructor/analytics/completion');
      setCompletionData(response.data?.data || response.data);
    } catch (err) {
      console.error('Failed to fetch completion data:', err);
    }
  };

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchRevenue(), fetchStudents(), fetchCompletion()]);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  return {
    revenueData,
    studentsData,
    completionData,
    loading,
    error,
    refetch: fetchAllAnalytics,
  };
}
