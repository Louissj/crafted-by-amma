'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';
import { BENEFITS, CONTACT } from '@/lib/constants';

/* ══════ INGREDIENTS ══════ */
export function Ingredients() {
  const items = [
    '🌾 Millets', '🌱 Sprouts', '🥜 Dry Fruits', '🫘 Ragi',
    '🌾 Wheat', '🫘 Soyabean', '🌻 Seeds', '🧂 Spices', '💪 Protein', '🌿 Fibre',
  ];
  return (
    <div className="py-16 px-4 text-center" style={{ background: 'linear-gradient(180deg,#E8EDD8,#F5F0E0)' }}>
      <SectionHeader tag="Nature's Pantry" title="Every Ingredient Counts" />
      <RevealSection className="flex flex-wrap justify-center gap-2.5 max-w-[720px] mx-auto">
        {items.map((item, i) => (
          <span key={i}
            className="bg-white border border-forest/[.06] px-4 py-2 rounded-full text-[.74rem] font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:bg-forest hover:text-brass hover:-translate-y-0.5 active:scale-[.94] cursor-default"
            style={{ transitionDelay: `${i * 25}ms`, color: '#2d4a20' }}>
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
    <section id="benefits" className="py-20 md:py-28 px-4 md:px-[6%] lg:px-[8%]"
      style={{ background: 'linear-gradient(180deg,#F5F0E0,#FAF3E6,#FBF5EC)' }}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 lg:gap-20 items-center max-w-[1100px] mx-auto">
        <RevealSection className="rounded-2xl overflow-hidden shadow-[0_16px_50px_rgba(26,42,20,.1)] order-2 md:order-1">
          <Image src="/images/benefits.jpg" alt="Millet Benefits" width={550} height={700}
            className="w-full block object-cover max-h-[400px] md:max-h-none" />
        </RevealSection>
        <div className="order-1 md:order-2">
          <RevealSection>
            <p className="text-[.58rem] font-semibold tracking-[5px] uppercase mb-1.5 text-sage">Why Millets?</p>
            <h2 className="font-display font-bold leading-tight text-[clamp(1.7rem,5vw,2.4rem)] text-forest">
              Benefits of Our Products
            </h2>
            <div className="w-[50px] h-0.5 bg-gradient-to-r from-sage to-brass rounded mt-3.5 mb-6" />
          </RevealSection>
          <div className="flex flex-col gap-3">
            {BENEFITS.map((b, i) => (
              <RevealSection key={i} delay={i * 70}
                className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-sage/[.06] shadow-sm transition-all active:scale-[.98] md:hover:translate-x-1 md:hover:shadow-md">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center text-white text-[.7rem] font-bold flex-shrink-0 shadow-md">✓</div>
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
    { icon: '🧡', title: 'Made with Love', desc: "Handmade in Amma's Mysuru kitchen with care." },
    { icon: '🌿', title: '100% Natural', desc: 'No preservatives, added sugar, or chemicals.' },
    { icon: '💪', title: 'Nutrient Dense', desc: '21+ superfoods in every batch.' },
    { icon: '✈️', title: 'Ships Worldwide', desc: 'Free shipping in Karnataka (1kg+).' },
  ];
  return (
    <section id="why" className="py-20 md:py-24 px-4 max-w-[1000px] mx-auto">
      <SectionHeader tag="The Amma Difference" title="Why Families Choose Us" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {cards.map((c, i) => (
          <RevealSection key={i} delay={i * 80}
            className={`text-center p-5 md:p-6 bg-cream-light rounded-2xl border border-forest/[.04] transition-all relative overflow-hidden group cursor-default
              ${i % 2 === 1 ? 'md:translate-y-4' : ''}`}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sage to-brass scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sand/30 to-sage/[.07] mx-auto mb-3 flex items-center justify-center text-xl transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              {c.icon}
            </div>
            <h3 className="font-display text-[.85rem] font-bold mb-1.5 text-forest">{c.title}</h3>
            <p className="text-[.68rem] text-forest/35 leading-relaxed">{c.desc}</p>
          </RevealSection>
        ))}
      </div>
    </section>
  );
}

/* ══════ TESTIMONIALS ══════ */
type Review = { id: string; name: string; place: string; rating: number; text: string; createdAt: string };

const FALLBACK_REVIEWS: Review[] = [
  { id: '1', name: 'Priya S.', place: 'Bangalore', rating: 5, text: 'Millet malt is a game changer. My kids love it every morning!', createdAt: '' },
  { id: '2', name: 'Rakesh M.', place: 'Mysuru', rating: 5, text: 'Dosa mix tastes just like homemade! Breakfast ready in minutes.', createdAt: '' },
  { id: '3', name: 'Ananya K.', place: 'Dubai', rating: 5, text: 'Pure and fresh — my whole family has it every morning.', createdAt: '' },
];

/* ── Star Picker ── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  const active = hovered || value;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button"
            onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
            className="transition-all duration-150 active:scale-90"
            style={{ fontSize: 36, lineHeight: 1, filter: s <= active ? 'drop-shadow(0 0 8px rgba(212,148,42,0.6))' : 'none', transform: s <= active ? 'scale(1.12)' : 'scale(1)', color: s <= active ? '#D4942A' : 'rgba(255,255,255,0.12)' }}>
            ★
          </button>
        ))}
      </div>
      <span className="text-[.72rem] font-semibold tracking-wide transition-all duration-200 h-4"
        style={{ color: active ? 'rgba(212,148,42,0.85)' : 'transparent' }}>
        {labels[active]}
      </span>
    </div>
  );
}

/* ── Review Modal ── */
function ReviewModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', place: '', rating: 0, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.rating === 0) { setError('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4"
      style={{ background: `rgba(2,6,2,${visible ? '0.88' : '0'})`, backdropFilter: 'blur(20px)', transition: 'background 0.28s ease' }}
      onClick={handleClose}
    >
      <div
        className="relative w-full md:max-w-[480px] rounded-t-[28px] md:rounded-[24px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg,#111a0d,#0d1509)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(48px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.28s cubic-bezier(0.34,1.4,0.64,1), opacity 0.28s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,transparent,rgba(200,180,74,0.6),rgba(212,148,42,0.9),rgba(200,180,74,0.6),transparent)' }} />

        {/* Close */}
        <button onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">✍️</div>
                <h3 className="font-display text-[1.2rem] font-bold mb-1" style={{ color: 'rgba(235,225,200,0.95)' }}>Share Your Experience</h3>
                <p className="text-[.65rem] tracking-wide" style={{ color: 'rgba(255,255,255,0.28)' }}>Your review helps other families choose wisely · Appears after a quick check</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Stars — centered, big */}
                <div className="flex flex-col items-center py-2 rounded-2xl"
                  style={{ background: 'rgba(200,180,74,0.04)', border: '1px solid rgba(200,180,74,0.1)' }}>
                  <p className="text-[.52rem] font-bold tracking-[3px] uppercase mb-3 mt-3" style={{ color: 'rgba(200,180,74,0.5)' }}>Tap to Rate</p>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                  <div className="mb-3" />
                </div>

                {/* Name + Place */}
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'name',  label: 'Your Name',    placeholder: 'e.g. Priya S.' },
                    { key: 'place', label: 'City / Place', placeholder: 'e.g. Bangalore' },
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-[.52rem] font-bold tracking-[2px] uppercase block mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</label>
                      <input
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl text-[.82rem] outline-none placeholder:opacity-30 transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(235,225,200,0.9)' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Review text */}
                <div>
                  <label className="text-[.52rem] font-bold tracking-[2px] uppercase block mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Your Review</label>
                  <textarea
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="Tell other families what you loved — the taste, quality, or how it helped…"
                    required rows={4}
                    className="w-full px-3.5 py-3 rounded-xl text-[.82rem] outline-none resize-none placeholder:opacity-25 transition-all leading-relaxed"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(235,225,200,0.9)' }}
                  />
                </div>

                {error && (
                  <p className="text-[.72rem] text-red-400 text-center py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)' }}>{error}</p>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 rounded-2xl font-bold text-[.82rem] tracking-wide transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#0d1509', boxShadow: '0 8px 24px rgba(212,148,42,0.25)' }}>
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                      </svg>
                      Submitting…
                    </>
                  ) : '🌾 Submit Review'}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.15),rgba(200,180,74,0.05))', border: '1px solid rgba(200,180,74,0.25)' }}>
                🙏
              </div>
              <h3 className="font-display text-[1.25rem] font-bold mb-2" style={{ background: 'linear-gradient(90deg,#C8B44A,#E8D46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Thank You!
              </h3>
              <p className="text-[.8rem] leading-relaxed mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Your review has been submitted successfully.</p>
              <p className="text-[.72rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>It will appear on the site once approved. We truly appreciate your love! ❤️</p>
              <button onClick={handleClose}
                className="mt-6 px-6 py-2.5 rounded-full text-[.75rem] font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(200,180,74,0.1)', border: '1px solid rgba(200,180,74,0.2)', color: 'rgba(200,180,74,0.8)' }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Avatar gradient colours cycling per review ── */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#3A5A2A,#C8B44A)',
  'linear-gradient(135deg,#1A3A2A,#5A8A4A)',
  'linear-gradient(135deg,#3A2A1A,#D4942A)',
  'linear-gradient(135deg,#1A2A3A,#4A7A8A)',
  'linear-gradient(135deg,#2A1A3A,#8A4AD4)',
];

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => { if (d.reviews?.length) setReviews(d.reviews); })
      .catch(() => {});
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="testi" className="relative overflow-hidden py-20 md:py-28">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#0E1A0A 0%,#152112 40%,#1A2A14 70%,#0E1A0A 100%)' }} />
      <div className="absolute inset-0 opacity-[.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '300px' }} />
      {/* Gold glow top-right */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right,rgba(200,180,74,0.06),transparent 65%)' }} />
      {/* Big decorative quote */}
      <div className="absolute top-8 left-4 font-display font-bold leading-none pointer-events-none select-none hidden md:block"
        style={{ fontSize: 220, color: 'rgba(200,180,74,0.03)', lineHeight: 1 }}>&ldquo;</div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8">

        {/* ── Header ── */}
        <RevealSection className="text-center mb-12 md:mb-16">
          <p className="text-[.5rem] font-bold tracking-[5px] uppercase mb-3" style={{ color: 'rgba(200,180,74,0.55)' }}>Customer Love ❤️</p>
          <h2 className="font-display font-bold text-[clamp(1.9rem,5vw,2.8rem)] leading-tight mb-5" style={{ color: 'rgba(255,248,220,0.95)' }}>
            What Families Say
          </h2>
          {/* Rating summary strip */}
          <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl"
            style={{ background: 'rgba(200,180,74,0.06)', border: '1px solid rgba(200,180,74,0.14)' }}>
            <div className="text-center">
              <p className="font-display text-[1.6rem] font-bold leading-none" style={{ color: '#D4942A' }}>{avgRating}</p>
              <p className="text-[.46rem] tracking-[2px] uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Avg Rating</p>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(200,180,74,0.18)' }} />
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[1,2,3,4,5].map(s => <span key={s} className="text-base" style={{ color: '#D4942A' }}>★</span>)}
              </div>
              <p className="text-[.52rem] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>{reviews.length} happy {reviews.length === 1 ? 'family' : 'families'}</p>
            </div>
          </div>
        </RevealSection>

        {/* ── Review cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 md:mb-16">
          {reviews.map((r, i) => (
            <RevealSection key={r.id} delay={i * 90}>
              <div className={`relative h-full rounded-2xl p-6 flex flex-col transition-all duration-400 hover:-translate-y-1.5 group
                ${i === 1 ? 'md:mt-6' : ''}`}
                style={{
                  background: i === 1
                    ? 'linear-gradient(145deg,rgba(200,180,74,0.1),rgba(200,180,74,0.03))'
                    : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${i === 1 ? 'rgba(200,180,74,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: i === 1 ? '0 8px 40px rgba(200,180,74,0.08)' : 'none',
                }}>
                {/* Corner gold glow on featured */}
                {i === 1 && <div className="absolute top-0 right-0 w-20 h-20 rounded-2xl overflow-hidden pointer-events-none"><div className="w-full h-full" style={{ background: 'radial-gradient(circle at top right,rgba(200,180,74,0.15),transparent 70%)' }} /></div>}

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= r.rating ? '#D4942A' : 'rgba(255,255,255,0.1)', fontSize: 14,
                      filter: s <= r.rating ? 'drop-shadow(0 0 4px rgba(212,148,42,0.5))' : 'none' }}>★</span>
                  ))}
                </div>

                {/* Quote mark */}
                <span className="font-display text-[2rem] leading-none mb-1 block" style={{ color: 'rgba(200,180,74,0.18)' }}>&ldquo;</span>

                {/* Review text */}
                <p className="font-display text-[.92rem] md:text-[.95rem] leading-[1.85] flex-1 mb-5"
                  style={{ color: 'rgba(235,225,200,0.55)', fontStyle: 'italic' }}>
                  {r.text}
                </p>

                {/* Divider */}
                <div className="h-px mb-4" style={{ background: i === 1 ? 'rgba(200,180,74,0.12)' : 'rgba(255,255,255,0.05)' }} />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[.75rem] flex-shrink-0"
                    style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], color: 'rgba(255,248,220,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[.78rem]" style={{ color: 'rgba(255,248,220,0.8)' }}>{r.name}</p>
                    <p className="text-[.6rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>📍 {r.place}</p>
                  </div>
                  {i === 1 && (
                    <div className="ml-auto">
                      <span className="text-[.48rem] font-bold tracking-[2px] uppercase px-2 py-1 rounded-full"
                        style={{ background: 'rgba(200,180,74,0.12)', color: 'rgba(200,180,74,0.7)', border: '1px solid rgba(200,180,74,0.15)' }}>
                        ✦ Featured
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* ── Write review CTA ── */}
        <RevealSection className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 mb-1">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right,transparent,rgba(200,180,74,0.3))' }} />
            <span className="text-[.5rem] font-bold tracking-[4px] uppercase" style={{ color: 'rgba(200,180,74,0.4)' }}>Share Your Voice</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left,transparent,rgba(200,180,74,0.3))' }} />
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-[.8rem] tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.14),rgba(212,148,42,0.06))', border: '1.5px solid rgba(212,148,42,0.3)', color: 'rgba(212,148,42,0.88)', boxShadow: '0 4px 24px rgba(212,148,42,0.1)' }}>
            ✍️ Write a Review
          </button>
          <p className="text-[.56rem] tracking-wide" style={{ color: 'rgba(255,255,255,0.18)' }}>Your words help other families make the right choice</p>
        </RevealSection>

      </div>

      {showModal && <ReviewModal onClose={() => setShowModal(false)} />}
    </section>
  );
}

