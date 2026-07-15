'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { trackEvent } from '@/lib/analytics';
import { ProductCard, ProductSkeleton } from '@/components/sections/ProductShared';
import { useSampleCart } from '@/lib/useSampleCart';

export default function ProductsPage() {
  const router = useRouter();
  const { products, priceMap, loading } = useProducts();
  const { cart, setCount, cartTotal, totalPacks } = useCart(priceMap);
  const { sampleTotal, sampleCount } = useSampleCart();

  const getCount = (productId: string, packSize: string) =>
    cart.find(i => i.productId === productId && i.packSize === packSize)?.count || 0;

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(170deg,#1A2E12 0%,#1E3414 30%,#243818 60%,#1A2E12 100%)' }}>
      <Navbar />

      {/* Page header */}
      <div className="pt-24 pb-10 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[.06]"
            style={{ background: 'radial-gradient(circle,#D4942A,transparent 70%)' }} />
        </div>
        <p className="text-[0.7rem] font-bold tracking-[4px] uppercase mb-3 relative z-[1]"
          style={{ color: 'rgba(212,148,42,0.6)' }}>
          Crafted by Amma
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 relative z-[1]"
          style={{ color: 'rgba(235,225,200,0.96)' }}>
          All Products
        </h1>
        <p className="text-sm relative z-[1]" style={{ color: 'rgba(235,225,200,0.55)' }}>
          {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} · Homemade · Mysuru`}
        </p>
      </div>

      {/* ── Sample Packs section ── */}
      <div className="max-w-[1120px] mx-auto px-4 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ background: 'rgba(212,148,42,0.15)' }} />
          <p className="text-[0.62rem] font-bold tracking-[4px] uppercase" style={{ color: 'rgba(212,148,42,0.50)' }}>Sample Packs</p>
          <div className="h-px flex-1" style={{ background: 'rgba(212,148,42,0.15)' }} />
        </div>
        <div onClick={() => router.push('/samples')} className="group flex flex-col sm:flex-row items-center gap-5 px-6 py-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[.99]"
          style={{
            background: 'linear-gradient(135deg,rgba(212,148,42,0.08),rgba(212,148,42,0.04))',
            border: '1.5px solid rgba(212,148,42,0.22)',
            boxShadow: '0 4px 24px rgba(212,148,42,0.07)',
          }}>
          <div className="flex-shrink-0 flex items-center gap-3">
            {[
              { label: 'Pack of 3', key: 'pack-3', sub: 'Choose 3' },
              { label: 'Pack of 5', key: 'pack-5', sub: 'Choose 5' },
              { label: 'Pack of 11', key: 'pack-10', sub: 'All 11' },
            ].map((opt) => (
              <Link key={opt.key} href={`/samples?pack=${opt.key}`}
                onClick={e => e.stopPropagation()}
                className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl no-underline transition-all hover:scale-[1.05] active:scale-95"
                style={{ background: 'rgba(212,148,42,0.08)', border: '1px solid rgba(212,148,42,0.18)' }}>
                <span className="font-display text-base font-bold" style={{ color: '#D4942A' }}>{opt.label}</span>
                <span className="text-[0.58rem] font-bold uppercase tracking-wider" style={{ color: 'rgba(212,148,42,0.45)' }}>
                  {opt.sub}
                </span>
              </Link>
            ))}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display text-lg font-bold mb-1" style={{ color: 'rgba(235,225,200,0.92)' }}>
              Try a Sample Pack
            </p>
            <p className="text-sm mb-3" style={{ color: 'rgba(235,225,200,0.40)' }}>
              Not sure what to order? Pick any 3, 5, or all 11 products as a tasting sample.
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide"
              style={{ background: 'rgba(212,148,42,0.12)', border: '1px solid rgba(212,148,42,0.30)', color: '#D4942A' }}>
              {sampleCount > 0 ? `${sampleCount} sample pack in cart · ₹${sampleTotal}` : 'Build your sample pack →'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Products by category ── */}
      {loading ? (
        <div className="max-w-[1120px] mx-auto px-4 pb-36">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8">
            {[0, 1, 2, 3, 4, 5].map(i => <ProductSkeleton key={i} />)}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="max-w-[1120px] mx-auto px-4 pb-36 text-center py-24">
          <div className="text-5xl mb-4 opacity-30">🫙</div>
          <p className="text-base font-semibold" style={{ color: 'rgba(235,225,200,0.4)' }}>No products available right now</p>
        </div>
      ) : (
        <div className="max-w-[1120px] mx-auto px-4 pb-36 space-y-14">
          {[
            { key: 'staples', label: '🌾 Powders & Spices', color: 'rgba(235,225,200,0.22)' },
            { key: 'snacks',  label: '🍘 Snacks',           color: 'rgba(212,148,42,0.50)'  },
            { key: 'sweets',  label: '🍬 Sweets',           color: 'rgba(212,100,100,0.50)'  },
          ].map(({ key, label, color }) => {
            const group = products.filter(p => (p.category || 'staples') === key);
            if (group.length === 0) return null;
            return (
              <div key={key}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <p className="text-[0.62rem] font-bold tracking-[4px] uppercase" style={{ color }}>{label}</p>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8">
                  {group.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priceMap={priceMap}
                      getCount={(packSize) => getCount(product.id, packSize)}
                      onCountChange={(packSize, count) => {
                        const prev = getCount(product.id, packSize);
                        if (count > prev) trackEvent('add_to_cart', { productId: product.id, packSize });
                        setCount(product.id, packSize, count);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
