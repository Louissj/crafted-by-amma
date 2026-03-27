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

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[.57rem] font-bold tracking-[2.5px] uppercase text-forest/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 border-[1.5px] border-forest/[.07] rounded-xl text-sm bg-white outline-none focus:border-sage/60 focus:ring-3 focus:ring-sage/[.06] transition-all placeholder:text-forest/25 text-forest";

export default function CheckoutPage() {
  const { priceMap } = useProducts();
  const { cart, cartTotal, totalPacks, clearCart, mounted } = useCart(priceMap);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
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
          if (!form.city) setForm(f => ({ ...f, city: po.District || po.Name || '' }));
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

  const validateStep1 = () => {
    if (!form.name.trim() || form.name.trim().length < 2) { setError('Enter your full name'); return false; }
    const cleaned = form.phone.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(cleaned)) { setError('Enter a valid Indian WhatsApp number'); return false; }
    if (!form.city.trim() || form.city.trim().length < 2) { setError('Enter your city'); return false; }
    if (!form.address.trim() || form.address.trim().length < 5) { setError('Enter your full address'); return false; }
    return true;
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F4EF' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sage/30 border-t-sage animate-spin" />
          <span className="text-xs text-forest/30 tracking-[2px] uppercase">Loading</span>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 40% 30%, rgba(90,122,58,0.08) 0%, #F7F4EF 60%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm w-full bg-white rounded-[28px] overflow-hidden border border-forest/[.04]"
          style={{ boxShadow: '0 24px 64px rgba(26,42,20,0.12)' }}>

          {/* Success banner */}
          <div className="px-8 py-7 text-center border-b border-forest/[.05]"
            style={{ background: 'linear-gradient(135deg,rgba(90,122,58,0.06),rgba(90,122,58,0.02))' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-5xl mb-3">✅</motion.div>
            <h1 className="font-display text-2xl font-bold text-forest mb-1">Order Placed!</h1>
            <p className="text-xs text-forest/40">Thank you! We&apos;ll confirm via WhatsApp within 2 hours.</p>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-brass/15 bg-brass/[.03] mb-5">
              <div>
                <p className="text-[.52rem] font-bold uppercase tracking-[2px] text-brass/50">Order ID</p>
                <p className="font-display text-base font-bold text-forest mt-0.5">#{orderId.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-2xl">🌾</div>
            </div>

            <p className="text-[.65rem] text-forest/30 text-center mb-5">
              Use your WhatsApp number to track your order status anytime.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link href="/track"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm no-underline text-forest transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', boxShadow: '0 6px 20px rgba(212,148,42,0.2)' }}>
                📦 Track Your Order
              </Link>
              <Link href="/"
                className="flex items-center justify-center py-3 rounded-2xl font-semibold text-sm no-underline text-forest/50 border-2 border-forest/[.08] hover:border-forest/15 transition-all">
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: '#F7F4EF' }}>
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display text-xl font-bold text-forest mb-2">Your cart is empty</h2>
        <p className="text-sm text-forest/40 mb-6">Add products to your cart before checking out.</p>
        <div className="flex gap-3">
          <Link href="/#prods" className="px-6 py-3 rounded-2xl font-semibold text-sm no-underline text-forest"
            style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)' }}>
            Browse Products
          </Link>
          <Link href="/cart" className="px-6 py-3 rounded-2xl font-semibold text-sm no-underline text-forest/60 border-2 border-forest/10 hover:border-forest/20 transition-all">
            View Cart
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main checkout ── */
  return (
    <div className="min-h-screen" style={{ background: '#F7F4EF' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-forest/[.05]"
        style={{ background: 'rgba(247,244,239,0.96)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Link href="/cart"
            className="flex items-center gap-1.5 text-xs font-semibold text-forest/40 hover:text-forest transition-colors no-underline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Cart
          </Link>
          <div className="flex-1 text-center">
            <span className="font-display text-base font-bold text-forest">Checkout</span>
          </div>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
                  animate={step > i + 1
                    ? { background: '#5A7A3A', color: '#fff', boxShadow: '0 4px 12px rgba(90,122,58,0.3)' }
                    : step === i + 1
                    ? { background: '#1A2A14', color: '#D4942A', boxShadow: '0 6px 16px rgba(26,42,20,0.25)' }
                    : { background: 'rgba(26,42,20,0.06)', color: 'rgba(26,42,20,0.3)', boxShadow: 'none' }}>
                  {step > i + 1 ? '✓' : i + 1}
                </motion.div>
                <span className={`text-[.58rem] font-bold tracking-[1px] transition-all ${step === i + 1 ? 'text-forest' : 'text-forest/25'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mb-5 mx-2 sm:mx-3 rounded-full transition-all duration-500 ${step > i + 1 ? 'bg-sage' : 'bg-forest/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: DETAILS ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-[24px] p-6 md:p-8 border border-forest/[.04]"
              style={{ boxShadow: '0 8px 32px rgba(26,42,20,0.08)' }}>

              <h2 className="font-display text-xl font-bold text-forest mb-0.5">Delivery Details</h2>
              <p className="text-xs text-forest/35 mb-6">We&apos;ll confirm your order via WhatsApp.</p>

              {/* Cart summary */}
              <div className="mb-6 p-4 rounded-2xl border border-forest/[.06]"
                style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.025),rgba(26,42,20,0.01))' }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[.55rem] font-bold uppercase tracking-[2px] text-forest/35">
                    {totalPacks} pack{totalPacks !== 1 ? 's' : ''} in cart
                  </span>
                  <Link href="/cart" className="text-[.6rem] font-bold text-sage no-underline hover:underline">Edit →</Link>
                </div>
                <div className="space-y-1">
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.packSize}`} className="flex justify-between text-xs text-forest/55">
                      <span>{PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName} · {item.packSize} × {item.count}</span>
                      <span className="font-medium">₹{(priceMap[item.productId]?.[item.packSize] || 0) * item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold text-forest border-t border-forest/[.06] pt-2 mt-2">
                  <span>Products</span><span className="text-sage">₹{cartTotal}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Full Name *">
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className={inputCls} placeholder="Your full name" />
                  </InputField>
                  <InputField label="WhatsApp Number *">
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className={inputCls} placeholder="+91 XXXXX XXXXX" type="tel" />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Pincode">
                    <div className="relative">
                      <input
                        value={pincode}
                        onChange={e => { if (deliveryZone !== 'international') setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
                        className={`${inputCls} pr-10`}
                        placeholder="6-digit pincode"
                        inputMode="numeric"
                        disabled={deliveryZone === 'international'}
                      />
                      {pincodeLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
                      )}
                      {!pincodeLoading && pincodeState && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sage">✓</div>
                      )}
                    </div>
                    {pincodeState && !pincodeError && (
                      <p className="text-[.6rem] mt-1 font-semibold" style={{ color: deliveryZone === 'karnataka' ? '#5A7A3A' : '#B87323' }}>
                        {pincodeState} {deliveryZone === 'karnataka' ? '· Karnataka' : '· Outside KA'}
                      </p>
                    )}
                    {pincodeError && <p className="text-[.6rem] mt-1 text-red-400">{pincodeError}</p>}
                  </InputField>
                  <InputField label="City *">
                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                      className={inputCls} placeholder="Mysuru, Bengaluru…" />
                  </InputField>
                </div>

                {/* International checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      deliveryZone === 'international'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-forest/20 bg-white group-hover:border-forest/40'
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
                      }
                    }}
                  >
                    {deliveryZone === 'international' && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${deliveryZone === 'international' ? 'text-blue-600' : 'text-forest/50 group-hover:text-forest/70'}`}>
                    ✈️ International order — delivery confirmed via WhatsApp
                  </span>
                </label>

                <InputField label="Full Address *">
                  <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className={`${inputCls} resize-y min-h-[80px]`}
                    placeholder="House/Flat no., Street, Landmark, Pincode" />
                </InputField>

                <InputField label="Notes (optional)">
                  <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className={inputCls} placeholder="Any preferences or special instructions…" />
                </InputField>
              </div>

              {delivery && (
                <div className={`mt-5 p-3.5 rounded-xl border flex items-center gap-2.5 ${
                  deliveryZone === 'international'
                    ? 'border-blue-200 bg-blue-50/60'
                    : deliveryCharge === 0
                    ? 'border-sage/15 bg-sage/[.03]'
                    : 'border-amber-200/60 bg-amber-50/40'
                }`}>
                  <span className="text-base">{deliveryZone === 'international' ? '✈️' : '🚚'}</span>
                  <span className="text-xs text-forest/55">
                    {deliveryZone === 'international'
                      ? <span className="text-blue-600 font-bold">International — delivery charge confirmed via WhatsApp</span>
                      : deliveryCharge === 0
                      ? <span className="text-sage font-bold">Free delivery for your order!</span>
                      : <><strong className="text-forest">₹{deliveryCharge}</strong> delivery charge</>}
                    {deliveryZone !== 'international' && deliveryCharge > 0 && delivery.note && <span className="text-forest/35"> · {delivery.note}</span>}
                  </span>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs text-red-500 mt-3 flex items-center gap-1.5">
                    <span>⚠</span>{error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button onClick={() => { setError(''); if (validateStep1()) setStep(2); }}
                className="w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-[1px] text-forest transition-all hover:shadow-xl active:scale-[.99]"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)', color: '#D4942A', boxShadow: '0 8px 24px rgba(26,42,20,0.2)' }}>
                Continue to Payment →
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <motion.form key="step2" onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-[24px] p-6 md:p-8 border border-forest/[.04]"
              style={{ boxShadow: '0 8px 32px rgba(26,42,20,0.08)' }}>

              <h2 className="font-display text-xl font-bold text-forest mb-0.5">Review &amp; Pay</h2>
              <p className="text-xs text-forest/35 mb-6">Tap your UPI app, pay, upload screenshot, done.</p>

              {/* Order summary */}
              <div className="mb-5 rounded-2xl border border-forest/[.06] overflow-hidden">
                <div className="px-4 py-3 border-b border-forest/[.05]"
                  style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.03),transparent)' }}>
                  <p className="text-[.57rem] font-bold uppercase tracking-[2.5px] text-forest/35">Order Summary</p>
                </div>
                <div className="px-4 py-3.5 space-y-1.5">
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.packSize}`} className="flex justify-between text-xs text-forest/55">
                      <span>{PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName} · {item.packSize} × {item.count}</span>
                      <span>₹{(priceMap[item.productId]?.[item.packSize] || 0) * item.count}</span>
                    </div>
                  ))}
                  <div className="border-t border-forest/[.05] pt-2 space-y-1.5 mt-1">
                    <div className="flex justify-between text-xs text-forest/45"><span>Products</span><span>₹{cartTotal}</span></div>
                    <div className="flex justify-between text-xs">
                      <span className="text-forest/45">Delivery</span>
                      <span className={deliveryCharge === 0 ? 'text-sage font-bold' : 'text-forest/45'}>
                        {deliveryCharge === 0 ? 'FREE 🎉' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-forest pt-1.5 border-t border-forest/[.05]">
                      <span>Total to Pay</span><span className="text-sage">₹{grandTotal}</span>
                    </div>
                  </div>
                  <p className="text-[.58rem] text-forest/25 pt-1">
                    For: {form.name} · {form.city}{pincode ? ` · ${pincode}` : ''} · {deliveryZone === 'international' ? 'International' : deliveryZone === 'karnataka' ? 'Karnataka' : 'Outside KA'}
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
                  <div className="mb-5 rounded-2xl overflow-hidden border border-brass/15"
                    style={{ background: 'linear-gradient(135deg,rgba(212,148,42,0.04),rgba(255,255,255,1))' }}>
                    <div className="px-5 py-3 border-b border-brass/[.08] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-forest">{isMobile ? 'Pay via UPI App' : 'Scan & Pay'}</p>
                        <p className="text-[.58rem] text-forest/35 mt-0.5">GPay · PhonePe · Paytm · Any UPI App</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold text-sage">₹{grandTotal}</p>
                        <p className="text-[.55rem] text-forest/30">pre-filled</p>
                      </div>
                    </div>

                    {isMobile ? (
                      /* Mobile: direct app deep-links */
                      <div className="px-5 py-4">
                        <div className="grid grid-cols-2 gap-2.5 mb-4">
                          {upiApps.map(app => (
                            <a key={app.name} href={app.url}
                              className="flex items-center gap-2.5 px-4 py-3 rounded-xl active:scale-95 transition-transform"
                              style={{ background: app.bg, border: `1.5px solid ${app.border}`, boxShadow: '0 2px 8px rgba(26,42,20,0.06)' }}>
                              {app.logo}
                              <span className="text-xs font-semibold text-forest">{app.name}</span>
                            </a>
                          ))}
                        </div>
                        <p className="text-[.58rem] text-center text-forest/35">
                          MANJULA H M · <span className="font-mono">manjulabasavaraj.urs-1@okicici</span>
                        </p>
                        <p className="text-[.54rem] text-center text-forest/25 mt-0.5">Verify name &amp; amount before confirming</p>
                      </div>
                    ) : (
                      /* Desktop: QR code */
                      <div className="px-5 py-5 flex flex-col items-center">
                        <div className="p-3 bg-white rounded-2xl border border-forest/[.06] mb-3"
                          style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.08)' }}>
                          <QRCodeSVG value={upiUrl} size={160} level="M" fgColor="#1A2A14"
                            imageSettings={{ src: '/images/logo.png', width: 28, height: 28, excavate: true }} />
                        </div>
                        <p className="text-sm font-semibold text-forest mb-0.5">MANJULA H M</p>
                        <p className="text-[.6rem] font-mono text-forest/40 tracking-wide">manjulabasavaraj.urs-1@okicici</p>
                        <p className="text-[.54rem] text-forest/25 mt-0.5">Verify name &amp; amount before confirming</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Screenshot upload */}
              <div className="mb-5">
                <label className="block text-[.57rem] font-bold tracking-[2.5px] uppercase text-forest/40 mb-2">
                  Payment Screenshot *
                </label>
                <div className={`border-2 rounded-2xl p-5 text-center cursor-pointer transition-all relative overflow-hidden
                  ${preview ? 'border-sage border-solid bg-sage/[.02]' : 'border-dashed border-forest/[.07] bg-white hover:border-sage/30 hover:bg-sage/[.01]'}`}>
                  {!preview ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{ background: 'rgba(26,42,20,0.05)' }}>
                        📤
                      </div>
                      <div className="text-sm font-semibold text-forest/40">Tap to upload screenshot</div>
                      <div className="text-[.6rem] text-forest/25">JPG, PNG, WebP · Max 5MB</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={preview} alt="" className="w-14 h-14 object-cover rounded-xl border-2 border-sage/30" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-xs font-bold text-sage truncate">{file?.name}</div>
                        <div className="text-[.6rem] text-forest/35 mt-0.5 flex items-center gap-1">✅ Ready to submit</div>
                      </div>
                      <button type="button" onClick={removeFile}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-red-400/60 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
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
                    className="text-xs text-red-500 mb-4 flex items-center gap-1.5">
                    <span>⚠</span>{error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="px-5 py-4 rounded-2xl text-sm font-semibold text-forest/55 border-2 border-forest/[.08] hover:border-forest/15 transition-all">
                  ← Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold tracking-[1px] text-cream-light disabled:opacity-50 transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', boxShadow: '0 6px 20px rgba(90,122,58,0.25)' }}>
                  {submitting
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing Order…</span>
                    : '✨ Place Order'}
                </button>
              </div>
              <p className="text-center text-[.55rem] text-forest/20 mt-2.5">WhatsApp confirmation within 2 hours</p>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
