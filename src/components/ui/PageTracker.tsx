'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { saveReferralCode } from '@/lib/referralClient';

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) return;
    trackEvent('page_view', { page: pathname });
  }, [pathname]);

  // Remember ?ref= from a shared link so it survives until checkout.
  // Read from location rather than useSearchParams — the latter would force
  // every page under this layout out of static rendering.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) {
      saveReferralCode(ref);
      trackEvent('referral_link_visit', { metadata: { code: ref.trim().toUpperCase() } });
    }
  }, [pathname]);

  return null;
}
