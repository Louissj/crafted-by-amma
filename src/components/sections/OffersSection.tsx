'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Offer = { id: string; icon: string; text: string; active: boolean };

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then((data: Offer[]) => {
        if (Array.isArray(data)) setOffers(data.filter(o => o.active));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Don't render anything until loaded, and only if there are active offers
  if (!loaded || offers.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-10 px-4"
      style={{ background: 'linear-gradient(135deg,#1a0a00 0%,#2a1200 40%,#1a0a00 100%)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse,#D4942A,transparent 70%)' }} />
      </div>

      {/* Top border shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg,transparent,#D4942A 30%,#F5C842 50%,#D4942A 70%,transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.4) 50%,transparent)' }} />

      <div className="max-w-[1120px] mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <div className="h-px flex-1 max-w-[80px]"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.5))' }} />
          <div className="flex items-center gap-2">
            <span className="text-lg animate-bounce" style={{ animationDuration: '1.8s' }}>🔥</span>
            <h2 className="font-display text-base font-bold tracking-[3px] uppercase"
              style={{ color: '#D4942A' }}>
              Special Offers
            </h2>
            <span className="text-lg animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}>🔥</span>
          </div>
          <div className="h-px flex-1 max-w-[80px]"
            style={{ background: 'linear-gradient(90deg,rgba(212,148,42,0.5),transparent)' }} />
        </div>

        {/* Offer cards */}
        <div className={`grid gap-3 ${
          offers.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          offers.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {offers.map((offer, i) => (
            <div key={offer.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg,rgba(212,148,42,0.12),rgba(212,148,42,0.06))',
                border: '1.5px solid rgba(212,148,42,0.30)',
                boxShadow: '0 4px 20px rgba(212,148,42,0.10)',
                animationDelay: `${i * 80}ms`,
              }}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{
                  background: 'linear-gradient(135deg,rgba(212,148,42,0.20),rgba(212,148,42,0.10))',
                  border: '1px solid rgba(212,148,42,0.25)',
                  boxShadow: '0 2px 12px rgba(212,148,42,0.15)',
                }}>
                {offer.icon}
              </div>
              {/* Text */}
              <p className="text-sm font-semibold leading-snug flex-1"
                style={{ color: 'rgba(235,215,170,0.95)' }}>
                {offer.text}
              </p>
              {/* Arrow hint */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgba(212,148,42,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-7">
          <Link href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm tracking-[1.5px] uppercase no-underline transition-all hover:scale-[1.04] active:scale-[.97]"
            style={{
              background: 'linear-gradient(135deg,#D4942A,#B87323)',
              color: '#1A0A00',
              boxShadow: '0 6px 24px rgba(212,148,42,0.35)',
            }}>
            Shop Now & Save
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
