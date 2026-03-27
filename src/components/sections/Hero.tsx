'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="min-h-screen min-h-[100dvh] relative overflow-hidden flex items-center justify-center">

      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center brightness-[.28] saturate-[.85] contrast-[1.1]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=70')" }} />

      {/* Gradient overlays */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg,rgba(12,22,10,.88) 0%,rgba(26,48,20,.65) 35%,rgba(36,58,28,.55) 55%,rgba(14,26,12,.85) 100%)' }} />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%,rgba(180,200,60,.08),transparent 55%),radial-gradient(circle at 20% 70%,rgba(200,180,74,.06),transparent 40%)' }} />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%,transparent 25%,rgba(8,16,6,.55) 100%)' }} />

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent 10%,rgba(200,180,74,.25) 50%,transparent 90%)' }} />

      {/* Corner accents */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-brass/[.2] rounded-tl-[10px]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-brass/[.2] rounded-br-[10px]" />
        <div className="hidden md:block absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-brass/[.1] rounded-tr-[10px]" />
        <div className="hidden md:block absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-brass/[.1] rounded-bl-[10px]" />
      </div>

      {/* Millet stalks */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px] md:h-[130px] pointer-events-none z-[1] overflow-hidden opacity-[.18]">
        <svg viewBox="0 0 800 130" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          {[55, 130, 215, 330, 455, 555, 665, 745].map((x, i) => (
            <g key={i} className="origin-bottom" style={{ animation: `sway ${3.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${-i * 0.4}s` }}>
              <line x1={x} y1="130" x2={x - 3} y2={25 + i * 5} stroke={`rgba(${100 + i * 5},${140 + i * 5},${50 + i * 3},.5)`} strokeWidth={1.5 + i * 0.1} />
              <ellipse cx={x - 5} cy={20 + i * 5} rx={2.5} ry={7} fill="rgba(200,180,74,.4)" transform={`rotate(${-10 + i * 4} ${x - 5} ${20 + i * 5})`} />
              <ellipse cx={x + 2} cy={14 + i * 5} rx={2} ry={6} fill="rgba(200,180,74,.32)" transform={`rotate(${10 - i * 3} ${x + 2} ${14 + i * 5})`} />
            </g>
          ))}
        </svg>
      </div>

      {/* Floating badge - mobile top right */}
      <div className="absolute top-20 right-4 md:top-1/4 md:right-[9%] z-[3]">
        <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[1.5px] uppercase border"
          style={{ background: 'rgba(200,180,74,0.1)', borderColor: 'rgba(200,180,74,0.2)', color: 'rgba(200,180,74,0.7)', backdropFilter: 'blur(8px)' }}>
          ✦ Zero Preservatives
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[2] text-center px-5 pt-28 pb-16 max-w-[640px] w-full md:text-left md:pt-40 md:pb-24 md:px-[8%] md:max-w-none">

        {/* Logo */}
        <div className="w-[120px] h-[120px] md:w-[148px] md:h-[148px] rounded-full border-[2.5px] border-brass/[.30] mx-auto md:mx-0 mb-5 md:mb-6 overflow-hidden animate-pulse-glow"
          style={{ boxShadow: '0 12px 48px rgba(0,0,0,.35),0 0 64px rgba(200,180,74,.10)' }}>
          <Image src="/images/logo.png" alt="Crafted by Amma" width={148} height={148} className="w-full h-full object-contain" />
        </div>

        {/* Location pill */}
        <p className="font-display text-[.92rem] md:text-[1rem] italic text-brass mb-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '.2s', animationFillMode: 'forwards' }}>
          📍 Proudly from Namma Mysuru
        </p>

        {/* Main heading */}
        <h1 className="font-display font-bold text-cream-light leading-[1.05] mb-3 text-[clamp(2.4rem,9vw,4.8rem)] opacity-0 animate-fade-up"
          style={{ animationDelay: '.3s', animationFillMode: 'forwards', textShadow: '0 2px 20px rgba(180,200,60,.06),0 4px 40px rgba(0,0,0,.2)' }}>
          Pure. Homemade.
          <span className="block text-[.56em] text-sand/65 font-medium mt-1.5">
            Crafted with <span className="text-brass relative inline-block">
              Love.
              <span className="absolute bottom-0.5 -left-0.5 -right-0.5 h-1.5 bg-sage/20 rounded -z-10" />
            </span>
          </span>
        </h1>

        {/* Kannada */}
        <p className="font-kannada text-[.85rem] text-sand/[.55] mb-3.5 opacity-0 animate-fade-up"
          style={{ animationDelay: '.4s', animationFillMode: 'forwards' }}>
          ಶುದ್ಧ · ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ · ಪೌಷ್ಟಿಕ
        </p>

        {/* Subtitle */}
        <p className="text-[.85rem] md:text-[.9rem] leading-[1.9] text-sand/[.60] max-w-[430px] mx-auto md:mx-0 mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: '.5s', animationFillMode: 'forwards' }}>
          From Amma&apos;s kitchen in Mysuru — Millet Malt Powder & Instant Multigrain Dosa Powder.
          <span className="block mt-1 text-brass/65 text-xs tracking-[1px]">Zero preservatives · Zero added sugar · 21+ ingredients</span>
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center md:justify-start flex-wrap mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: '.6s', animationFillMode: 'forwards' }}>
          <a href="#order"
            className="px-7 py-3.5 rounded-full text-xs font-bold tracking-[1.5px] uppercase no-underline inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            style={{ background: 'linear-gradient(135deg,#5A7A3A,#7A9A50)', color: '#F5F0E0', boxShadow: '0 6px 24px rgba(90,122,58,0.35)' }}>
            🛒 Order Now
          </a>
          <a href="#prods"
            className="px-7 py-3.5 rounded-full text-xs font-bold tracking-[1.5px] uppercase no-underline inline-flex items-center gap-2 transition-all hover:border-brass/50 hover:text-brass active:scale-95 text-sand/80 border-[1.5px] border-sand/[.25]">
            Explore Products →
          </a>
        </div>

        {/* Trust pills - mobile friendly */}
        <div className="flex gap-2 justify-center md:justify-start flex-wrap opacity-0 animate-fade-up"
          style={{ animationDelay: '.75s', animationFillMode: 'forwards' }}>
          {['🌿 100% Natural', '🚫 No Chemicals', '✈️ Ships Worldwide'].map(t => (
            <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(235,225,200,0.65)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center md:items-start gap-1 mt-10 animate-bounce opacity-0"
          style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
          <span className="text-xs tracking-[3px] uppercase text-sand/[.14]">Scroll</span>
          <div className="w-px h-5 bg-gradient-to-b from-brass/15 to-transparent" />
        </div>
      </div>

      {/* Desktop right decoration */}
      <div className="hidden md:block absolute right-[8%] top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-80 h-80 border border-brass/[.07] rounded-full" />
        <div className="absolute inset-10 border border-dashed border-brass/[.04] rounded-full" />
        <div className="absolute inset-[5.5rem] border border-brass/[.07] rounded-full" />
      </div>
    </section>
  );
}
