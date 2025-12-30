/**
 * Shopping Cart Hook
 * Manages cart state with localStorage persistence
 */

import { useCallback, useEffect, useState } from 'react';
import { ServiceListingDTO } from '../types/api';

export interface CartItem {
  id: number;
  listing: ServiceListingDTO;
  quantity: number;
  addedAt: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (listing: ServiceListingDTO, quantity?: number) => void;
  removeItem: (listingId: number) => void;
  updateQuantity: (listingId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const STORAGE_KEY = 'acredita_cart';

export const useCart = (): CartContextType => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading cart from storage:', e);
        setItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (listing: ServiceListingDTO, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === listing.id);
        if (existing) {
          // For services, quantity is just 1. For products, increment quantity
          if (listing.listing_type === 'product') {
            return prev.map((item) =>
              item.id === listing.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return prev;
        }
        return [
          ...prev,
          {
            id: listing.id,
            listing,
            quantity: listing.listing_type === 'product' ? quantity : 1,
            addedAt: new Date().toISOString(),
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((listingId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== listingId));
  }, []);

  const updateQuantity = useCallback((listingId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(listingId);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === listingId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.listing.base_price) * item.quantity,
    0
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
};
