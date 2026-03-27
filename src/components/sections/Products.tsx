'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';
import { useCart } from '@/lib/useCart';
import { useProducts, DbProduct } from '@/lib/useProducts';
import { trackEvent } from '@/lib/analytics';

/* ─── SVG icons ─── */
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
    <path d="M8 1L1 8l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
    <path d="M1 1l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
  const [imgIdx, setImgIdx] = useState(0);
  const [visible, setVisible] = useState(false);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % Math.max(images.length, 1));
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 260);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4"
      style={{
        background: `rgba(2,6,2,${visible ? '0.88' : '0'})`,
        backdropFilter: 'blur(20px)',
        transition: 'background 0.26s ease',
      }}
      onClick={handleClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full md:max-w-[560px] rounded-t-[28px] md:rounded-[24px] overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(145deg,#1E3014,#192C10)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
          maxHeight: '92vh',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.26s cubic-bezier(0.34,1.56,0.64,1), opacity 0.26s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(200,180,74,0.6),rgba(212,148,42,0.9),rgba(200,180,74,0.6),transparent)' }} />

        {/* ── Top: Image gallery ── */}
        <div className="relative w-full flex-shrink-0 flex flex-col"
          style={{ background: 'linear-gradient(160deg,#263C1C,#1C3012)' }}>

          {/* Main image */}
          <div className="relative overflow-hidden" style={{ height: 280 }}>
            {images.length > 0 ? images.map((src, i) => (
              <img key={i} src={src} alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
                style={{ opacity: i === imgIdx ? 1 : 0 }}
              />
            )) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-10">🫙</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top,rgba(13,21,9,0.7) 0%,transparent 50%)' }} />

            {/* Badge */}
            {product.badge && (
              <span className="absolute top-4 left-4 z-[3] px-3 py-1 rounded-full text-xs font-bold tracking-[2px] uppercase"
                style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14', boxShadow: '0 2px 12px rgba(212,148,42,0.4)' }}>
                {product.badge}
              </span>
            )}

            {/* Prev/Next on image */}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-[3] transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}>
                  <ChevronLeft />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-[3] transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}>
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 justify-center" style={{ background: 'rgba(0,0,0,0.25)' }}>
              {images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className="rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200"
                  style={{
                    width: 48, height: 48,
                    border: `2px solid ${i === imgIdx ? 'rgba(200,180,74,0.7)' : 'rgba(255,255,255,0.08)'}`,
                    opacity: i === imgIdx ? 1 : 0.4,
                    transform: i === imgIdx ? 'scale(1.06)' : 'scale(1)',
                  }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom: Details + Order ── */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 md:p-6 flex-1 flex flex-col">

            {/* Header */}
            <div className="mb-4">
              <p className="text-[.82rem] font-bold tracking-[3px] uppercase mb-1.5" style={{ color: 'rgba(200,180,74,0.55)' }}>
                Crafted by Amma · Homemade
              </p>
              <h2 className="font-display text-[1.35rem] md:text-[1.6rem] font-bold leading-tight mb-2"
                style={{ color: 'rgba(235,225,200,0.95)' }}>
                {product.name}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(235,225,200,0.78)' }}>
                {product.description}
              </p>
            </div>

            {/* Price range */}
            <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-display text-[1.25rem] font-bold" style={{ color: '#D4942A' }}>{priceRange}</span>
              <span className="text-xs tracking-[1.5px] uppercase" style={{ color: 'rgba(235,225,200,0.3)' }}>per pack · incl. all sizes</span>
            </div>

            {/* Ingredients */}
            <div className="mb-3 px-3.5 py-3 rounded-xl" style={{ background: 'rgba(90,122,58,0.06)', border: '1px solid rgba(90,122,58,0.09)' }}>
              <span className="text-xs font-bold tracking-[2.5px] uppercase block mb-1.5" style={{ color: 'rgba(212,148,42,0.55)' }}>
                🌾 Ingredients
              </span>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(235,225,200,0.78)' }}>{product.ingredients}</p>
            </div>

            {/* Usage */}
            {(product.usage ?? []).map((u, i) => (
              <div key={i} className="mb-3 px-3.5 py-3 rounded-xl" style={{ background: 'rgba(90,122,58,0.06)', border: '1px solid rgba(90,122,58,0.09)' }}>
                <span className="text-xs font-bold tracking-[2.5px] uppercase block mb-1.5" style={{ color: 'rgba(212,148,42,0.55)' }}>
                  📋 How to Use · {u.type}
                </span>
                <p className="text-base leading-relaxed" style={{ color: 'rgba(235,225,200,0.78)' }}>{u.instructions}</p>
              </div>
            ))}

            {/* Pack size selector */}
            <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-bold tracking-[2.5px] uppercase mb-3" style={{ color: 'rgba(235,225,200,0.28)' }}>
                Choose Pack Size &amp; Quantity
              </p>
              <div className="space-y-2">
                {sizeEntries.map(([size, price], i) => {
                  const count = getCount(size);
                  const isActive = count > 0;
                  const isBest = i === sizeEntries.length - 1;
                  return (
                    <div key={size}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200"
                      style={{
                        background: isActive ? 'rgba(212,148,42,0.09)' : 'rgba(255,255,255,0.025)',
                        border: `1.5px solid ${isActive ? 'rgba(212,148,42,0.35)' : 'rgba(255,255,255,0.055)'}`,
                      }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold" style={{ color: isActive ? '#D4942A' : 'rgba(235,225,200,0.70)' }}>
                            {size}
                          </span>
                          {isBest && (
                            <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                              style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14' }}>
                              Best Value
                            </span>
                          )}
                        </div>
                        <span className="text-sm" style={{ color: 'rgba(235,225,200,0.35)' }}>₹{price} per pack</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button"
                          onClick={() => onCountChange(size, Math.max(0, count - 1))}
                          disabled={count <= 0}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all disabled:opacity-20"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.10)', color: 'rgba(235,225,200,0.65)' }}>
                          −
                        </button>
                        <span className="font-display text-base font-bold w-5 text-center"
                          style={{ color: isActive ? '#D4942A' : 'rgba(235,225,200,0.3)' }}>
                          {count}
                        </span>
                        <button type="button"
                          onClick={() => onCountChange(size, Math.min(10, count + 1))}
                          disabled={count >= 10}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all disabled:opacity-20"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.10)', color: 'rgba(235,225,200,0.65)' }}>
                          +
                        </button>
                      </div>

                      <div className="w-12 text-right flex-shrink-0">
                        {isActive
                          ? <span className="font-display text-sm font-bold" style={{ color: '#D4942A' }}>₹{price * count}</span>
                          : <span className="text-xs" style={{ color: 'rgba(235,225,200,0.16)' }}>—</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View cart CTA */}
              {hasSelection ? (
                <Link href="/cart" onClick={handleClose}
                  className="mt-4 flex items-center justify-between px-4 py-3.5 rounded-xl no-underline transition-all hover:scale-[1.01] active:scale-[.99]"
                  style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.18),rgba(212,148,42,0.09))', border: '1.5px solid rgba(212,148,42,0.35)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛒</span>
                    <span className="text-xs font-bold" style={{ color: 'rgba(212,148,42,0.85)' }}>View Cart</span>
                  </div>
                  <span className="font-display text-base font-bold" style={{ color: '#D4942A' }}>₹{cardTotal} →</span>
                </Link>
              ) : (
                <p className="mt-3 text-center text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Select a pack size above to add to cart
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-20 transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

/* ─── Product Card (simplified) ─── */
function ProductCard({
  product,
  priceMap,
  getCount,
  onOpen,
}: {
  product: DbProduct;
  priceMap: Record<string, Record<string, number>>;
  getCount: (packSize: string) => number;
  onOpen: () => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const productPrices = priceMap[product.id] || product.prices || {};
  const sizeEntries = Object.entries(productPrices);
  const images = product.images ?? [];
  const totalInCart = sizeEntries.reduce((sum, [size, price]) => sum + price * getCount(size), 0);
  const packsInCart = sizeEntries.reduce((sum, [size]) => sum + getCount(size), 0);
  const minPrice = sizeEntries.length ? Math.min(...sizeEntries.map(([, p]) => p)) : 0;

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActiveImg(p => (p + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div
      className="group rounded-[24px] overflow-hidden cursor-pointer transition-all duration-400 hover:-translate-y-1.5 h-full flex flex-col"
      style={{
        background: 'linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.04))',
        border: `1px solid ${packsInCart > 0 ? 'rgba(212,148,42,0.4)' : 'rgba(255,255,255,0.14)'}`,
        boxShadow: packsInCart > 0 ? '0 8px 40px rgba(212,148,42,0.12)' : '0 8px 30px rgba(0,0,0,0.25)',
        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.4s',
      }}
      onClick={onOpen}
    >
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 260, background: 'linear-gradient(160deg,#2A4020,#1E3418)' }}>
        {images.length > 0 ? images.map((img, i) => (
          <Image key={i} src={img} alt={product.name} width={640} height={400} unoptimized
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]
              ${i === activeImg ? 'opacity-100' : 'opacity-0'}`} />
        )) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-6xl opacity-10">🫙</span>
            <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(235,225,200,0.2)' }}>No image</span>
          </div>
        )}

        {/* Overlay on hover */}
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

        {/* Gradient bottom */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)' }} />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-4 left-4 z-[3] px-3 py-1 rounded-full text-xs font-bold tracking-[2px] uppercase"
            style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', color: '#1A2A14', boxShadow: '0 2px 12px rgba(212,148,42,0.4)' }}>
            {product.badge}
          </span>
        )}

        {/* Cart indicator */}
        {packsInCart > 0 && (
          <div className="absolute top-4 right-4 z-[3] px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: 'rgba(212,148,42,0.18)', border: '1px solid rgba(212,148,42,0.45)', backdropFilter: 'blur(8px)' }}>
            <span className="text-xs">🛒</span>
            <span className="font-display text-[.82rem] font-bold" style={{ color: '#D4942A' }}>{packsInCart}</span>
          </div>
        )}

        {/* Image dots */}
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
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-xl font-bold leading-snug mb-1.5" style={{ color: 'rgba(235,225,200,0.98)' }}>
          {product.name}
        </h3>
        <p className="text-base leading-relaxed mb-4 line-clamp-2" style={{ color: 'rgba(235,225,200,0.72)' }}>
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-sm font-bold tracking-[2px] uppercase block mb-0.5" style={{ color: 'rgba(235,225,200,0.60)' }}>Starting from</span>
            <span className="font-display text-[1.1rem] font-bold" style={{ color: '#D4942A' }}>₹{minPrice}</span>
          </div>
          <button
            onClick={onOpen}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.15),rgba(212,148,42,0.07))', border: '1.5px solid rgba(212,148,42,0.28)', color: 'rgba(212,148,42,0.9)' }}>
            {packsInCart > 0 ? `In Cart · ₹${totalInCart}` : 'Order Now'}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton loader ─── */
function ProductSkeleton() {
  return (
    <div className="rounded-[24px] overflow-hidden animate-pulse" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
      <div className="h-[260px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 w-full rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-3 w-4/5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-10 w-full rounded-xl mt-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
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

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full opacity-[.08]"
          style={{ background: 'radial-gradient(circle,#D4942A,transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[36rem] h-[36rem] rounded-full opacity-[.08]"
          style={{ background: 'radial-gradient(circle,#5A7A3A,transparent 70%)' }} />
      </div>

      <SectionHeader tag="Our Products" title="Amma's Signature Recipes" dark />

      <div className="max-w-[1040px] lg:max-w-[1120px] mx-auto mb-8 relative z-[2]">
        <p className="text-center text-base tracking-wide" style={{ color: 'rgba(235,225,200,0.72)' }}>
          Tap any product to explore details, pick your size &amp; place your order
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
                onOpen={() => setOpenProduct(product)}
              />
            </RevealSection>
          ))
        )}
      </div>

      {/* Product modal */}
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

      {/* ── Sticky mini cart bar ── */}
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
