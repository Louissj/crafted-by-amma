import prisma from '@/lib/db';
import { normaliseCode } from '@/lib/referralRules';

export * from '@/lib/referralRules';

/**
 * Resolve a customer-supplied referral code to its canonical form.
 * Returns null for anything that isn't an active referrer's code — an order
 * is never rejected over a bad code, it just records no referral.
 */
export async function resolveReferralCode(raw: unknown): Promise<string | null> {
  const code = normaliseCode(raw);
  if (!code) return null;
  try {
    const referrer = await prisma.referrer.findUnique({
      where: { code },
      select: { code: true, active: true },
    });
    return referrer?.active ? referrer.code : null;
  } catch {
    return null;
  }
}
