'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { PRODUCTS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';

type DeliverySettings = { baseCharge: number; freeAboveAmt: number; karnatakFree: boolean; note: string };

export default function CartPage() {
  const { priceMap } = useProducts();
  const { cart, setCount, clearCart, cartTotal, totalPacks, mounted } = useCart(priceMap);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [isKarnataka, setIsKarnataka] = useState(true);

  useEffect(() => {
    fetch('/api/settings/delivery').then(r => r.json()).then(setDelivery).catch(() => {});
    trackEvent('cart_view');
  }, []);

  const deliveryCharge = useMemo(() => {
    if (!delivery) return 0;
    if (isKarnataka && delivery.karnatakFree && cartTotal >= delivery.freeAboveAmt) return 0;
    return delivery.baseCharge;
  }, [delivery, isKarnataka, cartTotal]);

  const grandTotal = cartTotal + deliveryCharge;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F4EF' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sage/30 border-t-sage animate-spin" />
          <span className="text-xs text-forest/30 tracking-[2px] uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F4EF' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-forest/[.05]"
        style={{ background: 'rgba(247,244,239,0.96)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/#prods"
            className="flex items-center gap-1.5 text-xs font-semibold text-forest/40 hover:text-forest transition-colors no-underline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Shop
          </Link>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-forest">Your Cart</span>
              {totalPacks > 0 && (
                <span className="text-[.6rem] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)' }}>
                  {totalPacks} {totalPacks === 1 ? 'pack' : 'packs'}
                </span>
              )}
            </div>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-[.65rem] font-semibold text-red-400/70 hover:text-red-500 transition-colors">
              Clear all
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* Empty state */}
          {cart.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.06),rgba(26,42,20,0.02))' }}>
                🛒
              </div>
              <h2 className="font-display text-2xl font-bold text-forest mb-2">Your cart is empty</h2>
              <p className="text-sm text-forest/40 mb-8 max-w-xs mx-auto">Browse our homemade products and add them to your cart.</p>
              <Link href="/#prods"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm no-underline text-brass transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)', boxShadow: '0 8px 24px rgba(26,42,20,0.2)' }}>
                Browse Products →
              </Link>
            </motion.div>
          )}

          {/* Cart items */}
          {cart.length > 0 && (
            <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Product groups */}
              <div className="space-y-4 mb-6">
                {Object.values(PRODUCTS).map((product, pi) => {
                  const items = cart.filter(i => i.productId === product.id);
                  if (items.length === 0) return null;
                  const productSubtotal = items.reduce(
                    (s, i) => s + (priceMap[i.productId]?.[i.packSize] || 0) * i.count, 0
                  );
                  return (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pi * 0.07 }}
                      className="bg-white rounded-2xl overflow-hidden border border-forest/[.04]"
                      style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.06)' }}>

                      {/* Product header */}
                      <div className="px-5 py-3.5 flex items-center gap-3 border-b border-forest/[.04]"
                        style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.025),transparent)' }}>
                        <div className="flex-1">
                          <h3 className="font-display text-sm font-bold text-forest">{product.name}</h3>
                          <span className="inline-block mt-0.5 text-[.52rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(212,148,42,0.1)', color: '#D4942A' }}>
                            {product.badge}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-sage">₹{productSubtotal}</span>
                          <p className="text-[.55rem] text-forest/30">{items.reduce((s, i) => s + i.count, 0)} packs</p>
                        </div>
                      </div>

                      {/* Size rows */}
                      <div className="divide-y divide-forest/[.03]">
                        <AnimatePresence>
                          {items.map(item => {
                            const unitPrice = priceMap[item.productId]?.[item.packSize] || 0;
                            const lineTotal = unitPrice * item.count;
                            return (
                              <motion.div key={item.packSize} layout
                                className="px-4 py-3 flex items-center gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-bold text-forest block">{item.packSize}</span>
                                  <span className="text-[.58rem] text-forest/35">₹{unitPrice}/pack</span>
                                </div>

                                {/* Counter */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button onClick={() => setCount(item.productId, item.packSize, item.count - 1)}
                                    className="w-8 h-8 rounded-full border-2 border-forest/10 text-forest/50 font-bold flex items-center justify-center hover:border-red-300 hover:text-red-400 hover:bg-red-50 transition-all text-base">
                                    −
                                  </button>
                                  <span className="font-display text-base font-bold text-forest w-5 text-center">{item.count}</span>
                                  <button onClick={() => setCount(item.productId, item.packSize, item.count + 1)}
                                    disabled={item.count >= 10}
                                    className="w-8 h-8 rounded-full border-2 border-forest/10 text-forest/50 font-bold flex items-center justify-center hover:border-sage hover:text-sage hover:bg-sage/[.05] disabled:opacity-20 transition-all text-base">
                                    +
                                  </button>
                                </div>

                                <div className="text-right flex-shrink-0 w-12">
                                  <span className="text-sm font-bold text-sage">₹{lineTotal}</span>
                                </div>

                                <button onClick={() => setCount(item.productId, item.packSize, 0)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[.65rem] text-forest/20 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                                  ✕
                                </button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add more */}
              <div className="flex justify-center mb-6">
                <Link href="/#prods"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage/80 hover:text-sage no-underline border border-sage/15 hover:border-sage/30 px-5 py-2.5 rounded-full transition-all hover:bg-sage/[.03]">
                  <span className="text-base leading-none">+</span> Add more products
                </Link>
              </div>

              {/* Delivery location */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="mb-4 bg-white rounded-2xl border border-forest/[.04] overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.05)' }}>
                <div className="px-5 py-3.5 border-b border-forest/[.04]"
                  style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.025),transparent)' }}>
                  <p className="text-[.58rem] font-bold uppercase tracking-[2.5px] text-forest/40">Delivery Location</p>
                </div>
                <div className="px-5 py-4 flex gap-3">
                  {[
                    { val: true,  label: 'Karnataka',     sub: 'Free delivery eligible', emoji: '🏠' },
                    { val: false, label: 'Outside KA',    sub: `₹${delivery?.baseCharge ?? 50} flat`, emoji: '✈️' },
                  ].map(opt => (
                    <button key={String(opt.val)} type="button" onClick={() => setIsKarnataka(opt.val)}
                      className={`flex-1 py-3.5 px-4 rounded-xl border-2 text-left transition-all ${
                        isKarnataka === opt.val
                          ? 'border-forest text-cream-light'
                          : 'border-forest/[.06] bg-white text-forest/50 hover:border-forest/15'
                      }`}
                      style={isKarnataka === opt.val ? { background: 'linear-gradient(135deg,#1A2A14,#243318)' } : {}}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span>{opt.emoji}</span>
                        <span className="text-sm font-bold">{opt.label}</span>
                      </div>
                      <div className={`text-[.62rem] ${isKarnataka === opt.val ? 'text-white/50' : 'text-forest/30'}`}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
                {delivery?.note && (
                  <div className="px-5 pb-3.5 flex items-center gap-1.5 text-[.65rem] text-forest/35 border-t border-forest/[.03]">
                    <span>🚚</span> {delivery.note}
                  </div>
                )}
              </motion.div>

              {/* Order summary */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mb-6 bg-white rounded-2xl border border-forest/[.04] overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.05)' }}>
                <div className="px-5 py-3.5 border-b border-forest/[.04]"
                  style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.025),transparent)' }}>
                  <p className="text-[.58rem] font-bold uppercase tracking-[2.5px] text-forest/40">Order Summary</p>
                </div>
                <div className="px-5 py-4">
                  <div className="space-y-1.5 mb-3">
                    {cart.map(item => (
                      <div key={`${item.productId}-${item.packSize}`} className="flex justify-between text-xs text-forest/50">
                        <span>{PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName} · {item.packSize} × {item.count}</span>
                        <span className="font-medium">₹{(priceMap[item.productId]?.[item.packSize] || 0) * item.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-forest/[.05] pt-3 space-y-2">
                    <div className="flex justify-between text-xs text-forest/45">
                      <span>Products ({totalPacks} pack{totalPacks !== 1 ? 's' : ''})</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-forest/45">Delivery</span>
                      <span className={deliveryCharge === 0 ? 'text-sage font-bold' : 'text-forest/45'}>
                        {deliveryCharge === 0 ? 'FREE 🎉' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Grand total */}
                <div className="px-5 py-4 flex justify-between items-center border-t border-forest/[.06]"
                  style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.03),transparent)' }}>
                  <span className="font-display text-base font-bold text-forest">Total to Pay</span>
                  <span className="font-display text-xl font-bold text-sage">₹{grandTotal}</span>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Link href="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm tracking-[1.5px] uppercase no-underline text-cream-light transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', boxShadow: '0 8px 24px rgba(90,122,58,0.25)' }}>
                  Proceed to Checkout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className="text-center text-[.58rem] text-forest/25 mt-2">WhatsApp confirmation within 2 hours</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
