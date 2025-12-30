/**
 * Cart Context
 * Provides shopping cart state to entire app
 */

import React, { createContext, useContext } from 'react';
import { useCart } from '../hooks/useCart';
import { ServiceListingDTO } from '../types/api';

export interface CartContextType {
  items: Array<{
    id: number;
    listing: ServiceListingDTO;
    quantity: number;
    addedAt: string;
  }>;
  addItem: (listing: ServiceListingDTO, quantity?: number) => void;
  removeItem: (listingId: number) => void;
  updateQuantity: (listingId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};
