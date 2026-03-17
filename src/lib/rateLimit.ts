// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  // Cleanup old entries periodically
  if (rateMap.size > 10000) {
    rateMap.forEach((v, k) => {
      if (now > v.resetTime) rateMap.delete(k);
    });
  }

  if (!entry || now > entry.resetTime) {
    rateMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// Presets
export function rateLimitLogin(ip: string) {
  return rateLimit(`login:${ip}`, 5, 15 * 60 * 1000); // 5 attempts per 15 min
}

export function rateLimitOrder(ip: string) {
  return rateLimit(`order:${ip}`, 10, 60 * 60 * 1000); // 10 orders per hour
}

export function rateLimitApi(ip: string) {
  return rateLimit(`api:${ip}`, 100, 60 * 1000); // 100 requests per minute
}
