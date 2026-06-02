'use client';

import { useState, useEffect } from 'react';
import { RevealSection } from '../ui/RevealSection';

const STORY_IMAGES = [
  'https://crafted-by-amma.s3.ap-south-1.amazonaws.com/images/multigrain1.png',
  'https://crafted-by-amma.s3.ap-south-1.amazonaws.com/images/multigrain2.png',
  'https://crafted-by-amma.s3.ap-south-1.amazonaws.com/images/multigrain3.png',
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
  const [expanded, setExpanded] = useState(false);
  const c = lang === 'en' ? ENGLISH : KANNADA;

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % STORY_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="about" className="relative overflow-hidden">

      {/* ═══ BACKGROUND SYSTEM ═══ */}
      {/* Story images — full section background slideshow */}
      {STORY_IMAGES.map((src, i) => (
        <div key={i} className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms]"
          style={{ backgroundImage: `url('${src}')`, opacity: i === imgIdx ? 1 : 0 }} />
      ))}
      {/* Primary dark overlay — keeps text readable over photo */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(175deg,rgba(6,14,4,0.88) 0%,rgba(12,24,6,0.84) 25%,rgba(18,34,10,0.78) 55%,rgba(8,18,4,0.90) 100%)' }} />
      {/* Green tint layer */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(175deg,rgba(20,44,12,0.45) 0%,rgba(30,52,18,0.35) 50%,rgba(18,38,10,0.45) 100%)' }} />
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[.032]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '300px' }} />
      {/* Gold halo top */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,180,74,0.13) 0%, transparent 65%)' }} />
      {/* Green depth bottom-right */}
      <div className="absolute bottom-0 right-0 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(40,70,20,0.12) 0%, transparent 65%)' }} />
      {/* Faint "80" watermark */}
      <div className="absolute right-[3%] top-1/2 -translate-y-1/2 font-display font-bold select-none pointer-events-none hidden lg:block"
        style={{ fontSize: 'clamp(180px,22vw,320px)', color: 'rgba(200,180,74,0.07)', lineHeight: 1, letterSpacing: '-0.04em' }}>
        80
      </div>

      {/* ═══ OPENING HERO ═══ */}
      <div className="relative z-10 pt-16 sm:pt-20 md:pt-28 pb-8 sm:pb-10 md:pb-16 px-4 sm:px-6 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <RevealSection>
          <div className="flex flex-col items-center gap-3 mb-8">
            <p className="text-sm sm:text-base font-bold tracking-[6px] uppercase" style={{ color: 'rgba(200,180,74,0.95)', textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}>
              {c.sublabel}
            </p>
            <Ornament />
          </div>
        </RevealSection>

        {/* Headline — three lines, mixed weight */}
        <RevealSection delay={80}>
          <h2 className="font-display font-bold text-center leading-[1.08] mb-8" style={{ fontSize: 'clamp(2.4rem,7.5vw,5rem)', textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>
            <span className="block font-light" style={{ color: 'rgba(255,248,220,0.95)', fontSize: '0.7em', letterSpacing: '0.02em' }}>
              {c.headline1}
            </span>
            <span className="block" style={{ color: 'rgba(255,248,220,1)' }}>
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
                className="px-5 py-1.5 rounded-full text-sm font-semibold tracking-wider transition-all duration-300"
                style={lang === l
                  ? { background: 'linear-gradient(135deg,#C8B44A,#E8D46A)', color: '#060C04' }
                  : { color: 'rgba(255,255,255,0.90)' }}>
                {l === 'en' ? 'English' : 'ಕನ್ನಡ'}
              </button>
            ))}
          </div>
        </RevealSection>
      </div>

      {/* ═══ STORY CONTENT — full width over background photo ═══ */}
      <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 md:pb-24">

        {/* Intro pull quote */}
        <RevealSection>
          <div className="relative mb-8 pl-6" style={{ borderLeft: '2px solid rgba(200,180,74,0.45)' }}>
            <div className="absolute -top-1 -left-0.5">
              <QuoteMark />
            </div>
            <p className="font-display text-lg md:text-xl italic leading-[1.75] mt-8" style={{ color: 'rgba(200,180,74,1)', textShadow: '0 1px 16px rgba(0,0,0,0.8)' }}>
              {c.intro}
            </p>
          </div>
        </RevealSection>

        {/* First paragraph — always visible */}
        <RevealSection delay={70}>
          <p className="text-base sm:text-lg leading-[1.95] mb-4" style={{ color: 'rgba(255,255,255,1)', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
            {c.paragraphs[0]}
          </p>
        </RevealSection>

        {/* Expandable rest of story */}
        <div className="overflow-hidden transition-all duration-700 ease-in-out"
          style={{ maxHeight: expanded ? '1200px' : '0px', opacity: expanded ? 1 : 0, transition: 'max-height 0.7s ease-in-out, opacity 0.5s ease-in-out' }}>
          <div className="space-y-4 mb-7 pt-2">
            {c.paragraphs.slice(1).map((para, i) => (
              <p key={i} className="text-base sm:text-lg leading-[1.95]" style={{ color: 'rgba(255,255,255,1)', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
                {para}
              </p>
            ))}
          </div>

          {/* Pull quote card */}
          <div className="relative rounded-2xl p-5 md:p-6 mb-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.16),rgba(200,180,74,0.06))', border: '1px solid rgba(200,180,74,0.35)', backdropFilter: 'blur(6px)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right, rgba(200,180,74,0.12), transparent 70%)' }} />
            <p className="font-display text-base sm:text-lg md:text-xl italic leading-[1.7]" style={{ color: 'rgba(255,248,220,1)', textShadow: '0 1px 14px rgba(0,0,0,0.8)' }}>
              &ldquo;{c.pullquote}&rdquo;
            </p>
          </div>

          {/* Closing + welcome */}
          <p className="text-base sm:text-lg leading-[1.9] mb-5" style={{ color: 'rgba(255,255,255,1)', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
            {c.closing}
          </p>
          <div className="h-px mb-5" style={{ background: 'linear-gradient(to right, rgba(200,180,74,0.3), transparent)' }} />
          <div className="space-y-1 mb-6">
            <p className="font-display font-medium text-base sm:text-lg" style={{ color: 'rgba(255,248,220,1)', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>{c.welcome1}</p>
            <p className="font-display font-semibold text-lg sm:text-xl" style={{ background: 'linear-gradient(90deg,#C8B44A,#E8D46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.welcome2}</p>
          </div>
        </div>

        {/* Read More / Read Less toggle */}
        <RevealSection delay={120}>
          <button onClick={() => setExpanded(v => !v)}
            className="group flex items-center gap-2.5 mt-2 mb-4 transition-all active:scale-95"
            style={{ color: 'rgba(200,180,74,0.85)' }}>
            <span className="text-sm font-bold tracking-[2px] uppercase">
              {expanded ? 'Read Less' : 'Read Our Full Story'}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform duration-300"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </RevealSection>

        {/* Slideshow dots — control the background photo */}
        <RevealSection delay={240}>
          <div className="flex gap-2 justify-center mt-10">
            {STORY_IMAGES.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === imgIdx ? 28 : 8, height: 8,
                  background: i === imgIdx ? 'rgba(200,180,74,0.9)' : 'rgba(255,255,255,0.3)',
                }} />
            ))}
          </div>
        </RevealSection>
      </div>

      {/* ═══ GENERATION TIMELINE ═══ */}
      /

      {/* ═══ FOOTER FEATURES STRIP ═══ */}
      <div className="relative z-10 pb-12 sm:pb-16 md:pb-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="rounded-2xl md:rounded-[28px] p-6 md:p-8 overflow-hidden relative"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
            {/* Subtle inner glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,180,74,0.04), transparent 60%)' }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
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
                    <h4 className="text-base font-semibold" style={{ color: 'rgba(255,248,220,1)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{f.title}</h4>
                    <p className="text-sm sm:text-base leading-snug mt-0.5" style={{ color: 'rgba(255,255,255,0.92)' }}>{f.desc}</p>
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
