/**
 * Pure referral rules — no server or browser dependencies, so both API routes
 * and client components can import this without dragging Prisma into the bundle.
 */

// The referral offer covers powders only. An exclusion list, so a new powder
// category is eligible automatically. Same rule the sample packs use.
export const NON_REFERRAL_CATEGORIES = ['snacks', 'sweets'];

export function isReferralEligibleCategory(category?: string | null): boolean {
  return !NON_REFERRAL_CATEGORIES.includes(category || 'millet-powders');
}

type EligibleItem = { productId: string; packSize: string; count: number };

/**
 * Value of the powder items in a cart, excluding delivery. Snapshotted on the
 * order so a later price change can never alter an old payout.
 */
export function referralEligibleSubtotal(
  items: EligibleItem[],
  priceMap: Record<string, Record<string, number>>,
  categoryById: Record<string, string | null | undefined>,
): number {
  return items.reduce((sum, i) => {
    if (!isReferralEligibleCategory(categoryById[i.productId])) return sum;
    return sum + (priceMap[i.productId]?.[i.packSize] ?? 0) * i.count;
  }, 0);
}

// People type codes with spaces or dashes; accept 'cba-priya-7k2m' for CBAPRIYA7K2M.
export function normaliseCode(raw: unknown): string {
  return String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