/* ══════ SHIPPING / OFFERS (dynamic from API) ══════ */
type Offer = { id: string; icon: string; text: string };

const FALLBACK_OFFERS: Offer[] = [
  { id: '1', icon: '📦', text: 'Free Shipping in Karnataka' },
  { id: '2', icon: '🌍', text: 'Worldwide Delivery Available' },
  { id: '3', icon: '✨', text: '5% Off on Every Order' },
  { id: '4', icon: '👥', text: 'Refer 5 Friends → Get 50% Off' },
];

export function Shipping() {
  const [offers, setOffers] = useState<Offer[]>(FALLBACK_OFFERS);

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then((data: Offer[]) => {
        if (Array.isArray(data) && data.length > 0) setOffers(data);
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless scroll on small screens
  const displayOffers = [...offers, ...offers];

  return (
    <div className="py-5 border-t border-b border-brass/[.08] overflow-hidden relative"
      style={{ background: 'linear-gradient(90deg,#121E0E,#1A2A14,#121E0E)' }}>
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg,#121E0E,transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(270deg,#121E0E,transparent)' }} />

      <div className="flex animate-scroll w-max">
        {displayOffers.map((offer, i) => (
          <div key={i} className="flex items-center gap-2 px-5 whitespace-nowrap">
            <span className="text-base">{offer.icon}</span>
            <span className="text-[.68rem] font-semibold tracking-[1.2px] uppercase text-millet/75">
              {offer.text}
            </span>
            <span className="ml-4 w-1 h-1 bg-brass/40 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════ CTA ══════ */
export function CTA() {
  return (
    <section className="py-20 md:py-24 px-4 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 50%,#223218,#1A2A14)' }}>
      <SectionHeader tag="Questions?" title="We'd Love to Help" dark />
      <RevealSection className="flex gap-3 justify-center flex-wrap mb-5">
        <a href={CONTACT.instagram} target="_blank"
          className="bg-gradient-to-br from-pink-500 to-orange-500 text-white px-7 py-3.5 rounded-full text-[.74rem] font-semibold tracking-[1.5px] no-underline inline-flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
          📸 Instagram
        </a>
        <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank"
          className="bg-green-500 text-white px-7 py-3.5 rounded-full text-[.74rem] font-semibold tracking-[1.5px] no-underline inline-flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
          💬 WhatsApp
        </a>
      </RevealSection>
      <p className="text-[.72rem] text-brass/35">
        📱 {CONTACT.phone1} · {CONTACT.phone2}
      </p>
    </section>
  );
}

/* ══════ CHECKOUT CTA ══════ */
export function CheckoutCTA() {
  const steps = [
    { step: '1', label: 'Browse Products', icon: '🌾', desc: 'Pick your pack sizes' },
    { step: '2', label: 'Add to Cart', icon: '🛒', desc: 'Mix & match freely' },
    { step: '3', label: 'Checkout', icon: '✅', desc: 'Pay via UPI' },
  ];
  return (
    <section id="order" className="py-20 md:py-24 px-4 text-center"
      style={{ background: 'linear-gradient(180deg,#F5F0E0,#FAF3E6)' }}>
      <div className="max-w-[680px] mx-auto">
        <RevealSection>
          <p className="text-[.6rem] font-bold tracking-[4px] uppercase text-sage mb-2">Ready to Order?</p>
          <h2 className="font-display font-bold text-[clamp(1.6rem,4vw,2.2rem)] text-forest leading-tight mb-3">
            From Amma&apos;s Kitchen<br />to Your Doorstep
          </h2>
          <p className="text-[.8rem] text-forest/40 mb-8 leading-relaxed">
            Order in 3 simple steps — payment via UPI, delivery straight to your door.
          </p>

          <div className="flex items-start justify-center gap-2 md:gap-6 mb-10 flex-nowrap">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-forest/[.05] border-2 border-forest/[.07] flex flex-col items-center justify-center gap-0.5 shadow-sm">
                    <span className="text-xl md:text-2xl">{s.icon}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[.6rem] font-bold text-forest block leading-snug">{s.label}</span>
                    <span className="text-[.54rem] text-forest/30 hidden md:block">{s.desc}</span>
                  </div>
                </div>
                {i < 2 && (
                  <span className="text-forest/20 text-lg mb-6 flex-shrink-0">→</span>
                )}
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection delay={100} className="flex gap-3 justify-center flex-wrap">
          <a href="#prods"
            className="bg-gradient-to-br from-forest to-forest/80 text-brass px-8 py-3.5 rounded-full font-semibold text-sm no-underline hover:-translate-y-0.5 hover:shadow-lg transition-all inline-flex items-center gap-2">
            🌾 Browse Products
          </a>
          <Link href="/cart"
            className="border-2 border-forest/15 text-forest px-8 py-3.5 rounded-full font-semibold text-sm no-underline hover:border-sage hover:text-sage transition-all inline-flex items-center gap-2">
            🛒 View Cart
          </Link>
        </RevealSection>
      </div>
    </section>
  );
}

/* ══════ FOOTER ══════ */
export function Footer() {
  return (
    <footer className="pt-12 pb-6 px-4 md:px-[6%]"
      style={{ background: 'linear-gradient(180deg,#121E0E,#0A120A)' }}>
      <div className="max-w-[1000px] mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-10 mb-8">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Image src="/images/logo.png" alt="" width={36} height={36}
                className="rounded-full border border-brass/[.1] flex-shrink-0" />
              <span className="font-display text-base font-bold text-millet">Crafted by Amma</span>
            </div>
            <p className="font-kannada text-[.65rem] text-cream-light/[.1] mb-1.5">ಅಮ್ಮನಿಂದ ಕರಕುಶಲ</p>
            <p className="text-[.7rem] text-cream-light/[.14] leading-relaxed mb-3">
              Homemade millet products from Namma Mysuru. Pure, natural, and made with love.
            </p>
            {/* Address */}
            <div className="mb-3 flex items-start gap-2">
              <span className="text-brass/40 mt-px flex-shrink-0 text-sm">📍</span>
              <address className="not-italic text-[.66rem] text-cream-light/[.18] leading-relaxed">
                #234, First Floor, 7th Cross,<br />
                G Block, Ramakrishna Nagar,<br />
                Mysore – 570023, Karnataka
              </address>
            </div>
            <div className="flex gap-2 mb-1">
              <a href={CONTACT.instagram} target="_blank"
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm no-underline transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                📸
              </a>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank"
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm no-underline transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                💬
              </a>
              <a href="https://maps.google.com/?q=#234+7th+Cross+G+Block+Ramakrishna+Nagar+Mysore+570023" target="_blank"
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm no-underline transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                🗺️
              </a>
            </div>
          </div>

          {/* Nav cols */}
          {[
            { title: 'Navigate', links: [{ label: 'Story', href: '#about' }, { label: 'Products', href: '#prods' }, { label: 'Why Us', href: '#why' }, { label: 'Order', href: '#order' }] },
            { title: 'Products', links: [{ label: 'Millet Malt', href: '#prods' }, { label: 'Dosa Mix', href: '#prods' }, { label: 'Track Order', href: '/track' }] },
            { title: 'Connect', links: [{ label: 'Instagram', href: CONTACT.instagram }, { label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}` }, { label: `📞 ${CONTACT.phone1}`, href: `tel:${CONTACT.phone1}` }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-display text-[.8rem] font-bold text-sand/60 mb-3 relative inline-block">
                {col.title}
                <span className="absolute -bottom-1 left-0 w-5 h-[1.5px] bg-sage rounded" />
              </h4>
              <ul className="list-none flex flex-col gap-2">
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href}
                      className="text-cream-light/[.15] text-[.7rem] no-underline hover:text-sage/80 transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Map embed */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-white/[.04]" style={{ height: '200px' }}>
          <iframe
            title="Crafted by Amma Location"
            width="100%" height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85)' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.3!2d76.6195!3d12.3119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf70381d572ef9%3A0x2b89eba7e636e0f3!2sRamakrishna%20Nagar%2C%20Mysuru%2C%20Karnataka%20570023!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream-light/[.03] pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[.58rem] text-cream-light/[.08]">
          <span>© 2026 Crafted by Amma · ಅಮ್ಮನಿಂದ ಕರಕುಶಲ</span>
          <a href="https://maps.google.com/?q=#234+7th+Cross+G+Block+Ramakrishna+Nagar+Mysore+570023" target="_blank"
            className="no-underline text-cream-light/[.08] hover:text-sage/40 transition-colors">
            📍 #234, G Block, Ramakrishna Nagar, Mysore – 570023
          </a>
        </div>
      </div>
    </footer>
  );
}
