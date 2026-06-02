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
  ds: DeliverySettings
): number {
  if (zone === 'international') return 0;

  // Total chargeable grams — 1kg+ packs are FREE in Karnataka, still charged outside
  const chargeableGrams = items.reduce((sum, item) => {
    const g = parseGrams(item.packSize);
    if (zone === 'karnataka' && g >= 1000) return sum; // 1kg free in Karnataka
    return sum + g * item.count;
  }, 0);

  if (zone === 'karnataka') {
    // Per-kg rate: baseCharge = ₹/kg, round up to nearest kg, 1kg packs already excluded
    return chargeableGrams === 0 ? 0 : Math.ceil(chargeableGrams / 1000) * (ds.baseCharge || 60);
  }
  if (zone === 'south-india') {
    return slabCharge(ds.southIndiaSlabs, chargeableGrams, ds.outstationCharge);
  }
  // north-india and anything else
  return slabCharge(ds.northIndiaSlabs, chargeableGrams, ds.outstationCharge);
}
