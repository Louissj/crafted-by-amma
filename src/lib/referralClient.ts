'use client';

// Referral code the visitor arrived with, remembered until they check out.
const KEY = 'amma_ref';

export function saveReferralCode(code: string) {
  try { localStorage.setItem(KEY, code.trim().toUpperCase()); } catch { /* private mode */ }
}

export function getReferralCode(): string {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}

export function clearReferralCode() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
