// Returns a stable anonymous session ID stored in localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = localStorage.getItem('cba-sid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('cba-sid', sid);
    }
    return sid;
  } catch {
    return '';
  }
}

type EventType = 'page_view' | 'cart_view' | 'add_to_cart' | 'checkout_start' | 'order_placed';

interface TrackPayload {
  productId?: string;
  packSize?: string;
  page?: string;
  metadata?: Record<string, unknown>;
}

export function trackEvent(type: EventType, payload: TrackPayload = {}) {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, sessionId: getSessionId(), ...payload }),
    }).catch(() => {});
  } catch { /* never throw */ }
}
