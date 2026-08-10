import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCourseSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCourses = async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/courses/search', { params: { q: query.trim() } });
      setResults(response.data?.data || response.data || []);
    } catch (err) {
      setError('Failed to search courses');
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchCourses,
  };
}
