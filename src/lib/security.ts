import { NextRequest } from 'next/server';

// Get client IP from request
export function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

// Sanitize string input - strip HTML/scripts
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')       // strip HTML tags
    .replace(/[<>'"`;]/g, '')      // strip dangerous chars
    .trim()
    .slice(0, 1000);               // max length
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
}

// Validate file upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Max 5MB.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    if (!ALLOWED_EXTS.includes(ext)) {
      return { valid: false, error: 'Only JPG, PNG, WebP images allowed.' };
    }
  }

  return { valid: true };
}

// Generate secure random filename
export function secureFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safe = ext.replace(/[^a-z0-9]/g, '');
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return `${Date.now()}-${random}.${safe}`;
}

// Calculate order total from cart items using prices fetched from DB
export function calculateCartTotal(
  cartItems: { productId: string; packSize: string; count: number }[],
  priceMap: Record<string, Record<string, number>>
): number {
  let total = 0;
  for (const item of cartItems) {
    total += (priceMap[item.productId]?.[item.packSize] || 0) * item.count;
  }
  return total;
}
