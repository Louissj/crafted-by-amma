'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { PRODUCTS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';

type DeliverySettings = { baseCharge: number; outstationCharge: number; freeAboveAmt: number; karnatakFree: boolean; note: string };

export default function CartPage() {
  const router = useRouter();
  const { priceMap } = useProducts();
  const { cart, setCount, clearCart, cartTotal, totalPacks, mounted } = useCart(priceMap);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);

  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeState, setPincodeState] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'karnataka' | 'india' | 'international'>('india');
  const [pincodeRequired, setPincodeRequired] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ productId: string; packSize: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/delivery').then(r => r.json()).then(setDelivery).catch(() => {});
    trackEvent('cart_view');

    // Restore any previously entered pincode/zone from sessionStorage
    try {
      const saved = sessionStorage.getItem('amma_delivery');
      if (saved) {
        const { pincode: p, deliveryZone: z } = JSON.parse(saved);
        if (p) setPincode(p);
        if (z) setDeliveryZone(z);
      }
    } catch { /* ignore */ }
  }, []);

  function isKarnatakaPincode(pin: string) {
    const n = parseInt(pin, 10);
    return n >= 560001 && n <= 597999;
  }

  useEffect(() => {
    if (deliveryZone === 'international') return;
    const pin = pincode.replace(/\D/g, '');
    if (pin.length !== 6) {
      setPincodeState('');
      setPincodeError('');
      setDeliveryZone('india');
      return;
    }
    setPincodeLoading(true);
    setPincodeError('');
    setPincodeState('');
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then(r => r.json())
      .then(data => {
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setPincodeState(po.State || '');
          setDeliveryZone(isKarnatakaPincode(pin) ? 'karnataka' : 'india');
        } else {
          setPincodeError('Pincode not found');
          setDeliveryZone('india');
        }
      })
      .catch(() => setPincodeError('Could not verify pincode'))
      .finally(() => setPincodeLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode]);

  function parseKg(packSize: string): number {
    const lower = packSize.toLowerCase();
    const gMatch = lower.match(/(\d+(?:\.\d+)?)\s*g\b/);
    if (gMatch) return parseFloat(gMatch[1]) / 1000;
    const kgMatch = lower.match(/(\d+(?:\.\d+)?)\s*kg/);
    if (kgMatch) return parseFloat(kgMatch[1]);
    return 1;
  }

  const deliveryCharge = useMemo(() => {
    if (!delivery) return 0;
    if (deliveryZone === 'international') return 0;
    if (!pincodeState) return 0; // don't show charge until pincode is verified
    if (deliveryZone === 'karnataka') {
      if (delivery.karnatakFree && cartTotal >= delivery.freeAboveAmt) return 0;
      return delivery.baseCharge;
    }
    // India outstation: ₹120 per kg
    const totalKg = cart.reduce((sum, item) => sum + parseKg(item.packSize) * item.count, 0);
    const perKgRate = delivery.outstationCharge ?? 120;
    return Math.round(totalKg * perKgRate);
  }, [delivery, deliveryZone, cartTotal, pincodeState, cart]);

  const grandTotal = cartTotal + deliveryCharge;

  const goToCheckout = useCallback(() => {
    if (deliveryZone !== 'international' && !pincodeState) {
      setPincodeRequired(true);
      document.getElementById('pincode-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    try {
      sessionStorage.setItem('amma_delivery', JSON.stringify({ pincode, deliveryZone }));
    } catch { /* ignore */ }
    router.push('/checkout');
  }, [pincode, deliveryZone, pincodeState, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F4EF' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sage/30 border-t-sage animate-spin" />
          <span className="text-xs text-forest/50 tracking-[2px] uppercase">Loading</span>
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
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)' }}>
                  {totalPacks} {totalPacks === 1 ? 'pack' : 'packs'}
                </span>
              )}
            </div>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setConfirmClearAll(true)} className="text-xs font-semibold text-red-400/70 hover:text-red-500 transition-colors">
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
                          <span className="inline-block mt-0.5 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(212,148,42,0.1)', color: '#D4942A' }}>
                            {product.badge}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-sage">₹{productSubtotal}</span>
                          <p className="text-xs text-forest/50">{items.reduce((s, i) => s + i.count, 0)} packs</p>
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
                                  <span className="text-xs text-forest/55">₹{unitPrice}/pack</span>
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

                                <button onClick={() => setConfirmRemove({ productId: item.productId, packSize: item.packSize })}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-forest/20 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
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
                  className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm tracking-[1.5px] uppercase no-underline transition-all hover:shadow-xl active:scale-[.98]"
                  style={{ background: 'linear-gradient(135deg,#2A4A1E,#3A6028)', color: '#C8B44A', boxShadow: '0 8px 24px rgba(26,42,20,0.18)' }}>
                  <span className="text-lg leading-none font-bold">+</span> Add More Products
                </Link>
              </div>

              {/* Pincode / delivery section */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="mb-4 bg-white rounded-2xl border border-forest/[.04] overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.05)' }}>

                {/* Header */}
                <div className="px-5 py-4 border-b border-forest/[.05]"
                  style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.03),transparent)' }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">🚚</span>
                    <p className="text-sm font-bold text-forest">Delivery Details</p>
                  </div>
                  <p className="text-xs text-forest/50 ml-6">Enter your pincode to calculate delivery charge</p>
                </div>

                <div className="px-5 py-4 space-y-4">

                  {/* Pincode input row */}
                  <div>
                    <label className="block text-xs font-semibold text-forest/60 mb-1.5">
                      Pincode {deliveryZone !== 'international' && <span className="text-red-400">*</span>}
                      {pincodeRequired && !pincodeState && deliveryZone !== 'international' && (
                        <span className="ml-2 text-red-500 font-semibold normal-case tracking-normal">Please enter your pincode to continue</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        id="pincode-input"
                        value={pincode}
                        onChange={e => {
                          if (deliveryZone !== 'international') {
                            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                            if (pincodeRequired) setPincodeRequired(false);
                          }
                        }}
                        disabled={deliveryZone === 'international'}
                        placeholder="e.g. 560001"
                        inputMode="numeric"
                        maxLength={6}
                        className="w-full pl-4 pr-16 py-3 border-[1.5px] rounded-xl text-sm outline-none transition-all text-forest font-medium
                          disabled:opacity-40 disabled:bg-forest/[.02] disabled:cursor-not-allowed
                          placeholder:text-forest/45 placeholder:font-normal
                          focus:ring-3 focus:ring-sage/[.08]"
                        style={{
                          borderColor: (pincodeRequired && !pincodeState) || pincodeError ? '#f87171' :
                            pincodeState ? (deliveryZone === 'karnataka' ? '#5A7A3A' : '#B87323') :
                            'rgba(26,42,20,0.10)',
                          background: (pincodeRequired && !pincodeState) || pincodeError ? 'rgba(248,113,113,0.04)' :
                            pincodeState ? (deliveryZone === 'karnataka' ? 'rgba(90,122,58,0.04)' : 'rgba(184,115,35,0.04)') :
                            'white',
                        }}
                      />
                      {/* digit counter */}
                      {pincode.length > 0 && pincode.length < 6 && !pincodeLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest/50">
                          {pincode.length}/6
                        </span>
                      )}
                      {/* loading spinner */}
                      {pincodeLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-sage/30 border-t-sage animate-spin block" />
                        </span>
                      )}
                      {/* success tick */}
                      {!pincodeLoading && pincodeState && !pincodeError && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: deliveryZone === 'karnataka' ? 'rgba(90,122,58,0.12)' : 'rgba(184,115,35,0.12)' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke={deliveryZone === 'karnataka' ? '#5A7A3A' : '#B87323'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Status lines */}
                    <AnimatePresence mode="wait">
                      {pincodeLoading && (
                        <motion.div key="loading" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-forest/[.03] border border-forest/[.06]">
                          <span className="w-3 h-3 rounded-full border-2 border-sage/40 border-t-sage animate-spin flex-shrink-0" />
                          <span className="text-xs text-forest/60 font-medium">Detecting your city & delivery zone…</span>
                        </motion.div>
                      )}
                      {!pincodeLoading && pincodeState && !pincodeError && (
                        <motion.div key="success" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-2 flex items-center justify-between px-3 py-2 rounded-lg border"
                          style={{
                            background: deliveryZone === 'karnataka' ? 'rgba(90,122,58,0.06)' : 'rgba(184,115,35,0.06)',
                            borderColor: deliveryZone === 'karnataka' ? 'rgba(90,122,58,0.2)' : 'rgba(184,115,35,0.2)',
                          }}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{deliveryZone === 'karnataka' ? '🏠' : '📦'}</span>
                            <div>
                              <p className="text-xs font-bold" style={{ color: deliveryZone === 'karnataka' ? '#3d6028' : '#8a5a1a' }}>
                                {pincodeState}
                              </p>
                              <p className="text-xs" style={{ color: deliveryZone === 'karnataka' ? '#5A7A3A99' : '#B8732399' }}>
                                {deliveryZone === 'karnataka' ? 'Karnataka · Free delivery eligible' : 'Outside Karnataka · ₹120 per kg'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black" style={{ color: deliveryZone === 'karnataka' ? '#5A7A3A' : '#B87323' }}>
                            {deliveryCharge === 0 ? '₹0' : `₹${deliveryCharge}`}
                          </span>
                        </motion.div>
                      )}
                      {!pincodeLoading && pincode.length > 0 && pincode.length < 6 && (
                        <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="mt-1.5 text-xs text-forest/40">
                          Enter all 6 digits to detect location
                        </motion.p>
                      )}
                      {!pincodeLoading && pincodeError && (
                        <motion.div key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                          <span className="text-sm">⚠️</span>
                          <span className="text-xs text-red-600 font-medium">{pincodeError} — check the pincode and retry</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Free delivery progress / banner */}
                  {!pincodeLoading && deliveryZone === 'karnataka' && delivery && (
                    <>
                      {deliveryCharge > 0 ? (
                        /* Progress bar — not yet free */
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-amber-200/70 overflow-hidden"
                          style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.06),rgba(212,148,42,0.02))' }}>
                          <div className="px-4 pt-3 pb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">🚚</span>
                                <span className="text-xs font-bold text-forest/80">
                                  Add <strong className="text-brass">₹{delivery.freeAboveAmt - cartTotal}</strong> more for free delivery
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-forest/45">
                                ₹{cartTotal} / ₹{delivery.freeAboveAmt}
                              </span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,42,20,0.08)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg,#D4942A,#B87323)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (cartTotal / delivery.freeAboveAmt) * 100)}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                              />
                            </div>
                            <p className="text-xs text-forest/45 mt-1.5">
                              Free delivery on orders ₹{delivery.freeAboveAmt}+ in Karnataka
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        /* Already free */
                        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl border border-sage/25 overflow-hidden"
                          style={{ background: 'linear-gradient(135deg,rgba(90,122,58,0.08),rgba(90,122,58,0.03))' }}>
                          <div className="px-4 pt-3 pb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">🎉</span>
                                <span className="text-xs font-bold text-sage">Free delivery unlocked!</span>
                              </div>
                              <span className="text-xs font-bold text-sage">₹0</span>
                            </div>
                            {/* Full progress bar */}
                            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(90,122,58,0.12)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg,#5A7A3A,#4a6830)' }}
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                              />
                            </div>
                            <p className="text-xs text-forest/50 mt-1.5">
                              You save <strong className="text-sage">₹{delivery.baseCharge}</strong> on delivery · Keep it up! 🌾
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* International checkbox */}
                  <div
                    onClick={() => {
                      if (deliveryZone === 'international') {
                        setDeliveryZone('india');
                        setPincodeState('');
                        setPincodeError('');
                      } else {
                        setDeliveryZone('international');
                        setPincode('');
                        setPincodeState('');
                        setPincodeError('');
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all select-none ${
                      deliveryZone === 'international'
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-forest/[.08] bg-forest/[.02] hover:border-forest/20 hover:bg-forest/[.03]'
                    }`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      deliveryZone === 'international' ? 'border-blue-500 bg-blue-500' : 'border-forest/25 bg-white'
                    }`}>
                      {deliveryZone === 'international' && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${deliveryZone === 'international' ? 'text-blue-700' : 'text-forest/70'}`}>
                        ✈️ International Order
                      </p>
                      <p className={`text-xs mt-0.5 ${deliveryZone === 'international' ? 'text-blue-500' : 'text-forest/40'}`}>
                        Delivery charge confirmed via WhatsApp after payment
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>

              {/* Order summary — receipt style */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mb-6 relative" style={{ filter: 'drop-shadow(0 8px 24px rgba(26,42,20,0.10))' }}>

                {/* Receipt body */}
                <div className="bg-white rounded-t-2xl overflow-hidden">

                  {/* Receipt header */}
                  <div className="px-5 pt-5 pb-4 text-center relative"
                    style={{ background: 'linear-gradient(160deg,#1A2A14 0%,#2d4420 100%)' }}>
                    <div className="text-2xl mb-1">🌾</div>
                    <p className="font-display text-base font-bold text-brass tracking-wide">Crafted by Amma</p>
                    <p className="text-xs text-white/60 tracking-[2px] uppercase mt-0.5">Order Bill</p>
                    <p className="text-xs text-white/50 mt-2">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Perforated edge */}
                  <div className="flex items-center overflow-hidden" style={{ height: '12px', background: '#F7F4EF' }}>
                    <div className="flex gap-0" style={{ marginLeft: '-6px', marginRight: '-6px' }}>
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-4 h-4 rounded-full bg-white border border-forest/[.04]"
                          style={{ marginLeft: '-2px' }} />
                      ))}
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="px-5 pt-4 pb-3 space-y-3.5">
                    {cart.map((item, idx) => {
                      const unitPrice = priceMap[item.productId]?.[item.packSize] || 0;
                      const lineTotal = unitPrice * item.count;
                      const product = PRODUCTS[item.productId as keyof typeof PRODUCTS];
                      const hues = ['#5A7A3A','#D4942A','#7A5A3A','#3A6A7A','#7A3A5A'];
                      const color = hues[idx % hues.length];
                      return (
                        <div key={`${item.productId}-${item.packSize}`} className="flex items-center gap-3">
                          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: color, minHeight: '36px' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-forest leading-tight">{product?.shortName}</p>
                            <p className="text-xs text-forest/55 mt-0.5">
                              {item.packSize} &nbsp;·&nbsp; {item.count} pack{item.count > 1 ? 's' : ''} &nbsp;·&nbsp; ₹{unitPrice} each
                            </p>
                          </div>
                          <span className="text-sm font-bold text-forest flex-shrink-0">₹{lineTotal}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dashed divider */}
                  <div className="mx-5 my-3 border-t-2 border-dashed border-forest/[.08]" />

                  {/* Subtotals */}
                  <div className="px-5 pb-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-forest/60">Products ({totalPacks} pack{totalPacks !== 1 ? 's' : ''})</span>
                      <span className="text-sm font-bold text-forest">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-medium text-forest/60">Delivery</span>
                        {deliveryZone !== 'international' && !pincodeState && (
                          <span className="ml-1.5 text-xs text-forest/55">(enter pincode)</span>
                        )}
                      </div>
                      {deliveryZone === 'international' ? (
                        <span className="text-xs font-bold text-blue-500">TBD ✈️</span>
                      ) : !pincodeState ? (
                        <span className="text-xs text-forest/50">—</span>
                      ) : deliveryCharge === 0 ? (
                        <div className="text-right">
                          <span className="text-sm font-bold text-sage line-through opacity-40 mr-1.5">₹{delivery?.baseCharge ?? 50}</span>
                          <span className="text-sm font-bold text-sage">₹0</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-forest">₹{deliveryCharge}</span>
                      )}
                    </div>

                    {/* Savings callout */}
                    {deliveryZone !== 'international' && deliveryCharge === 0 && pincodeState && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(90,122,58,0.08)', border: '1px solid rgba(90,122,58,0.15)' }}>
                        <span className="text-sm">🏷️</span>
                        <span className="text-sm font-bold text-sage">
                          You save ₹{delivery?.baseCharge ?? 50} — Free delivery applied!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Perforated bottom edge */}
                <div className="flex items-center overflow-hidden" style={{ height: '12px', background: '#F7F4EF' }}>
                  <div className="flex gap-0" style={{ marginLeft: '-6px', marginRight: '-6px' }}>
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-4 h-4 rounded-full bg-white border border-forest/[.04]"
                        style={{ marginLeft: '-2px' }} />
                    ))}
                  </div>
                </div>

                {/* Total footer */}
                <div className="bg-white rounded-b-2xl px-5 py-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[2px] text-forest/40">Total to Pay</p>
                    <p className="font-display text-2xl font-bold mt-0.5" style={{ color: '#1A2A14' }}>
                      {deliveryZone === 'international' ? `₹${cartTotal}` : `₹${grandTotal}`}
                      {deliveryZone === 'international' && <span className="text-sm text-blue-400 ml-1">+</span>}
                    </p>
                    {deliveryZone === 'international'
                      ? <p className="text-xs text-blue-400 mt-0.5">+ delivery via WhatsApp</p>
                      : !pincodeState
                      ? <p className="text-xs text-forest/50 mt-0.5">Enter pincode for exact total</p>
                      : deliveryCharge === 0
                      ? <p className="text-xs font-bold text-sage mt-0.5">Incl. free delivery 🎉</p>
                      : <p className="text-xs text-forest/40 mt-0.5">Incl. ₹{deliveryCharge} delivery</p>
                    }
                  </div>
                  {/* Stamp */}
                  <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 border-dashed flex-shrink-0"
                    style={{ borderColor: 'rgba(90,122,58,0.25)', background: 'rgba(90,122,58,0.04)' }}>
                    <span className="text-[.48rem] font-black uppercase tracking-[1.5px] text-sage/50 text-center leading-tight">UPI<br/>Pay</span>
                    <span className="text-lg leading-none mt-0.5">🌾</span>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <button onClick={goToCheckout}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm tracking-[1.5px] uppercase text-cream-light transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', boxShadow: '0 8px 24px rgba(90,122,58,0.25)' }}>
                  Proceed to Checkout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-center text-xs text-forest/45 mt-2">WhatsApp confirmation within 2 hours</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation popup */}
      <AnimatePresence>
        {(confirmClearAll || confirmRemove) && (
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-5"
            style={{ background: 'rgba(4,10,4,0.70)', backdropFilter: 'blur(10px)' }}
            onClick={() => { setConfirmClearAll(false); setConfirmRemove(null); }}
          >
            <motion.div
              key="confirm-panel"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-[320px] rounded-2xl overflow-hidden"
              style={{ background: '#FFFEF9', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Red top bar */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg,#B83020,#E04530,#B83020)' }} />

              <div className="px-6 py-5">
                {/* Icon + title */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(184,48,32,0.09)' }}>
                    🗑️
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-bold text-forest leading-tight">
                      {confirmClearAll ? 'Clear entire cart?' : 'Remove this item?'}
                    </h3>
                    <p className="text-sm text-forest/50 mt-1 leading-snug">
                      {confirmClearAll
                        ? 'All products will be removed. This cannot be undone.'
                        : `"${confirmRemove?.packSize}" will be removed from your cart.`}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-forest/[.06] mb-4" />

                {/* Buttons */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => { setConfirmClearAll(false); setConfirmRemove(null); }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-forest/60 border border-forest/10 hover:bg-forest/[.03] active:scale-95 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmClearAll) clearCart();
                      if (confirmRemove) setCount(confirmRemove.productId, confirmRemove.packSize, 0);
                      setConfirmClearAll(false);
                      setConfirmRemove(null);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg,#C8341E,#A02818)', boxShadow: '0 4px 16px rgba(200,52,30,0.35)' }}>
                    {confirmClearAll ? 'Clear Cart' : 'Remove'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
