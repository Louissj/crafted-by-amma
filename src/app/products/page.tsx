'use client';

import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { trackEvent } from '@/lib/analytics';
import { ProductCard, ProductSkeleton } from '@/components/sections/ProductShared';

export default function ProductsPage() {
  const { products, priceMap, loading } = useProducts();
  const { cart, setCount, cartTotal, totalPacks } = useCart(priceMap);

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

      {/* Grid */}
      <div className="max-w-[1120px] mx-auto px-4 pb-36">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8">
          {loading ? (
            [0, 1, 2, 3, 4, 5].map(i => <ProductSkeleton key={i} />)
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-24">
              <div className="text-5xl mb-4 opacity-30">🫙</div>
              <p className="text-base font-semibold" style={{ color: 'rgba(235,225,200,0.4)' }}>
                No products available right now
              </p>
            </div>
          ) : (
            products.map((product) => (
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
            ))
          )}
        </div>
      </div>

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
    </div>
  );
}
