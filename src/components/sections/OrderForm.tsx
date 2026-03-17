'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/constants';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';
import { useCart, CART_PRICES } from '@/lib/useCart';

type Offer = { id: string; icon: string; text: string };
type DeliverySettings = { baseCharge: number; freeAboveAmt: number; karnatakFree: boolean; note: string };

const STEP_LABELS = ['Details', 'Payment'];

export default function OrderForm() {
  const { cart, cartTotal, totalPacks, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', city: '', isKarnataka: true, address: '', notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);

  useEffect(() => {
    fetch('/api/offers').then(r => r.json()).then(d => setOffers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/settings/delivery').then(r => r.json()).then(d => setDelivery(d)).catch(() => {});
  }, []);

  const deliveryCharge = useMemo(() => {
    if (!delivery) return 0;
    if (form.isKarnataka && delivery.karnatakFree && cartTotal >= delivery.freeAboveAmt) return 0;
    return delivery.baseCharge;
  }, [delivery, form.isKarnataka, cartTotal]);

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
    setFile(null);
    setPreview('');
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

  const goNext = () => {
    setError('');
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please upload your payment screenshot to proceed.'); return; }
    if (cart.length === 0) { setError('Your cart is empty. Please add products first.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('cartItems', JSON.stringify(cart));
      fd.append('city', form.city);
      fd.append('isKarnataka', String(form.isKarnataka));
      fd.append('address', form.address);
      fd.append('notes', form.notes);
      fd.append('screenshot', file);

      const res = await fetch('/api/orders', { method: 'POST', body: fd });
      if (res.ok) {
        setSuccess(true);
        clearCart();
        setForm({ name: '', phone: '', city: '', isKarnataka: true, address: '', notes: '' });
        removeFile();
        setStep(1);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section id="order" className="py-20 md:py-24 px-4 max-w-[860px] mx-auto">
        <SectionHeader tag="ಆರ್ಡರ್ ಮಾಡಿ" title="Order Homemade Goodness" />

        {/* Premium Offers Strip */}
        {offers.length > 0 && (
          <RevealSection className="mb-10">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A2A14 0%, #243420 60%, #1E2E18 100%)' }}>
              <div className="px-5 pt-4 pb-1 flex items-center gap-3">
                <span className="text-[.6rem] font-bold tracking-[3px] uppercase text-brass/60">Exclusive Offers</span>
                <div className="flex-1 h-px bg-brass/[.08]" />
                <span className="text-[.6rem] text-brass/30">{offers.length} active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                {offers.map(o => (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(212,148,42,0.05)', border: '1px solid rgba(212,148,42,0.10)' }}>
                    <span className="text-lg flex-shrink-0">{o.icon}</span>
                    <span className="text-xs leading-snug" style={{ color: 'rgba(235,220,190,0.70)' }}>{o.text}</span>
                  </div>
                ))}
              </div>
              {delivery?.note && (
                <div className="px-5 pb-3 text-[.65rem] flex items-center gap-1.5" style={{ color: 'rgba(212,148,42,0.40)' }}>
                  <span>🚚</span> {delivery.note}
                </div>
              )}
            </div>
          </RevealSection>
        )}

        {/* Empty cart state */}
        {cart.length === 0 && (
          <RevealSection>
            <div className="text-center py-14 bg-cream-light rounded-2xl border border-forest/[.03]">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="font-display text-xl font-bold text-forest mb-2">Your cart is empty</h3>
              <p className="text-sm text-forest/40 mb-6">Add products before checking out.</p>
              <div className="flex gap-3 justify-center">
                <a href="#prods"
                  className="inline-block bg-gradient-to-r from-forest to-forest/80 text-brass px-6 py-2.5 rounded-xl font-semibold text-xs no-underline">
                  Browse Products
                </a>
                <Link href="/cart"
                  className="inline-block border-2 border-forest/10 text-forest/60 px-6 py-2.5 rounded-xl font-semibold text-xs no-underline hover:border-forest/20 transition-all">
                  View Cart
                </Link>
              </div>
            </div>
          </RevealSection>
        )}

        {cart.length > 0 && (
          <>
            {/* Step Indicator */}
            <RevealSection className="mb-8">
              <div className="flex items-center justify-center">
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                        ${step > i + 1 ? 'bg-sage text-white' : step === i + 1 ? 'bg-forest text-brass shadow-lg' : 'bg-forest/10 text-forest/30'}`}>
                        {step > i + 1 ? '✓' : i + 1}
                      </div>
                      <span className={`text-[.6rem] font-semibold transition-all ${step === i + 1 ? 'text-forest' : 'text-forest/25'}`}>{label}</span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`w-14 md:w-20 h-0.5 mb-4 mx-1 transition-all ${step > i + 1 ? 'bg-sage' : 'bg-forest/10'}`} />
                    )}
                  </div>
                ))}
              </div>
            </RevealSection>

            <RevealSection delay={100}>
              <div className="bg-cream-light rounded-2xl p-6 md:p-8 shadow-[0_14px_44px_rgba(26,42,20,.04)] border border-forest/[.02]">

                {/* ── STEP 1: DETAILS ── */}
                {step === 1 && (
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1">Your Delivery Details</h3>
                    <p className="text-xs text-forest/40 mb-1">We&apos;ll WhatsApp you on this number to confirm.</p>

                    {/* Cart summary (read-only) */}
                    <div className="mb-6 p-3.5 rounded-xl border border-forest/[.05] bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[.55rem] font-bold uppercase tracking-[2px] text-forest/40">
                          Cart · {totalPacks} pack{totalPacks !== 1 ? 's' : ''}
                        </span>
                        <Link href="/cart" className="text-[.6rem] font-semibold text-sage no-underline hover:underline">
                          Edit cart →
                        </Link>
                      </div>
                      {cart.map(item => (
                        <div key={`${item.productId}-${item.packSize}`} className="flex justify-between text-xs text-forest/55 mb-1">
                          <span>{PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName} · {item.packSize} × {item.count}</span>
                          <span>₹{(CART_PRICES[item.productId]?.[item.packSize] || 0) * item.count}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold text-forest border-t border-forest/[.05] pt-2 mt-1">
                        <span>Products total</span><span className="text-sage">₹{cartTotal}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Full Name *</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.06] rounded-xl text-sm bg-white outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all"
                          placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">WhatsApp Number *</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.06] rounded-xl text-sm bg-white outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all"
                          placeholder="+91 XXXXX XXXXX" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">City *</label>
                        <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                          className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.06] rounded-xl text-sm bg-white outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all"
                          placeholder="Mysuru, Bengaluru..." />
                      </div>
                      <div>
                        <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Delivery State</label>
                        <div className="flex gap-2 mt-1">
                          {[{ val: true, label: '🏠 Karnataka' }, { val: false, label: '✈️ Outside KA' }].map(opt => (
                            <button key={String(opt.val)} type="button"
                              onClick={() => setForm({ ...form, isKarnataka: opt.val })}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                                ${form.isKarnataka === opt.val ? 'bg-forest text-brass border-forest' : 'border-forest/10 text-forest/50 bg-white hover:border-forest/20'}`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Full Address *</label>
                      <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                        className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.06] rounded-xl text-sm bg-white outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all resize-y min-h-[70px]"
                        placeholder="House/Flat no., Street, Pincode" />
                    </div>

                    <div className="mb-5">
                      <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Special Notes (optional)</label>
                      <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.06] rounded-xl text-sm bg-white outline-none focus:border-sage transition-all"
                        placeholder="Any preferences or instructions..." />
                    </div>

                    {delivery && (
                      <div className="mb-5 p-3 rounded-xl border border-sage/10 bg-sage/[.02] flex items-center gap-2 text-xs">
                        <span>🚚</span>
                        <span className="text-forest/60">
                          {deliveryCharge === 0
                            ? <span className="text-sage font-semibold">Free delivery for your order!</span>
                            : <><span>Delivery charge: </span><strong className="text-forest">₹{deliveryCharge}</strong></>
                          }
                          {deliveryCharge > 0 && delivery.note && <span className="text-forest/40"> · {delivery.note}</span>}
                        </span>
                      </div>
                    )}

                    {error && <p className="text-xs text-red-500 mb-3 px-1">{error}</p>}

                    <button onClick={goNext}
                      className="w-full py-3.5 bg-gradient-to-r from-forest to-forest/80 text-brass rounded-xl font-semibold text-sm tracking-wide transition-all hover:shadow-lg">
                      Continue to Payment →
                    </button>
                  </div>
                )}

                {/* ── STEP 2: PAYMENT ── */}
                {step === 2 && (
                  <form onSubmit={handleSubmit}>
                    <h3 className="font-display text-xl font-bold mb-1">Review &amp; Pay</h3>
                    <p className="text-xs text-forest/40 mb-6">Scan the QR, upload your screenshot, and place the order.</p>

                    {/* Order summary */}
                    <div className="mb-5 p-4 rounded-xl border border-forest/[.06] bg-white">
                      <p className="text-[.58rem] font-bold uppercase tracking-[2px] text-forest/40 mb-3">Order Summary</p>
                      <div className="space-y-1.5 mb-2">
                        {cart.map(item => (
                          <div key={`${item.productId}-${item.packSize}`} className="flex justify-between text-xs text-forest/60">
                            <span>{PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName} · {item.packSize} × {item.count}</span>
                            <span>₹{(CART_PRICES[item.productId]?.[item.packSize] || 0) * item.count}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-forest/[.05] pt-2 space-y-1">
                        <div className="flex justify-between text-xs text-forest/50">
                          <span>Products subtotal</span><span>₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-forest/50">Delivery</span>
                          <span className={deliveryCharge === 0 ? 'text-sage font-semibold' : 'text-forest/50'}>
                            {deliveryCharge === 0 ? 'FREE 🎉' : `₹${deliveryCharge}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-forest pt-1.5 border-t border-forest/[.05]">
                          <span>Total to Pay</span><span className="text-sage">₹{grandTotal}</span>
                        </div>
                      </div>
                      <p className="text-[.6rem] text-forest/30 mt-2">
                        For: {form.name} · {form.city} · {form.isKarnataka ? 'Karnataka' : 'Outside KA'}
                      </p>
                    </div>

                    {/* QR code */}
                    <div className="mb-4 p-5 rounded-xl border-2 border-dashed border-brass/10 bg-white text-center">
                      <p className="text-xs font-bold text-forest mb-1">💳 Scan &amp; Pay ₹{grandTotal}</p>
                      <p className="text-[.6rem] text-forest/25 mb-3">UPI · GPay · PhonePe · Any UPI App</p>
                      <div className="w-[140px] h-[140px] mx-auto bg-cream rounded-xl border border-forest/[.04] flex flex-col items-center justify-center gap-1.5">
                        <span className="text-4xl">📱</span>
                        <small className="text-[.52rem] text-forest/[.18] tracking-[1.5px] uppercase">Your QR Here</small>
                      </div>
                    </div>

                    {/* Screenshot upload */}
                    <div className="mb-5">
                      <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1.5">Upload Payment Screenshot *</label>
                      <div className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all relative overflow-hidden bg-white
                        ${preview ? 'border-sage border-solid' : 'border-forest/[.06] hover:border-sage/40'}`}>
                        {!preview ? (
                          <div>
                            <div className="text-2xl mb-1">📤</div>
                            <div className="text-xs text-forest/30">Tap to upload payment screenshot</div>
                            <div className="text-[.6rem] text-forest/20 mt-0.5">JPG, PNG, WebP · Max 5MB</div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <img src={preview} alt="" className="w-14 h-14 object-cover rounded-lg border-[1.5px] border-sage" />
                            <div className="text-left flex-1">
                              <div className="text-xs font-semibold text-sage truncate">{file?.name}</div>
                              <div className="text-[.6rem] text-forest/30 mt-0.5">✅ Ready to upload</div>
                            </div>
                            <button type="button" onClick={removeFile} className="text-red-400 text-xs font-bold px-2 hover:text-red-600">✕</button>
                          </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>

                    {error && <p className="text-xs text-red-500 mb-3 px-1">{error}</p>}

                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setStep(1); setError(''); }}
                        className="px-5 py-3.5 border-2 border-forest/10 text-forest/60 rounded-xl text-sm font-semibold hover:border-forest/20 transition-all">
                        ← Back
                      </button>
                      <button type="submit" disabled={submitting}
                        className="flex-1 py-3.5 bg-gradient-to-br from-sage to-sage/80 text-cream rounded-xl text-sm font-semibold tracking-[1px] uppercase disabled:opacity-50 transition-all hover:shadow-lg relative overflow-hidden">
                        <span className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                        {submitting ? 'Placing Order...' : '✨ Place Order'}
                      </button>
                    </div>
                    <p className="text-center text-[.56rem] text-forest/[.18] mt-2">WhatsApp confirmation in 2 hours</p>
                  </form>
                )}

              </div>
            </RevealSection>
          </>
        )}
      </section>

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 bg-forest/55 backdrop-blur-lg z-[50000] flex items-center justify-center p-4" onClick={() => setSuccess(false)}>
          <div className="bg-cream-light rounded-[22px] p-9 text-center max-w-[360px] w-full" onClick={e => e.stopPropagation()}>
            <div className="text-5xl">🎉</div>
            <h3 className="font-display text-xl font-bold mt-2.5 mb-1.5">Order Placed!</h3>
            <p className="text-sm text-forest/40 leading-relaxed mb-5">
              Thank you! We&apos;ll send a WhatsApp confirmation within 2 hours.
            </p>
            <button onClick={() => setSuccess(false)} className="bg-sage text-cream-light border-none py-3 px-7 rounded-full text-xs font-semibold cursor-pointer">
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
