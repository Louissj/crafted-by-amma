'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-[9999] w-full"
      style={{ background: 'linear-gradient(90deg,#1A2E12,#243818,#1A2E12)', borderBottom: '1px solid rgba(212,148,42,0.25)' }}>

      {/* Shimmer sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 h-full w-[30%] animate-shimmer"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.08),transparent)' }} />
      </div>

      <div className="relative flex items-center justify-center gap-3 px-10 py-2">
        <Link href="/products" className="no-underline flex items-center gap-3">
          {/* Left dots */}
          <span className="hidden sm:flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,148,42,0.5)' }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(212,148,42,0.7)' }} />
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,148,42,0.5)' }} />
          </span>

          <p className="text-center text-[0.72rem] sm:text-sm tracking-[1.5px] font-semibold"
            style={{ color: 'rgba(235,225,200,0.80)' }}>
            <span className="font-black tracking-[2px]"
              style={{ color: '#D4942A', fontSize: '0.85rem' }}>
              10% OFF on all products
            </span>
            {' · '}
            <span className="hidden sm:inline">Millet Powders, Masala Powders &amp; Chutney Pudi</span>
            <span className="sm:hidden">All Products</span>
            {' · '}
            <span className="underline underline-offset-2" style={{ color: 'rgba(212,148,42,0.80)' }}>
              Shop Now
            </span>
          </p>

          {/* Right dots */}
          <span className="hidden sm:flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,148,42,0.5)' }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(212,148,42,0.7)' }} />
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,148,42,0.5)' }} />
          </span>
        </Link>

        {/* Dismiss */}
        <button onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: 'rgba(235,225,200,0.30)' }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
