'use client';

import { useState, useEffect } from 'react';

export type UsageStep = { type: string; instructions: string };

export type DbProduct = {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  ingredients: string;
  usage: UsageStep[];
  prices: Record<string, number>;
  images: string[];
  active: boolean;
  sortOrder: number;
};

// Fallback prices in case API hasn't loaded yet (matches seed data)
const FALLBACK_PRICES: Record<string, Record<string, number>> = {
  'millet-malt':  { '250g': 110, '500g': 190, '1kg': 350 },
  'instant-dosa': { '250g': 85,  '500g': 160, '1kg': 280 },
};

export function useProducts() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build a priceMap from DB products, falling back to hardcoded values
  const priceMap: Record<string, Record<string, number>> = products.length > 0
    ? Object.fromEntries(products.map(p => [p.id, p.prices]))
    : FALLBACK_PRICES;

  return { products, priceMap, loading };
}
