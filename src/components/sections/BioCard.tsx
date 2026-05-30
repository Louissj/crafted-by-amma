'use client';

import Image from 'next/image';
import { RevealSection } from '../ui/RevealSection';

export default function BioCard() {
  const stats = [
    { icon: '🌾', val: '21+', label: 'Ingredients' },
    { icon: '✅', val: '100%', label: 'Natural' },
    { icon: '🚫', val: 'Zero', label: 'Chemicals' },
  ];

  const categories = [
    {
      icon: '🌾',
      title: 'Millet Products',
      items: ['Millet Malt Powder', 'Instant Dosa Powder', 'Sprouted Ragi Flour'],
    },
    {
      icon: '🫙',
      title: 'Masala Powders',
      items: ['Rasam Powder', 'Sambar Powder', 'Bisibelebath Powder', 'Vangibath Powder'],
    },
    {
      icon: '🌶️',
      title: 'Chutney Pudi',
      items: ['Karibevu Chutney Pudi', 'Kadalebele Chutney Pudi', 'Flaxseed Chutney Pudi'],
    },
  ];

  const details = [
    { icon: '📍', title: 'Namma Mysuru', desc: 'Proudly crafted in Karnataka' },
    { icon: '📦', title: 'Ships Worldwide', desc: 'Free delivery across Karnataka' },
    { icon: '💚', title: 'No Preservatives', desc: 'No added sugar · No artificial flavours' },
  ];

  const highlights = [
    { icon: '⭐', label: 'Testimonials', href: '#testi' },
    { icon: '🌍', label: 'Worldwide', href: '/products' },
    { icon: '🛒', label: 'Order Now', href: '/products' },
  ];

  return (
    <section className="px-3 -mt-7 relative z-10 mb-4">
      <div className="max-w-[580px] md:max-w-[860px] lg:max-w-[920px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(26,42,20,.08)]"
        style={{ background: 'linear-gradient(170deg,#FFFEF9,#FDF8EF,#FAF3E6)' }}>
        {/* Gold top bar with shimmer */}
        <div className="h-1 relative overflow-hidden" style={{ background: 'linear-gradient(90deg,#3A5A2A,#5A7A3A,#8AA050,#C8B44A,#8AA050,#5A7A3A,#3A5A2A)' }}>
          <div className="absolute top-0 w-[60%] h-full animate-shimmer" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)' }} />
        </div>

        <div className="p-6 md:p-8 lg:p-9">
          {/* Profile */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-[66px] h-[66px] rounded-full p-[3px] flex-shrink-0" style={{ background: 'linear-gradient(135deg,#5A7A3A,#8AA050,#C8B44A,#8AA050,#5A7A3A)' }}>
              <div className="w-full h-full rounded-full overflow-hidden border-[2.5px] border-cream-light">
                <Image src="/images/logo.png" alt="Logo" width={66} height={66} className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-[1.35rem] font-bold text-forest leading-tight">Crafted by Amma</h2>
              <span className="text-sm text-sage font-bold tracking-[2px] inline-block mt-1 px-2.5 py-0.5 bg-gradient-to-br from-sage/[.06] to-millet/[.04] border border-sage/[.08] rounded-full uppercase">
                Homemade · Traditional · Nutritious
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-1.5 md:gap-3 mb-5">
            {stats.map((s, i) => (
              <RevealSection key={i} delay={i * 100} className="flex-1 flex items-center gap-1.5 md:gap-2 px-2 py-2.5 md:px-4 md:py-3.5 rounded-xl border border-sage/[.06]"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#243420)' }}>
                <span className="text-base md:text-lg flex-shrink-0">{s.icon}</span>
                <div>
                  <span className="font-display text-lg md:text-xl font-bold text-brass block leading-tight">{s.val}</span>
                  <span className="text-[0.62rem] md:text-sm text-sand/[.45] tracking-[0.5px] md:tracking-[1.5px] uppercase">{s.label}</span>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {categories.map((cat, i) => (
              <RevealSection key={i} delay={i * 80}
                className="flex flex-col gap-1.5 p-3 bg-sage/[.02] border border-sage/[.04] rounded-xl">
                <div className="flex items-center gap-1.5">
                  <div className="w-[28px] h-[28px] rounded-[8px] bg-gradient-to-br from-sage/[.10] to-brass/[.05] flex items-center justify-center text-sm flex-shrink-0">
                    {cat.icon}
                  </div>
                  <strong className="text-[0.68rem] text-forest font-bold leading-tight">{cat.title}</strong>
                </div>
                <ul className="space-y-0.5 pl-0.5">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-1">
                      <span className="text-sage/50 text-[0.55rem] mt-[3px] flex-shrink-0">•</span>
                      <span className="text-[0.62rem] text-forest/50 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </RevealSection>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {details.map((d, i) => (
              <RevealSection key={i} delay={i * 80} className="flex gap-2 items-start p-3 bg-sage/[.02] border border-sage/[.04] rounded-xl transition-all active:scale-[.97]">
                <div className="w-[28px] h-[28px] rounded-[8px] bg-gradient-to-br from-sage/[.08] to-brass/[.04] flex items-center justify-center text-sm flex-shrink-0">
                  {d.icon}
                </div>
                <div>
                  <strong className="text-[0.68rem] text-forest block leading-snug">{d.title}</strong>
                  <p className="text-[0.62rem] text-forest/40 leading-snug mt-px">{d.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Highlights */}
          <div className="flex justify-around">
            {highlights.map((h, i) => (
              <a key={i} href={h.href} className="flex flex-col items-center gap-1.5 no-underline">
                <div className="w-14 h-14 rounded-full border-2 border-sage/[.1] flex items-center justify-center text-xl bg-gradient-to-br from-cream-light to-sage/[.03] shadow-[0_4px_14px_rgba(26,42,20,.03),inset_0_2px_4px_rgba(255,255,255,.5),0_0_0_3px_rgba(90,122,58,.02)] transition-all active:scale-90">
                  {h.icon}
                </div>
                <span className="text-[0.65rem] md:text-sm text-sage tracking-[0px] md:tracking-[.8px] font-semibold uppercase text-center">{h.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
