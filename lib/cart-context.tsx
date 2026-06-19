'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from '@/lib/db';
import { finalPrice } from './discount';

export interface CartItem { product: Product; quantity: number; }
interface CartState { items: CartItem[]; }
type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; slug: string }
  | { type: 'UPDATE_QTY'; slug: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const ex = state.items.find(i => i.product.slug === action.product.slug);
      if (ex) return { items: state.items.map(i => i.product.slug === action.product.slug ? { ...i, quantity: Math.min(i.quantity + 1, action.product.stock) } : i) };
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_ITEM': return { items: state.items.filter(i => i.product.slug !== action.slug) };
    case 'UPDATE_QTY':
      if (action.quantity <= 0) return { items: state.items.filter(i => i.product.slug !== action.slug) };
      return { items: state.items.map(i => i.product.slug === action.slug ? { ...i, quantity: action.quantity } : i) };
    case 'CLEAR_CART': return { items: [] };
    case 'LOAD': return { items: action.items };
    default: return state;
  }
}

interface CartContextType { items: CartItem[]; addItem: (p: Product) => void; removeItem: (slug: string) => void; updateQty: (slug: string, qty: number) => void; clearCart: () => void; totalItems: number; totalPrice: number; }
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try { const s = localStorage.getItem('chillzone-cart'); if (s) dispatch({ type: 'LOAD', items: JSON.parse(s) }); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('chillzone-cart', JSON.stringify(state.items)); }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + finalPrice(i.product.price, i.product.discountPct) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem: p => dispatch({ type: 'ADD_ITEM', product: p }), removeItem: slug => dispatch({ type: 'REMOVE_ITEM', slug }), updateQty: (slug, qty) => dispatch({ type: 'UPDATE_QTY', slug, quantity: qty }), clearCart: () => dispatch({ type: 'CLEAR_CART' }), totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
