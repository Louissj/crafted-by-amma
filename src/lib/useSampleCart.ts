'use client';

import { useState, useEffect, useCallback } from 'react';

const KEY = 'cba-sample-cart';

export type SamplePackOption = { key: string; label: string; count: number; price: number };
export type SampleCartItem = {
  packKey: string;
  label: string;
  count: number;        // number of products in this sample pack
  price: number;
  selectedProducts: string[];
  qty: number;          // how many of this sample pack to order
};

export function useSampleCart() {
  const [items, setItems] = useState<SampleCartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('cartUpdate'));
  }, [items, mounted]);

  const addSamplePack = useCallback((item: SampleCartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.packKey === item.packKey);
      if (idx >= 0) return prev.map((i, n) => n === idx ? item : i);
      return [...prev, item];
    });
  }, []);

  const removeSamplePack = useCallback((packKey: string) => {
    setItems(prev => prev.filter(i => i.packKey !== packKey));
  }, []);

  const clearSampleCart = useCallback(() => setItems([]), []);

  const sampleTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const sampleCount = items.reduce((s, i) => s + i.qty, 0);

  return { sampleItems: items, addSamplePack, removeSamplePack, clearSampleCart, sampleTotal, sampleCount, mounted };
}
