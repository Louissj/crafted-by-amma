'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="min-h-screen min-h-[100dvh] relative overflow-hidden flex items-center justify-center">
      {/* Background layers */}
      <div className="absolute inset-0 bg-cover bg-center brightness-[.32] saturate-[.9] contrast-[1.1] hue-rotate-[10deg]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=70')" }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg,rgba(15,28,12,.82) 0%,rgba(28,52,22,.6) 30%,rgba(38,62,30,.5) 50%,rgba(18,32,14,.78) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%,rgba(180,200,60,.1),transparent 50%),radial-gradient(circle at 25% 65%,rgba(120,160,40,.06),transparent 40%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 45%,transparent 30%,rgba(10,20,8,.5) 100%)' }} />

      {/* Shimmer lines */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 10%,rgba(200,180,74,.2) 50%,transparent 90%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 10%,rgba(200,180,74,.15) 50%,transparent 90%)' }} />

      {/* Corner accents */}
      <div className="absolute inset-3.5 pointer-events-none">
        <div className="absolute top-0 left-0 w-[30px] h-[30px] border-t-[1.5px] border-l-[1.5px] border-brass/[.18] rounded-tl-[10px]" />
        <div className="absolute bottom-0 right-0 w-[30px] h-[30px] border-b-[1.5px] border-r-[1.5px] border-brass/[.18] rounded-br-[10px]" />
      </div>

      {/* Millet stalks SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-[1] overflow-hidden opacity-20">
        <svg viewBox="0 0 800 120" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          {[60,130,220,340,460,560,670,750].map((x, i) => (
            <g key={i} className="origin-bottom" style={{ animation: `sway ${3.5+i*0.3}s ease-in-out infinite`, animationDelay: `${-i*0.4}s` }}>
              <line x1={x} y1="120" x2={x-3} y2={25+i*5} stroke={`rgba(${100+i*5},${140+i*5},${50+i*3},.45)`} strokeWidth={1.6+i*0.1} />
              <ellipse cx={x-5} cy={20+i*5} rx={2.5} ry={7} fill="rgba(200,180,74,.35)" transform={`rotate(${-10+i*4} ${x-5} ${20+i*5})`} />
              <ellipse cx={x+2} cy={15+i*5} rx={2} ry={6} fill="rgba(200,180,74,.3)" transform={`rotate(${10-i*3} ${x+2} ${15+i*5})`} />
            </g>
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-[2] text-center px-5 pt-28 pb-11 max-w-[660px] w-full md:text-left md:pt-40 md:pb-20 md:px-[8%] md:max-w-none">
        <div className="w-[82px] h-[82px] md:w-[86px] md:h-[86px] rounded-full border-[2.5px] border-brass/[.28] mx-auto md:mx-0 mb-6 overflow-hidden animate-pulse-glow"
          style={{ boxShadow: '0 8px 36px rgba(0,0,0,.22),0 0 50px rgba(200,180,74,.08)' }}>
          <Image src="/images/logo.png" alt="Crafted by Amma" width={86} height={86} className="w-full h-full object-contain" />
        </div>

        <p className="font-display text-[1.05rem] italic text-brass mb-4 opacity-0 animate-fade-up" style={{ animationDelay: '.2s', animationFillMode: 'forwards' }}>
          📍 Proudly from Namma Mysuru
        </p>

        <h1 className="font-display font-bold text-cream-light leading-[1.05] mb-2 text-[clamp(2.6rem,9vw,4.8rem)] opacity-0 animate-fade-up"
          style={{ animationDelay: '.3s', animationFillMode: 'forwards', textShadow: '0 2px 20px rgba(180,200,60,.08),0 4px 40px rgba(0,0,0,.15)' }}>
          Pure. Homemade.
          <span className="block text-[.58em] text-sand/70 font-medium mt-1">
            Crafted with <span className="text-brass relative">Love.<span className="absolute bottom-0.5 -left-0.5 -right-0.5 h-1.5 bg-sage/25 rounded -z-10" /></span>
          </span>
        </h1>

        <p className="font-kannada text-[.88rem] text-sand/[.35] mb-3.5 opacity-0 animate-fade-up" style={{ animationDelay: '.4s', animationFillMode: 'forwards' }}>
          ಶುದ್ಧ · ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ · ಪೌಷ್ಟಿಕ
        </p>

        <p className="text-[.88rem] leading-[1.9] text-sand/[.38] max-w-[470px] mx-auto md:mx-0 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: '.5s', animationFillMode: 'forwards' }}>
          From Amma&apos;s kitchen in Mysuru — handmade Millet Malt Powder & Instant Multigrain Dosa Powder. Zero preservatives. Zero added sugar.
        </p>

        <div className="flex gap-2.5 justify-center md:justify-start flex-wrap mb-8 opacity-0 animate-fade-up" style={{ animationDelay: '.6s', animationFillMode: 'forwards' }}>
          <a href="#order" className="px-7 py-3.5 rounded-full text-[.74rem] font-semibold tracking-[2px] uppercase no-underline inline-flex items-center gap-2 transition-all bg-gradient-to-br from-sage to-sage-light text-cream shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:scale-95">
            🛒 Order Now
          </a>
          <a href="#prods" className="px-7 py-3.5 rounded-full text-[.74rem] font-semibold tracking-[2px] uppercase no-underline inline-flex items-center gap-2 transition-all text-sand/70 border-[1.5px] border-sand/[.12] hover:border-brass hover:text-brass active:scale-95">
            Explore Products
          </a>
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center md:items-start gap-1 mt-7 animate-bounce opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          <span className="text-[.56rem] tracking-[3px] uppercase text-sand/[.15]">Scroll</span>
          <div className="w-px h-[22px] bg-gradient-to-b from-brass/20 to-transparent" />
        </div>
      </div>

      {/* Desktop decorative circles */}
      <div className="hidden md:block absolute right-[8%] top-1/2 -translate-y-1/2 w-80 h-80 border border-brass/[.08] rounded-full pointer-events-none" />
      <div className="hidden md:block absolute right-[calc(8%+40px)] top-[calc(50%+20px)] -translate-y-1/2 w-60 h-60 border border-dashed border-brass/[.05] rounded-full pointer-events-none" />
    </section>
  );
}
