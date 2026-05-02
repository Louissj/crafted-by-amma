'use client';

import Image from 'next/image';
import { CONTACT } from '@/lib/constants';

const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hi! I heard Crafted by Amma is launching soon — notify me! 🌾')}`;

export default function LaunchingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#0C1A08 0%,#142210 45%,#1A2E12 75%,#0A1406 100%)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[.07]"
          style={{ background: 'radial-gradient(circle,#D4942A,transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[.05]"
          style={{ background: 'radial-gradient(circle,#5A7A3A,transparent 70%)' }} />
      </div>

      {/* Gold top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg,transparent 5%,rgba(200,180,74,0.6) 50%,transparent 95%)' }} />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">

        {/* Logo */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{ background: '#D4942A', transform: 'scale(1.4)' }} />
          <Image src="/images/logo.png" alt="Crafted by Amma" width={88} height={88}
            className="relative rounded-full"
            style={{ border: '2px solid rgba(212,148,42,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
        </div>

        {/* Brand name */}
        <p className="text-[0.62rem] font-bold tracking-[5px] uppercase mb-2"
          style={{ color: 'rgba(212,148,42,0.55)' }}>
          Crafted by Amma
        </p>
        <p className="font-kannada text-xs mb-8" style={{ color: 'rgba(235,225,200,0.15)' }}>
          ಅಮ್ಮನಿಂದ ಕರಕುಶಲ
        </p>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4"
          style={{ color: 'rgba(235,225,200,0.96)' }}>
          Something <span style={{ color: '#D4942A' }}>delicious</span><br />is coming
        </h1>

        <p className="text-sm leading-relaxed mb-10"
          style={{ color: 'rgba(235,225,200,0.45)' }}>
          Homemade millet products from Namma Mysuru.<br />
          Pure, natural, and made with love — launching very soon.
        </p>

        {/* WhatsApp notify CTA */}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-3 px-7 py-4 rounded-2xl no-underline font-bold text-sm tracking-wide transition-all active:scale-[.98] hover:scale-[1.03] mb-6"
          style={{
            background: 'linear-gradient(135deg,#25D366,#1aad54)',
            color: '#fff',
            boxShadow: '0 8px 28px rgba(37,211,102,0.30)',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Notify me on WhatsApp
        </a>

        {/* Phone */}
        <a href={`tel:${CONTACT.phone1}`}
          className="text-sm no-underline transition-colors hover:opacity-80"
          style={{ color: 'rgba(235,225,200,0.30)' }}>
          📞 +91 {CONTACT.phone1}
        </a>

        {/* Location */}
        <p className="mt-3 text-xs" style={{ color: 'rgba(235,225,200,0.18)' }}>
          📍 Mysuru, Karnataka
        </p>

        {/* FSSAI */}
        <p className="mt-6 text-[0.58rem] font-mono" style={{ color: 'rgba(235,225,200,0.12)' }}>
          FSSAI Lic. No. 21226197000270
        </p>
      </div>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg,transparent 5%,rgba(200,180,74,0.25) 50%,transparent 95%)' }} />
    </div>
  );
}
