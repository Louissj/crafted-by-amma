'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="min-h-screen min-h-[100dvh] relative overflow-hidden flex items-center justify-center">

      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center brightness-[.42] saturate-[.85] contrast-[1.05]"
        style={{ backgroundImage: "url('https://crafted-by-amma.s3.ap-south-1.amazonaws.com/images/multigrain4.png')" }} />

      {/* Strong directional overlay — heavy where text sits, lighter at edges */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg,rgba(6,14,4,.90) 0%,rgba(14,28,8,.80) 30%,rgba(24,44,16,.62) 55%,rgba(8,18,6,.86) 100%)' }} />
      {/* Warm tint */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%,rgba(180,200,60,.06),transparent 55%)' }} />
      {/* Edge vignette */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%,transparent 20%,rgba(4,10,2,.50) 100%)' }} />

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent 10%,rgba(200,180,74,.30) 50%,transparent 90%)' }} />

      {/* Corner accents */}
      <div className="absolute inset-3 sm:inset-4 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-brass/[.28] rounded-tl-[10px]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-brass/[.28] rounded-br-[10px]" />
        <div className="hidden sm:block absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-brass/[.16] rounded-tr-[10px]" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-brass/[.16] rounded-bl-[10px]" />
      </div>

      {/* Millet stalks */}
      <div className="absolute bottom-0 left-0 right-0 h-[70px] sm:h-[100px] md:h-[130px] pointer-events-none z-[1] overflow-hidden opacity-[.22]">
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

      {/* Floating badge — hidden on small mobile to avoid overlap */}
      {/* <div className="hidden sm:block absolute top-20 right-4 md:top-1/4 md:right-[9%] z-[3]">
        <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[1.5px] uppercase border"
          style={{ background: 'rgba(200,180,74,0.12)', borderColor: 'rgba(200,180,74,0.32)', color: 'rgba(200,180,74,0.95)', backdropFilter: 'blur(8px)' }}>
          ✦ Zero Preservatives
        </div>
      </div> */}

      {/* Content */}
      <div className="relative z-[2] text-center px-5 pt-24 pb-14 sm:pt-28 sm:pb-16 max-w-[600px] w-full
        md:text-left md:pt-40 md:pb-24 md:px-[8%] md:max-w-none lg:pt-44">

        {/* Logo */}
        <div className="relative mx-auto md:mx-0 mb-5 md:mb-6 w-[130px] h-[130px] sm:w-[155px] sm:h-[155px] md:w-[185px] md:h-[185px] flex-shrink-0">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{ boxShadow: '0 0 0 3px rgba(200,180,74,0.22), 0 0 0 7px rgba(200,180,74,0.09), 0 16px 56px rgba(0,0,0,0.55), 0 0 80px rgba(200,180,74,0.22)' }} />
          {/* Inner image container */}
          <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-brass/[.60]"
            style={{ boxShadow: 'inset 0 2px 8px rgba(200,180,74,0.25)' }}>
            <Image src="/images/logo.png" alt="Crafted by Amma" width={185} height={185} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Location pill */}
        <p className="font-display text-base sm:text-lg italic text-brass mb-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '.2s', animationFillMode: 'forwards', textShadow: '0 1px 10px rgba(0,0,0,.5)' }}>
          📍 Proudly from Namma Mysuru
        </p>

        {/* Main heading */}
        <h1 className="font-display font-bold leading-[1.05] mb-4 opacity-0 animate-fade-up whitespace-nowrap
          text-[clamp(1.6rem,7.5vw,5.5rem)]"
          style={{
            animationDelay: '.3s',
            animationFillMode: 'forwards',
            color: 'rgba(245,240,224,1)',
            textShadow: '0 2px 20px rgba(0,0,0,.80),0 4px 48px rgba(0,0,0,.60)',
          }}>
          Crafted By Amma
          <span className="block text-[.55em] font-medium mt-2"
            style={{ color: 'rgba(235,225,200,0.90)', textShadow: '0 1px 14px rgba(0,0,0,.70)' }}>
            Homemade Millet{' '}
            <span style={{ color: '#C8B44A', textShadow: '0 1px 12px rgba(0,0,0,.60)' }} className="relative inline-block">
              Products
              <span className="absolute bottom-0.5 -left-0.5 -right-0.5 h-1.5 bg-sage/25 rounded -z-10" />
            </span>
          </span>
        </h1>

        {/* Kannada */}
        <p className="font-kannada text-base sm:text-lg mb-4 opacity-0 animate-fade-up"
          style={{
            animationDelay: '.4s',
            animationFillMode: 'forwards',
            color: 'rgba(235,225,200,0.82)',
            textShadow: '0 1px 10px rgba(0,0,0,.55)',
          }}>
          ಶುದ್ಧ · ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ · ಪೌಷ್ಟಿಕ
        </p>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl leading-[1.8] max-w-[500px] mx-auto md:mx-0 mb-8 opacity-0 animate-fade-up"
          style={{
            animationDelay: '.5s',
            animationFillMode: 'forwards',
            color: 'rgba(235,225,200,0.85)',
            textShadow: '0 1px 8px rgba(0,0,0,.50)',
          }}>
          From Amma&apos;s kitchen in Mysuru — Millet Malt Powder &amp; Instant Multigrain Dosa Powder.
          <span className="block mt-2 text-sm sm:text-base tracking-[1px]"
            style={{ color: 'rgba(200,180,74,0.88)', textShadow: '0 1px 8px rgba(0,0,0,.45)' }}>
            Zero preservatives · Zero added sugar · 21+ ingredients
          </span>
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center md:justify-start flex-wrap mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: '.6s', animationFillMode: 'forwards' }}>
          <a href="#order"
            className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold tracking-[1.5px] uppercase
              no-underline inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            style={{ background: 'linear-gradient(135deg,#5A7A3A,#7A9A50)', color: '#F5F0E0', boxShadow: '0 6px 24px rgba(90,122,58,0.50)' }}>
            🛒 Order Now
          </a>
          <a href="#prods"
            className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold tracking-[1.5px] uppercase
              no-underline inline-flex items-center gap-2 transition-all hover:border-brass/60 hover:text-brass active:scale-95"
            style={{ color: 'rgba(235,225,200,0.92)', border: '1.5px solid rgba(235,225,200,0.40)' }}>
            Explore Products →
          </a>
        </div>

        {/* Trust pills */}
        <div className="flex gap-2 justify-center md:justify-start flex-wrap opacity-0 animate-fade-up"
          style={{ animationDelay: '.75s', animationFillMode: 'forwards' }}>
          {['🌿 100% Natural', '🚫 No Chemicals', '✈️ Ships Worldwide'].map(t => (
            <span key={t} className="text-sm sm:text-base font-semibold px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.26)', color: 'rgba(235,225,200,0.92)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center md:items-start gap-1 mt-10 animate-bounce opacity-0"
          style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
          <span className="text-xs tracking-[3px] uppercase" style={{ color: 'rgba(235,225,200,0.38)' }}>Scroll</span>
          <div className="w-px h-5 bg-gradient-to-b from-brass/25 to-transparent" />
        </div>
      </div>

      {/* Desktop ring decoration — lg only so it doesn't crowd tablet layout */}
      <div className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-72 h-72 xl:w-80 xl:h-80 border border-brass/[.10] rounded-full" />
        <div className="absolute inset-10 border border-dashed border-brass/[.06] rounded-full" />
        <div className="absolute inset-[5rem] xl:inset-[5.5rem] border border-brass/[.10] rounded-full" />
      </div>
    </section>
  );
}
