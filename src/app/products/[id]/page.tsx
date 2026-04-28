'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { useCart } from '@/lib/useCart';
import { useProducts, DbProduct } from '@/lib/useProducts';
import { trackEvent } from '@/lib/analytics';

/* ─── Lightbox ─── */
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(24px)' }}
      onClick={onClose}>
      <div className="relative flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        }}>
        <img src={images[idx]} alt=""
          className="max-w-[96vw] max-h-[90vh] object-contain rounded-2xl"
          style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.9)' }} />
      </div>
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white/60"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          {idx + 1} / {images.length}
        </div>
      )}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center active:scale-90"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1 8l7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center active:scale-90"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M1 1l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              className={`rounded-full transition-all ${i === idx ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30'}`} />
          ))}
        </div>
      )}
      <button onClick={onClose}
        className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-90"
        style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ─── Image Gallery ─── */
function ImageGallery({ images, productName, badge }: { images: string[]; productName: string; badge?: string }) {
  const [mainIdx, setMainIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const hasThumbs = images.length > 1;

  if (images.length === 0) {
    return (
      <div className="w-full flex-1 flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#1E3018,#162810)', minHeight: 320 }}>
        <span className="text-8xl opacity-10">🫙</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main image */}
      <div
        className="relative flex-1 cursor-zoom-in select-none flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1C2E14,#142010)', minHeight: 280 }}
        onClick={() => setLightboxIdx(mainIdx)}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 45) {
            if (diff > 0) setMainIdx(i => (i + 1) % images.length);
            else setMainIdx(i => (i - 1 + images.length) % images.length);
          }
        }}>

        {/* Images with object-contain — full image always visible */}
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={productName}
            className="absolute inset-0 w-full h-full transition-opacity duration-500"
            style={{ opacity: i === mainIdx ? 1 : 0, objectFit: 'contain', padding: '12px' }}
          />
        ))}

        {/* Badge */}
        {badge && (
          <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold tracking-[2px] uppercase"
            style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14', boxShadow: '0 2px 12px rgba(212,148,42,0.4)' }}>
            {badge}
          </span>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
          <span className="text-[0.6rem] text-white/55 font-medium">Tap to zoom</span>
        </div>

        {/* Counter */}
        {hasThumbs && (
          <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-full text-xs font-bold text-white/50 pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
            {mainIdx + 1} / {images.length}
          </div>
        )}

        {/* Prev / Next — desktop only (mobile uses swipe) */}
        {hasThumbs && (
          <>
            <button onClick={e => { e.stopPropagation(); setMainIdx(i => (i - 1 + images.length) % images.length); }}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center active:scale-90 transition-all"
              style={{ background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path d="M8 1L1 8l7 7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={e => { e.stopPropagation(); setMainIdx(i => (i + 1) % images.length); }}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center active:scale-90 transition-all"
              style={{ background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path d="M1 1l7 7-7 7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasThumbs && (
        <div className="flex gap-2 px-3 py-3 overflow-x-auto flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.30)', scrollbarWidth: 'none' }}>
          {images.map((src, i) => (
            <button key={i} onClick={() => setMainIdx(i)}
              className="flex-shrink-0 rounded-xl overflow-hidden transition-all active:scale-95"
              style={{
                width: 68, height: 68,
                border: `2px solid ${i === mainIdx ? 'rgba(212,148,42,0.85)' : 'rgba(255,255,255,0.10)'}`,
                boxShadow: i === mainIdx ? '0 0 0 2px rgba(212,148,42,0.25)' : 'none',
                background: '#1C2E14',
              }}>
              <img src={src} alt="" className="w-full h-full" style={{ objectFit: 'contain', padding: 4 }} />
            </button>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <Lightbox images={images} startIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { products, priceMap, loading } = useProducts();
  const { cart, setCount, cartTotal, totalPacks } = useCart(priceMap);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find(p => p.id === params.id);
      if (found) setProduct(found);
      else setNotFound(true);
    }
    if (!loading && products.length === 0) {
      fetch(`/api/products/${params.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setProduct(data); else setNotFound(true); })
        .catch(() => setNotFound(true));
    }
  }, [loading, products, params.id]);

  const getCount = (packSize: string) =>
    cart.find(i => i.productId === params.id && i.packSize === packSize)?.count || 0;

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: 'linear-gradient(170deg,#1A2E12,#1E3414)' }}>
        <div className="text-5xl mb-4 opacity-30">🫙</div>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'rgba(235,225,200,0.9)' }}>Product not found</h2>
        <Link href="/products" className="mt-4 px-6 py-3 rounded-2xl font-bold text-sm no-underline"
          style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#fff' }}>
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen"
        style={{ background: 'linear-gradient(170deg,#1A2E12,#1E3414)' }}>
        <Navbar />
        <div className="pt-[60px] lg:grid lg:grid-cols-2">
          <div className="animate-pulse" style={{ minHeight: 400, background: 'rgba(255,255,255,0.03)' }} />
          <div className="px-8 py-10 space-y-5">
            <div className="h-7 w-1/2 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-10 w-3/4 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-5 w-1/3 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-28 w-full rounded-2xl animate-pulse mt-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      </div>
    );
  }

  const productPrices = priceMap[product.id] || product.prices || {};
  const sizeEntries = Object.entries(productPrices);
  const images = product.images ?? [];
  const priceRange = sizeEntries.length
    ? sizeEntries.length === 1
      ? `₹${sizeEntries[0][1]}`
      : `₹${Math.min(...sizeEntries.map(([, p]) => p))} – ₹${Math.max(...sizeEntries.map(([, p]) => p))}`
    : '';
  const productCartTotal = sizeEntries.reduce((sum, [size, price]) => sum + price * getCount(size), 0);
  const packsInProduct = sizeEntries.reduce((sum, [size]) => sum + getCount(size), 0);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(170deg,#1A2E12 0%,#1E3414 50%,#243818 100%)' }}>

      <Navbar />

      {/* Back button — sits just below the navbar */}
      <button onClick={() => router.back()}
        className="fixed top-[68px] left-4 z-[500] w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: 'rgba(0,0,0,0.60)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path d="M8 1L1 8l7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Two-column layout on desktop ── */}
      <div className="pt-[60px] lg:pt-0 lg:mt-[60px] lg:grid lg:grid-cols-2 lg:h-[calc(100vh-60px)]">

        {/* LEFT — sticky image gallery */}
        <div className="lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] flex flex-col"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>

          {/* Mobile: fixed height. Desktop: fills full left column */}
          <div className="h-[360px] sm:h-[420px] lg:h-full flex flex-col">
            <ImageGallery images={images} productName={product.name} badge={product.badge} />
          </div>
        </div>

        {/* RIGHT — scrollable details */}
        <div className="lg:overflow-y-auto lg:h-[calc(100vh-60px)] pb-36 lg:pb-32">
          <div className="px-5 md:px-8 lg:px-10 pt-8 lg:pt-10 max-w-xl lg:max-w-none mx-auto">

            {/* Header */}
            <div className="mb-6">
              {product.badge && (
                <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold tracking-[2px] uppercase"
                  style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14', boxShadow: '0 2px 12px rgba(212,148,42,0.35)' }}>
                  {product.badge}
                </span>
              )}
              <p className="text-[0.68rem] font-bold tracking-[3.5px] uppercase mb-2" style={{ color: 'rgba(200,180,74,0.50)' }}>
                Crafted by Amma · Homemade · Mysuru
              </p>
              <h1 className="font-display text-[1.8rem] md:text-[2.1rem] font-bold leading-tight mb-3"
                style={{ color: 'rgba(235,225,200,0.97)' }}>
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[1.6rem] font-bold" style={{ color: '#D4942A' }}>{priceRange}</span>
                <span className="text-sm" style={{ color: 'rgba(235,225,200,0.35)' }}>per pack</span>
              </div>
            </div>

            <div className="h-px mb-6" style={{ background: 'rgba(200,180,74,0.10)' }} />

            {/* Description */}
            <div className="mb-6">
              <p className="text-[0.68rem] font-bold tracking-[3px] uppercase mb-3" style={{ color: 'rgba(212,148,42,0.50)' }}>
                About
              </p>
              <p className="text-[0.96rem] leading-[1.9]" style={{ color: 'rgba(235,225,200,0.78)' }}>
                {product.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['✅ 100% Natural', '🚫 No Chemicals', '🌾 Homemade', '📦 Fresh Packed'].map(h => (
                <span key={h} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(90,122,58,0.10)', border: '1px solid rgba(90,122,58,0.18)', color: 'rgba(235,225,200,0.65)' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Ingredients */}
            <div className="rounded-2xl p-5 mb-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,148,42,0.12)' }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'rgba(212,148,42,0.12)' }}>🌾</span>
                <p className="text-[0.68rem] font-bold tracking-[3px] uppercase" style={{ color: 'rgba(212,148,42,0.65)' }}>
                  Ingredients
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(235,225,200,0.70)' }}>
                {product.ingredients}
              </p>
            </div>

            {/* Usage steps */}
            {(product.usage ?? []).map((u, i) => (
              <div key={i} className="rounded-2xl p-5 mb-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(90,122,58,0.14)' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(90,122,58,0.12)' }}>📋</span>
                  <p className="text-[0.68rem] font-bold tracking-[3px] uppercase" style={{ color: 'rgba(90,160,58,0.65)' }}>
                    How to Use · {u.type}
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(235,225,200,0.70)' }}>
                  {u.instructions}
                </p>
              </div>
            ))}

            <div className="h-px my-6" style={{ background: 'rgba(200,180,74,0.10)' }} />

            {/* Pack selector */}
            <div>
              <p className="text-[0.68rem] font-bold tracking-[3px] uppercase mb-4" style={{ color: 'rgba(212,148,42,0.50)' }}>
                Choose Pack Size &amp; Quantity
              </p>
              <div className="space-y-3">
                {sizeEntries.map(([size, price], i) => {
                  const count = getCount(size);
                  const isBest = i === sizeEntries.length - 1 && sizeEntries.length > 1;
                  return (
                    <div key={size}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200"
                      style={{
                        background: count > 0 ? 'rgba(212,148,42,0.07)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${count > 0 ? 'rgba(212,148,42,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        boxShadow: count > 0 ? '0 4px 20px rgba(212,148,42,0.07)' : 'none',
                      }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-display text-base font-bold"
                            style={{ color: count > 0 ? '#D4942A' : 'rgba(235,225,200,0.85)' }}>
                            {size}
                          </span>
                          {isBest && (
                            <span className="text-[0.58rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14' }}>
                              Best Value
                            </span>
                          )}
                        </div>
                        <span className="text-sm" style={{ color: 'rgba(235,225,200,0.38)' }}>
                          ₹{price} per pack
                          {count > 1 && (
                            <span className="ml-2 font-bold" style={{ color: 'rgba(212,148,42,0.65)' }}>
                              · ₹{price * count} total
                            </span>
                          )}
                        </span>
                      </div>

                      {count === 0 ? (
                        <button
                          onClick={() => { trackEvent('add_to_cart', { productId: product.id, packSize: size }); setCount(product.id, size, 1); }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#F5F0E0', boxShadow: '0 3px 14px rgba(90,122,58,0.30)' }}>
                          <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
                            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center rounded-xl overflow-hidden flex-shrink-0"
                          style={{ border: '1.5px solid rgba(212,148,42,0.45)', background: 'rgba(212,148,42,0.08)' }}>
                          <button onClick={() => setCount(product.id, size, Math.max(0, count - 1))}
                            className="w-11 h-11 flex items-center justify-center text-xl font-bold active:scale-90"
                            style={{ color: '#D4942A' }}>−</button>
                          <span className="font-display text-lg font-bold w-8 text-center" style={{ color: '#D4942A' }}>{count}</span>
                          <button onClick={() => setCount(product.id, size, Math.min(10, count + 1))}
                            disabled={count >= 10}
                            className="w-11 h-11 flex items-center justify-center text-xl font-bold active:scale-90 disabled:opacity-30"
                            style={{ color: '#D4942A' }}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {packsInProduct > 0 && (
                <Link href="/cart"
                  className="mt-4 flex items-center justify-between px-5 py-4 rounded-2xl no-underline transition-all active:scale-[.99]"
                  style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.13),rgba(212,148,42,0.06))', border: '1.5px solid rgba(212,148,42,0.28)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🛒</span>
                    <div>
                      <span className="text-xs font-bold tracking-[1.5px] uppercase block" style={{ color: 'rgba(212,148,42,0.60)' }}>
                        {packsInProduct} pack{packsInProduct > 1 ? 's' : ''} selected
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'rgba(235,225,200,0.85)' }}>Go to Cart</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold" style={{ color: '#D4942A' }}>₹{productCartTotal}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4942A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mini cart bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-4 md:pb-5 transition-all duration-400
        ${totalPacks > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto">
          <Link href="/cart"
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl no-underline transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#243A1C,#2E4824)', border: '1px solid rgba(212,148,42,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.40)' }}>
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
    </div>
  );
}
