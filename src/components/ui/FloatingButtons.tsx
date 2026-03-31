'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

export default function FloatingButtons() {
  const [cartCount, setCartCount] = useState(0);
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hi! I want to order from Crafted by Amma 🌾')}`;

  useEffect(() => {
    const read = () => {
      try {
        const stored = localStorage.getItem('cba-cart');
        const items: Array<{ count: number }> = stored ? JSON.parse(stored) : [];
        setCartCount(items.reduce((s, i) => s + (i.count || 0), 0));
      } catch { setCartCount(0); }
    };
    read();
    window.addEventListener('cartUpdate', read);
    return () => window.removeEventListener('cartUpdate', read);
  }, []);

  // On mobile: sit above the cart band if cart has items, otherwise use normal bottom spacing
  const mobileBottom = cartCount > 0 ? 'bottom-[100px]' : 'bottom-8';

  return (
    <div className={`fixed ${mobileBottom} md:bottom-8 right-4 z-[8000] flex flex-col items-end gap-2.5`}>

      {/* Track Order */}
      <Link href="/track"
        className="group flex items-center no-underline active:scale-95 transition-all duration-200">
        {/* Label — visible on hover (desktop) */}
        <span className="mr-2.5 hidden md:block opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200
          text-[0.65rem] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-full pointer-events-none"
          style={{ background: 'rgba(10,18,8,0.90)', color: 'rgba(200,180,74,0.90)', border: '1px solid rgba(200,180,74,0.25)' }}>
          Track Order
        </span>
        {/* Circle button */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(10,18,8,0.90)',
            border: '1.5px solid rgba(200,180,74,0.35)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.30)',
            backdropFilter: 'blur(12px)',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8B44A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
          </svg>
        </div>
      </Link>

      {/* WhatsApp */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        className="group flex items-center no-underline active:scale-95 transition-all duration-200">
        {/* Label — visible on hover (desktop) */}
        <span className="mr-2.5 hidden md:block opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200
          text-[0.65rem] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-full pointer-events-none"
          style={{ background: 'rgba(10,18,8,0.90)', color: 'rgba(37,211,102,0.90)', border: '1px solid rgba(37,211,102,0.25)' }}>
          WhatsApp
        </span>
        {/* Circle button */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg,#25D366,#1aad54)',
            boxShadow: '0 4px 16px rgba(37,211,102,0.40)',
          }}>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: '#25D366' }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      </a>

    </div>
  );
}
