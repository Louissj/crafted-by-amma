'use client';

import Link from 'next/link';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { useSampleCart } from '@/lib/useSampleCart';
import { trackEvent } from '@/lib/analytics';
import { ProductCard, ProductSkeleton } from './ProductShared';

const FEATURED_COUNT = 3;

export default function Products() {
  const { products, priceMap, loading } = useProducts();
  const { cart, setCount, cartTotal, totalPacks } = useCart(priceMap);
  const { sampleTotal, sampleCount } = useSampleCart();

  const featured = products.slice(0, FEATURED_COUNT);
  const hasMore = products.length > FEATURED_COUNT;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8 max-w-[1040px] lg:max-w-[1120px] mx-auto relative z-[2]">
        {loading ? (
          [0, 1, 2].map(i => <ProductSkeleton key={i} />)
        ) : (
          featured.map((product, i) => (
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
              />
            </RevealSection>
          ))
        )}
      </div>

      {/* View All button */}
      {(hasMore || (!loading && products.length > 0)) && (
        <div className="flex justify-center mt-10 relative z-[2]">
          <Link href="/products"
            className="group flex items-center gap-3 px-7 py-4 rounded-2xl no-underline font-bold text-sm tracking-[1.5px] uppercase transition-all hover:scale-[1.03] active:scale-[.98]"
            style={{
              background: 'linear-gradient(135deg,rgba(212,148,42,0.12),rgba(212,148,42,0.06))',
              border: '1.5px solid rgba(212,148,42,0.35)',
              color: '#D4942A',
              boxShadow: '0 4px 24px rgba(212,148,42,0.12)',
            }}>
            <span>Browse All Products</span>
            {hasMore && (
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(212,148,42,0.15)', color: '#D4942A' }}>
                {products.length}+
              </span>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      )}

      {/* Sticky mini cart bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-4 md:pb-5 transition-all duration-400
        ${totalPacks > 0 || sampleCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
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
                  {totalPacks > 0 && `${totalPacks} pack${totalPacks !== 1 ? 's' : ''}`}
                  {totalPacks > 0 && sampleCount > 0 && ' · '}
                  {sampleCount > 0 && `${sampleCount} sample${sampleCount !== 1 ? 's' : ''}`}
                </span>
                <span className="font-display text-sm font-bold" style={{ color: 'rgba(235,225,200,0.85)' }}>View Cart</span>
              </div>
            </div>
            <div className="flex-1" />
            <div className="text-right">
              <span className="font-display text-lg font-bold" style={{ color: '#D4942A' }}>₹{cartTotal + sampleTotal}</span>
              <span className="text-xs block" style={{ color: 'rgba(235,225,200,0.30)' }}>excl. delivery</span>
            </div>
            <span style={{ color: '#D4942A' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
