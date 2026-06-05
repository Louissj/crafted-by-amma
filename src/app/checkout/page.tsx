'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { useSampleCart } from '@/lib/useSampleCart';
import { trackEvent } from '@/lib/analytics';

type DeliverySlab = { maxGrams: number; charge: number };
type DeliverySettings = {
  baseCharge: number; outstationCharge: number; freeAboveAmt: number;
  karnatakFree: boolean; note: string;
  karnatakaSlabs: DeliverySlab[]; southIndiaSlabs: DeliverySlab[]; northIndiaSlabs: DeliverySlab[];
};
const SOUTH_INDIA_STATES = ['tamil nadu','kerala','andhra pradesh','telangana','goa','puducherry','pondicherry','lakshadweep','andaman and nicobar'];
function parseKgCo(s: string) { return parseFloat(s) * (s.toLowerCase().includes('kg') ? 1000 : 1); }

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayWindow = Window & {
  Razorpay: new (options: Record<string, unknown>) => { open(): void };
};

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
  const { products, priceMap } = useProducts();
  const { cart, cartTotal, totalPacks, clearCart, mounted } = useCart(priceMap);
  const { sampleItems, sampleTotal, clearSampleCart } = useSampleCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', city: '', address: '', pincode: '' });
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeState, setPincodeState] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'karnataka' | 'south-india' | 'north-india' | 'international'>('north-india');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);

  useEffect(() => {
    fetch('/api/settings/delivery').then(r => r.json()).then(setDelivery).catch(() => {});
    trackEvent('checkout_start');

    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);

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

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deliveryZone === 'international') return;
    const pin = pincode.replace(/\D/g, '');
    if (pin.length !== 6) {
      setPincodeState('');
      setPincodeError('');
      setDeliveryZone('north-india');
      return;
    }
    setPincodeLoading(true);
    setPincodeError('');
    setPincodeState('');
    fetch(`/api/pincode/${pin}`)
      .then(async r => { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(data => {
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const state: string = po.State || '';
          setPincodeState(state);
          const sl = state.toLowerCase();
          if (sl.includes('karnataka')) setDeliveryZone('karnataka');
          else if (SOUTH_INDIA_STATES.some(s => sl.includes(s))) setDeliveryZone('south-india');
          else setDeliveryZone('north-india');
          setForm(f => ({ ...f, city: po.District || po.Name || f.city }));
        } else {
          setPincodeError('Pincode not found');
          setDeliveryZone('north-india');
        }
      })
      .catch(() => {
        const n = parseInt(pin, 10);
        const isKA = n >= 560001 && n <= 591999;
        setPincodeState(isKA ? 'Karnataka' : '');
        setDeliveryZone(isKA ? 'karnataka' : 'north-india');
        setPincodeError('');
      })
      .finally(() => setPincodeLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode]);

  function coSlabCharge(slabs: DeliverySlab[], grams: number, fallback: number) {
    if (!slabs?.length) return fallback;
    const sorted = [...slabs].sort((a, b) => a.maxGrams - b.maxGrams);
    return (sorted.find(s => grams <= s.maxGrams) ?? sorted[sorted.length - 1]).charge;
  }

  const coGrams = !delivery || deliveryZone === 'international' ? 0
    : cart.reduce((sum, item) => {
        const g = parseKgCo(item.packSize);
        if (deliveryZone === 'karnataka' && g >= 1000) return sum;
        return sum + g * item.count;
      }, 0)
      + sampleItems.reduce((sum, i) => sum + 50 * i.count * i.qty, 0); // each sample = 50g

  const deliveryCharge = (() => {
    if (!delivery || deliveryZone === 'international') return 0;
    if (coGrams === 0) return 0;
    if (deliveryZone === 'karnataka') return coSlabCharge(delivery.karnatakaSlabs, coGrams, delivery.baseCharge || 60);
    if (deliveryZone === 'south-india') return coSlabCharge(delivery.southIndiaSlabs, coGrams, delivery.outstationCharge);
    return coSlabCharge(delivery.northIndiaSlabs, coGrams, delivery.outstationCharge);
  })();

  const grandTotal = cartTotal + sampleTotal + deliveryCharge;

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

  const handleRazorpayPay = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/orders/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, sampleItems, deliveryZone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to initiate payment');
        setSubmitting(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Crafted by Amma',
        description: 'Homemade Millet Products · Mysuru',
        image: '/images/logo.png',
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        notes: {
          city: form.city,
          address: form.address,
        },
        theme: { color: '#5A7A3A' },
        handler: async (response: RazorpayResponse) => {
          setSubmitting(true);
          try {
            const verifyRes = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                name: form.name,
                phone: form.phone,
                city: form.city,
                address: form.address,
                pincode,
                deliveryZone,
                notes: form.notes,
                cartItems: cart,
                sampleItems,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              clearCart();
              clearSampleCart();
              setOrderId(verifyData.orderId || '');
            } else {
              setError(verifyData.error || 'Payment verification failed. Please contact support.');
            }
          } catch {
            setError('Payment verification failed. Please contact support.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      };

      const rzp = new (window as unknown as RazorpayWindow).Razorpay(options);
      rzp.open();
      setSubmitting(false);
    } catch {
      setError('Failed to initiate payment. Please try again.');
      setSubmitting(false);
    }
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
            <h1 className="font-display text-2xl font-bold mb-1.5" style={{ color: '#D4942A' }}>Order Confirmed!</h1>
            <p className="text-sm text-white/60">Payment received. We&apos;ll dispatch your order within 1 business day.</p>

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
          <Link href="/products"
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
                            {products.find(p => p.id === item.productId)?.shortName}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {item.packSize} · {item.count} pack{item.count > 1 ? 's' : ''} × ₹{unitPrice}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-white flex-shrink-0">₹{unitPrice * item.count}</span>
                      </div>
                    );
                  })}
                  {sampleItems.map(item => (
                    <div key={item.packKey} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight">🧪 {item.label}</p>
                        <p className="text-xs text-white/50 mt-0.5">
                          {item.count} products · qty {item.qty} × ₹{item.price}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-white flex-shrink-0">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-white/70">Subtotal</span>
                    <span className="text-lg font-bold" style={{ color: '#D4942A' }}>₹{cartTotal + sampleTotal}</span>
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

                {/* International toggle */}
                <div
                  className={`rounded-2xl px-4 py-3 cursor-pointer select-none transition-all ${
                    deliveryZone === 'international'
                      ? 'border-[1.5px] border-blue-300 bg-blue-50'
                      : 'border-[1.5px] border-forest/10 bg-forest/[.02]'
                  }`}
                  onClick={() => {
                    if (deliveryZone === 'international') {
                      setDeliveryZone('north-india');
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
                className="w-full mt-7 px-5 py-[18px] rounded-2xl font-bold text-sm tracking-[1px] transition-all hover:shadow-xl active:scale-[.99] flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)', color: '#D4942A', boxShadow: '0 8px 28px rgba(26,42,20,0.22)' }}>
                <span className="tracking-[1px] uppercase">Continue to Payment</span>
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold">₹{grandTotal}</span>
                  <span>→</span>
                </span>
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-[28px] p-7 md:p-9"
              style={{ boxShadow: '0 12px 48px rgba(26,42,20,0.10), 0 2px 8px rgba(26,42,20,0.04)' }}>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-5 bg-sage rounded-full" />
                <h2 className="font-display text-2xl font-bold text-forest">Review &amp; Pay</h2>
              </div>
              <p className="text-sm text-forest/50 mt-1 mb-7 ml-4">Review your order, then pay securely via Razorpay.</p>

              {/* Order summary */}
              <div className="mb-7 rounded-2xl overflow-hidden border border-forest/[.06]">
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)' }}>
                  <div>
                    <p className="text-xs font-bold tracking-[2px] uppercase" style={{ color: 'rgba(212,148,42,0.6)' }}>Order Summary</p>
                    <p className="text-sm text-white/60 mt-0.5">{totalPacks} pack{totalPacks !== 1 ? 's' : ''} · {cart.length + sampleItems.length} item{cart.length + sampleItems.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-0.5">Total</p>
                    <p className="font-display text-2xl font-bold" style={{ color: '#D4942A' }}>₹{grandTotal}</p>
                  </div>
                </div>

                <div className="px-5 pt-4 pb-2 space-y-3">
                  {cart.map(item => {
                    const unitPrice = priceMap[item.productId]?.[item.packSize] || 0;
                    return (
                      <div key={`${item.productId}-${item.packSize}`} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest leading-tight">
                            {products.find(p => p.id === item.productId)?.shortName}
                          </p>
                          <p className="text-xs text-forest/50 mt-0.5">
                            {item.packSize} · {item.count} pack{item.count > 1 ? 's' : ''} × ₹{unitPrice} each
                          </p>
                        </div>
                        <span className="text-sm font-bold text-forest flex-shrink-0">₹{unitPrice * item.count}</span>
                      </div>
                    );
                  })}
                  {sampleItems.map(item => (
                    <div key={item.packKey} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-forest leading-tight">🧪 {item.label}</p>
                        <p className="text-xs text-forest/50 mt-0.5">
                          {item.count} products · qty {item.qty} × ₹{item.price}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-forest flex-shrink-0">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="px-5 pt-3 pb-4 space-y-2.5 border-t border-dashed border-forest/10 mt-2">
                  {cart.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-forest/60">Products subtotal</span>
                    <span className="font-semibold text-forest">₹{cartTotal}</span>
                  </div>
                  )}
                  {sampleItems.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-forest/60">Sample packs</span>
                    <span className="font-semibold text-forest">₹{sampleTotal}</span>
                  </div>
                  )}
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

              {/* Razorpay secure payment block */}
              <div className="mb-7 rounded-2xl border border-sage/20 overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(90,122,58,0.03),#fff)' }}>
                <div className="px-5 py-5 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(90,122,58,0.08)', border: '1.5px solid rgba(90,122,58,0.15)' }}>
                    🔒
                  </div>
                  <div>
                    <p className="font-bold text-forest text-base">Pay via UPI</p>
                    <p className="text-xs text-forest/50 mt-1.5">GPay · PhonePe · Paytm · Any UPI App</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    {['GPay', 'PhonePe', 'Paytm', 'Any UPI'].map(app => (
                      <span key={app} className="text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ background: 'rgba(26,42,20,0.04)', color: '#1A2A14', borderColor: 'rgba(26,42,20,0.1)' }}>
                        {app}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-forest/40">
                    Powered by Razorpay · 100% secure &amp; encrypted
                  </p>
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
                <button
                  onClick={handleRazorpayPay}
                  disabled={submitting}
                  className="flex-1 py-[18px] rounded-2xl text-sm font-bold tracking-[1px] disabled:opacity-60 transition-all hover:shadow-xl active:scale-[.99] flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#fff', boxShadow: '0 8px 24px rgba(90,122,58,0.28)' }}>
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Preparing…</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Pay ₹{grandTotal} Securely</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-forest/50 text-center mt-3">UPI payment powered by Razorpay · 100% secure</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
