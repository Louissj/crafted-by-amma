'use client';

import Image from 'next/image';
import { CONTACT } from '@/lib/constants';

const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hi! I heard Crafted by Amma is launching soon — notify me! 🌾')}`;

const PARTICLES = [
  { left: '8%',  delay: '0s',   duration: '8s',  size: 2.5 },
  { left: '20%', delay: '2.1s', duration: '11s', size: 2 },
  { left: '33%', delay: '1.0s', duration: '7s',  size: 3.5 },
  { left: '47%', delay: '3.4s', duration: '9s',  size: 2 },
  { left: '60%', delay: '0.6s', duration: '8s',  size: 3 },
  { left: '74%', delay: '2.8s', duration: '10s', size: 2 },
  { left: '86%', delay: '1.5s', duration: '7s',  size: 2.5 },
  { left: '93%', delay: '4.0s', duration: '9s',  size: 2 },
];

export default function LaunchingSoon() {
  return (
    <>
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) scale(1);    opacity: 0; }
          8%   { opacity: 0.7; }
          88%  { opacity: 0.15; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes shimmer-sweep {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        @keyframes brand-shimmer {
          0%   { background-position: -250% center; }
          100% { background-position:  250% center; }
        }
        @keyframes ring-pulse-1 {
          0%, 100% { transform: scale(1.14);   opacity: 0.30; }
          50%       { transform: scale(1.18);   opacity: 0.55; }
        }
        @keyframes ring-pulse-2 {
          0%, 100% { transform: scale(1.32);   opacity: 0.12; }
          50%       { transform: scale(1.36);   opacity: 0.24; }
        }
        @keyframes ring-pulse-3 {
          0%, 100% { transform: scale(1.54);   opacity: 0.05; }
          50%       { transform: scale(1.58);   opacity: 0.12; }
        }
        @keyframes logo-glow {
          0%, 100% { box-shadow: 0 0 28px 4px rgba(212,148,42,0.16), 0 10px 36px rgba(0,0,0,0.75); }
          50%       { box-shadow: 0 0 52px 16px rgba(212,148,42,0.30), 0 10px 36px rgba(0,0,0,0.75); }
        }
        @keyframes breathe-glow {
          0%, 100% { opacity: 0.07; }
          50%       { opacity: 0.13; }
        }
        @keyframes reveal-line {
          from { opacity: 0; transform: translateY(28px) skewY(1deg); }
          to   { opacity: 1; transform: translateY(0)   skewY(0deg); }
        }
        @keyframes reveal-fade {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes line-grow {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes badge-pop {
          0%   { opacity: 0; transform: scale(0.7) translateY(8px); }
          70%  { transform: scale(1.06) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .brand-name-shimmer {
          background: linear-gradient(
            105deg,
            #B8922A 0%,
            #D4942A 15%,
            #E8C060 30%,
            #F8ECA0 42%,
            #FFFBE0 50%,
            #F8ECA0 58%,
            #E8C060 70%,
            #D4942A 85%,
            #B8922A 100%
          );
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: brand-shimmer 3.5s linear infinite;
        }
        .launching-text {
          background: linear-gradient(90deg,
            #8aaa6a 0%, #a8c880 30%, #c8e8a0 50%, #a8c880 70%, #8aaa6a 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-sweep 3s linear infinite;
        }

        .reveal-1 { animation: reveal-line 0.9s cubic-bezier(.16,.8,.3,1.1) 0.05s both; }
        .reveal-2 { animation: reveal-line 0.9s cubic-bezier(.16,.8,.3,1.1) 0.20s both; }
        .reveal-3 { animation: reveal-line 0.9s cubic-bezier(.16,.8,.3,1.1) 0.35s both; }
        .reveal-4 { animation: reveal-fade 0.8s ease-out 0.50s both; }
        .reveal-5 { animation: reveal-fade 0.8s ease-out 0.65s both; }
        .reveal-6 { animation: reveal-fade 0.8s ease-out 0.80s both; }
        .reveal-7 { animation: reveal-fade 0.8s ease-out 0.95s both; }
        .line-reveal { animation: line-grow 0.8s ease-out 0.45s both; transform-origin: center; }
        .badge-reveal { animation: badge-pop 0.6s cubic-bezier(.34,1.56,.64,1) 0.55s both; }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(175deg,#060C04 0%,#0C1608 25%,#111D0D 55%,#080E05 100%)' }}>

        {/* Grain */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '160px',
          }} />

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0"
            style={{ animation: 'breathe-glow 5s ease-in-out infinite',
              background: 'radial-gradient(ellipse 80% 55% at 50% 15%, rgba(212,148,42,1), transparent)' }} />
          <div className="absolute"
            style={{ bottom: '-8%', left: '-5%', width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(90,122,58,0.08), transparent 65%)' }} />
          <div className="absolute"
            style={{ bottom: '-8%', right: '-5%', width: 500, height: 500, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180,130,40,0.06), transparent 65%)' }} />
          {/* Center bloom behind brand name */}
          <div className="absolute left-1/2 -translate-x-1/2"
            style={{ top: '30%', width: 520, height: 260, borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(212,148,42,0.05), transparent 70%)',
              animation: 'breathe-glow 7s ease-in-out 1s infinite' }} />
        </div>

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <div key={i} className="absolute bottom-0 pointer-events-none rounded-full"
            style={{
              left: p.left, width: p.size, height: p.size,
              background: 'rgba(212,148,42,0.6)',
              animation: `float-up ${p.duration} ${p.delay} ease-in infinite`,
              boxShadow: `0 0 ${p.size * 3}px rgba(212,148,42,0.5)`,
            }} />
        ))}

        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(212,148,42,0.5) 30%,rgba(248,220,100,1) 50%,rgba(212,148,42,0.5) 70%,transparent 100%)' }} />

        {/* Corner brackets */}
        {([
          { top: 18, left: 18, d: 'M1 12V1h11' },
          { top: 18, right: 18, d: 'M1 1h11v11' },
          { bottom: 18, left: 18, d: 'M1 1v11h11' },
          { bottom: 18, right: 18, d: 'M12 1H1v11' },
        ] as Array<{ top?: number; bottom?: number; left?: number; right?: number; d: string }>).map((c, i) => (
          <div key={i} className="absolute pointer-events-none"
            style={{ top: c.top, bottom: c.bottom, left: c.left, right: c.right, opacity: 0.3 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d={c.d} stroke="#D4942A" strokeWidth="1.2" strokeLinecap="square"/>
            </svg>
          </div>
        ))}

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center text-center w-full" style={{ maxWidth: 500 }}>

          {/* Logo */}
          <div className="reveal-1 relative flex items-center justify-center mb-8"
            style={{ width: 120, height: 120 }}>
            <div className="absolute inset-0 rounded-full"
              style={{ border: '1.5px solid rgba(212,148,42,0.45)', animation: 'ring-pulse-1 3.2s ease-in-out infinite' }} />
            <div className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(212,148,42,0.18)', animation: 'ring-pulse-2 4.5s ease-in-out infinite' }} />
            <div className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(212,148,42,0.07)', animation: 'ring-pulse-3 5.5s ease-in-out 0.5s infinite' }} />
            <Image src="/images/logo.png" alt="Crafted by Amma" width={96} height={96}
              className="relative rounded-full"
              style={{ border: '2px solid rgba(212,148,42,0.32)', animation: 'logo-glow 3.5s ease-in-out infinite' }} />
          </div>

          {/* ── BRAND NAME — the hero ── */}
          <div className="mb-2 overflow-hidden">
            <p className="reveal-2 text-[0.6rem] font-bold tracking-[6px] uppercase mb-3"
              style={{ color: 'rgba(212,148,42,0.45)' }}>
              est. Mysuru · Homemade
            </p>
          </div>

          <div className="overflow-hidden mb-1">
            <h1 className="reveal-2 font-display font-bold leading-none"
              style={{ fontSize: 'clamp(2.8rem,10vw,4.4rem)', color: 'rgba(235,225,200,0.95)', letterSpacing: '-0.02em' }}>
              Crafted by
            </h1>
          </div>
          <div className="overflow-hidden mb-6">
            <h1 className="reveal-3 brand-name-shimmer font-display font-bold leading-none"
              style={{ fontSize: 'clamp(3.6rem,13vw,6rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Amma
            </h1>
          </div>

          {/* Tagline rule */}
          <div className="reveal-4 w-full flex items-center gap-3 mb-5">
            <div className="flex-1 h-px line-reveal" style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.22))', transformOrigin: 'right' }} />
            <span className="text-[0.6rem] font-semibold tracking-[4px] uppercase flex-shrink-0"
              style={{ color: 'rgba(212,148,42,0.40)' }}>
              Millet · Malt · Dosa
            </span>
            <div className="flex-1 h-px line-reveal" style={{ background: 'linear-gradient(90deg,rgba(212,148,42,0.22),transparent)', transformOrigin: 'left' }} />
          </div>

          {/* Launching soon badge */}
          <div className="badge-reveal mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full"
              style={{
                background: 'rgba(212,148,42,0.08)',
                border: '1px solid rgba(212,148,42,0.22)',
                boxShadow: '0 0 20px rgba(212,148,42,0.08)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#D4942A', boxShadow: '0 0 6px rgba(212,148,42,0.8)', animation: 'ring-pulse-1 1.8s ease-in-out infinite' }} />
              <span className="launching-text font-bold text-[0.7rem] tracking-[3px] uppercase">
                Launching Soon
              </span>
            </span>
          </div>

          {/* Description */}
          <p className="reveal-5 text-[0.88rem] leading-[1.85] mb-8"
            style={{ color: 'rgba(235,225,200,0.32)', maxWidth: 380 }}>
            Pure homemade millet products — made with love from Namma Mysuru.
            No preservatives. No shortcuts.
          </p>

          {/* WhatsApp CTA */}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="reveal-6 w-full flex items-center justify-center gap-3 no-underline transition-all active:scale-[.97] hover:scale-[1.015] mb-3"
            style={{
              padding: '17px 32px',
              borderRadius: 14,
              background: 'linear-gradient(135deg,#1DB954,#128a3c)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              boxShadow: '0 8px 32px rgba(29,185,84,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Get Notified on WhatsApp
          </a>

          {/* Phone */}
          <a href={`tel:${CONTACT.phone1}`}
            className="reveal-6 w-full flex items-center justify-center gap-2.5 no-underline transition-all hover:opacity-60 mb-9"
            style={{
              padding: '14px 32px', borderRadius: 14,
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(235,225,200,0.25)',
              fontSize: '0.76rem', letterSpacing: '1.5px',
              textTransform: 'uppercase', fontWeight: 600,
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
            +91 {CONTACT.phone1}
          </a>

          {/* Kannada + location + FSSAI */}
          <div className="reveal-7 flex flex-col items-center gap-1.5">
            <p className="font-kannada text-sm" style={{ color: 'rgba(235,225,200,0.12)' }}>
              ಅಮ್ಮನಿಂದ ಕರಕುಶಲ
            </p>
            <div className="flex items-center gap-2">
              <div className="h-px w-5" style={{ background: 'rgba(212,148,42,0.18)' }} />
              <p className="text-[0.56rem] tracking-[3px] uppercase" style={{ color: 'rgba(235,225,200,0.15)' }}>
                Mysuru · Karnataka · India
              </p>
              <div className="h-px w-5" style={{ background: 'rgba(212,148,42,0.18)' }} />
            </div>
            <p className="text-[0.5rem] font-mono" style={{ color: 'rgba(235,225,200,0.07)' }}>
              FSSAI Lic. No. 21226197000270
            </p>
          </div>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.25) 50%,transparent)' }} />
      </div>
    </>
  );
}
