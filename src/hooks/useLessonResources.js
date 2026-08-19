import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useLessonResources(lessonId) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/lessons/${lessonId}/resources`);
      setResources(response.data?.data || response.data || []);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Resources error:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  const addResource = async (resourceData) => {
    try {
      const response = await api.post(`/lessons/${lessonId}/resources`, resourceData);
      setResources(prev => [...prev, response.data?.data || response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to add resource:', err);
      throw err;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      await api.delete(`/resources/${resourceId}`);
      setResources(prev => prev.filter(r => r.id !== resourceId));
    } catch (err) {
      console.error('Failed to delete resource:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return {
    resources,
    loading,
    error,
    refetch: fetchResources,
    addResource,
    deleteResource,
  };
}
