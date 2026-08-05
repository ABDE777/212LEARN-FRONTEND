import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/wishlist');
      const data = response.data?.data || {};
      setWishlist(data.wishlist || data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (courseId, courseTitle = 'Cours') => {
    if (!isAuthenticated) {
      showError('Veuillez vous connecter pour sauvegarder dans vos souhaits.');
      return false;
    }
    setLoading(true);
    try {
      await api.post('/wishlist', { courseId });
      await fetchWishlist();
      showSuccess(`"${courseTitle}" ajouté à vos souhaits !`);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de l\'ajout aux souhaits';
      showError(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (courseId, courseTitle = '') => {
    setLoading(true);
    try {
      await api.delete(`/wishlist/${courseId}`);
      await fetchWishlist();
      if (courseTitle) {
        showSuccess(`"${courseTitle}" retiré des souhaits.`);
      } else {
        showSuccess('Cours retiré des souhaits.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la suppression';
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const items = wishlist?.items || (Array.isArray(wishlist) ? wishlist : []);
  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items,
        wishlistCount,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
