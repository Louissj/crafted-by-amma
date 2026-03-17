'use client';

import { useState, useEffect, useCallback } from 'react';

const CART_KEY = 'cba-cart';

export type CartItem = { productId: string; packSize: string; count: number };

// Fallback prices — used only if DB products haven't loaded yet
export const CART_PRICES: Record<string, Record<string, number>> = {
  'millet-malt':  { '250g': 110, '500g': 190, '1kg': 350 },
  'instant-dosa': { '250g': 85,  '500g': 160, '1kg': 280 },
};

export function useCart(priceMap?: Record<string, Record<string, number>>) {
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const prices = priceMap || CART_PRICES;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setCartState(JSON.parse(stored));
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('cartUpdate'));
  }, [cart, mounted]);

  const setCount = useCallback((productId: string, packSize: string, count: number) => {
    setCartState(prev => {
      const idx = prev.findIndex(i => i.productId === productId && i.packSize === packSize);
      if (count <= 0) return idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
      if (idx >= 0) return prev.map((item, i) => i === idx ? { ...item, count } : item);
      return [...prev, { productId, packSize, count }];
    });
  }, []);

  const clearCart = useCallback(() => setCartState([]), []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (prices[item.productId]?.[item.packSize] || 0) * item.count,
    0
  );
  const totalPacks = cart.reduce((s, i) => s + i.count, 0);

  return { cart, setCount, clearCart, cartTotal, totalPacks, mounted };
}
