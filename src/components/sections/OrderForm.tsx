'use client';

import { useState, useRef } from 'react';
import { PRODUCTS, QUANTITY_OPTIONS, OFFERS } from '@/lib/constants';
import SectionHeader from '../ui/SectionHeader';
import { RevealSection } from '../ui/RevealSection';

export default function OrderForm() {
  const [form, setForm] = useState({ name: '', phone: '', products: [] as string[], quantity: '1kg', city: '', address: '', notes: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleProduct = (id: string) => {
    setForm(f => ({ ...f, products: f.products.includes(id) ? f.products.filter(p => p !== id) : [...f.products, id] }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const removeFile = () => { setFile(null); setPreview(''); if (fileRef.current) fileRef.current.value = ''; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('products', JSON.stringify(form.products));
      formData.append('quantity', form.quantity);
      formData.append('city', form.city);
      formData.append('address', form.address);
      formData.append('notes', form.notes);
      if (file) formData.append('screenshot', file);

      const res = await fetch('/api/orders', { method: 'POST', body: formData });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', phone: '', products: [], quantity: '1kg', city: '', address: '', notes: '' });
        removeFile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section id="order" className="py-20 md:py-24 px-4 max-w-[1150px] mx-auto">
        <SectionHeader tag="ಆರ್ಡರ್ ಮಾಡಿ" title="Order Homemade Goodness" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-11 items-start">
          {/* Left: How it works */}
          <RevealSection>
            <h3 className="font-display text-2xl font-bold mb-2">How It Works</h3>
            <p className="text-sm text-forest/40 leading-relaxed mb-5">3 simple steps.</p>
            <div className="flex flex-col gap-3.5">
              {[
                { n: '1', t: 'Fill Form', d: 'Products, quantity & address.' },
                { n: '2', t: 'Scan & Pay', d: 'UPI/GPay/PhonePe + screenshot.' },
                { n: '3', t: 'We Confirm', d: 'WhatsApp confirmation in 2hrs.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-forest to-forest-light rounded-full flex items-center justify-center font-display text-base font-bold text-brass shadow-md">
                    {s.n}
                  </div>
                  <div><h4 className="text-sm font-semibold">{s.t}</h4><p className="text-xs text-forest/35">{s.d}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-gradient-to-br from-sage/[.03] to-brass/[.015] border border-sage/[.06] rounded-[18px_4px_4px_18px]">
              <h4 className="font-display text-base font-bold text-sage mb-2">🎉 Offers</h4>
              {OFFERS.map((o, i) => (
                <div key={i} className="flex items-center gap-2 mb-1 text-sm text-forest/45">{o.icon} {o.text}</div>
              ))}
            </div>
          </RevealSection>

          {/* Right: Form */}
          <RevealSection delay={200}>
            <div className="bg-cream-light rounded-[4px_22px_22px_4px] p-7 shadow-[0_14px_44px_rgba(26,42,20,.03)] border border-forest/[.015]">
              <h3 className="font-display text-xl font-bold mb-0.5">Order Form</h3>
              <p className="text-[.66rem] text-forest/25 mb-5">WhatsApp confirmation.</p>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div><label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.04] rounded-[10px] text-sm bg-cream outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all" placeholder="Full name" /></div>
                  <div><label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">WhatsApp *</label>
                    <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.04] rounded-[10px] text-sm bg-cream outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all" placeholder="+91 XXXXX XXXXX" /></div>
                </div>

                <div className="mb-3">
                  <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Products *</label>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {Object.values(PRODUCTS).map(p => (
                      <label key={p.id} onClick={() => toggleProduct(p.id)}
                        className={`flex items-center gap-2 text-sm cursor-pointer p-2.5 px-3 bg-cream rounded-[10px] border-[1.5px] transition-all
                          ${form.products.includes(p.id) ? 'border-sage bg-sage/[.02]' : 'border-forest/[.03]'}`}>
                        <input type="checkbox" checked={form.products.includes(p.id)} readOnly className="accent-sage w-4 h-4 flex-shrink-0" />
                        <span><b>{p.shortName}</b> — from ₹{Object.values(p.prices)[0]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div><label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Quantity</label>
                    <select value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                      className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.04] rounded-[10px] text-sm bg-cream outline-none focus:border-sage transition-all">
                      {QUANTITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select></div>
                  <div><label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">City *</label>
                    <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                      className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.04] rounded-[10px] text-sm bg-cream outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all" placeholder="Mysuru, KA" /></div>
                </div>

                <div className="mb-3"><label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Address *</label>
                  <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    className="w-full px-3 py-2.5 border-[1.5px] border-forest/[.04] rounded-[10px] text-sm bg-cream outline-none focus:border-sage focus:ring-2 focus:ring-sage/[.06] transition-all resize-y min-h-[60px]" placeholder="Address + pincode" /></div>

                {/* QR placeholder */}
                <div className="mt-1 p-5 bg-gradient-to-br from-brass/[.02] to-sage/[.01] border-[1.5px] border-dashed border-forest/[.04] rounded-xl text-center">
                  <h4 className="text-sm font-bold mb-1">💳 Scan & Pay</h4>
                  <p className="text-[.6rem] text-forest/25 mb-2">Scan QR, upload screenshot</p>
                  <div className="w-[130px] h-[130px] mx-auto bg-white rounded-xl border-[1.5px] border-forest/[.03] flex items-center justify-center flex-col gap-1">
                    <span className="text-4xl">📱</span>
                    <small className="text-[.52rem] text-forest/[.18] tracking-[1.5px] uppercase">Your QR</small>
                  </div>
                </div>

                {/* File upload */}
                <div className="mb-3 mt-3">
                  <label className="block text-[.58rem] font-semibold tracking-[2px] uppercase text-forest mb-1">Payment Screenshot</label>
                  <div className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all relative overflow-hidden bg-white
                    ${preview ? 'border-sage border-solid' : 'border-forest/[.05] hover:border-sage'}`}>
                    {!preview ? (
                      <div><div className="text-2xl mb-1">📤</div><div className="text-xs text-forest/30">Tap to upload</div></div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <img src={preview} alt="" className="w-12 h-12 object-cover rounded-lg border-[1.5px] border-sage" />
                        <div className="text-left"><div className="text-xs font-semibold text-sage">{file?.name}</div><div className="text-[.6rem] text-forest/28">✅</div></div>
                        <button type="button" onClick={removeFile} className="ml-auto bg-transparent border-none text-terra cursor-pointer text-xs font-semibold">✕</button>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-br from-sage to-sage-light text-cream border-none rounded-xl text-sm font-semibold tracking-[2px] uppercase cursor-pointer transition-all hover:from-sage-light hover:to-millet active:scale-[.97] disabled:opacity-50 relative overflow-hidden mt-1.5">
                  <span className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  {submitting ? 'Placing Order...' : '✨ Place Order'}
                </button>
                <p className="text-center text-[.56rem] text-forest/[.18] mt-1.5">WhatsApp confirmation in 2 hours</p>
              </form>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 bg-forest/55 backdrop-blur-lg z-[50000] flex items-center justify-center p-4" onClick={() => setSuccess(false)}>
          <div className="bg-cream-light rounded-[22px] p-9 text-center max-w-[360px] w-full" onClick={e => e.stopPropagation()}>
            <div className="text-5xl">🎉</div>
            <h3 className="font-display text-xl font-bold mt-2.5 mb-1.5">Order Placed!</h3>
            <p className="text-sm text-forest/40 leading-relaxed mb-5">WhatsApp confirmation in 2 hours!</p>
            <button onClick={() => setSuccess(false)} className="bg-sage text-cream-light border-none py-3 px-7 rounded-full text-xs font-semibold cursor-pointer">Done</button>
          </div>
        </div>
      )}
    </>
  );
}
