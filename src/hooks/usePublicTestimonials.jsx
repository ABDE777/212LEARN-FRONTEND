import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export function usePublicTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/stats/testimonials');
      const payload = response.data?.data ?? response.data ?? [];
      setTestimonials(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to fetch public testimonials:', err);
      setError('Impossible de charger les témoignages.');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, loading, error, refreshTestimonials: fetchTestimonials };
}
