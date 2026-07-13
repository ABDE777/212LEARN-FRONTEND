import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Impossible de charger les catégories. Le serveur est temporairement indisponible.');
        // Set fallback categories so UI still works
        setCategories([
          { id: '1', name: 'Informatique', description: 'Programmation et développement' },
          { id: '2', name: 'Base de données', description: 'SQL et NoSQL' },
          { id: '3', name: 'Développement Web', description: 'Frontend et Backend' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
