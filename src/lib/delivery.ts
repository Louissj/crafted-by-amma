/**
 * Shared weight-based delivery charge calculation.
 * Used by server-side API routes so the logic matches the cart/checkout UI.
 */

type Slab = { maxGrams: number; charge: number };
type DeliverySettings = {
  baseCharge: number;
  outstationCharge: number;
  karnatakaSlabs?: Slab[];
  southIndiaSlabs?: Slab[];
  northIndiaSlabs?: Slab[];
};
type CartItem = { packSize: string; count: number };

const SOUTH_INDIA_STATES = [
  'tamil nadu', 'kerala', 'andhra pradesh', 'telangana',
  'goa', 'puducherry', 'pondicherry', 'lakshadweep',
  'andaman and nicobar',
];

export function parseGrams(packSize: string): number {
  const lower = packSize.toLowerCase();
  const kg = lower.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kg) return parseFloat(kg[1]) * 1000;
  const g = lower.match(/(\d+(?:\.\d+)?)\s*g/);
  if (g) return parseFloat(g[1]);
  return 1000; // unknown → treat as 1kg (free in Karnataka)
}

function slabCharge(slabs: Slab[] | undefined, grams: number, fallback: number): number {
  if (!slabs?.length) return fallback;
  const sorted = [...slabs].sort((a, b) => a.maxGrams - b.maxGrams);
  return (sorted.find(s => grams <= s.maxGrams) ?? sorted[sorted.length - 1]).charge;
}

export function getDeliveryZoneFromState(state: string): 'karnataka' | 'south-india' | 'north-india' {
  const sl = state.toLowerCase();
  if (sl.includes('karnataka')) return 'karnataka';
  if (SOUTH_INDIA_STATES.some(s => sl.includes(s))) return 'south-india';
  return 'north-india';
}

export function calcDeliveryCharge(
  zone: string,
  items: CartItem[],
  ds: DeliverySettings,
  extraGrams = 0  // e.g. weight from sample packs (50g per product)
): number {
  if (zone === 'international') return 0;

  // Karnataka promo: an order made up entirely of 1kg+ packs ships free.
  // Anything else pays on the real parcel weight. Dropping the big pack's
  // weight from a mixed order billed a 2.6kg parcel as though it were 1.6kg.
  if (
    zone === 'karnataka' &&
    extraGrams === 0 &&
    items.length > 0 &&
    items.every(item => parseGrams(item.packSize) >= 1000)
  ) {
    return 0;
  }

  const totalGrams = items.reduce(
    (sum, item) => sum + parseGrams(item.packSize) * item.count,
    0,
  ) + extraGrams;

  if (totalGrams === 0) return 0;

  if (zone === 'karnataka') {
    return slabCharge(ds.karnatakaSlabs, totalGrams, ds.baseCharge || 60);
  }
  if (zone === 'south-india') {
    return slabCharge(ds.southIndiaSlabs, totalGrams, ds.outstationCharge);
  }
  // north-india and anything else
  return slabCharge(ds.northIndiaSlabs, totalGrams, ds.outstationCharge);
}
