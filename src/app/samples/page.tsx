'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { useProducts } from '@/lib/useProducts';
import { useSampleCart, SamplePackOption } from '@/lib/useSampleCart';

type SamplePack = {
  id: string;
  name: string;
  description: string;
  options: SamplePackOption[];
};

function SamplesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preAddId = searchParams.get('product'); // product ID to auto-select

  const { products, loading: productsLoading } = useProducts();
  const { addSamplePack, sampleItems } = useSampleCart();

  const [pack, setPack] = useState<SamplePack | null>(null);
  const [packLoading, setPackLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SamplePackOption | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  // Keep a stable ref to products so effects don't re-fire on product reference changes
  const productsRef = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);

  useEffect(() => {
    fetch('/api/sample-packs')
      .then(r => r.json())
      .then((data: SamplePack[]) => { if (data.length) setPack(data[0]); })
      .catch(() => {})
      .finally(() => setPackLoading(false));
  }, []);

  // Only reset/auto-select when the pack OPTION KEY changes — NOT when products ref changes
  const selectedKey = selectedOption?.key ?? '';
  useEffect(() => {
    if (!selectedKey) return;
    const prods = productsRef.current;
    const opt = selectedOption!;
    if (opt.count >= prods.length && prods.length > 0) {
      // Pack of 10 (or more than total) → auto-select all
      setSelected(prods.map(p => p.id));
    } else {
      // Pre-select the product that came from the badge click, if any
      setSelected(preAddId && prods.find(p => p.id === preAddId) ? [preAddId] : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const isAllLocked = !!(selectedOption && selectedOption.count >= products.length && products.length > 0);

  const toggleProduct = (id: string) => {
    if (!selectedOption || isAllLocked) return; // Pack of 10: locked, no toggling
    const max = selectedOption.count;
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  };

  const canAdd = !!(selectedOption && selected.length === selectedOption.count);

  const handleAdd = () => {
    if (!selectedOption || !canAdd) return;
    addSamplePack({
      packKey: selectedOption.key,
      label: selectedOption.label,
      count: selectedOption.count,
      price: selectedOption.price,
      selectedProducts: selected,
      qty: 1,
    });
    router.push('/cart');
  };

  const existingSample = selectedOption
    ? sampleItems.find(i => i.packKey === selectedOption.key)
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(170deg,#1A2E12 0%,#1E3414 40%,#243818 100%)' }}>
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 px-4 text-center">
        <p className="text-[0.65rem] font-bold tracking-[5px] uppercase mb-2" style={{ color: 'rgba(212,148,42,0.55)' }}>
          Try Before You Buy
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: 'rgba(235,225,200,0.97)' }}>
          Sample Packs
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(235,225,200,0.45)' }}>
          Pick any products as a tasting sample. Perfect for gifting or first-time orders.
        </p>
        {preAddId && !selectedOption && (
          <p className="mt-3 text-xs font-semibold" style={{ color: 'rgba(212,148,42,0.65)' }}>
            ↓ Choose a pack size to add this product
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-40">

        {/* ── Step 1: Pack size selector ── */}
        <p className="text-[0.62rem] font-bold tracking-[3px] uppercase mb-3" style={{ color: 'rgba(235,225,200,0.25)' }}>
          Step 1 — Choose your pack size
        </p>

        {packLoading ? (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[0, 1, 2].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
          </div>
        ) : pack ? (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {pack.options.map(opt => {
              const isActive = selectedOption?.key === opt.key;
              const productsCount = productsRef.current.length;
              return (
                <button key={opt.key} onClick={() => setSelectedOption(opt)}
                  className="flex flex-col items-center gap-1.5 px-2 py-4 rounded-2xl transition-all active:scale-[.97]"
                  style={{
                    background: isActive ? 'rgba(212,148,42,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${isActive ? 'rgba(212,148,42,0.60)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isActive ? '0 6px 24px rgba(212,148,42,0.14)' : 'none',
                  }}>
                  <span className="font-display text-lg font-bold" style={{ color: isActive ? '#D4942A' : 'rgba(235,225,200,0.75)' }}>
                    {opt.label}
                  </span>
                  {/* Price row */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-display text-base font-bold" style={{ color: isActive ? '#D4942A' : 'rgba(235,225,200,0.50)' }}>
                      ₹{opt.price}
                    </span>
                    {opt.mrp && opt.mrp > opt.price && (
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-[0.65rem]" style={{ color: 'rgba(235,225,200,0.22)' }}>₹{opt.mrp}</span>
                        <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.15)', color: 'rgba(74,222,128,0.9)' }}>
                          {Math.round((1 - opt.price / opt.mrp) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[0.58rem] font-semibold tracking-wide text-center" style={{ color: 'rgba(235,225,200,0.28)' }}>
                    {opt.count >= productsCount && productsCount > 0 ? 'All products' : `Choose any ${opt.count}`}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 mb-8">
            <p className="text-sm" style={{ color: 'rgba(235,225,200,0.30)' }}>Sample packs not available</p>
          </div>
        )}

        {/* ── Step 2: Product selection ── */}
        {selectedOption && (
          <>
            <p className="text-[0.62rem] font-bold tracking-[3px] uppercase mb-3" style={{ color: 'rgba(235,225,200,0.25)' }}>
              Step 2 — Select products
            </p>

            {/* Counter + progress */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'rgba(235,225,200,0.55)' }}>
                {isAllLocked ? (
                  <>
                    All products included
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full tracking-wide"
                      style={{ background: 'rgba(212,148,42,0.12)', border: '1px solid rgba(212,148,42,0.25)', color: 'rgba(212,148,42,0.70)' }}>
                      🔒 Locked
                    </span>
                  </>
                ) : `Select any ${selectedOption.count} products`}
              </p>
              <span className="font-display text-lg font-bold"
                style={{ color: selected.length === selectedOption.count ? '#D4942A' : 'rgba(235,225,200,0.35)' }}>
                {selected.length} / {selectedOption.count}
              </span>
            </div>

            <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (selected.length / selectedOption.count) * 100)}%`,
                  background: selected.length === selectedOption.count
                    ? 'linear-gradient(90deg,#5A7A3A,#D4942A)'
                    : 'linear-gradient(90deg,#5A7A3A,#4a8030)',
                }} />
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {productsLoading
                ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))
                : products.map(product => {
                    const isSelected = selected.includes(product.id);
                    const isMaxed = !isSelected && selected.length >= selectedOption.count;
                    const img = product.images?.[0];

                    return (
                      <button key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all active:scale-[.97]"
                        style={{
                          background: isSelected
                            ? 'rgba(212,148,42,0.10)'
                            : isMaxed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${isSelected ? 'rgba(212,148,42,0.52)' : 'rgba(255,255,255,0.08)'}`,
                          opacity: isMaxed ? 0.4 : 1,
                          cursor: isAllLocked ? 'default' : isMaxed ? 'not-allowed' : 'pointer',
                          boxShadow: isSelected ? '0 3px 14px rgba(212,148,42,0.10)' : 'none',
                        }}>

                        {/* Checkbox */}
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg,#D4942A,#B87323)'
                              : 'rgba(255,255,255,0.06)',
                            border: `1.5px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.14)'}`,
                          }}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {img ? (
                            <Image src={img} alt={product.shortName} width={44} height={44} unoptimized
                              className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20 text-lg">🫙</div>
                          )}
                        </div>

                        {/* Name */}
                        <span className="text-xs font-semibold leading-snug flex-1 min-w-0"
                          style={{ color: isSelected ? 'rgba(235,225,200,0.95)' : 'rgba(235,225,200,0.55)' }}>
                          {product.shortName}
                        </span>
                      </button>
                    );
                  })}
            </div>
          </>
        )}

        {/* No option selected prompt */}
        {!selectedOption && !packLoading && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3 opacity-20">☝️</div>
            <p className="text-sm" style={{ color: 'rgba(235,225,200,0.30)' }}>Select a pack size above to get started</p>
          </div>
        )}
      </div>

      {/* ── Sticky bottom bar ── */}
      {selectedOption && (
        <div className="fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-5">
          <div className="max-w-md mx-auto space-y-2">

            {existingSample && (
              <div className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: 'rgba(90,122,58,0.15)', border: '1px solid rgba(90,122,58,0.25)' }}>
                <span className="text-xs font-semibold" style={{ color: 'rgba(180,220,130,0.80)' }}>
                  ✓ {existingSample.label} already in cart
                </span>
                <Link href="/cart" className="text-xs font-bold no-underline" style={{ color: '#D4942A' }}>View Cart →</Link>
              </div>
            )}

            <button onClick={handleAdd} disabled={!canAdd}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all active:scale-[.98]"
              style={{
                background: canAdd
                  ? 'linear-gradient(135deg,#5A7A3A,#4a6830)'
                  : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${canAdd ? 'rgba(90,122,58,0.55)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: canAdd ? '0 8px 28px rgba(90,122,58,0.22)' : 'none',
                color: canAdd ? '#F5F0E0' : 'rgba(235,225,200,0.25)',
                cursor: canAdd ? 'pointer' : 'not-allowed',
              }}>
              <span className="text-sm tracking-wide">
                {canAdd
                    ? `Add ${selectedOption.label} to Cart`
                    : `Select ${selectedOption.count - selected.length} more product${selectedOption.count - selected.length !== 1 ? 's' : ''}`}
              </span>
              <span className="font-display text-lg">₹{selectedOption.price}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SamplesPage() {
  return (
    <Suspense>
      <SamplesContent />
    </Suspense>
  );
}
