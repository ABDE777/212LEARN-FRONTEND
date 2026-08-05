import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/cart');
      const data = response.data?.data || {};
      setCart(data.cart || data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (courseId, courseTitle = 'Cours') => {
    if (!isAuthenticated) {
      showError('Veuillez vous connecter pour ajouter un cours au panier.');
      return false;
    }
    setLoading(true);
    try {
      await api.post('/cart/items', { courseId });
      await fetchCart();
      showSuccess(`"${courseTitle}" ajouté au panier !`);
      setIsCartOpen(true);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de l\'ajout au panier';
      showError(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId, courseTitle = '') => {
    setLoading(true);
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
      if (courseTitle) {
        showSuccess(`"${courseTitle}" retiré du panier.`);
      } else {
        showSuccess('Article retiré du panier.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la suppression';
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await api.delete('/cart');
      setCart({ items: [] });
      await fetchCart();
    } catch (err) {
      console.error('Clear cart error:', err);
      // Fallback local clear
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.items || (Array.isArray(cart) ? cart : []);
  const cartCount = items.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        loading,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
