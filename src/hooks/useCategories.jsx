import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      const backendCategories = response.data?.data?.categories || response.data?.categories || response.data || [];
      setCategories(backendCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Impossible de charger les catégories. Le serveur est temporairement indisponible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    
    // Listen for category update events from other components
    const handleCategoryUpdate = () => {
      fetchCategories();
    };
    
    window.addEventListener('categories-updated', handleCategoryUpdate);
    
    return () => {
      window.removeEventListener('categories-updated', handleCategoryUpdate);
    };
  }, [fetchCategories]);

  const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    await fetchCategories();
    window.dispatchEvent(new CustomEvent('categories-updated'));
    return response.data?.data?.category || response.data;
  };

  const updateCategory = async (categoryId, categoryData) => {
    const response = await api.patch(`/categories/${categoryId}`, categoryData);
    await fetchCategories();
    window.dispatchEvent(new CustomEvent('categories-updated'));
    return response.data?.data?.category || response.data?.data || response.data;
  };

  const deleteCategory = async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    await fetchCategories();
    window.dispatchEvent(new CustomEvent('categories-updated'));
    return response.data?.data || response.data;
  };

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
