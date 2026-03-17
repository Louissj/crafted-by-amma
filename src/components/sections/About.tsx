'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RevealSection } from '../ui/RevealSection';

const STORY_IMAGES = [
  'https://crafted-by-amma.s3.ap-south-1.amazonaws.com/images/IMG_8971.PNG',
  'https://crafted-by-amma.s3.ap-south-1.amazonaws.com/images/IMG_8975.PNG',
];

/* ── Decorative SVG ornament ── */
const Ornament = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="120" height="16" viewBox="0 0 120 16" fill="none">
    <line x1="0" y1="8" x2="48" y2="8" stroke="url(#og)" strokeWidth="0.8"/>
    <circle cx="54" cy="8" r="2.5" fill="rgba(200,180,74,0.5)"/>
    <circle cx="60" cy="8" r="4" stroke="rgba(200,180,74,0.45)" strokeWidth="1" fill="none"/>
    <circle cx="66" cy="8" r="2.5" fill="rgba(200,180,74,0.5)"/>
    <line x1="72" y1="8" x2="120" y2="8" stroke="url(#og2)" strokeWidth="0.8"/>
    <defs>
      <linearGradient id="og" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(200,180,74,0)" /><stop offset="1" stopColor="rgba(200,180,74,0.55)" />
      </linearGradient>
      <linearGradient id="og2" x1="72" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(200,180,74,0.55)" /><stop offset="1" stopColor="rgba(200,180,74,0)" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Large decorative quote mark ── */
const QuoteMark = () => (
  <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
    <path d="M0 40V24C0 14.4 5.6 6.8 16.8 1.2L20 6.4C13.6 9.6 10 14 9.6 19.6H18.4V40H0ZM28 40V24C28 14.4 33.6 6.8 44.8 1.2L48 6.4C41.6 9.6 38 14 37.6 19.6H46.4V40H28Z"
      fill="url(#qm)"/>
    <defs>
      <linearGradient id="qm" x1="0" y1="0" x2="52" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(200,180,74,0.35)"/><stop offset="1" stopColor="rgba(200,180,74,0.1)"/>
      </linearGradient>
    </defs>
  </svg>
);

const ENGLISH = {
  label: 'Our Story',
  sublabel: 'Heritage · ಪರಂಪರೆ',
  headline1: 'A Legacy of',
  headline2: 'Love, Nourishment',
  headline3: '& Tradition',
  intro: 'Some recipes are created in kitchens. But a few are born from love, care, and generations of wisdom.',
  paragraphs: [
    'Nearly 80 years ago, in a small South Indian home, a mother carefully prepared nutritious millet recipes for her family. She believed food was more than just a meal — it was a way to nurture health, strengthen families, and pass on traditions.',
    'Using locally grown millets, handpicked grains, and time-tested methods, she created a millet malt powder and millet dosa mix that became a beloved part of the family\'s daily life. The recipe was simple, natural, and deeply nourishing.',
    'Years passed, and this treasured recipe was lovingly passed down to her daughter — my mother-in-law, who continued the tradition in her own kitchen. She preserved every detail: the careful selection of grains, the slow roasting process, and the balance of ingredients that made the food both healthy and delicious.',
    'When the recipe was finally passed on to me, it came with more than instructions. It carried 80 years of family heritage, memories, and the responsibility to keep this tradition alive.',
    'Today, with Crafted by Amma, we are sharing this legacy with you. Every pack of our Millet Malt Powder and Instant Millet Dosa Powder is made using the same traditional recipe that has nourished generations in our family.',
  ],
  pullquote: 'Because for us, this isn\'t just a product. It is a family tradition, a story of mothers, and a promise of wholesome nourishment.',
  closing: 'When you enjoy our products, you are not just tasting millet — you are experiencing 80 years of tradition, love, and home-made goodness.',
  welcome1: 'Welcome to our family kitchen.',
  welcome2: 'Welcome to Crafted by Amma. ❤️🌾',
  imgBrand: 'Crafted by Amma',
  imgSubtitle: 'Homemade · Mysuru, Karnataka',
  imgYears: 'Years',
};

