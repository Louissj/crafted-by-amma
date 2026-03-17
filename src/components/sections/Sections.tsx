import Image from 'next/image';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';
import { BENEFITS, OFFERS, CONTACT } from '@/lib/constants';

/* ══════ INGREDIENTS ══════ */
export function Ingredients() {
  const items = ['🌾 Millets', '🌱 Sprouts', '🥜 Dry Fruits', '🫘 Ragi', '🌾 Wheat', '🫘 Soyabean', '🌻 Seeds', '🧂 Spices', '💪 Protein', '🌿 Fibre'];
  return (
    <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(180deg,#E8EDD8,#F5F0E0)' }}>
      <SectionHeader tag="Nature's Pantry" title="Every Ingredient Counts" />
      <RevealSection className="flex flex-wrap justify-center gap-2 max-w-[750px] mx-auto">
        {items.map((item, i) => (
          <span key={i} className="bg-cream-light border border-forest/[.025] px-3.5 py-1.5 rounded-full text-[.72rem] font-medium flex items-center gap-1 shadow-sm transition-all hover:bg-forest hover:text-brass hover:-translate-y-0.5 active:scale-[.92]"
            style={{ transitionDelay: `${i * 20}ms` }}>
            {item}
          </span>
        ))}
      </RevealSection>
    </div>
  );
}

/* ══════ BENEFITS ══════ */
export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 md:py-24 px-4 md:px-[6%] lg:px-[8%]" style={{ background: 'linear-gradient(180deg,#F5F0E0,#FAF3E6,#FBF5EC)' }}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-7 md:gap-16 lg:gap-20 items-center max-w-[1100px] lg:max-w-[1200px] mx-auto">
        <RevealSection className="rounded-2xl md:rounded-[20px_4px_4px_20px] overflow-hidden shadow-[0_16px_50px_rgba(26,42,20,.08)]">
          <Image src="/images/benefits.jpg" alt="Millet Benefits" width={550} height={700} className="w-full block object-cover max-h-[450px]" />
        </RevealSection>
        <div>
          <RevealSection>
            <p className="text-[.58rem] font-semibold tracking-[5px] uppercase mb-1.5 text-sage">Why Millets?</p>
            <h2 className="font-display font-bold leading-tight text-[clamp(1.7rem,5vw,2.4rem)] text-forest">Benefits of Our Products</h2>
            <div className="w-[50px] h-0.5 bg-gradient-to-r from-sage to-brass rounded mt-3.5 mb-6" />
          </RevealSection>
          <div className="flex flex-col gap-3.5">
            {BENEFITS.map((b, i) => (
              <RevealSection key={i} delay={i * 80} className="flex items-start gap-3.5 p-3 md:p-3.5 bg-sage/[.025] border border-sage/[.04] rounded-xl transition-all active:scale-[.98] md:hover:translate-x-1 md:hover:bg-sage/[.04]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center text-white text-[.7rem] font-bold flex-shrink-0 shadow-md">✓</div>
                <div>
                  <strong className="text-[.86rem] text-forest block leading-snug">{b.title}</strong>
                  <p className="text-[.7rem] text-forest/40 leading-snug mt-px">{b.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════ WHY US ══════ */
export function WhyUs() {
  const cards = [
    { icon: '🧡', title: 'Made with Love', desc: "Handmade in Amma's Mysuru kitchen." },
    { icon: '🌿', title: '100% Natural', desc: 'No preservatives, sugar, or chemicals.' },
    { icon: '💪', title: 'Nutrient Dense', desc: '21+ ingredients per product.' },
    { icon: '✈️', title: 'Ships Worldwide', desc: 'Free shipping Karnataka 1kg+.' },
  ];
  return (
    <section id="why" className="py-20 md:py-24 px-4 max-w-[1000px] mx-auto">
      <SectionHeader tag="The Amma Difference" title="Why Families Choose Us" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
        {cards.map((c, i) => (
          <RevealSection key={i} delay={i * 80}
            className={`text-center p-7 md:p-6 bg-cream-light rounded-2xl border border-forest/[.015] transition-all relative overflow-hidden group
              ${i % 2 === 0 ? 'rounded-[18px_4px_18px_4px]' : 'rounded-[4px_18px_4px_18px]'}
              ${i % 2 === 1 ? 'md:translate-y-3.5' : ''}`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sage to-brass scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sand/35 to-sage/[.06] mx-auto mb-2.5 flex items-center justify-center text-xl transition-all group-hover:scale-110 group-hover:rotate-3">{c.icon}</div>
            <h3 className="font-display text-[.92rem] font-bold mb-1">{c.title}</h3>
            <p className="text-[.7rem] text-forest/35 leading-relaxed">{c.desc}</p>
          </RevealSection>
        ))}
      </div>
    </section>
  );
}

/* ══════ TESTIMONIALS ══════ */
export function Testimonials() {
  const reviews = [
    { text: 'Millet malt is a game changer. My kids love it!', name: 'Priya S.', loc: 'Bangalore', initial: 'P' },
    { text: 'Dosa mix tastes homemade! Breakfast in minutes.', name: 'Rakesh M.', loc: 'Mysuru', initial: 'R' },
    { text: 'Millet malt for my family every morning. Pure and fresh!', name: 'Ananya K.', loc: 'Dubai', initial: 'A' },
  ];
  return (
    <section id="testi" className="py-20 md:py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(170deg,#1A2A14,#223218,#1A2A14)' }}>
      <span className="absolute -top-2.5 left-[2%] font-display text-[14rem] text-brass/[.02] leading-none pointer-events-none">&ldquo;</span>
      <SectionHeader tag="Customer Love ❤️" title="What Families Say" dark />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-[1000px] mx-auto relative z-[2]">
        {reviews.map((r, i) => (
          <RevealSection key={i} delay={i * 100}
            className={`bg-cream-light/[.025] border border-cream-light/[.03] p-6 transition-all hover:-translate-y-1 hover:border-brass/[.08]
              ${i === 0 ? 'rounded-[4px_18px_18px_4px]' : i === 1 ? 'md:translate-y-4 rounded-2xl' : 'rounded-[18px_4px_4px_18px]'}`}>
            <div className="text-brass text-[.76rem] mb-2 tracking-[2px]" style={{ textShadow: '0 0 12px rgba(200,180,74,.12)' }}>★★★★★</div>
            <p className="font-display text-[.95rem] leading-[1.8] text-cream-light/[.32] italic mb-3.5">&ldquo;{r.text}&rdquo;</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage to-millet flex items-center justify-center text-white font-bold text-[.65rem] font-display">{r.initial}</div>
              <div>
                <div className="font-semibold text-[.74rem] text-sand/80">{r.name}</div>
                <div className="text-[.58rem] text-cream-light/[.18]">{r.loc}</div>
              </div>
            </div>
          </RevealSection>
        ))}
      </div>
    </section>
  );
}

/* ══════ SHIPPING ══════ */
export function Shipping() {
  const items = [
    { icon: '📦', text: 'Free Shipping Karnataka' },
    { icon: '🌍', text: 'Worldwide Delivery' },
    { icon: '✨', text: '5% Off Every Order' },
    { icon: '👥', text: 'Refer 5 → Get 50% Off' },
  ];
  return (
    <div className="py-6 px-4 bg-forest border-t border-b border-brass/[.06]">
      <div className="flex justify-center gap-2 flex-wrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-brass px-4 py-2 bg-brass/[.05] border border-brass/[.08] rounded-full transition-all active:scale-[.93]">
            <span className="text-[.75rem]">{item.icon}</span>
            <span className="text-[.58rem] tracking-[1px] uppercase font-semibold text-millet">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════ CTA ══════ */
export function CTA() {
  return (
    <section className="py-20 md:py-24 px-4 text-center" style={{ background: 'radial-gradient(ellipse at 50% 50%,#223218,#1A2A14)' }}>
      <SectionHeader tag="Questions?" title="We'd Love to Help" dark />
      <RevealSection className="flex gap-2.5 justify-center flex-wrap">
        <a href={CONTACT.instagram} target="_blank" className="bg-gradient-to-br from-pink-500 to-orange-500 text-white px-6 py-3 rounded-full text-[.72rem] font-semibold tracking-[1.5px] no-underline inline-flex items-center gap-1.5 shadow-[0_4px_16px_rgba(225,48,108,.12)]">
          📸 Instagram
        </a>
        <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" className="bg-green-500 text-white px-6 py-3 rounded-full text-[.72rem] font-semibold tracking-[1.5px] no-underline inline-flex items-center gap-1.5 shadow-[0_4px_16px_rgba(37,211,102,.12)]">
          💬 WhatsApp
        </a>
      </RevealSection>
      <p className="mt-4 text-[.72rem] text-brass/35">📱 {CONTACT.phone1} · {CONTACT.phone2}</p>
    </section>
  );
}

/* ══════ FOOTER ══════ */
export function Footer() {
  return (
    <footer className="pt-11 pb-5 px-4 md:px-[6%]" style={{ background: 'linear-gradient(180deg,#121E0E,#0A120A)' }}>
      <div className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1fr_1fr] gap-7 md:gap-10 max-w-[1000px] mx-auto mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/images/logo.png" alt="" width={32} height={32} className="rounded-full border border-brass/[.08] flex-shrink-0" />
            <span className="font-display text-base font-bold text-millet">Crafted by Amma</span>
          </div>
          <p className="font-kannada text-[.62rem] text-cream-light/[.08] mb-1">ಅಮ್ಮನಿಂದ ಕರಕುಶಲ</p>
          <p className="text-[.7rem] text-cream-light/[.12] leading-relaxed">Homemade millet products from Namma Mysuru.</p>
        </div>
        {[
          { title: 'Navigate', links: [{ label: 'Story', href: '#about' }, { label: 'Products', href: '#prods' }, { label: 'Order', href: '#order' }] },
          { title: 'Products', links: [{ label: 'Millet Malt', href: '#prods' }, { label: 'Dosa Mix', href: '#prods' }] },
          { title: 'Connect', links: [{ label: 'Instagram', href: CONTACT.instagram }, { label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}` }] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="font-display text-[.86rem] font-bold text-sand/80 mb-2.5 relative inline-block">
              {col.title}
              <span className="absolute -bottom-1 left-0 w-5 h-[1.5px] bg-sage rounded" />
            </h4>
            <ul className="list-none flex flex-col gap-1.5">
              {col.links.map(l => (
                <li key={l.label}><a href={l.href} className="text-cream-light/[.12] text-[.7rem] no-underline hover:text-sage transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-cream-light/[.02] pt-3.5 text-center text-[.56rem] text-cream-light/[.06]">
        © 2026 Crafted by Amma · ಅಮ್ಮನಿಂದ ಕರಕುಶಲ · Mysuru
      </div>
    </footer>
  );
}
