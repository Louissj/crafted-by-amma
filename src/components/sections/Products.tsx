'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';
import { useCart } from '@/lib/useCart';
import { useProducts, DbProduct } from '@/lib/useProducts';
import { trackEvent } from '@/lib/analytics';

/* ─── Image Lightbox ─── */
function Lightbox({ images, startIdx, onClose }: { images: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);
  const touchStartX = useRef(0);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, next, prev]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      {/* Image */}
      <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        }}>
        <img
          src={images[idx]}
          alt=""
          className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl"
          style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }}
        />
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white/60"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          {idx + 1} / {images.length}
        </div>
      )}

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1 8l7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M1 1l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Dot strip */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              className={`rounded-full transition-all ${i === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>
      )}

      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ─── Image Carousel (inside modal) ─── */
function ImageCarousel({ images, productName, badge, onLightbox }: {
  images: string[];
  productName: string;
  badge?: string;
  onLightbox: (idx: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  if (images.length === 0) {
    return (
      <div className="w-full h-[260px] md:h-[320px] flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(160deg,#2A4020,#1E3418)' }}>
        <span className="text-7xl opacity-10">🫙</span>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0 overflow-hidden select-none h-[260px] md:h-[320px]"
      style={{ background: 'linear-gradient(160deg,#263C1C,#1C3012)' }}>

      {/* Slides */}
      <div
        ref={trackRef}
        className="flex h-full"
        style={{ transform: `translateX(-${idx * 100}%)`, transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 45) diff > 0 ? next() : prev();
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full flex-shrink-0 relative cursor-zoom-in h-full"
            onClick={() => onLightbox(idx)}>
            <img src={src} alt={productName}
              className="w-full h-full object-cover" />
            {/* Tap to zoom hint on first image */}
            {i === 0 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                </svg>
                <span className="text-[0.6rem] text-white/60 font-medium">Tap to zoom</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top,rgba(13,21,9,0.65) 0%,transparent 45%)' }} />

      {/* Badge */}
      {badge && (
        <span className="absolute top-4 left-4 z-[3] px-3 py-1 rounded-full text-xs font-bold tracking-[2px] uppercase"
          style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14', boxShadow: '0 2px 12px rgba(212,148,42,0.4)' }}>
          {badge}
        </span>
      )}

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-[3] transition-all active:scale-90"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1 8l7 7" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-[3] transition-all active:scale-90"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M1 1l7 7-7 7" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Dot strip + counter */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              className={`rounded-full transition-all duration-200 border border-white/20 ${i === idx ? 'w-5 h-1.5 bg-white/90' : 'w-1.5 h-1.5 bg-white/30'}`} />
          ))}
        </div>
      )}

    </div>
  );
}

/* ─── Product Modal ─── */
function ProductModal({
  product,
  priceMap,
  getCount,
  onCountChange,
  onClose,
}: {
  product: DbProduct;
  priceMap: Record<string, Record<string, number>>;
  getCount: (packSize: string) => number;
  onCountChange: (packSize: string, count: number) => void;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const productPrices = priceMap[product.id] || product.prices || {};
  const sizeEntries = Object.entries(productPrices);
  const images = product.images ?? [];
  const priceRange = sizeEntries.length
    ? sizeEntries.length === 1
      ? `₹${sizeEntries[0][1]}`
      : `₹${Math.min(...sizeEntries.map(([, p]) => p))} – ₹${Math.max(...sizeEntries.map(([, p]) => p))}`
    : '';
  const cardTotal = sizeEntries.reduce((sum, [size, price]) => sum + price * getCount(size), 0);
  const hasSelection = cardTotal > 0;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && lightboxIdx === null) handleClose(); };
    window.addEventListener('keydown', onKey);
    // Lock scroll on both html and body to cover all browsers
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIdx]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 260);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4"
        style={{
          background: `rgba(2,6,2,${visible ? '0.88' : '0'})`,
          backdropFilter: 'blur(20px)',
          transition: 'background 0.26s ease',
          touchAction: 'none',
        }}
        onClick={handleClose}
        onTouchMove={e => e.preventDefault()}
      >
        {/* Panel */}
        <div
          className="relative w-full md:max-w-[580px] rounded-t-[28px] md:rounded-[24px] overflow-hidden flex flex-col h-[94dvh] md:h-auto md:max-h-[92vh]"
          style={{
            background: 'linear-gradient(145deg,#1E3014,#192C10)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.26s cubic-bezier(0.34,1.56,0.64,1), opacity 0.26s ease',
            touchAction: 'pan-y',
          }}
          onClick={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
        >
          {/* Gold top bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(200,180,74,0.6),rgba(212,148,42,0.9),rgba(200,180,74,0.6),transparent)' }} />

          {/* Carousel */}
          <ImageCarousel
            images={images}
            productName={product.name}
            badge={product.badge}
            onLightbox={setLightboxIdx}
          />

          {/* Scrollable details */}
          <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
            <div className="p-5 md:p-6">
              <p className="text-[.78rem] font-bold tracking-[3px] uppercase mb-1" style={{ color: 'rgba(200,180,74,0.55)' }}>
                Crafted by Amma · Homemade
              </p>
              <h2 className="font-display text-[1.3rem] md:text-[1.55rem] font-bold leading-tight mb-1.5"
                style={{ color: 'rgba(235,225,200,0.95)' }}>
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display text-lg font-bold" style={{ color: '#D4942A' }}>{priceRange}</span>
                <span className="text-xs" style={{ color: 'rgba(235,225,200,0.30)' }}>per pack</span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(235,225,200,0.75)' }}>
                {product.description}
              </p>

              <div className="space-y-2.5">
                <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(90,122,58,0.07)', border: '1px solid rgba(90,122,58,0.10)' }}>
                  <span className="text-[0.7rem] font-bold tracking-[2px] uppercase block mb-1.5" style={{ color: 'rgba(212,148,42,0.55)' }}>
                    🌾 Ingredients
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(235,225,200,0.75)' }}>{product.ingredients}</p>
                </div>

                {(product.usage ?? []).map((u, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl" style={{ background: 'rgba(90,122,58,0.07)', border: '1px solid rgba(90,122,58,0.10)' }}>
                    <span className="text-[0.7rem] font-bold tracking-[2px] uppercase block mb-1.5" style={{ color: 'rgba(212,148,42,0.55)' }}>
                      📋 How to Use · {u.type}
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(235,225,200,0.75)' }}>{u.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky bottom — pack selector */}
          <div className="flex-shrink-0 px-4 pb-5 pt-3 space-y-2"
            style={{ background: 'linear-gradient(to top,#0e1c09,#192C10)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[0.65rem] font-bold tracking-[2px] uppercase" style={{ color: 'rgba(235,225,200,0.28)' }}>
              Choose Size &amp; Qty
            </p>
            {sizeEntries.map(([size, price], i) => {
              const count = getCount(size);
              const isBest = i === sizeEntries.length - 1 && sizeEntries.length > 1;
              return (
                <div key={size}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: count > 0 ? 'rgba(212,148,42,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${count > 0 ? 'rgba(212,148,42,0.30)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-sm font-bold" style={{ color: count > 0 ? '#D4942A' : 'rgba(235,225,200,0.75)' }}>
                        {size}
                      </span>
                      {isBest && (
                        <span className="text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14' }}>
                          Best
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(235,225,200,0.35)' }}>₹{price} per pack</span>
                  </div>
                  {count === 0 ? (
                    <button
                      onClick={() => onCountChange(size, 1)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#F5F0E0', boxShadow: '0 2px 10px rgba(90,122,58,0.30)' }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: '1.5px solid rgba(212,148,42,0.40)', background: 'rgba(212,148,42,0.07)' }}>
                      <button onClick={() => onCountChange(size, Math.max(0, count - 1))}
                        className="w-9 h-9 flex items-center justify-center text-lg font-bold active:scale-90"
                        style={{ color: '#D4942A' }}>−</button>
                      <span className="font-display text-base font-bold w-6 text-center" style={{ color: '#D4942A' }}>{count}</span>
                      <button onClick={() => onCountChange(size, Math.min(10, count + 1))}
                        disabled={count >= 10}
                        className="w-9 h-9 flex items-center justify-center text-lg font-bold active:scale-90 disabled:opacity-30"
                        style={{ color: '#D4942A' }}>+</button>
                    </div>
                  )}
                </div>
              );
            })}

            {hasSelection ? (
              <Link href="/cart" onClick={handleClose}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl no-underline transition-all active:scale-[.99]"
                style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', boxShadow: '0 6px 20px rgba(90,122,58,0.30)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛒</span>
                  <span className="text-sm font-bold tracking-[1px] uppercase text-white/90">View Cart</span>
                </div>
                <span className="font-display text-base font-bold" style={{ color: '#F5F0E0' }}>₹{cardTotal} →</span>
              </Link>
            ) : (
              <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Select a pack size above to add to cart
              </p>
            )}
          </div>

          {/* Close */}
          <button onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-20 transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

/* ─── Inline stepper ─── */
function Stepper({ count, onAdd, onRemove }: { count: number; onAdd: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-0 rounded-xl overflow-hidden flex-shrink-0"
      style={{ border: '1.5px solid rgba(212,148,42,0.40)', background: 'rgba(212,148,42,0.07)' }}>
      <button
        onClick={e => { e.stopPropagation(); onRemove(); }}
        className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all active:scale-90"
        style={{ color: '#D4942A' }}>
        −
      </button>
      <span className="font-display text-lg font-bold w-7 text-center" style={{ color: '#D4942A' }}>
        {count}
      </span>
      <button
        onClick={e => { e.stopPropagation(); onAdd(); }}
        disabled={count >= 10}
        className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all active:scale-90 disabled:opacity-30"
        style={{ color: '#D4942A' }}>
        +
      </button>
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({
  product,
  priceMap,
  getCount,
  onCountChange,
  onOpen,
}: {
  product: DbProduct;
  priceMap: Record<string, Record<string, number>>;
  getCount: (packSize: string) => number;
  onCountChange: (packSize: string, count: number) => void;
  onOpen: () => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const productPrices = priceMap[product.id] || product.prices || {};
  const sizeEntries = Object.entries(productPrices);
  const images = product.images ?? [];
  const totalInCart = sizeEntries.reduce((sum, [size, price]) => sum + price * getCount(size), 0);
  const packsInCart = sizeEntries.reduce((sum, [size]) => sum + getCount(size), 0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActiveImg(p => (p + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div
      className="rounded-[24px] overflow-hidden h-full flex flex-col"
      style={{
        background: 'linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.04))',
        border: `1px solid ${packsInCart > 0 ? 'rgba(212,148,42,0.4)' : 'rgba(255,255,255,0.14)'}`,
        boxShadow: packsInCart > 0 ? '0 8px 40px rgba(212,148,42,0.12)' : '0 8px 30px rgba(0,0,0,0.25)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Image — click opens detail modal */}
      <div
        className="group relative overflow-hidden flex-shrink-0 cursor-pointer"
        style={{ height: 220, background: 'linear-gradient(160deg,#2A4020,#1E3418)' }}
        onClick={onOpen}
      >
        {images.length > 0 ? images.map((img, i) => (
          <Image key={i} src={img} alt={product.name} width={640} height={400} unoptimized
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]
              ${i === activeImg ? 'opacity-100' : 'opacity-0'}`} />
        )) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-6xl opacity-10">🫙</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs tracking-wide"
            style={{ background: 'rgba(200,180,74,0.15)', border: '1.5px solid rgba(200,180,74,0.5)', color: 'rgba(235,225,200,0.95)', backdropFilter: 'blur(8px)' }}>
            View Details
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)' }} />

        {product.badge && (
          <span className="absolute top-4 left-4 z-[3] px-3 py-1 rounded-full text-xs font-bold tracking-[2px] uppercase"
            style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14', boxShadow: '0 2px 12px rgba(212,148,42,0.4)' }}>
            {product.badge}
          </span>
        )}

        {packsInCart > 0 && (
          <div className="absolute top-4 right-4 z-[3] px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: 'rgba(212,148,42,0.18)', border: '1px solid rgba(212,148,42,0.45)', backdropFilter: 'blur(8px)' }}>
            <span className="text-xs">🛒</span>
            <span className="font-display text-[.82rem] font-bold" style={{ color: '#D4942A' }}>{packsInCart}</span>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[3]">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                className={`h-1.5 rounded-full transition-all border border-white/20 ${i === activeImg ? 'bg-white/85 w-5' : 'bg-white/25 w-1.5'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4 cursor-pointer" onClick={onOpen}>
          <h3 className="font-display text-xl font-bold leading-snug mb-1" style={{ color: 'rgba(235,225,200,0.98)' }}>
            {product.name}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(235,225,200,0.60)' }}>
            {product.description}
          </p>
        </div>

        <div className="mt-auto space-y-2.5">
          <p className="text-[0.65rem] font-bold tracking-[2px] uppercase mb-2" style={{ color: 'rgba(235,225,200,0.28)' }}>
            Choose Size &amp; Qty
          </p>
          {sizeEntries.map(([size, price], i) => {
            const count = getCount(size);
            const isBest = i === sizeEntries.length - 1 && sizeEntries.length > 1;
            return (
              <div key={size}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: count > 0 ? 'rgba(212,148,42,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${count > 0 ? 'rgba(212,148,42,0.30)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-bold" style={{ color: count > 0 ? '#D4942A' : 'rgba(235,225,200,0.75)' }}>
                      {size}
                    </span>
                    {isBest && (
                      <span className="text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14' }}>
                        Best
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(235,225,200,0.35)' }}>₹{price} per pack</span>
                </div>

                {count === 0 ? (
                  <button
                    onClick={e => { e.stopPropagation(); onCountChange(size, 1); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#F5F0E0', boxShadow: '0 2px 10px rgba(90,122,58,0.30)' }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Add
                  </button>
                ) : (
                  <Stepper
                    count={count}
                    onAdd={() => onCountChange(size, Math.min(10, count + 1))}
                    onRemove={() => onCountChange(size, Math.max(0, count - 1))}
                  />
                )}
              </div>
            );
          })}

          {packsInCart > 0 && (
            <Link href="/cart"
              className="mt-1 flex items-center justify-between px-4 py-3 rounded-xl no-underline transition-all active:scale-[.99]"
              style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.15),rgba(212,148,42,0.07))', border: '1.5px solid rgba(212,148,42,0.30)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">🛒</span>
                <span className="text-xs font-bold" style={{ color: 'rgba(212,148,42,0.80)' }}>
                  {packsInCart} pack{packsInCart > 1 ? 's' : ''} · View Cart
                </span>
              </div>
              <span className="font-display text-sm font-bold" style={{ color: '#D4942A' }}>₹{totalInCart} →</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton loader ─── */
function ProductSkeleton() {
  return (
    <div className="rounded-[24px] overflow-hidden animate-pulse" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
      <div className="h-[220px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 w-full rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-10 w-full rounded-xl mt-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-10 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  );
}

/* ─── Section ─── */
export default function Products() {
  const { products, priceMap, loading } = useProducts();
  const { cart, setCount, cartTotal, totalPacks } = useCart(priceMap);
  const [openProduct, setOpenProduct] = useState<DbProduct | null>(null);

  const getCount = (productId: string, packSize: string) =>
    cart.find(i => i.productId === productId && i.packSize === packSize)?.count || 0;

  return (
    <section id="prods" className="py-16 sm:py-20 md:py-28 px-4 sm:px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(170deg,#1E3414 0%,#273E1C 40%,#2C4420 70%,#1E3414 100%)' }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full opacity-[.08]"
          style={{ background: 'radial-gradient(circle,#D4942A,transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[36rem] h-[36rem] rounded-full opacity-[.08]"
          style={{ background: 'radial-gradient(circle,#5A7A3A,transparent 70%)' }} />
      </div>

      <SectionHeader tag="Our Products" title="Amma's Signature Recipes" dark />

      <div className="max-w-[1040px] lg:max-w-[1120px] mx-auto mb-8 relative z-[2]">
        <p className="text-center text-base tracking-wide" style={{ color: 'rgba(235,225,200,0.72)' }}>
          Pick your size &amp; add to cart — tap the image for full details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-8 max-w-[1040px] lg:max-w-[1120px] mx-auto relative z-[2]">
        {loading ? (
          [0, 1].map(i => <ProductSkeleton key={i} />)
        ) : (
          products.map((product, i) => (
            <RevealSection key={product.id} delay={i * 150} className="h-full">
              <ProductCard
                product={product}
                priceMap={priceMap}
                getCount={(packSize) => getCount(product.id, packSize)}
                onCountChange={(packSize, count) => {
                  const prev = getCount(product.id, packSize);
                  if (count > prev) trackEvent('add_to_cart', { productId: product.id, packSize });
                  setCount(product.id, packSize, count);
                }}
                onOpen={() => setOpenProduct(product)}
              />
            </RevealSection>
          ))
        )}
      </div>

      {/* Product detail modal */}
      {openProduct && (
        <ProductModal
          product={openProduct}
          priceMap={priceMap}
          getCount={(packSize) => getCount(openProduct.id, packSize)}
          onCountChange={(packSize, count) => {
            const prev = getCount(openProduct.id, packSize);
            if (count > prev) trackEvent('add_to_cart', { productId: openProduct.id, packSize });
            setCount(openProduct.id, packSize, count);
          }}
          onClose={() => setOpenProduct(null)}
        />
      )}

      {/* Sticky mini cart bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-4 md:pb-5 transition-all duration-400
        ${totalPacks > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto">
          <Link href="/cart"
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl no-underline transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg,#243A1C,#2E4824)',
              border: '1px solid rgba(212,148,42,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
            }}>
            <div className="flex items-center gap-2.5">
              <span className="text-base">🛒</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-[2px] block" style={{ color: 'rgba(212,148,42,0.55)' }}>
                  {totalPacks} pack{totalPacks !== 1 ? 's' : ''} in cart
                </span>
                <span className="font-display text-sm font-bold" style={{ color: 'rgba(235,225,200,0.85)' }}>View Cart</span>
              </div>
            </div>
            <div className="flex-1" />
            <div className="text-right">
              <span className="font-display text-lg font-bold" style={{ color: '#D4942A' }}>₹{cartTotal}</span>
              <span className="text-xs block" style={{ color: 'rgba(235,225,200,0.30)' }}>excl. delivery</span>
            </div>
            <span style={{ color: '#D4942A' }}>→</span>
          </Link>
        </div>
      </div>

    </section>
  );
}