const KANNADA = {
  label: 'ನಮ್ಮ ಕಥೆ',
  sublabel: 'Heritage · ಪರಂಪರೆ',
  headline1: 'ಪ್ರೀತಿ,',
  headline2: 'ಪೋಷಣೆ ಮತ್ತು',
  headline3: 'ಸಂಪ್ರದಾಯದ ಪರಂಪರೆ',
  intro: 'ನಮ್ಮ ಮಿಲ್ಲೆಟ್ ಮಾಲ್ಟ್ ಪೌಡರ್ ಮತ್ತು ಮಿಲ್ಲೆಟ್ ದೋಸೆ ಪೌಡರ್ ರೆಸಿಪಿ ಸುಮಾರು 80 ವರ್ಷಗಳ ಹಳೆಯ ಕುಟುಂಬ ಪರಂಪರೆ.',
  paragraphs: [
    'ಇದು ನನ್ನ ಅತ್ತೆಯ ಅಮ್ಮನಿಂದ ನನ್ನ ಅತ್ತೆಗೆ, ಅಲ್ಲಿಂದ ಪ್ರೀತಿಯಿಂದ ನನಗೆ ಬಂದ ಅಮೂಲ್ಯವಾದ ರೆಸಿಪಿ.',
    'ಪೋಷಕಾಂಶಗಳಿಂದ ತುಂಬಿರುವ ಮಿಲ್ಲೆಟ್ ಧಾನ್ಯಗಳನ್ನು ಬಳಸಿಕೊಂಡು, ಮನೆಯಲ್ಲೇ ಬಳಸುತ್ತಿದ್ದ ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನದಲ್ಲಿ ಈ ಪೌಡರ್‌ಗಳನ್ನು ತಯಾರಿಸಲಾಗುತ್ತದೆ.',
    'ಇದು ಕೇವಲ ಒಂದು ಉತ್ಪನ್ನವಲ್ಲ — ತಲೆಮಾರುಗಳಿಂದ ಬಂದ ಆರೋಗ್ಯಕರ ಆಹಾರದ ಪರಂಪರೆ.',
  ],
  pullquote: 'ಇದು ಕೇವಲ ಒಂದು ಉತ್ಪನ್ನವಲ್ಲ — ತಲೆಮಾರುಗಳಿಂದ ಬಂದ ಆರೋಗ್ಯಕರ ಆಹಾರದ ಪರಂಪರೆ.',
  closing: 'Crafted by Amma – ಪ್ರೀತಿಯಿಂದ ತಯಾರಿಸಿದ ಆರೋಗ್ಯಕರ ಆಹಾರ. 🌾',
  welcome1: 'ನಮ್ಮ ಮನೆ ಅಡುಗೆ ಮನೆಗೆ ಸ್ವಾಗತ.',
  welcome2: 'Crafted by Amma ಗೆ ಸ್ವಾಗತ. ❤️🌾',
  imgBrand: 'ಕ್ರಾಫ್ಟೆಡ್ ಬೈ ಅಮ್ಮ',
  imgSubtitle: 'ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ · ಮೈಸೂರು, ಕರ್ನಾಟಕ',
  imgYears: 'ವರ್ಷ',
};

const GENERATIONS = [
  {
    num: '01',
    years: 'c. 1945',
    role: 'Great-Grandmother',
    kannadaRole: 'ಮುತ್ತಜ್ಜಿ',
    icon: '👵',
    desc: 'The original keeper of the recipe — millet wisdom nurtured in a quiet South Indian home, passed with love.',
  },
  {
    num: '02',
    years: 'c. 1975',
    role: 'Mother-in-Law',
    kannadaRole: 'ಅತ್ತೆ',
    icon: '🏡',
    desc: 'Every detail preserved — the slow roast, the grain selection, the perfect balance that made every meal a blessing.',
  },
  {
    num: '03',
    years: 'Today',
    role: 'Crafted by Amma',
    kannadaRole: 'ನಮ್ಮ ಅಮ್ಮ',
    icon: '🌾',
    desc: 'Sharing the 80-year legacy with the world — one carefully crafted pack at a time, from Mysuru to your home.',
    highlight: true,
  },
];

