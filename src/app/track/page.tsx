'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '@/lib/constants';
import { CART_PRICES } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';

type CartItem = { productId: string; packSize: string; count: number };

type TrackOrder = {
  id: string; status: string; products: unknown; quantity: string;
  totalAmount: number | null; deliveryCharge: number | null;
  isKarnataka: boolean; city: string; count: number; createdAt: string;
};

const STATUS_FLOW = ['pending', 'verified', 'confirmed', 'shipped', 'delivered'] as const;

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  pending:   { label: 'Pending',   color: '#D4942A', bg: 'rgba(212,148,42,0.1)',  icon: '⏳', desc: 'Order received, awaiting verification' },
  verified:  { label: 'Verified',  color: '#5A7A3A', bg: 'rgba(90,122,58,0.1)',   icon: '✅', desc: 'Payment verified by our team' },
  confirmed: { label: 'Confirmed', color: '#5A7A3A', bg: 'rgba(90,122,58,0.1)',   icon: '📋', desc: 'Order confirmed & being prepared' },
  shipped:   { label: 'Shipped',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  icon: '🚚', desc: 'On the way to you!' },
  delivered: { label: 'Delivered', color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: '🎉', desc: 'Delivered successfully' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: '✕', desc: 'Order was cancelled' },
};

function resolveProducts(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.15)' }}>
        <span className="text-red-500 text-sm">✕</span>
        <span className="text-xs font-semibold text-red-500">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number]);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {STATUS_FLOW.map((s, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          const meta = STATUS_META[s];
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={done
                    ? { background: '#5A7A3A', boxShadow: '0 2px 8px rgba(90,122,58,0.3)' }
                    : current
                    ? { background: '#1A2A14', boxShadow: '0 0 0 3px rgba(26,42,20,0.12), 0 4px 12px rgba(26,42,20,0.2)' }
                    : { background: 'rgba(26,42,20,0.07)', boxShadow: 'none' }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all">
                  {done && <span className="text-white text-[.55rem] font-bold">✓</span>}
                  {current && <span className="w-2 h-2 bg-brass rounded-full block" />}
                </motion.div>
                <span className={`text-[.48rem] font-bold leading-tight text-center w-9 sm:w-12 ${
                  done || current ? 'text-forest' : 'text-forest/25'
                }`}>{meta.label}</span>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <motion.div
                  initial={false}
                  animate={{ background: done ? '#5A7A3A' : 'rgba(26,42,20,0.08)' }}
                  className="flex-1 h-0.5 mx-0.5 mb-4 rounded-full transition-all duration-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current status description */}
      {STATUS_META[status] && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: STATUS_META[status].bg }}>
          <span className="text-sm">{STATUS_META[status].icon}</span>
          <span className="text-[.65rem] font-semibold" style={{ color: STATUS_META[status].color }}>
            {STATUS_META[status].desc}
          </span>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, index, priceMap }: { order: TrackOrder; index: number; priceMap: Record<string, Record<string, number>> }) {
  const [expanded, setExpanded] = useState(index === 0);
  const items = resolveProducts(order.products);
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const productSubtotal = (order.totalAmount ?? 0) - (order.deliveryCharge ?? 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-2xl overflow-hidden border border-forest/[.04]"
      style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.06)' }}>

      {/* Card header */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-forest/[.01] transition-colors">

        {/* Status dot */}
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
          style={{ background: meta.bg }}>
          {meta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono text-[.68rem] font-bold text-forest/50">#{order.id.slice(-8).toUpperCase()}</span>
            <span className="text-[.55rem] font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
              {meta.label}
            </span>
          </div>
          <p className="text-[.62rem] text-forest/35 truncate">
            {formatDate(order.createdAt)} · {order.city}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-display text-base font-bold text-sage">₹{order.totalAmount ?? '—'}</div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}
            className="flex justify-end mt-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(26,42,20,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-forest/[.04]">
            <div className="px-5 pb-5">
              <StatusTimeline status={order.status} />

              {/* Items */}
              <div className="mt-4 rounded-xl border border-forest/[.05] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-forest/[.04]"
                  style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.025),transparent)' }}>
                  <p className="text-[.55rem] font-bold uppercase tracking-[2.5px] text-forest/35">Items Ordered</p>
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  {items.length > 0 && typeof items[0] === 'object' && items[0] !== null
                    ? (items as CartItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs text-forest/60">
                          <span>
                            {PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName || item.productId}
                            <span className="text-forest/35"> · {item.packSize} × {item.count}</span>
                          </span>
                          <span className="font-medium">₹{(priceMap[item.productId]?.[item.packSize] || 0) * item.count}</span>
                        </div>
                      ))
                    : items.map((id, i) => (
                        <div key={i} className="text-xs text-forest/60">
                          {PRODUCTS[id as keyof typeof PRODUCTS]?.shortName || String(id)}
                        </div>
                      ))
                  }
                </div>
              </div>

              {/* Totals */}
              <div className="mt-3 p-3.5 rounded-xl border border-forest/[.05] space-y-1.5"
                style={{ background: 'rgba(26,42,20,0.015)' }}>
                <div className="flex justify-between text-xs text-forest/45">
                  <span>Products</span><span>₹{productSubtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-forest/45">
                  <span>Delivery</span>
                  <span>{order.deliveryCharge === 0 ? <span className="text-sage font-semibold">Free</span> : `₹${order.deliveryCharge ?? 0}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-forest pt-1.5 border-t border-forest/[.05]">
                  <span>Total Paid</span><span className="text-sage">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TrackPage() {
  const { priceMap } = useProducts();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<TrackOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned) return;
    setLoading(true); setError(''); setOrders(null);
    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setOrders(data.orders || []);
      setSearched(cleaned);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F4EF' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-forest/[.05]"
        style={{ background: 'rgba(247,244,239,0.96)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-forest/40 hover:text-forest transition-colors no-underline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Home
          </Link>
          <div className="flex-1 text-center">
            <span className="font-display text-base font-bold text-forest">Track Order</span>
          </div>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg,rgba(26,42,20,0.07),rgba(26,42,20,0.03))' }}>
            📦
          </div>
          <h1 className="font-display text-2xl font-bold text-forest mb-2">Track Your Orders</h1>
          <p className="text-sm text-forest/40 max-w-xs mx-auto">Enter the WhatsApp number you used to place your order.</p>
        </motion.div>

        {/* Search */}
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2.5">
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              placeholder="+91 XXXXX XXXXX"
              className="flex-1 px-4 py-3.5 border-[1.5px] border-forest/[.07] rounded-2xl text-sm bg-white outline-none focus:border-sage/60 focus:ring-3 focus:ring-sage/[.06] transition-all placeholder:text-forest/25 text-forest"
              style={{ boxShadow: '0 2px 8px rgba(26,42,20,0.04)' }} />
            <button type="submit" disabled={loading || !phone.trim()}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm text-forest disabled:opacity-40 transition-all hover:shadow-lg active:scale-[.98] flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1A2A14,#243318)', color: '#D4942A', boxShadow: '0 4px 16px rgba(26,42,20,0.2)' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-brass/30 border-t-brass rounded-full animate-spin block" />
                : 'Search'}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-red-500 mt-2 px-1 flex items-center gap-1.5">
                <span>⚠</span>{error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16">
              <div className="w-10 h-10 border-2 border-forest/10 border-t-forest/40 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-forest/30">Looking up your orders…</p>
            </motion.div>
          )}

          {orders !== null && !loading && orders.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-16 bg-white rounded-2xl border border-forest/[.04]"
              style={{ boxShadow: '0 4px 20px rgba(26,42,20,0.05)' }}>
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-display text-lg font-bold text-forest mb-1">No orders found</h3>
              <p className="text-sm text-forest/40 mb-1">No orders found for <strong>{searched}</strong>.</p>
              <p className="text-xs text-forest/25">Make sure you&apos;re using the same number you ordered with.</p>
              <Link href="/checkout"
                className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl text-xs font-bold no-underline text-forest transition-all"
                style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)' }}>
                Place a New Order →
              </Link>
            </motion.div>
          )}

          {orders !== null && !loading && orders.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-xs font-semibold text-forest/40">
                  {orders.length} order{orders.length !== 1 ? 's' : ''} for {searched}
                </p>
                <Link href="/checkout"
                  className="text-[.65rem] font-bold text-sage no-underline hover:underline">
                  Order Again →
                </Link>
              </div>
              <div className="space-y-3">
                {orders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i} priceMap={priceMap} />
                ))}
              </div>
            </motion.div>
          )}

          {orders === null && !loading && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-8">
              <p className="text-xs text-forest/20 tracking-[1px]">Your order history will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
