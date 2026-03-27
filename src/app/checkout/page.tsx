'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { PRODUCTS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';

type DeliverySettings = { baseCharge: number; outstationCharge: number; freeAboveAmt: number; karnatakFree: boolean; note: string };

const STEPS = ['Details', 'Payment'];

function InputField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-[2px] uppercase text-forest/70 mb-2">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
          <span>⚠</span>{error}
        </p>
      )}
    </div>
  );
}

const inputCls = "w-full px-4 py-3.5 border-[1.5px] border-forest/[.10] rounded-xl text-sm bg-white outline-none focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all placeholder:text-forest/50 text-forest font-medium";
const inputErrCls = "w-full px-4 py-3.5 border-[1.5px] border-red-400/60 rounded-xl text-sm bg-red-50/30 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-forest/50 text-forest font-medium";

export default function CheckoutPage() {
  const { priceMap } = useProducts();
  const { cart, cartTotal, totalPacks, clearCart, mounted } = useCart(priceMap);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', city: '', address: '', pincode: '' });
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeState, setPincodeState] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'karnataka' | 'india' | 'international'>('india');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch('/api/settings/delivery').then(r => r.json()).then(setDelivery).catch(() => {});
    trackEvent('checkout_start');
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));

    // Pre-fill pincode/zone carried over from cart page
    try {
      const saved = sessionStorage.getItem('amma_delivery');
      if (saved) {
        const { pincode: p, deliveryZone: z } = JSON.parse(saved);
        if (p) setPincode(p);
        if (z) setDeliveryZone(z);
        sessionStorage.removeItem('amma_delivery');
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const stateName: string = po.State || '';
          setPincodeState(stateName);
          const isKA = isKarnatakaPincode(pin);
          setDeliveryZone(isKA ? 'karnataka' : 'india');
          setForm(f => ({ ...f, city: po.District || po.Name || f.city }));
        } else {
          setPincodeError('Pincode not found');
          setDeliveryZone('india');
        }
      })
      .catch(() => setPincodeError('Could not verify pincode'))
      .finally(() => setPincodeLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode]);

  const deliveryCharge = useMemo(() => {
    if (!delivery) return 0;
    if (deliveryZone === 'international') return 0;
    if (deliveryZone === 'karnataka') {
      if (delivery.karnatakFree && cartTotal >= delivery.freeAboveAmt) return 0;
      return delivery.baseCharge;
    }
    return delivery.outstationCharge ?? 120;
  }, [delivery, deliveryZone, cartTotal]);

  const grandTotal = cartTotal + deliveryCharge;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const removeFile = () => {
    setFile(null); setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  function validateField(field: keyof typeof fieldErrors, value: string): string {
    if (field === 'name') return value.trim().length < 2 ? 'Enter your full name' : '';
    if (field === 'phone') return !/^(\+91|91)?[6-9]\d{9}$/.test(value.replace(/[\s\-\(\)]/g, '')) ? 'Enter a valid Indian WhatsApp number' : '';
    if (field === 'city') return value.trim().length < 2 ? 'Enter your city' : '';
    if (field === 'address') return value.trim().length < 5 ? 'Enter your full address' : '';
    if (field === 'pincode') {
      if (deliveryZone === 'international') return '';
      if (value.replace(/\D/g, '').length !== 6) return 'Enter a valid 6-digit pincode';
      return '';
    }
    return '';
  }

  function blurField(field: keyof typeof fieldErrors, value: string) {
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  }

  const validateStep1 = () => {
    const errors = {
      name: validateField('name', form.name),
      phone: validateField('phone', form.phone),
      city: validateField('city', form.city),
      address: validateField('address', form.address),
      pincode: validateField('pincode', pincode),
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please upload your payment screenshot.'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('phone', form.phone);
      fd.append('cartItems', JSON.stringify(cart));
      fd.append('city', form.city); fd.append('pincode', pincode); fd.append('deliveryZone', deliveryZone);
      fd.append('address', form.address); fd.append('notes', form.notes);
      fd.append('screenshot', file);
      const res = await fetch('/api/orders', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) { clearCart(); setOrderId(data.orderId || ''); }
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(26,42,20,0.07) 0%, #F0EDE6 50%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-sage/30 border-t-sage animate-spin" />
          <span className="text-xs font-bold tracking-[2px] uppercase text-forest/50">Loading</span>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(90,122,58,0.12), #F0EDE6)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm w-full rounded-[32px] overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(26,42,20,0.14), 0 4px 16px rgba(26,42,20,0.06)' }}>

          {/* Dark header */}
          <div className="px-8 py-8 text-center"
            style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-5xl mb-4">🌾</motion.div>
            <h1 className="font-display text-2xl font-bold mb-1.5" style={{ color: '#D4942A' }}>Order Placed!</h1>
            <p className="text-sm text-white/60">Thank you! We&apos;ll confirm via WhatsApp within 2 hours.</p>

            {/* Order ID pill */}
            <div className="inline-flex items-center gap-2.5 mt-5 px-5 py-2.5 rounded-full"
              style={{ background: 'rgba(212,148,42,0.15)', border: '1px solid rgba(212,148,42,0.3)' }}>
              <span className="text-xs font-bold tracking-[2px] uppercase" style={{ color: 'rgba(212,148,42,0.7)' }}>Order ID</span>
              <span className="font-display text-sm font-bold" style={{ color: '#D4942A' }}>#{orderId.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          {/* White body */}
          <div className="px-8 py-7 bg-white">
            <p className="text-xs text-forest/50 text-center mb-6">
              Use your WhatsApp number to track your order status anytime.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/track"
                className="flex items-center justify-center gap-2 py-[18px] rounded-2xl font-bold text-sm no-underline text-forest transition-all"
                style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', boxShadow: '0 8px 24px rgba(212,148,42,0.25)' }}>
                📦 Track Your Order
              </Link>
              <Link href="/"
                className="flex items-center justify-center py-4 rounded-2xl font-semibold text-sm no-underline text-forest/60 border-[1.5px] border-forest/10 hover:border-forest/20 transition-all">
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(26,42,20,0.07) 0%, #F0EDE6 50%)' }}>
        <div className="text-5xl mb-5">🛒</div>
        <h2 className="font-display text-2xl font-bold text-forest mb-2">Your cart is empty</h2>
        <p className="text-sm text-forest/50 mb-7">Add products to your cart before checking out.</p>
        <div className="flex gap-3">
          <Link href="/#prods"
            className="px-6 py-3.5 rounded-2xl font-bold text-sm no-underline text-forest transition-all"
            style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', boxShadow: '0 6px 20px rgba(212,148,42,0.2)' }}>
            Browse Products
          </Link>
          <Link href="/cart"
            className="px-6 py-3.5 rounded-2xl font-bold text-sm no-underline text-forest/60 border-[1.5px] border-forest/10 hover:border-forest/20 transition-all">
            View Cart
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main checkout ── */
  return (
    <div className="min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(26,42,20,0.07) 0%, #F0EDE6 50%)' }}>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-forest/[.06]"
        style={{ background: 'rgba(240,237,230,0.94)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Link href="/cart"
            className="flex items-center gap-2 text-xs font-semibold text-forest/60 hover:text-forest transition-colors no-underline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Cart
          </Link>
          <div className="flex-1 text-center">
            <span className="font-display text-base font-bold text-forest">🌾 Crafted by Amma</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((label, i) => {
            const stepIcons = ['📋', '💳'];
            const isCompleted = step > i + 1;
            const isActive = step === i + 1;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                    animate={
                      isCompleted
                        ? { background: '#5A7A3A', color: '#fff', boxShadow: '0 4px 16px rgba(90,122,58,0.35)' }
                        : isActive
                        ? { background: '#1A2A14', color: '#D4942A', boxShadow: '0 6px 20px rgba(26,42,20,0.28)' }
                        : { background: 'rgba(26,42,20,0.06)', color: 'rgba(26,42,20,0.3)', boxShadow: 'none' }
                    }>
                    {isCompleted ? '✓' : stepIcons[i]}
                  </motion.div>
                  <span className={`text-xs font-bold tracking-[1px] transition-all ${isActive ? 'text-forest' : isCompleted ? 'text-sage' : 'text-forest/30'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-16 sm:w-28 h-0 mb-6 mx-3 border-t-2 transition-all duration-500 ${step > i + 1 ? 'border-sage border-solid' : 'border-dashed border-forest/20'}`} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: DETAILS ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-[28px] p-7 md:p-9"
              style={{ boxShadow: '0 12px 48px rgba(26,42,20,0.10), 0 2px 8px rgba(26,42,20,0.04)' }}>

              {/* Section title */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-5 bg-sage rounded-full" />
                <h2 className="font-display text-2xl font-bold text-forest">Delivery Details</h2>
              </div>
              <p className="text-sm text-forest/50 mt-1 mb-7 ml-4">We&apos;ll confirm your order via WhatsApp.</p>

              {/* Dark cart mini-summary */}
              <div className="mb-7 rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)' }}>
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10">
                  <div>
                    <p className="text-sm font-bold text-white">🌾 Your Order</p>
                    <p className="text-xs text-white/50 mt-0.5">{totalPacks} pack{totalPacks !== 1 ? 's' : ''} · {cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Link href="/cart" className="text-xs font-semibold no-underline px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: '#D4942A', background: 'rgba(212,148,42,0.12)', border: '1px solid rgba(212,148,42,0.2)' }}>
                    Edit cart →
                  </Link>
                </div>
                <div className="px-5 pb-4 pt-3 space-y-3">
                  {cart.map(item => {
                    const unitPrice = priceMap[item.productId]?.[item.packSize] || 0;
                    return (
                      <div key={`${item.productId}-${item.packSize}`} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white leading-tight">
                            {PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {item.packSize} · {item.count} pack{item.count > 1 ? 's' : ''} × ₹{unitPrice}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-white flex-shrink-0">₹{unitPrice * item.count}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-white/70">Subtotal</span>
                    <span className="text-lg font-bold" style={{ color: '#D4942A' }}>₹{cartTotal}</span>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Full Name *" error={fieldErrors.name}>
                    <input value={form.name}
                      onChange={e => { setForm({ ...form, name: e.target.value }); if (fieldErrors.name) setFieldErrors(p => ({ ...p, name: validateField('name', e.target.value) })); }}
                      onBlur={e => blurField('name', e.target.value)}
                      className={fieldErrors.name ? inputErrCls : inputCls} placeholder="Your full name" />
                  </InputField>
                  <InputField label="WhatsApp Number *" error={fieldErrors.phone}>
                    <input value={form.phone}
                      onChange={e => { setForm({ ...form, phone: e.target.value }); if (fieldErrors.phone) setFieldErrors(p => ({ ...p, phone: validateField('phone', e.target.value) })); }}
                      onBlur={e => blurField('phone', e.target.value)}
                      className={fieldErrors.phone ? inputErrCls : inputCls} placeholder="+91 XXXXX XXXXX" type="tel" />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label={deliveryZone === 'international' ? 'Pincode' : 'Pincode *'} error={fieldErrors.pincode}>
                    <input
                      value={pincode}
                      onChange={e => {
                        if (deliveryZone !== 'international') {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setPincode(val);
                          if (fieldErrors.pincode) setFieldErrors(p => ({ ...p, pincode: val.length === 6 ? '' : 'Enter a valid 6-digit pincode' }));
                        }
                      }}
                      onBlur={() => blurField('pincode', pincode)}
                      className={fieldErrors.pincode ? inputErrCls : inputCls}
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      disabled={deliveryZone === 'international'}
                    />
                    {/* Pincode status pills */}
                    {pincodeLoading && (
                      <span className="inline-flex items-center gap-1.5 mt-2 bg-forest/5 text-forest/50 text-xs px-3 py-1 rounded-full animate-pulse">
                        <span className="w-3 h-3 border border-forest/30 border-t-forest/70 rounded-full animate-spin inline-block" />
                        Detecting location…
                      </span>
                    )}
                    {!pincodeLoading && pincodeState && !pincodeError && !fieldErrors.pincode && (
                      deliveryZone === 'karnataka' ? (
                        <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1.5 rounded-full font-semibold border"
                          style={{ background: 'rgba(90,122,58,0.08)', color: '#5A7A3A', borderColor: 'rgba(90,122,58,0.25)' }}>
                          🏠 {pincodeState} · Karnataka
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1.5 rounded-full font-semibold border"
                          style={{ background: 'rgba(212,148,42,0.08)', color: '#B87323', borderColor: 'rgba(212,148,42,0.25)' }}>
                          📍 {pincodeState} · Outside KA
                        </span>
                      )
                    )}
                    {!pincodeLoading && pincodeError && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1.5 rounded-full font-semibold border border-red-300/50 bg-red-50 text-red-500">
                        ⚠ {pincodeError}
                      </span>
                    )}
                  </InputField>
                  <InputField label="City *" error={fieldErrors.city}>
                    <input value={form.city}
                      onChange={e => { setForm({ ...form, city: e.target.value }); if (fieldErrors.city) setFieldErrors(p => ({ ...p, city: validateField('city', e.target.value) })); }}
                      onBlur={e => blurField('city', e.target.value)}
                      className={fieldErrors.city ? inputErrCls : inputCls} placeholder="Mysuru, Bengaluru…" />
                  </InputField>
                </div>

                {/* International toggle — premium card style */}
                <div
                  className={`rounded-2xl px-4 py-3 cursor-pointer select-none transition-all ${
                    deliveryZone === 'international'
                      ? 'border-[1.5px] border-blue-300 bg-blue-50'
                      : 'border-[1.5px] border-forest/10 bg-forest/[.02]'
                  }`}
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
                      setFieldErrors(p => ({ ...p, pincode: '' }));
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      deliveryZone === 'international'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-forest/20 bg-white'
                    }`}>
                      {deliveryZone === 'international' && (
                        <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold transition-colors ${deliveryZone === 'international' ? 'text-blue-700' : 'text-forest/60'}`}>
                        ✈️ International Order
                      </div>
                      <div className={`text-xs mt-0.5 transition-colors ${deliveryZone === 'international' ? 'text-blue-600/70' : 'text-forest/50'}`}>
                        Delivery charge confirmed via WhatsApp
                      </div>
                    </div>
                  </div>
                </div>

                <InputField label="Full Address *" error={fieldErrors.address}>
                  <textarea value={form.address}
                    onChange={e => { setForm({ ...form, address: e.target.value }); if (fieldErrors.address) setFieldErrors(p => ({ ...p, address: validateField('address', e.target.value) })); }}
                    onBlur={e => blurField('address', e.target.value)}
                    className={`${fieldErrors.address ? inputErrCls : inputCls} resize-y min-h-[88px]`}
                    placeholder="House/Flat no., Street, Landmark, Pincode" />
                </InputField>

                <InputField label="Notes (optional)">
                  <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className={inputCls} placeholder="Any preferences or special instructions…" />
                </InputField>
              </div>

              {/* Delivery status badge */}
              {delivery && (
                <div className={`mt-6 rounded-2xl px-4 py-3 flex items-center justify-between ${
                  deliveryZone === 'international'
                    ? 'bg-blue-50 border border-blue-200'
                    : deliveryCharge === 0
                    ? 'border border-sage/20'
                    : 'bg-amber-50/60 border border-amber-200/60'
                }`}
                style={deliveryZone !== 'international' && deliveryCharge === 0 ? { background: 'rgba(90,122,58,0.08)' } : {}}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{deliveryZone === 'international' ? '✈️' : '🚚'}</span>
                    <div>
                      {deliveryZone === 'international' ? (
                        <>
                          <div className="text-sm font-bold text-blue-700">International Shipping</div>
                          <div className="text-xs text-blue-600/70 mt-0.5">Charge confirmed via WhatsApp</div>
                        </>
                      ) : deliveryCharge === 0 ? (
                        <>
                          <div className="text-sm font-bold" style={{ color: '#5A7A3A' }}>Free Delivery</div>
                          <div className="text-xs text-forest/50 mt-0.5">on your Karnataka order</div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-amber-800">Standard Delivery</div>
                          {delivery.note && <div className="text-xs text-forest/50 mt-0.5">{delivery.note}</div>}
                        </>
                      )}
                    </div>
                  </div>
                  {deliveryZone !== 'international' && (
                    <span className={`text-lg font-bold ${deliveryCharge === 0 ? '' : 'text-amber-700'}`}
                      style={deliveryCharge === 0 ? { color: '#5A7A3A' } : {}}>
                      {deliveryCharge === 0 ? '₹0' : `₹${deliveryCharge}`}
                    </span>
                  )}
                </div>
              )}

              {/* Continue button */}
              <button onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full mt-7 py-[18px] rounded-2xl font-bold text-sm tracking-[1px] transition-all hover:shadow-xl active:scale-[.99]"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)', color: '#D4942A', boxShadow: '0 8px 28px rgba(26,42,20,0.22)' }}>
                Continue to Payment →
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <motion.form key="step2" onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-[28px] p-7 md:p-9"
              style={{ boxShadow: '0 12px 48px rgba(26,42,20,0.10), 0 2px 8px rgba(26,42,20,0.04)' }}>

              {/* Section title */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-5 bg-sage rounded-full" />
                <h2 className="font-display text-2xl font-bold text-forest">Review &amp; Pay</h2>
              </div>
              <p className="text-sm text-forest/50 mt-1 mb-7 ml-4">Tap your UPI app, pay, upload screenshot, done.</p>

              {/* Order summary */}
              <div className="mb-7 rounded-2xl overflow-hidden border border-forest/[.06]">
                {/* Dark header */}
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)' }}>
                  <div>
                    <p className="text-xs font-bold tracking-[2px] uppercase" style={{ color: 'rgba(212,148,42,0.6)' }}>Order Summary</p>
                    <p className="text-sm text-white/60 mt-0.5">{totalPacks} pack{totalPacks !== 1 ? 's' : ''} · {cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-0.5">Total</p>
                    <p className="font-display text-2xl font-bold" style={{ color: '#D4942A' }}>₹{grandTotal}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 pt-4 pb-2 space-y-3">
                  {cart.map(item => {
                    const unitPrice = priceMap[item.productId]?.[item.packSize] || 0;
                    return (
                      <div key={`${item.productId}-${item.packSize}`} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest leading-tight">
                            {PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName}
                          </p>
                          <p className="text-xs text-forest/50 mt-0.5">
                            {item.packSize} · {item.count} pack{item.count > 1 ? 's' : ''} × ₹{unitPrice} each
                          </p>
                        </div>
                        <span className="text-sm font-bold text-forest flex-shrink-0">₹{unitPrice * item.count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="px-5 pt-3 pb-4 space-y-2.5 border-t border-dashed border-forest/10 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-forest/60">Products subtotal</span>
                    <span className="font-semibold text-forest">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-forest/60">Delivery charge</span>
                    {deliveryZone === 'international' ? (
                      <span className="text-xs font-bold text-blue-600">Confirmed via WhatsApp ✈️</span>
                    ) : deliveryCharge === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-forest/30">₹{delivery?.baseCharge ?? 50}</span>
                        <span className="text-sm font-bold" style={{ color: '#5A7A3A' }}>₹0 Free</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-forest">₹{deliveryCharge}</span>
                    )}
                  </div>

                  {/* Savings callout */}
                  {deliveryZone !== 'international' && deliveryCharge === 0 && delivery && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(90,122,58,0.07)', border: '1px solid rgba(90,122,58,0.15)' }}>
                      <span>🏷️</span>
                      <span className="text-xs font-bold" style={{ color: '#5A7A3A' }}>
                        You save ₹{delivery.baseCharge} on delivery!
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-forest/10">
                    <span className="text-base font-bold text-forest">Total to Pay</span>
                    <span className="text-xl font-bold" style={{ color: '#5A7A3A' }}>₹{grandTotal}</span>
                  </div>

                  <p className="text-xs text-forest/50 pt-0.5">
                    Delivering to <strong className="text-forest/70">{form.city || '—'}</strong>
                    {pincode ? <span className="text-forest/40"> · {pincode}</span> : ''}
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[.65rem] font-semibold"
                      style={{
                        background: deliveryZone === 'international' ? 'rgba(59,130,246,0.1)' : deliveryZone === 'karnataka' ? 'rgba(90,122,58,0.1)' : 'rgba(184,115,35,0.1)',
                        color: deliveryZone === 'international' ? '#3b82f6' : deliveryZone === 'karnataka' ? '#5A7A3A' : '#B87323',
                      }}>
                      {deliveryZone === 'international' ? '✈️ International' : deliveryZone === 'karnataka' ? '🏠 Karnataka' : '📦 Outside KA'}
                    </span>
                  </p>
                </div>
              </div>

              {/* UPI Payment */}
              {(() => {
                const upiUrl = `upi://pay?pa=manjulabasavaraj.urs-1@okicici&pn=Crafted%20by%20Amma&am=${grandTotal}&cu=INR&tn=CraftedByAmma%20Order`;
                const upiApps = [
                  {
                    name: 'GPay',
                    url: `tez://upi/pay?pa=manjulabasavaraj.urs-1@okicici&pn=Crafted%20by%20Amma&am=${grandTotal}&cu=INR&tn=CraftedByAmma%20Order`,
                    logo: (
                      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="white"/>
                        <text x="24" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Arial" fill="#4285F4">G</text>
                        <text x="8" y="34" fontSize="9" fontWeight="700" fontFamily="Arial">
                          <tspan fill="#4285F4">P</tspan><tspan fill="#EA4335">a</tspan><tspan fill="#FBBC05">y</tspan>
                        </text>
                        <circle cx="24" cy="17" r="7" fill="none" stroke="#4285F4" strokeWidth="2.5"/>
                        <path d="M24 10 A7 7 0 0 1 31 17" stroke="#EA4335" strokeWidth="2.5" fill="none"/>
                        <path d="M31 17 A7 7 0 0 1 24 24" stroke="#FBBC05" strokeWidth="2.5" fill="none"/>
                        <path d="M24 24 A7 7 0 0 1 17 17" stroke="#34A853" strokeWidth="2.5" fill="none"/>
                        <rect x="20" y="15" width="8" height="4" rx="1" fill="white"/>
                        <rect x="21" y="16" width="4" height="2" rx="0.5" fill="#4285F4"/>
                      </svg>
                    ),
                    bg: '#f8f9ff',
                    border: '#4285F422',
                  },
                  {
                    name: 'PhonePe',
                    url: `phonepe://pay?pa=manjulabasavaraj.urs-1@okicici&pn=Crafted%20by%20Amma&am=${grandTotal}&cu=INR&tn=CraftedByAmma%20Order`,
                    logo: (
                      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="#5F259F"/>
                        <text x="24" y="32" textAnchor="middle" fontSize="20" fontWeight="900" fontFamily="Arial" fill="white">P</text>
                        <circle cx="32" cy="18" r="4" fill="#CBB3F0"/>
                      </svg>
                    ),
                    bg: '#f9f5ff',
                    border: '#5F259F22',
                  },
                  {
                    name: 'Paytm',
                    url: `paytmmp://pay?pa=manjulabasavaraj.urs-1@okicici&pn=Crafted%20by%20Amma&am=${grandTotal}&cu=INR&tn=CraftedByAmma%20Order`,
                    logo: (
                      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="#00B9F1"/>
                        <rect x="8" y="14" width="32" height="20" rx="3" fill="white"/>
                        <text x="24" y="29" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Arial" fill="#00B9F1">Paytm</text>
                      </svg>
                    ),
                    bg: '#f0fbff',
                    border: '#00B9F122',
                  },
                  {
                    name: 'Any UPI',
                    url: upiUrl,
                    logo: (
                      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="white"/>
                        <text x="24" y="22" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="Arial" fill="#6C3D9E">UPI</text>
                        <rect x="8" y="26" width="15" height="3" rx="1.5" fill="#F47920"/>
                        <rect x="25" y="26" width="15" height="3" rx="1.5" fill="#6C3D9E"/>
                      </svg>
                    ),
                    bg: '#fdf8ff',
                    border: '#6C3D9E22',
                  },
                ];
                return (
                  <div className="mb-7 rounded-2xl overflow-hidden border border-brass/15"
                    style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.04),rgba(255,255,255,1))' }}>
                    <div className="px-5 py-4 border-b border-brass/[.10] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-forest">{isMobile ? 'Pay via UPI App' : 'Scan & Pay'}</p>
                        <p className="text-xs text-forest/50 mt-0.5">GPay · PhonePe · Paytm · Any UPI App</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold" style={{ color: '#D4942A' }}>₹{grandTotal}</p>
                      </div>
                    </div>

                    {isMobile ? (
                      /* Mobile: direct app deep-links */
                      <div className="px-5 py-5">
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          {upiApps.map(app => (
                            <a key={app.name} href={app.url}
                              className="flex items-center gap-3 px-4 py-3.5 rounded-xl active:scale-95 transition-transform"
                              style={{ background: app.bg, border: `1.5px solid ${app.border}`, boxShadow: '0 2px 8px rgba(26,42,20,0.06)' }}>
                              {app.logo}
                              <span className="text-sm font-semibold text-forest">{app.name}</span>
                            </a>
                          ))}
                        </div>
                        <p className="text-xs text-center text-forest/60 font-medium">
                          MANJULA H M · <span className="font-mono">manjulabasavaraj.urs-1@okicici</span>
                        </p>
                        <div className="mt-3 flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl"
                          style={{ background: 'rgba(212,148,42,0.08)', border: '1px solid rgba(212,148,42,0.2)' }}>
                          <span className="text-xs font-semibold" style={{ color: '#B87323' }}>
                            ⚠ Verify name &amp; amount before confirming
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Desktop: QR code */
                      <div className="px-5 py-6 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-2xl border border-forest/[.06] mb-4"
                          style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.08)' }}>
                          <QRCodeSVG value={upiUrl} size={168} level="M" fgColor="#1A2A14"
                            imageSettings={{ src: '/images/logo.png', width: 28, height: 28, excavate: true }} />
                        </div>
                        <p className="text-base font-bold text-forest mb-1">MANJULA H M</p>
                        <p className="text-xs font-mono text-forest/50 tracking-wide mb-4">manjulabasavaraj.urs-1@okicici</p>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                          style={{ background: 'rgba(212,148,42,0.08)', border: '1px solid rgba(212,148,42,0.2)' }}>
                          <span className="text-xs font-semibold" style={{ color: '#B87323' }}>
                            ⚠ Verify name &amp; amount before confirming
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Screenshot upload */}
              <div className="mb-6">
                <label className="block text-xs font-bold tracking-[2px] uppercase text-forest/70 mb-3">
                  Upload Payment Screenshot *
                </label>
                <div className={`border-2 rounded-2xl text-center cursor-pointer transition-all relative overflow-hidden min-h-[120px] flex items-center justify-center
                  ${preview ? 'border-sage border-solid bg-sage/[.02]' : 'border-dashed border-forest/15 bg-white hover:border-sage/40 hover:bg-sage/[.01]'}`}>
                  {!preview ? (
                    <div className="flex flex-col items-center gap-2.5 py-8">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(26,42,20,0.05)' }}>
                        📸
                      </div>
                      <div className="text-sm font-semibold text-forest/60">Tap to upload</div>
                      <div className="text-xs text-forest/50">JPG, PNG, WebP · Max 5MB</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4 w-full">
                      <img src={preview} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-sage/30 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-bold text-sage truncate">{file?.name}</div>
                        <div className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(90,122,58,0.1)', color: '#5A7A3A' }}>
                          ✓ Ready to submit
                        </div>
                      </div>
                      <button type="button" onClick={removeFile}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-red-400/70 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 border border-red-200/50">
                        ✕
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-sm text-red-500 mb-5 flex items-center gap-2 font-medium px-4 py-3 rounded-xl bg-red-50 border border-red-200/50">
                    <span>⚠</span>{error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="px-5 py-[18px] rounded-2xl text-sm font-semibold text-forest/60 border-[1.5px] border-forest/10 hover:border-forest/20 transition-all flex-shrink-0">
                  ← Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-[18px] rounded-2xl text-sm font-bold tracking-[1px] disabled:opacity-50 transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#fff', boxShadow: '0 8px 24px rgba(90,122,58,0.28)' }}>
                  {submitting
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing Order…
                      </span>
                    : '✨ Place Order'}
                </button>
              </div>
              <p className="text-xs text-forest/50 text-center mt-3">WhatsApp confirmation within 2 hours</p>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
