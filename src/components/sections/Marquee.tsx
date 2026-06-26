'use client';

import { useState, useEffect } from 'react';

type Offer = { id: string; icon: string; text: string };

const STATIC_ITEMS = [
  { icon: '🌾', text: 'No Preservatives' },
  { icon: '🍃', text: 'No Added Sugar' },
  { icon: '✨', text: 'No Artificial Flavours' },
  { icon: '🏠', text: 'ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ' },
  { icon: '✈️', text: 'Ships Worldwide' },
  { icon: '💪', text: 'Millet Powered' },
];

export default function Marquee() {
  const [offers, setOffers] = useState<{ icon: string; text: string }[]>(STATIC_ITEMS);

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then((data: Offer[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setOffers([...STATIC_ITEMS, ...data.map(o => ({ icon: o.icon, text: o.text }))]);
        }
      })
      .catch(() => {});
  }, []);

  const repeated = [...offers, ...offers, ...offers];

  return (
    <div className="py-4 overflow-hidden border-t border-b border-brass/[.07]"
      style={{ background: 'linear-gradient(90deg,#253D1C,#2C4822,#253D1C)' }}>
      <div className="flex animate-scroll w-max">
        {repeated.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-5 whitespace-nowrap">
            <span className="text-base opacity-90">{item.icon}</span>
            <span className="text-sm font-semibold text-millet/90 tracking-[1.5px] uppercase">{item.text}</span>
            <span className="ml-3 w-[3px] h-[3px] bg-brass/60 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