export default function About() {
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [imgIdx, setImgIdx] = useState(0);
  const c = lang === 'en' ? ENGLISH : KANNADA;

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % STORY_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="about" className="relative overflow-hidden">

      {/* ═══ BACKGROUND SYSTEM ═══ */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(175deg,#04080300 0%,#060C04 8%,#080F06 50%,#060A04 85%,#030703 100%)' }} />
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[.032]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '300px' }} />
      {/* Gold halo top */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,180,74,0.07) 0%, transparent 65%)' }} />
      {/* Green depth bottom-right */}
      <div className="absolute bottom-0 right-0 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(40,70,20,0.12) 0%, transparent 65%)' }} />
      {/* Faint "80" watermark */}
      <div className="absolute right-[3%] top-1/2 -translate-y-1/2 font-display font-bold select-none pointer-events-none hidden lg:block"
        style={{ fontSize: 'clamp(180px,22vw,320px)', color: 'rgba(200,180,74,0.025)', lineHeight: 1, letterSpacing: '-0.04em' }}>
        80
      </div>

      {/* ═══ OPENING HERO ═══ */}
      <div className="relative z-10 pt-20 md:pt-28 pb-10 md:pb-16 px-4 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <RevealSection>
          <div className="flex flex-col items-center gap-3 mb-8">
            <p className="text-[.5rem] font-bold tracking-[6px] uppercase" style={{ color: 'rgba(200,180,74,0.6)' }}>
              {c.sublabel}
            </p>
            <Ornament />
          </div>
        </RevealSection>

        {/* Headline — three lines, mixed weight */}
        <RevealSection delay={80}>
          <h2 className="font-display font-bold text-center leading-[1.08] mb-8" style={{ fontSize: 'clamp(2.4rem,7.5vw,5rem)' }}>
            <span className="block font-light" style={{ color: 'rgba(255,248,220,0.6)', fontSize: '0.7em', letterSpacing: '0.02em' }}>
              {c.headline1}
            </span>
            <span className="block" style={{ color: 'rgba(255,248,220,0.95)' }}>
              {c.headline2}
            </span>
            <span className="block" style={{ background: 'linear-gradient(90deg,#B8A435,#E8D46A,#D4A82A,#E8D46A,#B8A435)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%' }}>
              {c.headline3}
            </span>
          </h2>
        </RevealSection>

        {/* Language toggle */}
        <RevealSection delay={140}>
          <div className="flex items-center gap-1 p-[3px] rounded-full mb-2"
            style={{ background: 'rgba(200,180,74,0.06)', border: '1px solid rgba(200,180,74,0.18)' }}>
            {(['en', 'kn'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-5 py-1.5 rounded-full text-[.7rem] font-semibold tracking-wider transition-all duration-300"
                style={lang === l
                  ? { background: 'linear-gradient(135deg,#C8B44A,#E8D46A)', color: '#060C04' }
                  : { color: 'rgba(255,255,255,0.35)' }}>
                {l === 'en' ? 'English' : 'ಕನ್ನಡ'}
              </button>
            ))}
          </div>
        </RevealSection>
      </div>

      {/* ═══ SPLIT CONTENT: Image left + Story right ═══ */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <div className="flex flex-col lg:grid lg:grid-cols-[440px_1fr] gap-0 items-start">

          {/* ── Left: Cinematic image panel ── */}
          <RevealSection delay={60} className="w-full relative lg:pr-12 mb-10 lg:mb-0">
            {/* Outer gold frame — desktop only */}
            <div className="absolute -inset-[6px] rounded-[32px] pointer-events-none hidden lg:block"
              style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.18),transparent 40%,transparent 60%,rgba(200,180,74,0.08))' }} />

            <div className="w-full relative rounded-[22px] md:rounded-[26px] overflow-hidden"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(200,180,74,0.12)' }}>

              {/* Slideshow images */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
                {STORY_IMAGES.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={lang === 'en' ? 'Crafted by Amma — Traditional Millet Products' : 'ಕ್ರಾಫ್ಟೆಡ್ ಬೈ ಅಮ್ಮ — ಸಾಂಪ್ರದಾಯಿಕ ಮಿಲ್ಲೆಟ್ ಉತ್ಪನ್ನಗಳು'}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                    style={{ opacity: i === imgIdx ? 1 : 0 }}
                  />
                ))}
              </div>

              {/* Layered gradients */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(6,12,4,0.15) 0%, transparent 25%, transparent 50%, rgba(6,12,4,0.94) 100%)' }} />

              {/* Slideshow dots */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                {STORY_IMAGES.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === imgIdx ? 20 : 6, height: 6,
                      background: i === imgIdx ? 'rgba(200,180,74,0.9)' : 'rgba(255,255,255,0.3)',
                    }} />
                ))}
              </div>

              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="flex items-end justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border: '1.5px solid rgba(200,180,74,0.5)', boxShadow: '0 0 12px rgba(200,180,74,0.2)' }}>
                      <Image src="/images/logo.png" alt="" width={36} height={36} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-[.85rem] md:text-[.92rem] leading-tight transition-all duration-300" style={{ color: 'rgba(255,248,220,0.95)' }}>{c.imgBrand}</p>
                      <p className="text-[.42rem] md:text-[.46rem] tracking-[2px] uppercase font-semibold transition-all duration-300" style={{ color: 'rgba(200,180,74,0.55)' }}>{c.imgSubtitle}</p>
                    </div>
                  </div>

                  {/* 80 years badge */}
                  <div className="rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.22),rgba(200,180,74,0.06))', border: '1px solid rgba(200,180,74,0.3)', backdropFilter: 'blur(12px)' }}>
                    <span className="font-display text-[1.5rem] md:text-[1.8rem] font-bold block leading-none" style={{ background: 'linear-gradient(180deg,#E8D46A,#C8A820)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>80</span>
                    <span className="text-[.38rem] md:text-[.42rem] tracking-[2px] uppercase block mt-0.5 transition-all duration-300" style={{ color: 'rgba(200,180,74,0.55)' }}>{c.imgYears}</span>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* ── Right: Story text ── */}
          <div className="lg:pl-6 flex flex-col justify-center">

            {/* Intro pull quote */}
            <RevealSection>
              <div className="relative mb-8 pl-6" style={{ borderLeft: '2px solid rgba(200,180,74,0.35)' }}>
                <div className="absolute -top-1 -left-0.5">
                  <QuoteMark />
                </div>
                <p className="font-display text-[1.05rem] md:text-[1.2rem] italic leading-[1.75] mt-8" style={{ color: 'rgba(200,180,74,0.82)' }}>
                  {c.intro}
                </p>
              </div>
            </RevealSection>

            {/* Body paragraphs */}
            <div className="space-y-4 mb-7">
              {c.paragraphs.map((para, i) => (
                <RevealSection key={i} delay={i * 70}>
                  <p className="text-[.88rem] md:text-[.92rem] leading-[1.95]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {para}
                  </p>
                </RevealSection>
              ))}
            </div>

            {/* Pull quote card */}
            <RevealSection delay={160}>
              <div className="relative rounded-2xl p-5 md:p-6 mb-6 overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.07),rgba(200,180,74,0.02))', border: '1px solid rgba(200,180,74,0.15)' }}>
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at top right, rgba(200,180,74,0.1), transparent 70%)' }} />
                <p className="font-display text-[.95rem] md:text-[1.05rem] italic leading-[1.7]" style={{ color: 'rgba(255,248,220,0.78)' }}>
                  &ldquo;{c.pullquote}&rdquo;
                </p>
              </div>
            </RevealSection>

            {/* Closing + welcome */}
            <RevealSection delay={200}>
              <p className="text-[.85rem] leading-[1.9] mb-5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                {c.closing}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(200,180,74,0.3), transparent)' }} />
              </div>
              <div className="mt-5 space-y-1">
                <p className="font-display font-medium text-[.95rem]" style={{ color: 'rgba(255,248,220,0.65)' }}>{c.welcome1}</p>
                <p className="font-display font-semibold text-[1rem] md:text-[1.1rem]" style={{ background: 'linear-gradient(90deg,#C8B44A,#E8D46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.welcome2}</p>
              </div>
            </RevealSection>
          </div>
        </div>
      </div>

      {/* ═══ GENERATION TIMELINE ═══ */}
      <div className="relative z-10 pb-20 md:pb-28 px-4">
        <div className="max-w-[1100px] mx-auto">

          {/* Section label */}
          <RevealSection className="flex flex-col items-center mb-12">
            <Ornament />
            <p className="text-[.5rem] font-bold tracking-[5px] uppercase mt-4" style={{ color: 'rgba(200,180,74,0.5)' }}>
              Three Generations · ಮೂರು ತಲೆಮಾರು
            </p>
          </RevealSection>

          {/* Generation cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 relative">
            {/* Connecting line on desktop */}
            <div className="absolute top-[52px] left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px hidden md:block"
              style={{ background: 'linear-gradient(to right, rgba(200,180,74,0.12), rgba(200,180,74,0.35), rgba(200,180,74,0.35), rgba(200,180,74,0.12))' }} />

            {GENERATIONS.map((g, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="relative rounded-2xl p-5 md:p-6 h-full transition-all duration-300 md:hover:-translate-y-1"
                  style={{
                    background: g.highlight
                      ? 'linear-gradient(145deg,rgba(200,180,74,0.1),rgba(200,180,74,0.03))'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${g.highlight ? 'rgba(200,180,74,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: g.highlight ? '0 8px 40px rgba(200,180,74,0.08)' : 'none',
                  }}>
                  {/* Top: number + icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-[2.2rem] font-bold leading-none"
                      style={{ color: g.highlight ? 'rgba(200,180,74,0.25)' : 'rgba(255,255,255,0.07)' }}>
                      {g.num}
                    </span>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                      style={{
                        background: g.highlight
                          ? 'linear-gradient(135deg,rgba(200,180,74,0.2),rgba(200,180,74,0.06))'
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${g.highlight ? 'rgba(200,180,74,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      {g.icon}
                    </div>
                  </div>

                  {/* Year pill */}
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full mb-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-[.48rem] font-bold tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{g.years}</span>
                  </div>

                  {/* Role */}
                  <h3 className="font-display text-[.95rem] font-bold mb-0.5 leading-snug"
                    style={{ color: g.highlight ? 'rgba(200,180,74,0.92)' : 'rgba(255,248,220,0.72)' }}>
                    {g.role}
                  </h3>
                  <p className="text-[.58rem] tracking-[1.5px] mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {g.kannadaRole}
                  </p>

                  {/* Divider */}
                  <div className="h-px mb-3" style={{ background: g.highlight ? 'rgba(200,180,74,0.12)' : 'rgba(255,255,255,0.05)' }} />

                  {/* Description */}
                  <p className="text-[.72rem] leading-[1.75]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {g.desc}
                  </p>

                  {/* Highlight corner glow */}
                  {g.highlight && (
                    <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none rounded-2xl overflow-hidden">
                      <div className="w-full h-full" style={{ background: 'radial-gradient(circle at top right, rgba(200,180,74,0.12), transparent 70%)' }} />
                    </div>
                  )}
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER FEATURES STRIP ═══ */}
      <div className="relative z-10 pb-16 md:pb-24 px-4">
        <div className="max-w-[1100px] mx-auto">
          <div className="rounded-2xl md:rounded-[28px] p-6 md:p-8 overflow-hidden relative"
            style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Subtle inner glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,180,74,0.04), transparent 60%)' }} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {[
                { icon: '🌾', title: 'Millet-Based', desc: 'Ancient grains, modern nutrition' },
                { icon: '🏡', title: 'Home Kitchen', desc: 'Small batch, handmade with care' },
                { icon: '🚫', title: 'Zero Chemicals', desc: 'No preservatives, ever' },
                { icon: '📦', title: 'Ships Worldwide', desc: 'Mysuru → Your doorstep' },
              ].map((f, i) => (
                <RevealSection key={i} delay={i * 70}
                  className="flex gap-3 items-center group cursor-default">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0 transition-transform md:group-hover:scale-110"
                    style={{ background: 'rgba(200,180,74,0.07)', border: '1px solid rgba(200,180,74,0.12)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-[.77rem] font-semibold" style={{ color: 'rgba(255,248,220,0.72)' }}>{f.title}</h4>
                    <p className="text-[.62rem] leading-snug mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{f.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
