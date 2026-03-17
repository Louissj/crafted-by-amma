import Image from 'next/image';
import { RevealSection } from '../ui/RevealSection';

export default function About() {
  const features = [
    { icon: '🌾', title: 'Millet-Based', desc: 'Ancient grains, modern nutrition' },
    { icon: '🏠', title: 'Home Kitchen', desc: 'Small batch, handmade' },
    { icon: '🚫', title: 'Zero Chemicals', desc: 'No preservatives' },
    { icon: '📦', title: 'Ships Worldwide', desc: 'Mysuru → You' },
  ];

  return (
    <section id="about" className="py-20 md:py-24 lg:py-28 px-4 md:px-[8%] max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-7 md:gap-16 lg:gap-20 items-center">
        {/* Image */}
        <RevealSection className="relative">
          <div className="relative rounded-2xl md:rounded-[4px_20px_20px_4px] overflow-hidden shadow-[0_20px_60px_rgba(26,42,20,.1)]">
            <div className="absolute -inset-1.5 rounded-[24px] md:rounded-[8px_24px_24px_8px] border-[1.5px] border-sage/10 pointer-events-none z-10" />
            <Image src="/images/malt-bowl.jpg" alt="Millet Products" width={550} height={700} className="w-full block object-cover" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-forest/20 to-transparent pointer-events-none" />
            {/* Logo badge */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-cream-light/92 backdrop-blur-lg px-3.5 py-2 pr-4 rounded-full shadow-lg">
              <Image src="/images/logo.png" alt="" width={32} height={32} className="rounded-full border-[1.5px] border-sage/10 bg-white flex-shrink-0" />
              <div>
                <span className="font-display text-[.78rem] font-bold text-forest block leading-tight">Crafted by Amma</span>
                <span className="text-[.5rem] text-sage tracking-[1.5px] uppercase font-semibold">Since Mysuru</span>
              </div>
            </div>
            {/* 100% badge */}
            <div className="absolute top-4 right-4 z-10 bg-gradient-to-br from-forest to-forest-light px-3.5 py-2.5 rounded-xl text-center shadow-lg border border-brass/[.08]">
              <span className="font-display text-lg font-bold text-brass block leading-tight">100%</span>
              <span className="text-[.44rem] text-sand/50 tracking-[2px] uppercase">Natural</span>
            </div>
          </div>
        </RevealSection>

        {/* Story */}
        <RevealSection delay={200}>
          <p className="text-[.58rem] font-semibold tracking-[5px] uppercase mb-1.5 text-sage">Our Story · ನಮ್ಮ ಕಥೆ</p>
          <h2 className="font-display font-bold leading-tight text-[clamp(1.7rem,5vw,2.4rem)] text-forest">
            Made in Amma&apos;s Kitchen,<br />Shared with the World
          </h2>
          <div className="w-[50px] h-0.5 bg-gradient-to-r from-sage to-brass rounded mt-3.5 mb-5" />
          <p className="text-[.88rem] leading-[2] text-forest/50 mb-1.5">
            What started in a Mysuru home kitchen with time-honoured family recipes has blossomed into a brand trusted across India. Every product is handmade by Amma — traditional stone-ground techniques, finest millets, grains, sprouts, dry fruits & natural ingredients. Packed with 21+ nutritious ingredients.
          </p>
          <p className="font-display text-[1.05rem] italic text-sage mb-6">&ldquo;Crafted by Amma&rdquo; — purity &amp; the taste of home ♥</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {features.map((f, i) => (
              <RevealSection key={i} delay={300 + i * 80}
                className="flex gap-2.5 items-center p-3 bg-sage/[.02] border border-sage/[.04] rounded-xl transition-all active:scale-[.97] md:hover:translate-x-1 md:hover:bg-sage/[.04]">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-sage/[.06] to-brass/[.03] flex items-center justify-center text-sm flex-shrink-0">{f.icon}</div>
                <div>
                  <h4 className="text-[.78rem] font-semibold text-forest">{f.title}</h4>
                  <p className="text-[.6rem] text-forest/35">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
