'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ORDER_STATUSES, PRODUCTS } from '@/lib/constants';

type CartItem = { productId: string; packSize: string; count: number };

type Order = {
  id: string; name: string; phone: string;
  products: unknown;
  quantity: string;
  city: string; address: string; paymentScreenshot: string | null; notes: string | null;
  status: string; totalAmount: number | null; deliveryCharge: number | null; isKarnataka: boolean; createdAt: string; paymentMethod: string | null;
};

type Offer = { id: string; icon: string; text: string; active: boolean; sortOrder: number };
type DeliverySettings = { id: string; baseCharge: number; freeAboveAmt: number; karnatakFree: boolean; note: string };
type AdminReview = { id: string; name: string; place: string; rating: number; text: string; approved: boolean; createdAt: string };
type Tab = 'orders' | 'offers' | 'delivery' | 'products' | 'analytics' | 'reviews';

type DbProduct = {
  id: string; name: string; shortName: string; badge: string;
  description: string; ingredients: string;
  usage: { type: string; instructions: string }[];
  prices: Record<string, number>;
  images: string[];
  active: boolean; sortOrder: number;
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'Pending',   color: '#D4942A', bg: 'rgba(212,148,42,0.12)',  icon: '⏳' },
  verified:  { label: 'Verified',  color: '#5A7A3A', bg: 'rgba(90,122,58,0.12)',   icon: '✅' },
  confirmed: { label: 'Confirmed', color: '#5A7A3A', bg: 'rgba(90,122,58,0.12)',   icon: '📋' },
  shipped:   { label: 'Shipped',   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: '🚚' },
  delivered: { label: 'Delivered', color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: '🎉' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: '✕' },
};

function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'xs' | 'sm' }) {
  const meta = STATUS_META[status] || { label: status, color: '#888', bg: 'rgba(136,136,136,0.1)', icon: '•' };
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap
      ${size === 'xs' ? 'text-sm px-2 py-0.5' : 'text-[.88rem] px-2.5 py-1'}`}
      style={{ color: meta.color, background: meta.bg }}>
      <span>{meta.icon}</span>{meta.label}
    </span>
  );
}

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Restore session on refresh
  useEffect(() => {
    fetch('/api/auth').then(r => {
      if (r.ok) setLoggedIn(true);
    }).finally(() => setAuthChecking(false));
  }, []);
  const [tab, setTab] = useState<Tab>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [waToast, setWaToast] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });

  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOfferIcon, setNewOfferIcon] = useState('✨');
  const [newOfferText, setNewOfferText] = useState('');
  const [offersLoading, setOffersLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Products state
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [deliverySaving, setDeliverySaving] = useState(false);

  type AnalyticsStats = {
    funnel: { visitors: number; cartViews: number; checkouts: number; orders: number; addToCartTotal: number };
    revenue: { total: number; last30d: number; avg: number };
    orders: { total: number; last7d: number; prev7d: number; byStatus: { status: string; count: number }[] };
    customers: { total: number; repeat: number; list: { name: string; phone: string; city: string; orders: number; spent: number; lastOrder: string }[] };
    productPerformance: { id: string; name: string; units: number; revenue: number; orders: number }[];
    addToCartByProduct: Record<string, number>;
    dailyRevenue: { date: string; amount: number }[];
    topCities: { city: string; count: number }[];
  };
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  type CustomerSummary = AnalyticsStats['customers']['list'][0];
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics/stats');
      if (res.ok) setAnalyticsStats(await res.json());
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const openCustomer = useCallback(async (c: CustomerSummary) => {
    setSelectedCustomer(c);
    setCustomerOrders([]);
    setCustomerOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(c.phone)}&limit=100`);
      const data = await res.json();
      setCustomerOrders(data.orders || []);
    } finally {
      setCustomerOrdersLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders || []);
    if (filter === 'all') {
      const all = data.orders || [];
      setStats({
        total: all.length,
        pending: all.filter((o: Order) => o.status === 'pending').length,
        confirmed: all.filter((o: Order) => ['confirmed', 'shipped', 'delivered'].includes(o.status)).length,
        revenue: all.filter((o: Order) => o.totalAmount).reduce((s: number, o: Order) => s + (o.totalAmount || 0), 0),
      });
    }
  }, [filter]);

  const fetchOffers = useCallback(async () => {
    const res = await fetch('/api/offers');
    const data = await res.json();
    setOffers(Array.isArray(data) ? data : []);
  }, []);

  const fetchDelivery = useCallback(async () => {
    const res = await fetch('/api/settings/delivery');
    setDelivery(await res.json());
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch('/api/reviews?all=1');
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    if (tab === 'orders') fetchOrders();
    if (tab === 'offers') fetchOffers();
    if (tab === 'delivery') fetchDelivery();
    if (tab === 'products') fetchProducts();
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'reviews') fetchReviews();
  }, [loggedIn, tab, filter, fetchOrders, fetchOffers, fetchDelivery, fetchProducts, fetchAnalytics, fetchReviews]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true); setLoginError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) setLoggedIn(true);
    else { setLoginError('Invalid credentials. Please try again.'); setLoggingIn(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setLoggedIn(false);
  };

  const getWhatsAppMessage = (name: string, status: string): string => {
    const firstName = name.trim().split(' ')[0];
    const cp = String.fromCodePoint;
    const e = {
      grain:   cp(0x1F33E), // 🌾
      pray:    cp(0x1F64F), // 🙏
      check:   cp(0x2705),  // ✅
      spark:   cp(0x2728),  // ✨
      heart:   cp(0x1F49B), // 💛
      box:     cp(0x1F4E6), // 📦
      hands:   cp(0x1F932), // 🤲
      leaf:    cp(0x1F33F), // 🌿
      truck:   cp(0x1F69A), // 🚚
      mailbox: cp(0x1F4EC), // 📬
      party:   cp(0x1F389), // 🎉
      star:    cp(0x2B50),  // ⭐
      sad:     cp(0x1F614), // 😔
      rocket:  cp(0x1F680), // 🚀
    };
    const messages: Record<string, string> = {
      verified:
        `${e.grain} *Crafted by Amma* ${e.grain}\n\nHello ${firstName}! ${e.pray}\n\n${e.check} *Payment Confirmed!*\n\nThank you so much for trusting us! Your payment has been received & verified successfully. Amma is now rolling up her sleeves to start crafting your order with pure love & fresh ingredients. ${e.heart}\n\n_No preservatives. No shortcuts. Just pure goodness — the way it's always been made at home._\n\nWe'll ping you again the moment your order is on its way! ${e.rocket}`,

      confirmed:
        `${e.grain} *Crafted by Amma* ${e.grain}\n\nHello ${firstName}! ${e.pray}\n\n${e.box} *Order Confirmed & Being Prepared!*\n\nYour order is officially in Amma's hands now! ${e.hands} She's carefully measuring, roasting & blending every ingredient — just like she would for her own family. ${e.heart}\n\n_21+ wholesome ingredients · Zero preservatives · Made with love_\n\nSit tight — we'll let you know as soon as it's packed & shipped! ${e.leaf}`,

      shipped:
        `${e.grain} *Crafted by Amma* ${e.grain}\n\nHello ${firstName}! ${e.pray}\n\n${e.truck} *Your Order is On Its Way!*\n\nGreat news — your package has left our kitchen and is now heading straight to your doorstep! ${e.mailbox}\n\nInside your parcel:\n${e.spark} Pure homemade goodness\n${e.spark} Zero chemicals or preservatives\n${e.spark} Packed with care & love ${e.heart}\n\nPlease keep your phone handy for the delivery. Can't wait for you to experience Amma's flavours! ${e.grain}`,

      delivered:
        `${e.grain} *Crafted by Amma* ${e.grain}\n\nHello ${firstName}! ${e.pray}\n\n${e.party} *Order Delivered Successfully!*\n\nYour Crafted by Amma order has reached you! We truly hope every sip and every bite fills your home with warmth, health & happiness. ${e.heart}\n\n_This was made with the same love a mother puts into every meal for her child._\n\n${e.star} *Loved it?* A little feedback from you means the world to Amma!\n\nThank you for being part of our family. See you again soon! ${e.leaf} ${e.pray}`,

      cancelled:
        `${e.grain} *Crafted by Amma* ${e.grain}\n\nHello ${firstName},\n\nWe're truly sorry to share that your order has been *cancelled*. ${e.sad}\n\nWe understand this can be disappointing, and we sincerely apologize for any inconvenience caused.\n\nIf you have any questions or would like to place a fresh order, please don't hesitate to reach out — we're always here for you! ${e.pray}\n\n_Crafted by Amma — Made with Love, Always._`,
    };
    return messages[status] || `${e.grain} *Crafted by Amma*\n\nHello ${firstName}! Your order status has been updated to *${status}*. Thank you for your patience! ${e.pray}`;
  };

  const updateStatus = async (id: string, status: string, order?: Order) => {
    setLoading(true);
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchOrders();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setLoading(false);
    const target = order ?? (selected?.id === id ? selected : null);
    if (target) {
      const phone = target.phone.replace(/[^0-9]/g, '').slice(-10);
      const msg = getWhatsAppMessage(target.name, status);
      // Copy message to clipboard first (100% emoji-safe)
      navigator.clipboard.writeText(msg).catch(() => {});
      // Open WhatsApp chat — user pastes the copied message
      const a = document.createElement('a');
      a.href = 'https://wa.me/91' + phone;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setWaToast('Message copied! Paste it in WhatsApp \uD83D\uDCCB');
      setTimeout(() => setWaToast(''), 4000);
    }
  };

  const resolveProducts = (raw: unknown): unknown[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  const getProductNames = (raw: unknown): string => {
    try {
      const arr = resolveProducts(raw);
      if (arr.length === 0) return '—';
      if (typeof arr[0] === 'object' && arr[0] !== null)
        return (arr as CartItem[]).map(i =>
          `${PRODUCTS[i.productId as keyof typeof PRODUCTS]?.shortName || i.productId} ${i.packSize}×${i.count}`
        ).join(', ');
      return (arr as string[]).map(id => PRODUCTS[id as keyof typeof PRODUCTS]?.shortName || id).join(', ');
    } catch { return '—'; }
  };

  const parseCartItems = (raw: unknown): CartItem[] => {
    try {
      const arr = resolveProducts(raw);
      if (arr.length === 0 || typeof arr[0] !== 'object' || arr[0] === null) return [];
      return arr as CartItem[];
    } catch { return []; }
  };

  const addOffer = async () => {
    if (!newOfferText.trim()) return;
    setOffersLoading(true);
    await fetch('/api/offers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon: newOfferIcon, text: newOfferText, sortOrder: offers.length }),
    });
    setNewOfferIcon('✨'); setNewOfferText('');
    await fetchOffers(); setOffersLoading(false);
  };

  const toggleOffer = async (id: string, active: boolean) => {
    await fetch(`/api/offers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
    await fetchOffers();
  };

  const deleteOffer = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    await fetchOffers();
  };

  const saveDelivery = async () => {
    if (!delivery) return;
    setDeliverySaving(true);
    await fetch('/api/settings/delivery', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(delivery),
    });
    setDeliverySaving(false);
    showToast('Delivery settings saved!');
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    setProductSaving(true);
    await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingProduct.name, shortName: editingProduct.shortName,
        badge: editingProduct.badge, description: editingProduct.description,
        ingredients: editingProduct.ingredients, usage: editingProduct.usage,
        prices: editingProduct.prices, active: editingProduct.active,
      }),
    });
    await fetchProducts();
    setProductSaving(false);
    setEditingProduct(null);
    showToast('Product saved successfully!');
  };

  const uploadProductImage = async (file: File) => {
    if (!editingProduct) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`/api/products/${editingProduct.id}/image`, { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) setEditingProduct(prev => prev ? { ...prev, images: data.images as string[] } : prev);
    setImageUploading(false);
  };

  const removeProductImage = async (url: string) => {
    if (!editingProduct) return;
    const res = await fetch(`/api/products/${editingProduct.id}/image`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (res.ok) setEditingProduct(prev => prev ? { ...prev, images: data.images as string[] } : prev);
  };

  const updatePrice = (packSize: string, value: string) => {
    if (!editingProduct) return;
    const num = parseFloat(value);
    setEditingProduct(prev => prev ? { ...prev, prices: { ...prev.prices, [packSize]: isNaN(num) ? 0 : num } } : prev);
  };

  const addPackSize = () => {
    if (!editingProduct) return;
    const size = prompt('Enter pack size (e.g. 2kg):');
    if (!size) return;
    setEditingProduct(prev => prev ? { ...prev, prices: { ...prev.prices, [size]: 0 } } : prev);
  };

  const removePackSize = (size: string) => {
    if (!editingProduct) return;
    const updated = { ...editingProduct.prices };
    delete updated[size];
    setEditingProduct(prev => prev ? { ...prev, prices: updated } : prev);
  };

  /* ─── LOGIN ─────────────────────────────────────────────── */
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080F06' }}>
        <div className="w-8 h-8 border-2 border-brass/20 border-t-brass rounded-full animate-spin" />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#050D03 0%,#0A1608 40%,#060E04 100%)' }}>

        {/* ── Animated background orbs (pointer-events-none so inputs stay clickable) ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large slow orbs */}
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[.12]"
            style={{ background: 'radial-gradient(circle,#5A7A3A,transparent)', top: '-10%', left: '-15%', animation: 'loginOrb1 18s ease-in-out infinite' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[.10]"
            style={{ background: 'radial-gradient(circle,#C8B44A,transparent)', bottom: '-10%', right: '-10%', animation: 'loginOrb2 22s ease-in-out infinite' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full blur-[90px] opacity-[.08]"
            style={{ background: 'radial-gradient(circle,#D4942A,transparent)', top: '40%', right: '20%', animation: 'loginOrb1 14s ease-in-out infinite reverse' }} />

          {/* Fine dot grid */}
          <div className="absolute inset-0 opacity-[.04]"
            style={{ backgroundImage: 'radial-gradient(circle,#C8B44A 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Floating grain particles */}
          {[
            { top: '12%', left: '8%', delay: '0s', dur: '8s', size: 3 },
            { top: '25%', left: '88%', delay: '1.5s', dur: '10s', size: 2 },
            { top: '60%', left: '5%', delay: '3s', dur: '9s', size: 2 },
            { top: '75%', left: '92%', delay: '0.8s', dur: '11s', size: 3 },
            { top: '45%', left: '95%', delay: '2s', dur: '7s', size: 1.5 },
            { top: '85%', left: '18%', delay: '4s', dur: '12s', size: 2 },
            { top: '8%', left: '55%', delay: '1s', dur: '9s', size: 1.5 },
            { top: '90%', left: '70%', delay: '3.5s', dur: '8s', size: 2.5 },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                top: p.top, left: p.left, width: p.size * 3, height: p.size * 3,
                background: i % 2 === 0 ? 'rgba(200,180,74,0.35)' : 'rgba(90,122,58,0.4)',
                animation: `loginFloat ${p.dur} ease-in-out infinite`, animationDelay: p.delay,
                boxShadow: `0 0 ${p.size * 4}px rgba(200,180,74,0.2)`,
              }} />
          ))}

          {/* Diagonal shimmer lines */}
          <div className="absolute inset-0 opacity-[.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(60deg,transparent,transparent 40px,rgba(200,180,74,1) 40px,rgba(200,180,74,1) 41px)' }} />
        </div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full mx-4"
          style={{ maxWidth: 420 }}>

          {/* Card glow ring */}
          <div className="absolute -inset-px rounded-[28px] pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.2),rgba(90,122,58,0.15),rgba(200,180,74,0.05))', borderRadius: 28 }} />

          <div className="relative rounded-[26px] overflow-hidden px-8 py-9"
            style={{
              background: 'linear-gradient(160deg,rgba(20,34,15,0.95) 0%,rgba(12,22,10,0.98) 100%)',
              border: '1px solid rgba(200,180,74,0.12)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}>

            {/* Top accent line */}
            <div className="absolute top-0 left-[15%] right-[15%] h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(200,180,74,0.5),transparent)' }} />

            {/* Logo section */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22,1,0.36,1] }}
                className="relative mb-5">
                {/* Glow ring behind logo */}
                <div className="absolute inset-0 rounded-full blur-xl opacity-40"
                  style={{ background: 'radial-gradient(circle,#C8B44A,transparent)', transform: 'scale(1.4)' }} />
                <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden"
                  style={{ border: '2px solid rgba(200,180,74,0.35)', boxShadow: '0 0 32px rgba(200,180,74,0.2),0 8px 24px rgba(0,0,0,0.4)' }}>
                  <Image src="/images/logo.png" alt="Crafted by Amma" width={72} height={72} className="w-full h-full object-cover" />
                </div>
                {/* Live indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#0A1208', border: '1.5px solid rgba(200,180,74,0.2)' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                className="text-center">
                <h1 className="font-display text-xl font-bold mb-0.5" style={{ color: '#F5EED8' }}>Crafted by Amma</h1>
                <p className="text-sm font-bold tracking-[3.5px] uppercase" style={{ color: 'rgba(200,180,74,0.45)' }}>Admin Console</p>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08))' }} />
              <span className="text-[.88rem] tracking-[3px] uppercase font-bold" style={{ color: 'rgba(200,180,74,0.3)' }}>Secure Sign In</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Username field */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
                <label className="block text-smfont-bold tracking-[2.5px] uppercase mb-2.5" style={{ color: 'rgba(200,180,74,0.5)' }}>
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-smpointer-events-none" style={{ color: 'rgba(200,180,74,0.35)' }}>
                    👤
                  </span>
                  <input
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-smoutline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1.5px solid rgba(255,255,255,0.09)',
                      color: '#F0E8D0',
                      caretColor: '#C8B44A',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(200,180,74,0.5)';
                      e.currentTarget.style.background = 'rgba(200,180,74,0.06)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,180,74,0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </motion.div>

              {/* Password field */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42, duration: 0.4 }}>
                <label className="block text-smfont-bold tracking-[2.5px] uppercase mb-2.5" style={{ color: 'rgba(200,180,74,0.5)' }}>
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-smpointer-events-none" style={{ color: 'rgba(200,180,74,0.35)' }}>
                    🔑
                  </span>
                  <input
                    value={password} onChange={e => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-smoutline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1.5px solid rgba(255,255,255,0.09)',
                      color: '#F0E8D0',
                      caretColor: '#C8B44A',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(200,180,74,0.5)';
                      e.currentTarget.style.background = 'rgba(200,180,74,0.06)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,180,74,0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-smtransition-opacity hover:opacity-80"
                    style={{ color: 'rgba(200,180,74,0.4)', lineHeight: 1 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {loginError && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                    <span className="flex-shrink-0">⚠️</span>
                    <span>{loginError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
                <button type="submit" disabled={loggingIn || !username || !password}
                  className="w-full py-4 rounded-2xl font-bold text-smtracking-[0.5px] transition-all duration-200 mt-1 relative overflow-hidden group"
                  style={{
                    background: loggingIn ? 'rgba(200,180,74,0.4)' : 'linear-gradient(135deg,#C8B44A 0%,#B09838 50%,#D4942A 100%)',
                    color: '#0A1208',
                    boxShadow: (!loggingIn && username && password) ? '0 8px 28px rgba(200,180,74,0.3),0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    opacity: (!username || !password) ? 0.45 : 1,
                  }}>
                  {/* Shimmer sweep on hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)', transform: 'skewX(-20deg)' }} />
                  <span className="relative flex items-center justify-center gap-2">
                    {loggingIn
                      ? <><span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />Signing in…</>
                      : <>Enter Dashboard →</>
                    }
                  </span>
                </button>
              </motion.div>
            </form>

            {/* Bottom badge */}
            <div className="flex items-center justify-center gap-2 mt-7 pt-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
              <span className="text-sm tracking-[2px] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Encrypted · Secure Access
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── CSS for bg animations ── */}
        <style>{`
          @keyframes loginOrb1 {
            0%, 100% { transform: translate(0,0) scale(1); }
            33% { transform: translate(30px,-20px) scale(1.05); }
            66% { transform: translate(-20px,15px) scale(0.97); }
          }
          @keyframes loginOrb2 {
            0%, 100% { transform: translate(0,0) scale(1); }
            40% { transform: translate(-25px,20px) scale(1.04); }
            70% { transform: translate(15px,-10px) scale(0.98); }
          }
          @keyframes loginFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(-18px) rotate(180deg); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  /* ─── DASHBOARD ──────────────────────────────────────────── */
  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.total,    icon: '📦', grad: 'from-[#1A2A14] to-[#243318]', accent: '#5A7A3A',  pct: 100 },
    { label: 'Pending',      value: stats.pending,  icon: '⏳', grad: 'from-[#2A1F0A] to-[#332610]', accent: '#D4942A',  pct: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0 },
    { label: 'Confirmed',    value: stats.confirmed,icon: '✅', grad: 'from-[#0A2A1A] to-[#103322]', accent: '#10B981',  pct: stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0 },
    { label: 'Revenue',      value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '💰', grad: 'from-[#2A1A0A] to-[#332210]', accent: '#C8B44A', pct: null },
  ];

  const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
    { id: 'orders',    icon: '📦', label: 'Orders' },
    { id: 'products',  icon: '🛍️', label: 'Products' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'reviews',   icon: '⭐', label: 'Reviews' },
    { id: 'offers',    icon: '🏷️', label: 'Offers' },
    { id: 'delivery',  icon: '🚚', label: 'Delivery' },
  ];

  const tabLabels: Record<Tab, string> = {
    orders: 'Orders', products: 'Products', analytics: 'Analytics', reviews: 'Reviews', offers: 'Offers', delivery: 'Delivery',
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden w-full" style={{ background: '#080F06' }}>

      {/* WhatsApp copy toast */}
      <AnimatePresence>
        {waToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-smfont-semibold shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#25D366,#1da851)', color: '#fff', boxShadow: '0 8px 32px rgba(37,211,102,0.35)', whiteSpace: 'nowrap' }}>
            <span>💬</span>
            {waToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 fixed top-0 left-0 h-full z-40"
        style={{ background: 'linear-gradient(180deg,#0D1A09 0%,#111E0D 60%,#0A1208 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <div className="px-5 pt-7 pb-6 border-b border-white/[.05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl border border-brass/30 overflow-hidden flex-shrink-0"
              style={{ boxShadow: '0 0 20px rgba(200,180,74,0.15)' }}>
              <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-display text-[.85rem] font-bold text-white block leading-tight">Crafted by Amma</span>
              <span className="text-sm text-brass/40 tracking-[2px] uppercase">Admin Console</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-sm text-white/25 tracking-[1px]">Live · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all group
                ${tab === item.id
                  ? 'text-forest font-bold shadow-lg'
                  : 'text-white/35 hover:text-white/70 hover:bg-white/[.04]'}`}
              style={tab === item.id ? { background: 'linear-gradient(135deg,#C8B44A,#D4942A)', boxShadow: '0 4px 16px rgba(200,180,74,0.25)' } : {}}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <span className="text-sm tracking-[0.3px]">{item.label}</span>
              {item.id === 'orders' && stats.pending > 0 && (
                <span className="ml-auto text-smfont-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.2)', color: '#FBBF24' }}>
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom: quick stats + logout */}
        <div className="px-3 pb-5 border-t border-white/[.04] pt-4 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Revenue', val: `₹${(stats.revenue / 1000).toFixed(1)}k`, color: '#C8B44A' },
              { label: 'Orders', val: stats.total, color: '#5A7A3A' },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-sm font-bold" style={{ color }}>{val}</div>
                <div className="text-sm text-white/20 uppercase tracking-[1px]">{label}</div>
              </div>
            ))}
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-smtext-white/20 hover:text-white/50 hover:bg-white/[.04] transition-all">
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 flex flex-col md:ml-[220px] min-h-screen overflow-x-hidden">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex-shrink-0"
          style={{ background: 'rgba(8,15,6,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,180,74,0.08)', boxShadow: '0 1px 0 rgba(0,0,0,0.4)' }}>
          <div className="px-5 py-3 flex items-center gap-3">
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-brass/20">
                <Image src="/images/logo.png" alt="Logo" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-smfont-bold text-white">Admin</span>
            </div>

            {/* Page title (desktop) */}
            <div className="hidden md:block">
              <h1 className="font-display text-base font-bold text-white leading-tight">{tabLabels[tab]}</h1>
              <p className="text-sm text-white/25 tracking-[1.5px] uppercase">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="flex-1" />

            {stats.pending > 0 && (
              <button onClick={() => setTab('orders')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-smfont-bold border transition-all"
                style={{ color: '#D4942A', borderColor: 'rgba(212,148,42,0.3)', background: 'rgba(212,148,42,0.1)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                </span>
                {stats.pending} pending
              </button>
            )}

          </div>
        </header>

        {/* Mobile bottom tab bar - fixed at bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
          style={{ background: 'rgba(13,26,9,0.97)', borderTop: '1px solid rgba(200,180,74,0.15)', backdropFilter: 'blur(20px)' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all relative
                ${tab === item.id ? 'text-brass' : 'text-white/25'}`}>
              {tab === item.id && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full"
                  style={{ background: 'linear-gradient(90deg,#C8B44A,#D4942A)' }} />
              )}
              <span className="text-base">{item.icon}</span>
              <span className="text-sm font-semibold capitalize tracking-wide">{item.label}</span>
              {item.id === 'orders' && stats.pending > 0 && (
                <span className="absolute top-1 right-[calc(50%-14px)] w-3.5 h-3.5 rounded-full text-[.42rem] font-bold flex items-center justify-center text-white"
                  style={{ background: '#D4942A' }}>
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── PAGE CONTENT ── */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6 pb-2">
            {STAT_CARDS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`bg-gradient-to-br ${s.grad} rounded-2xl p-4 border border-white/[.06] relative overflow-hidden`}
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
                {/* Icon badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: `${s.accent}18` }}>{s.icon}</div>
                <p className="text-sm font-bold tracking-[2.5px] uppercase mb-2.5"
                  style={{ color: `${s.accent}99` }}>{s.label}</p>
                <p className="font-display text-2xl font-bold text-white truncate mb-3">{s.value}</p>
                {/* Progress bar */}
                {s.pct !== null && (
                  <div className="space-y-1">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg,${s.accent}88,${s.accent})` }} />
                    </div>
                    <p className="text-[.85rem] text-white/20">{s.pct}% of total</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${s.accent}44, transparent)` }} />
              </motion.div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="px-4 py-4 flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
            {['all', ...ORDER_STATUSES.map(s => s.value)].map(s => {
              const meta = s === 'all' ? null : STATUS_META[s];
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3.5 py-1.5 rounded-full text-smfont-semibold transition-all border flex-shrink-0 ${
                    filter === s
                      ? 'text-white border-transparent shadow-md'
                      : 'text-white/30 border-white/[.08] hover:border-white/20 hover:text-white/50'
                  }`}
                  style={filter === s ? { background: meta?.color || '#1A2A14', boxShadow: `0 4px 12px ${meta?.color || '#1A2A14'}44` } : { background: 'rgba(255,255,255,0.04)' }}>
                  {s === 'all' ? 'All Orders' : meta?.label}
                </button>
              );
            })}
          </div>

          {/* Mobile order cards */}
          <div className="md:hidden px-4 pb-8 space-y-3">
            {orders.length === 0 && (
              <div className="py-16 text-center text-white/20 text-smrounded-2xl border border-white/[.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>No orders found</div>
            )}
            {orders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl border border-white/[.06] overflow-hidden cursor-pointer transition-all hover:border-white/[.12] hover:shadow-lg active:scale-[.99]"
                style={{ background: 'linear-gradient(135deg,rgba(22,36,18,0.9),rgba(10,16,8,0.95))', boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
                onClick={() => setSelected(order)}>
                <div className="flex">
                  {/* Left status stripe */}
                  <div className="w-1 flex-shrink-0 rounded-l-2xl"
                    style={{ background: STATUS_META[order.status]?.color || '#888' }} />
                  <div className="flex-1 px-4 py-3.5">
                    {/* Top row: avatar + info + amount */}
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-smfont-bold"
                        style={{ background: `${STATUS_META[order.status]?.color || '#888'}18`, color: STATUS_META[order.status]?.color || '#888', border: `1px solid ${STATUS_META[order.status]?.color || '#888'}30` }}>
                        {order.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="font-semibold text-smtext-white/90 truncate">{order.name}</div>
                          <StatusBadge status={order.status} size="xs" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-smtext-brass/40">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-white/20 text-[.88rem]">·</span>
                          <span className="text-sm text-white/30 truncate">{order.city}</span>
                        </div>
                      </div>
                      <div className="font-display text-base font-bold flex-shrink-0" style={{ color: '#C8B44A' }}>
                        ₹{order.totalAmount ?? '—'}
                      </div>
                    </div>
                    {/* Products */}
                    <div className="text-sm text-white/25 mt-2.5 truncate pl-12">{getProductNames(order.products)}</div>
                    {/* Status select — full width below, easy to tap */}
                    {(() => {
                      const flow = ['pending', 'verified', 'confirmed', 'shipped', 'delivered'];
                      const currentIdx = flow.indexOf(order.status);
                      if (order.status === 'cancelled' || order.status === 'delivered') return null;
                      const forward = flow.slice(currentIdx);
                      const opts = [...forward, 'cancelled'].map(v => ORDER_STATUSES.find(s => s.value === v)!).filter(Boolean);
                      return (
                        <div className="mt-2.5 pl-12" onClick={e => e.stopPropagation()}>
                          <select value={order.status} onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value, order); }}
                            disabled={loading}
                            className="w-full text-smborder border-white/20 rounded-lg px-3 py-2 outline-none cursor-pointer disabled:opacity-50"
                            style={{ background: '#1A2A14', color: '#E8DEB0', minWidth: 120 }}>
                            {opts.map(s => <option key={s.value} value={s.value} style={{ background: '#1A2A14', color: '#E8DEB0' }}>{s.label}</option>)}
                          </select>
                        </div>
                      );
                    })()}
                  </div>{/* end flex-1 */}
                </div>{/* end flex */}
              </motion.div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block px-6 pb-8">
            <div className="rounded-2xl overflow-hidden border border-white/[.07]"
              style={{ background: 'rgba(15,24,10,0.8)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(200,180,74,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Order', 'Customer', 'Products', 'City', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-smfont-bold uppercase tracking-[2px]" style={{ color: 'rgba(200,180,74,0.4)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-t border-white/[.04] cursor-pointer transition-all hover:bg-white/[.03]"
                        onClick={() => setSelected(order)}>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-smfont-bold px-2 py-0.5 rounded-md" style={{ color: 'rgba(200,180,74,0.5)', background: 'rgba(200,180,74,0.08)' }}>
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-smtext-white/90">{order.name}</div>
                          <div className="text-[.85rem] text-white/30 mt-0.5">{order.phone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-white/40 line-clamp-1 max-w-[200px] block">{getProductNames(order.products)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-white/40">{order.city}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-bold" style={{ color: '#C8B44A' }}>₹{order.totalAmount ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          {(() => {
                            const flow = ['pending', 'verified', 'confirmed', 'shipped', 'delivered'];
                            const currentIdx = flow.indexOf(order.status);
                            if (order.status === 'cancelled') return <span className="text-[.85rem] text-red-400/50 italic">Cancelled</span>;
                            if (order.status === 'delivered') return <span className="text-[.85rem] text-emerald-400/50 italic">Delivered</span>;
                            const forward = flow.slice(currentIdx);
                            const opts = [...forward, 'cancelled'].map(v => ORDER_STATUSES.find(s => s.value === v)!).filter(Boolean);
                            return (
                              <select value={order.status} onChange={e => updateStatus(order.id, e.target.value, order)}
                                disabled={loading}
                                className="text-sm border border-white/20 rounded-lg px-3 py-2 outline-none cursor-pointer disabled:opacity-50"
                                style={{ background: '#1A2A14', color: '#E8DEB0', minWidth: 120 }}>
                                {opts.map(s => <option key={s.value} value={s.value} style={{ background: '#1A2A14', color: '#E8DEB0' }}>{s.label}</option>)}
                              </select>
                            );
                          })()}
                        </td>
                      </motion.tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-16 text-center text-white/20 text-sm">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── REVIEWS TAB ── */}
      {tab === 'reviews' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 max-w-3xl">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Customer Reviews</h2>
              <p className="text-sm text-white/30 mt-0.5">Approve reviews to show them on the website. Delete spam.</p>
            </div>
            <div className="flex gap-2 text-[.88rem] font-semibold">
              <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(200,180,74,0.12)', color: 'rgba(200,180,74,0.8)' }}>
                {reviews.filter(r => !r.approved).length} pending
              </span>
              <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                {reviews.filter(r => r.approved).length} approved
              </span>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-12 text-white/30 text-sm">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">No reviews yet</div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-2xl p-4 md:p-5 flex flex-col gap-3"
                  style={{ background: r.approved ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${r.approved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)'}` }}>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-smflex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,rgba(90,122,58,0.4),rgba(200,180,74,0.2))', color: 'rgba(200,180,74,0.9)' }}>
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[.88rem] text-white/80">{r.name}</p>
                        <p className="text-sm text-white/35">📍 {r.place} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="text-sm" style={{ color: s <= r.rating ? '#D4942A' : 'rgba(255,255,255,0.1)' }}>★</span>
                        ))}
                      </div>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${r.approved ? 'text-emerald-400' : 'text-amber-400'}`}
                        style={{ background: r.approved ? 'rgba(16,185,129,0.12)' : 'rgba(212,148,42,0.12)' }}>
                        {r.approved ? '✓ Live' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Review text */}
                  <p className="text-[.85rem] leading-relaxed text-white/50 italic">&ldquo;{r.text}&rdquo;</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {!r.approved ? (
                      <button
                        onClick={async () => {
                          await fetch(`/api/reviews/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: true }) });
                          fetchReviews();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[.7rem] font-semibold transition-all hover:opacity-90"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                        ✓ Approve
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await fetch(`/api/reviews/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: false }) });
                          fetchReviews();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[.7rem] font-semibold transition-all hover:opacity-90"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                        Hide
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this review?')) return;
                        await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' });
                        fetchReviews();
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[.7rem] font-semibold transition-all hover:opacity-90 ml-auto"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── OFFERS TAB ── */}
      {tab === 'offers' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 max-w-2xl">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-white">Offer Banners</h2>
            <p className="text-sm text-white/30 mt-0.5">Control the scrolling offers shown at the top of your site.</p>
          </div>

          <div className="rounded-2xl p-5 border border-white/[.07] mb-5"
            style={{ background: 'rgba(15,24,10,0.8)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
            <h3 className="text-sm font-bold text-white/80 mb-3">Add New Offer</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input value={newOfferIcon} onChange={e => setNewOfferIcon(e.target.value)}
                  className="w-14 flex-shrink-0 px-2 py-2.5 border-[1.5px] border-white/[.08] rounded-xl text-center text-lg outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
                  maxLength={4} />
                <input value={newOfferText} onChange={e => setNewOfferText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOffer()}
                  className="flex-1 px-3 py-2.5 border-[1.5px] border-white/[.08] rounded-xl text-smoutline-none transition-all placeholder:text-white/20"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
                  placeholder="e.g. Free delivery on orders above ₹350" />
              </div>
              <button onClick={addOffer} disabled={offersLoading || !newOfferText.trim()}
                className="w-full py-2.5 rounded-xl text-smfont-semibold disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg,#C8B44A,#D4942A)', color: '#0D1A09', fontWeight: 700 }}>
                Add Offer
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {offers.length === 0 && (
              <div className="text-center py-12 text-white/20 text-smrounded-2xl border border-white/[.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                No offers yet. Add your first one above.
              </div>
            )}
            <AnimatePresence>
              {offers.map(offer => (
                <motion.div key={offer.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-[1.5px] transition-all
                    ${offer.active ? 'border-brass/20' : 'border-white/[.06] opacity-50'}`}
                  style={{ background: offer.active ? 'rgba(200,180,74,0.06)' : 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xl flex-shrink-0">{offer.icon}</span>
                  <span className="flex-1 text-smtext-white/80">{offer.text}</span>
                  <button onClick={() => toggleOffer(offer.id, !offer.active)}
                    className={`px-3 py-1 rounded-full text-smfont-semibold transition-all
                      ${offer.active ? 'text-emerald-400' : 'text-white/30'}`}
                    style={{ background: offer.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)' }}>
                    {offer.active ? 'Live' : 'Hidden'}
                  </button>
                  <button onClick={() => deleteOffer(offer.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-smtext-red-400/40 hover:text-red-400 transition-all"
                    style={{ background: 'rgba(239,68,68,0.06)' }}>
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── DELIVERY TAB ── */}
      {tab === 'delivery' && delivery && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 max-w-lg">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-white">Delivery Settings</h2>
            <p className="text-sm text-white/30 mt-0.5">Control shipping charges shown during checkout.</p>
          </div>

          <div className="rounded-2xl p-6 border border-white/[.07] space-y-5"
            style={{ background: 'rgba(15,24,10,0.8)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
            {[
              { label: 'Base Delivery Charge (₹)', key: 'baseCharge', hint: 'Applied when free delivery conditions aren\'t met' },
              { label: 'Free Delivery Above (₹)', key: 'freeAboveAmt', hint: 'Orders above this amount qualify for free delivery' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-smfont-bold uppercase tracking-[2px] mb-1.5" style={{ color: 'rgba(200,180,74,0.5)' }}>{field.label}</label>
                <input type="number" min={0}
                  value={delivery[field.key as keyof DeliverySettings] as number}
                  onChange={e => setDelivery({ ...delivery, [field.key]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-[1.5px] border-white/[.08] rounded-xl text-smoutline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }} />
                <p className="text-sm text-white/25 mt-1">{field.hint}</p>
              </div>
            ))}

            <div className="flex items-center justify-between p-4 rounded-xl border-[1.5px]" style={{ borderColor: 'rgba(200,180,74,0.15)', background: 'rgba(200,180,74,0.04)' }}>
              <div>
                <p className="text-sm font-semibold text-white/80">Free delivery in Karnataka</p>
                <p className="text-[.85rem] text-white/30 mt-0.5">When order meets the free delivery threshold</p>
              </div>
              <button type="button" onClick={() => setDelivery({ ...delivery, karnatakFree: !delivery.karnatakFree })}
                className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0`}
                style={{ background: delivery.karnatakFree ? 'linear-gradient(135deg,#C8B44A,#D4942A)' : 'rgba(255,255,255,0.1)', boxShadow: delivery.karnatakFree ? '0 2px 8px rgba(200,180,74,0.3)' : 'none' }}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${delivery.karnatakFree ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="block text-smfont-bold uppercase tracking-[2px] mb-1.5" style={{ color: 'rgba(200,180,74,0.5)' }}>Customer-facing Note</label>
              <input value={delivery.note} onChange={e => setDelivery({ ...delivery, note: e.target.value })}
                className="w-full px-4 py-3 border-[1.5px] border-white/[.08] rounded-xl text-smoutline-none transition-all placeholder:text-white/20"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
                placeholder="e.g. Free delivery in Karnataka for orders ₹350+" />
            </div>

            <button onClick={saveDelivery} disabled={deliverySaving}
              className="w-full py-3.5 rounded-xl font-semibold text-smtracking-[0.5px] disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#C8B44A,#D4942A)', color: '#0D1A09', boxShadow: '0 6px 20px rgba(200,180,74,0.2)' }}>
              {deliverySaving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>

          <div className="mt-4 p-4 rounded-xl border border-white/[.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-sm font-bold uppercase tracking-[2px] mb-2" style={{ color: 'rgba(200,180,74,0.4)' }}>Live Preview</p>
            <p className="text-sm text-white/70">Delivery: <strong style={{ color: '#C8B44A' }}>₹{delivery.baseCharge}</strong></p>
            {delivery.karnatakFree && <p className="text-[.88rem] text-emerald-400/60 mt-1">{delivery.note}</p>}
          </div>
        </motion.div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Products</h2>
              <p className="text-sm text-white/30 mt-0.5">Edit product details, prices, and images.</p>
            </div>
          </div>

          {productsLoading && (
            <div className="flex items-center justify-center py-20">
              <span className="w-8 h-8 border-2 border-white/10 border-t-brass rounded-full animate-spin" />
            </div>
          )}

          {!productsLoading && products.length === 0 && (
            <div className="py-20 text-center rounded-2xl border border-white/[.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-4xl mb-3 opacity-20">📦</div>
              <p className="text-sm text-white/40 font-medium">No products found</p>
              <p className="text-sm text-white/20 mt-1">Products seeded in the database will appear here.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {products.map(product => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/[.07] overflow-hidden group transition-all hover:border-brass/20"
                style={{ background: 'rgba(15,24,10,0.8)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>

                {/* Product image */}
                <div className="h-52 relative overflow-hidden bg-gradient-to-br from-forest/[.05] to-sage/[.08]">
                  {(product.images ?? [])[0] ? (
                    <img src={product.images[0]} alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <span className="text-5xl opacity-15">🫙</span>
                      <span className="text-sm font-semibold text-forest/20 tracking-widest uppercase">No image</span>
                    </div>
                  )}
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(15,26,10,0.55), transparent)' }} />
                  {/* Image count badge */}
                  {(product.images ?? []).length > 1 && (
                    <span className="absolute bottom-2.5 left-3 text-smfont-bold text-white/70 tracking-wide">
                      +{product.images.length - 1} more
                    </span>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-2.5 right-2.5 text-smfont-bold px-2 py-0.5 rounded-full backdrop-blur-sm
                    ${product.active ? 'bg-sage/80 text-white' : 'bg-black/40 text-white/60'}`}>
                    {product.active ? '● Live' : '○ Hidden'}
                  </span>
                  {/* Badge label */}
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 text-smfont-bold px-2 py-0.5 rounded-full backdrop-blur-sm"
                      style={{ background: 'rgba(212,148,42,0.75)', color: '#fff' }}>
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-display text-smfont-bold text-white/90 leading-snug mb-1">{product.name}</h3>
                  <p className="text-[.85rem] text-white/30 line-clamp-2 mb-3">{product.description}</p>

                  {/* Price pills */}
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {Object.entries(product.prices).map(([size, price]) => (
                      <span key={size} className="text-sm font-semibold px-2.5 py-1 rounded-full border border-white/[.08]" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                        {size} · <span style={{ color: '#C8B44A' }} className="font-bold">₹{price}</span>
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setEditingProduct({ ...product })}
                    className="w-full py-2.5 rounded-xl text-smfont-bold transition-all hover:opacity-90 active:scale-[.98]"
                    style={{ background: 'linear-gradient(135deg,#C8B44A,#D4942A)', color: '#0D1A09' }}>
                    Edit Product →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {analyticsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brass animate-spin" />
              <span className="text-sm text-white/20 tracking-[2px] uppercase">Loading analytics…</span>
            </div>
          ) : analyticsStats ? (
            <div className="p-4 md:p-6 space-y-5">

              {/* ══ LIVE HEADER BANNER ══ */}
              {(() => {
                const totalOrders = analyticsStats.orders.byStatus.reduce((s, b) => s + b.count, 0);
                const pendingCount = analyticsStats.orders.byStatus.find(b => b.status === 'pending')?.count ?? 0;
                const deliveredCount = analyticsStats.orders.byStatus.find(b => b.status === 'delivered')?.count ?? 0;
                const convRate = analyticsStats.funnel.visitors > 0
                  ? ((analyticsStats.funnel.orders / analyticsStats.funnel.visitors) * 100).toFixed(1)
                  : '0.0';
                const retainRate = analyticsStats.customers.total > 0
                  ? Math.round((analyticsStats.customers.repeat / analyticsStats.customers.total) * 100)
                  : 0;
                return (
                  <div className="rounded-2xl overflow-hidden border border-white/[.08]"
                    style={{ background: 'linear-gradient(135deg,#0D1A09 0%,#162110 40%,#0D1A09 100%)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
                    {/* Header bar */}
                    <div className="px-5 py-2.5 flex items-center justify-between border-b border-white/[.05]">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#34D399' }} />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span className="text-sm font-bold tracking-[2px] uppercase text-white/30">Live · {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <button onClick={fetchAnalytics}
                        className="text-sm font-semibold px-2.5 py-1 rounded-lg border border-white/[.07] text-white/25 hover:text-white/50 hover:border-white/15 transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        ↻ Refresh
                      </button>
                    </div>
                    {/* 4 KPI cells */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[.05]">
                      {[
                        { label: 'Total Revenue', val: `₹${analyticsStats.revenue.total.toLocaleString()}`, sub: `₹${analyticsStats.revenue.avg} avg order`, color: '#C8B44A', icon: '💰' },
                        { label: 'All Orders', val: totalOrders, sub: `${pendingCount} pending · ${deliveredCount} delivered`, color: '#60A5FA', icon: '📦' },
                        { label: 'Conversion Rate', val: `${convRate}%`, sub: `${analyticsStats.funnel.visitors} visitors`, color: '#34D399', icon: '📈' },
                        { label: 'Retention Rate', val: `${retainRate}%`, sub: `${analyticsStats.customers.repeat} of ${analyticsStats.customers.total} repeat`, color: '#A78BFA', icon: '🔁' },
                      ].map(({ label, val, sub, color, icon }) => (
                        <div key={label} className="px-4 py-4 md:py-5">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-sm opacity-60">{icon}</span>
                            <span className="text-[.85rem] font-bold tracking-[1.5px] uppercase text-white/30">{label}</span>
                          </div>
                          <div className="font-display text-xl md:text-2xl font-bold leading-none truncate" style={{ color }}>{val}</div>
                          <div className="text-[.88rem] text-white/20 mt-1.5 leading-tight truncate">{sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ══ VISUAL CONVERSION FUNNEL ══ */}
              <div className="rounded-2xl overflow-hidden border border-white/[.07]"
                style={{ background: 'rgba(12,20,8,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="px-5 py-3.5 border-b border-white/[.05]" style={{ background: 'rgba(200,180,74,0.04)' }}>
                  <p className="text-sm font-bold tracking-[2.5px] uppercase" style={{ color: 'rgba(200,180,74,0.45)' }}>Conversion Funnel</p>
                </div>
                <div className="p-4 md:p-5">
                  {/* Funnel stages with arrows */}
                  {(() => {
                    const stages = [
                      { label: 'Visitors', val: analyticsStats.funnel.visitors, icon: '👀', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
                      { label: 'Cart Views', val: analyticsStats.funnel.cartViews, icon: '🛒', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
                      { label: 'Checkout', val: analyticsStats.funnel.checkouts, icon: '📋', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
                      { label: 'Orders', val: analyticsStats.funnel.orders, icon: '✅', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
                    ];
                    const maxVal = stages[0].val || 1;
                    return (
                      <>
                        {/* Desktop: horizontal */}
                        <div className="hidden md:flex items-center gap-2">
                          {stages.map((stage, i) => {
                            const dropPct = i > 0 && stages[i - 1].val > 0
                              ? Math.round((stage.val / stages[i - 1].val) * 100)
                              : null;
                            return (
                              <div key={stage.label} className="flex items-center gap-2 flex-1">
                                {i > 0 && (
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <span className="text-sm font-bold" style={{ color: dropPct && dropPct >= 50 ? '#34D399' : '#EF4444' }}>{dropPct}%</span>
                                    <span className="text-white/20 text-base">→</span>
                                  </div>
                                )}
                                <div className="flex-1 rounded-xl p-3 text-center border border-white/[.06]" style={{ background: stage.bg }}>
                                  <div className="text-lg mb-1">{stage.icon}</div>
                                  <div className="font-display text-xl font-bold" style={{ color: stage.color }}>{stage.val.toLocaleString()}</div>
                                  <div className="text-[.88rem] text-white/35 uppercase tracking-[1px] mt-0.5">{stage.label}</div>
                                  {/* Width bar showing relative volume */}
                                  <div className="mt-2 h-1 rounded-full mx-auto" style={{ background: 'rgba(255,255,255,0.06)', width: '80%' }}>
                                    <div className="h-full rounded-full" style={{ width: `${Math.max(4, (stage.val / maxVal) * 100)}%`, background: stage.color }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Mobile: vertical */}
                        <div className="md:hidden space-y-2">
                          {stages.map((stage, i) => {
                            const dropPct = i > 0 && stages[i - 1].val > 0
                              ? Math.round((stage.val / stages[i - 1].val) * 100)
                              : null;
                            return (
                              <div key={stage.label}>
                                {i > 0 && (
                                  <div className="flex items-center gap-2 px-3 py-1">
                                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                    <span className="text-sm font-bold px-1.5 py-0.5 rounded-full" style={{ color: dropPct && dropPct >= 50 ? '#34D399' : '#EF4444', background: dropPct && dropPct >= 50 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)' }}>↓ {dropPct}% continued</span>
                                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                  </div>
                                )}
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[.06]" style={{ background: stage.bg }}>
                                  <span className="text-xl flex-shrink-0">{stage.icon}</span>
                                  <span className="text-sm text-white/50 flex-1">{stage.label}</span>
                                  <div className="text-right">
                                    <div className="font-display text-lg font-bold" style={{ color: stage.color }}>{stage.val.toLocaleString()}</div>
                                    <div className="h-1 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)', width: 60 }}>
                                      <div className="h-full rounded-full" style={{ width: `${Math.max(4, (stage.val / maxVal) * 100)}%`, background: stage.color }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Overall conversion badge */}
                        {analyticsStats.funnel.visitors > 0 && (
                          <div className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <span className="text-sm text-white/30">Overall visitor-to-order:</span>
                            <span className="text-sm font-bold" style={{ color: '#34D399' }}>
                              {((analyticsStats.funnel.orders / analyticsStats.funnel.visitors) * 100).toFixed(1)}%
                            </span>
                            <span className="text-sm text-white/20">conversion rate</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* ══ REVENUE CHART ══ */}
              {analyticsStats.dailyRevenue.length > 0 && (() => {
                const data = analyticsStats.dailyRevenue;
                const max = Math.max(...data.map(d => d.amount), 1);
                const total30d = data.reduce((s, d) => s + d.amount, 0);
                const half = Math.floor(data.length / 2);
                const first15 = data.slice(0, half).reduce((s, d) => s + d.amount, 0);
                const last15 = data.slice(half).reduce((s, d) => s + d.amount, 0);
                const trend = first15 > 0 ? Math.round(((last15 - first15) / first15) * 100) : 0;
                return (
                  <div className="rounded-2xl border border-white/[.07]" style={{ background: 'rgba(12,20,8,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <div className="px-5 py-3.5 border-b border-white/[.05] flex items-center justify-between" style={{ background: 'rgba(200,180,74,0.04)' }}>
                      <p className="text-sm font-bold tracking-[2.5px] uppercase" style={{ color: 'rgba(200,180,74,0.45)' }}>Revenue · Last 30 Days</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: trend >= 0 ? '#34D399' : '#EF4444' }}>
                          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs prior period
                        </span>
                        <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ color: '#C8B44A', background: 'rgba(200,180,74,0.1)' }}>
                          ₹{total30d.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-end gap-px h-32 md:h-44">
                        {data.map(({ date, amount }, i) => {
                          const heightPct = Math.max(4, (amount / max) * 100);
                          const isWeekend = [0, 6].includes(new Date(date).getDay());
                          return (
                            <div key={date} className="flex-1 flex flex-col justify-end items-center group relative" style={{ minWidth: 0 }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[.85rem] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
                                style={{ background: 'rgba(200,180,74,0.95)', color: '#0D1A09', fontWeight: 700 }}>
                                ₹{amount.toLocaleString()} · {date.slice(5)}
                              </div>
                              <div className="w-full rounded-t transition-all cursor-default relative overflow-hidden"
                                style={{ height: `${heightPct}%`, background: isWeekend ? 'rgba(200,180,74,0.25)' : 'rgba(255,255,255,0.07)' }}>
                                {amount > 0 && (
                                  <div className="absolute inset-0 rounded-t"
                                    style={{ background: `linear-gradient(to top,${isWeekend ? 'rgba(200,180,74,0.5)' : 'rgba(90,122,58,0.6)'},${isWeekend ? '#C8B44A' : 'rgba(200,180,74,0.8)'})` }} />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 px-0.5">
                        <span className="text-[.85rem] text-white/20">{data[0]?.date.slice(5)}</span>
                        <span className="text-[.85rem] text-white/15">· Hover bars for details ·</span>
                        <span className="text-[.85rem] text-white/20">{data[data.length - 1]?.date.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ══ ORDERS BY STATUS + TOP CITIES ══ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Orders by status - donut-style */}
                <div className="rounded-2xl p-5 border border-white/[.07]" style={{ background: 'rgba(12,20,8,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold tracking-[2.5px] uppercase" style={{ color: 'rgba(200,180,74,0.45)' }}>Orders by Status</p>
                    <span className="text-sm text-white/25">{analyticsStats.orders.byStatus.reduce((s, b) => s + b.count, 0)} total</span>
                  </div>
                  <div className="space-y-2.5">
                    {analyticsStats.orders.byStatus.map(({ status, count }) => {
                      const m: Record<string, { color: string; icon: string; label: string }> = {
                        pending:   { color: '#D4942A', icon: '⏳', label: 'Pending' },
                        verified:  { color: '#5A7A3A', icon: '✅', label: 'Verified' },
                        confirmed: { color: '#5A7A3A', icon: '📋', label: 'Confirmed' },
                        shipped:   { color: '#3B82F6', icon: '🚚', label: 'Shipped' },
                        delivered: { color: '#10B981', icon: '🎉', label: 'Delivered' },
                        cancelled: { color: '#EF4444', icon: '❌', label: 'Cancelled' },
                      };
                      const { color, icon, label } = m[status] ?? { color: '#999', icon: '•', label: status };
                      const total = analyticsStats.orders.byStatus.reduce((s, b) => s + b.count, 0) || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={status} className="flex items-center gap-2.5">
                          <span className="text-sm w-5 flex-shrink-0">{icon}</span>
                          <span className="text-[.85rem] text-white/45 w-16 flex-shrink-0 capitalize">{label}</span>
                          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}99,${color})` }} />
                          </div>
                          <span className="text-sm text-white/25 w-7 text-right flex-shrink-0">{pct}%</span>
                          <span className="text-sm font-bold w-5 text-right flex-shrink-0" style={{ color }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top cities with rank */}
                <div className="rounded-2xl p-5 border border-white/[.07]" style={{ background: 'rgba(12,20,8,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold tracking-[2.5px] uppercase" style={{ color: 'rgba(200,180,74,0.45)' }}>Top Cities</p>
                    <span className="text-sm text-white/25">{analyticsStats.topCities.length} cities</span>
                  </div>
                  {analyticsStats.topCities.length === 0 && <p className="text-sm text-white/20">No order data yet</p>}
                  <div className="space-y-2.5">
                    {analyticsStats.topCities.slice(0, 6).map(({ city, count }, i) => {
                      const max = analyticsStats.topCities[0]?.count ?? 1;
                      const rankColors = ['#C8B44A', '#9CA3AF', '#CD7F32'];
                      const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                      return (
                        <div key={city} className="flex items-center gap-2.5">
                          <span className="text-sm w-5 flex-shrink-0 text-center">{rankIcon ?? <span className="text-sm text-white/20">{i + 1}</span>}</span>
                          <span className="text-[.88rem] text-white/50 w-20 truncate capitalize flex-shrink-0">{city}</span>
                          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: i < 3 ? `linear-gradient(90deg,rgba(90,122,58,0.6),${rankColors[i] ?? '#C8B44A'})` : 'rgba(255,255,255,0.15)' }} />
                          </div>
                          <span className="text-sm font-bold w-5 text-right flex-shrink-0" style={{ color: i < 3 ? (rankColors[i] ?? '#C8B44A') : 'rgba(255,255,255,0.3)' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ══ PRODUCT PERFORMANCE ══ */}
              {(() => {
                const top = analyticsStats.productPerformance[0];
                const rest = analyticsStats.productPerformance.slice(1);
                const maxUnits = Math.max(...analyticsStats.productPerformance.map(x => x.units), 1);
                return (
                  <div className="space-y-3">
                    {/* Top performer spotlight */}
                    {top && (
                      <div className="rounded-2xl p-4 md:p-5 border border-brass/20 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.12),rgba(212,148,42,0.06),rgba(12,20,8,0.9))', boxShadow: '0 8px 32px rgba(200,180,74,0.08)' }}>
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10" style={{ background: '#C8B44A' }} />
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">🏆</span>
                          <span className="text-sm font-bold tracking-[2px] uppercase" style={{ color: 'rgba(200,180,74,0.6)' }}>Top Performer</span>
                        </div>
                        <div className="flex items-end justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-display text-lg md:text-xl font-bold text-white/90 leading-tight">{top.name}</h3>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-sm font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(200,180,74,0.15)', color: '#C8B44A' }}>
                                {top.units} units sold
                              </span>
                              <span className="text-sm font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
                                ₹{top.revenue.toLocaleString()} revenue
                              </span>
                              <span className="text-sm font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}>
                                {analyticsStats.addToCartByProduct[top.id] ?? 0} add-to-carts
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-2xl md:text-3xl font-bold" style={{ color: '#C8B44A' }}>₹{top.revenue.toLocaleString()}</div>
                            <div className="text-[.88rem] text-white/25 uppercase tracking-widest mt-0.5">Est. Revenue</div>
                          </div>
                        </div>
                        {/* Volume bar */}
                        <div className="mt-4 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg,rgba(200,180,74,0.4),#C8B44A)' }} />
                        </div>
                      </div>
                    )}

                    {/* Rest of products */}
                    {rest.length > 0 && (
                      <div className="rounded-2xl overflow-hidden border border-white/[.07]" style={{ background: 'rgba(12,20,8,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/[.06]" style={{ background: 'rgba(200,180,74,0.03)' }}>
                                <th className="px-4 py-2.5 text-left text-smfont-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(200,180,74,0.35)' }}>Product</th>
                                <th className="px-4 py-2.5 text-left text-smfont-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(200,180,74,0.35)' }}>Units</th>
                                <th className="hidden md:table-cell px-4 py-2.5 text-left text-smfont-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(200,180,74,0.35)' }}>Carts</th>
                                <th className="px-4 py-2.5 text-left text-smfont-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(200,180,74,0.35)' }}>Revenue</th>
                                <th className="hidden md:table-cell px-4 py-2.5 text-left text-smfont-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(200,180,74,0.35)' }}>Orders</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rest.map((p, i) => (
                                <tr key={p.id} className={i < rest.length - 1 ? 'border-b border-white/[.04]' : ''}>
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-smtext-white/70 leading-tight">{p.name}</div>
                                    <div className="mt-1 h-1 w-16 md:w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                      <div className="h-full rounded-full" style={{ width: `${(p.units / maxUnits) * 100}%`, background: 'rgba(200,180,74,0.4)' }} />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-smfont-bold text-white/50">{p.units}</td>
                                  <td className="hidden md:table-cell px-4 py-3 text-smfont-bold text-blue-400/70">{analyticsStats.addToCartByProduct[p.id] ?? 0}</td>
                                  <td className="px-4 py-3 text-smfont-bold text-emerald-400/80">₹{p.revenue.toLocaleString()}</td>
                                  <td className="hidden md:table-cell px-4 py-3 text-smfont-bold text-white/30">{p.orders}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {analyticsStats.productPerformance.length === 0 && (
                      <div className="py-12 text-center text-smtext-white/20 rounded-2xl border border-white/[.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        No product sales yet
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Customer Details ── */}
              <div className="rounded-2xl overflow-hidden border border-white/[.07]" style={{ background: 'rgba(15,24,10,0.8)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between" style={{ background: 'rgba(200,180,74,0.04)' }}>
                  <p className="text-sm font-bold tracking-[2.5px] uppercase" style={{ color: 'rgba(200,180,74,0.4)' }}>Customer Details</p>
                  <div className="flex gap-4 text-smtext-white/30">
                    <span>Total: <span style={{ color: '#C8B44A' }} className="font-bold">{analyticsStats.customers.total}</span></span>
                    <span>Repeat buyers: <span className="font-bold text-emerald-400">{analyticsStats.customers.repeat}</span></span>
                  </div>
                </div>
                {/* Mobile customer cards */}
                <div className="md:hidden divide-y divide-white/[.04]">
                  {analyticsStats.customers.list.length === 0 && (
                    <div className="px-5 py-10 text-center text-smtext-white/20">No customers yet</div>
                  )}
                  {analyticsStats.customers.list.map(c => (
                    <div key={c.phone} onClick={() => openCustomer(c)}
                      className="px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-white/[.03] transition-colors active:bg-white/[.05]">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-smflex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,rgba(200,180,74,0.2),rgba(200,180,74,0.08))', color: '#C8B44A' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-smtext-white/80 truncate">{c.name}</span>
                          {c.orders > 1 && <span className="text-[.85rem] px-1 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>★</span>}
                        </div>
                        <div className="text-sm text-white/30 truncate">{c.phone} · {c.city}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold" style={{ color: '#C8B44A' }}>₹{Math.round(c.spent).toLocaleString()}</div>
                        <div className="text-sm text-white/30">{c.orders} order{c.orders !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[.06]">
                        {['Customer', 'Phone', 'City', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-smfont-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(200,180,74,0.35)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsStats.customers.list.map((c, i) => (
                        <tr key={c.phone} onClick={() => openCustomer(c)}
                          className={`cursor-pointer transition-colors hover:bg-white/[.03] ${i < analyticsStats.customers.list.length - 1 ? 'border-b border-white/[.04]' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-smtext-white/80">{c.name}</div>
                            {c.orders > 1 && (
                              <span className="text-[.88rem] px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>
                                ★ Repeat
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <a href={`tel:${c.phone}`} className="text-sm text-blue-400 no-underline hover:underline">{c.phone}</a>
                            <a href={`https://wa.me/91${c.phone.replace(/[^0-9]/g, '').slice(-10)}`} target="_blank"
                              className="ml-2 text-smtext-green-400 no-underline hover:underline">WA</a>
                          </td>
                          <td className="px-4 py-3 text-smtext-white/40 capitalize">{c.city}</td>
                          <td className="px-4 py-3 text-smfont-bold text-white/50">{c.orders}</td>
                          <td className="px-4 py-3 text-smfont-bold" style={{ color: '#C8B44A' }}>₹{Math.round(c.spent).toLocaleString()}</td>
                          <td className="px-4 py-3 text-smtext-white/30">{new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        </tr>
                      ))}
                      {analyticsStats.customers.list.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-smtext-white/20">No customers yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-smtext-white/20">Failed to load analytics.</div>
          )}
        </motion.div>
      )}

      {/* ── CUSTOMER DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedCustomer(null)}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full md:w-[480px] md:h-full flex flex-col rounded-t-3xl md:rounded-none overflow-hidden"
              style={{ background: '#080F06', boxShadow: '-8px 0 60px rgba(0,0,0,0.5)', maxHeight: '90vh', borderLeft: '1px solid rgba(200,180,74,0.1)' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-6 pt-6 pb-5 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#1A2A14,#2d3f22)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)' }}>
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => setSelectedCustomer(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all text-lg">
                    ✕
                  </button>
                </div>
                <h2 className="font-display text-xl font-bold text-white mb-0.5">{selectedCustomer.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={`tel:${selectedCustomer.phone}`} className="text-sm text-brass no-underline hover:underline">{selectedCustomer.phone}</a>
                  <a href={`https://wa.me/91${selectedCustomer.phone.replace(/[^0-9]/g, '').slice(-10)}`} target="_blank"
                    className="text-sm font-bold px-2 py-0.5 rounded-full no-underline"
                    style={{ background: 'rgba(37,211,102,0.2)', color: '#25D366' }}>WhatsApp</a>
                  {selectedCustomer.orders > 1 && (
                    <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.2)', color: '#34D399' }}>★ Repeat Buyer</span>
                  )}
                </div>
                <p className="text-[.88rem] text-white/40 mt-1">📍 {selectedCustomer.city}</p>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Total Orders', val: selectedCustomer.orders, color: '#60A5FA' },
                    { label: 'Total Spent', val: `₹${Math.round(selectedCustomer.spent).toLocaleString()}`, color: '#C8B44A' },
                    { label: 'Last Order', val: new Date(selectedCustomer.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), color: '#34D399' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="text-base font-bold" style={{ color }}>{val}</div>
                      <div className="text-[.85rem] text-white/30 uppercase tracking-[1px] mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-sm font-bold tracking-[2px] uppercase px-1" style={{ color: 'rgba(200,180,74,0.4)' }}>Order History</p>
                {customerOrdersLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-brass animate-spin" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-10 text-smtext-white/20">No orders found</div>
                ) : (
                  customerOrders.map(order => {
                    const meta = STATUS_META[order.status] ?? { label: order.status, color: '#999', bg: 'rgba(136,136,136,0.1)', icon: '•' };
                    const items = Array.isArray(order.products) ? order.products as CartItem[] : [];
                    return (
                      <div key={order.id} className="rounded-2xl overflow-hidden border border-white/[.07]"
                        style={{ background: 'rgba(15,24,10,0.8)' }}>
                        {/* Order header */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[.06]"
                          style={{ background: 'rgba(200,180,74,0.04)' }}>
                          <div>
                            <span className="text-sm font-mono" style={{ color: 'rgba(200,180,74,0.4)' }}>#{order.id.slice(-8).toUpperCase()}</span>
                            <p className="text-[.88rem] text-white/30 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: '#C8B44A' }}>₹{order.totalAmount?.toLocaleString() ?? '—'}</span>
                            <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                              {meta.icon} {meta.label}
                            </span>
                          </div>
                        </div>
                        {/* Items */}
                        <div className="px-4 py-3 space-y-1">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-white/40">{item.productId} · {item.packSize}</span>
                              <span className="font-semibold text-white/30">×{item.count}</span>
                            </div>
                          ))}
                          {items.length === 0 && <p className="text-sm text-white/20 italic">No item details</p>}
                        </div>
                        {/* Footer */}
                        <div className="px-4 pb-3 flex items-center gap-3">
                          <span className="text-sm text-white/25">📍 {order.city}</span>
                          {order.paymentMethod && <span className="text-sm text-white/25">💳 {order.paymentMethod}</span>}
                          {order.notes && <span className="text-sm text-white/25 truncate">📝 {order.notes}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* WhatsApp CTA */}
              <div className="p-4 flex-shrink-0 border-t border-white/[.06]">
                <a href={`https://wa.me/91${selectedCustomer.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${selectedCustomer.name}! Thank you for ordering from Crafted by Amma 🌾`)}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-smfont-semibold text-white no-underline transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#25D366,#1da851)', boxShadow: '0 4px 16px rgba(37,211,102,0.2)' }}>
                  💬 Message on WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRODUCT EDIT MODAL ── */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setEditingProduct(null)}>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full sm:max-w-xl rounded-t-[24px] sm:rounded-[24px] max-h-[92vh] overflow-y-auto"
              style={{ background: '#080F06', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(200,180,74,0.1)' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-white/[.06] flex items-center justify-between sticky top-0 z-10" style={{ background: 'rgba(8,15,6,0.97)', backdropFilter: 'blur(10px)' }}>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Edit Product</h2>
                  <p className="text-sm text-white/25 font-mono">{editingProduct.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Active toggle */}
                  <button onClick={() => setEditingProduct(p => p ? { ...p, active: !p.active } : p)}
                    className={`px-3 py-1.5 rounded-full text-smfont-bold transition-all`}
                    style={editingProduct.active ? { background: 'rgba(16,185,129,0.15)', color: '#34D399' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                    {editingProduct.active ? 'Live' : 'Hidden'}
                  </button>
                  <button onClick={() => setEditingProduct(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[.06] transition-all text-sm">
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[.57rem] font-bold uppercase tracking-[2.5px]" style={{ color: 'rgba(200,180,74,0.45)' }}>Product Images</p>
                    <button onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-smfont-bold transition-all disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg,#5A7A3A,#4a6830)', color: '#fff' }}>
                      {imageUploading
                        ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                        : <>+ Upload Product Image</>}
                    </button>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadProductImage(f); e.target.value = ''; }} />
                  </div>

                  {/* Main image preview */}
                  {(editingProduct.images ?? []).length > 0 && (
                    <div className="relative rounded-2xl overflow-hidden mb-3 bg-forest/[.03]" style={{ height: 200 }}>
                      <img src={editingProduct.images[0]} alt=""
                        className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
                      <span className="absolute bottom-2 left-3 text-[.88rem] font-bold text-white/60 uppercase tracking-widest">Main image</span>
                    </div>
                  )}

                  {/* Thumbnail strip */}
                  <div className="flex gap-2 flex-wrap">
                    {(editingProduct.images ?? []).map((img, i) => (
                      <div key={i} className="relative group flex-shrink-0">
                        <img src={img} alt=""
                          className={`w-16 h-16 object-cover rounded-xl border-2 transition-all
                            ${i === 0 ? 'border-brass/40' : 'border-white/[.08]'}`} />
                        <button onClick={() => removeProductImage(img)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-smflex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                          ✕
                        </button>
                      </div>
                    ))}
                    {(editingProduct.images ?? []).length === 0 && (
                      <div className="w-full py-8 rounded-xl border-2 border-dashed border-white/[.08] flex flex-col items-center gap-2 text-white/20">
                        <span className="text-3xl">🖼</span>
                        <span className="text-sm">No images yet — upload to S3</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic fields */}
                {[
                  { label: 'Product Name', key: 'name', multiline: false },
                  { label: 'Short Name (for cart/orders)', key: 'shortName', multiline: false },
                  { label: 'Badge (e.g. Bestseller)', key: 'badge', multiline: false },
                  { label: 'Description', key: 'description', multiline: true },
                  { label: 'Ingredients', key: 'ingredients', multiline: true },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[.57rem] font-bold uppercase tracking-[2.5px] mb-1.5" style={{ color: 'rgba(200,180,74,0.45)' }}>{field.label}</label>
                    {field.multiline ? (
                      <textarea value={editingProduct[field.key as keyof DbProduct] as string}
                        onChange={e => setEditingProduct(p => p ? { ...p, [field.key]: e.target.value } : p)}
                        className="w-full px-3 py-2.5 border-[1.5px] border-white/[.08] rounded-xl text-smoutline-none transition-all resize-y min-h-[70px] text-white/80"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    ) : (
                      <input value={editingProduct[field.key as keyof DbProduct] as string}
                        onChange={e => setEditingProduct(p => p ? { ...p, [field.key]: e.target.value } : p)}
                        className="w-full px-3 py-2.5 border-[1.5px] border-white/[.08] rounded-xl text-smoutline-none transition-all text-white/80"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    )}
                  </div>
                ))}

                {/* Prices */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[.57rem] font-bold uppercase tracking-[2.5px]" style={{ color: 'rgba(200,180,74,0.45)' }}>Prices</label>
                    <button onClick={addPackSize} className="text-sm font-bold text-brass hover:underline">+ Add size</button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(editingProduct.prices).map(([size, price]) => (
                      <div key={size} className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white/60 w-12 flex-shrink-0">{size}</span>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-smtext-white/30">₹</span>
                          <input type="number" value={price} onChange={e => updatePrice(size, e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border-[1.5px] border-white/[.08] rounded-xl text-smoutline-none transition-all text-white/80"
                            style={{ background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                        <button onClick={() => removePackSize(size)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-smtext-red-400/40 hover:text-red-400 transition-all flex-shrink-0"
                          style={{ background: 'rgba(239,68,68,0.06)' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage instructions */}
                <div>
                  <label className="block text-[.57rem] font-bold uppercase tracking-[2.5px] mb-2" style={{ color: 'rgba(200,180,74,0.45)' }}>Usage Instructions</label>
                  <div className="space-y-2">
                    {editingProduct.usage.map((step, i) => (
                      <div key={i} className="p-3 rounded-xl border border-white/[.07] space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <input value={step.type} placeholder="Type (e.g. Sweet)"
                          onChange={e => {
                            const updated = [...editingProduct.usage];
                            updated[i] = { ...updated[i], type: e.target.value };
                            setEditingProduct(p => p ? { ...p, usage: updated } : p);
                          }}
                          className="w-full px-2.5 py-1.5 border border-white/[.07] rounded-lg text-smoutline-none text-white/70 placeholder:text-white/20"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <textarea value={step.instructions} placeholder="Instructions"
                          onChange={e => {
                            const updated = [...editingProduct.usage];
                            updated[i] = { ...updated[i], instructions: e.target.value };
                            setEditingProduct(p => p ? { ...p, usage: updated } : p);
                          }}
                          className="w-full px-2.5 py-1.5 border border-white/[.07] rounded-lg text-smoutline-none resize-none min-h-[52px] text-white/70 placeholder:text-white/20"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={saveProduct} disabled={productSaving}
                  className="w-full py-3.5 rounded-2xl font-bold text-smdisabled:opacity-40 transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#C8B44A,#D4942A)', color: '#0D1A09', boxShadow: '0 6px 20px rgba(200,180,74,0.2)' }}>
                  {productSaving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ORDER DETAIL MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}>

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-t-[24px] md:rounded-[24px] w-full md:max-w-lg max-h-[90vh] overflow-y-auto"
              style={{ background: '#080F06', boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(200,180,74,0.1)' }}
              onClick={e => e.stopPropagation()}>
              {/* drag handle on mobile */}
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Modal header */}
              <div className="px-4 md:px-6 pt-5 md:pt-6 pb-4 flex items-start justify-between border-b border-white/[.06]"
                style={{ background: 'rgba(200,180,74,0.04)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg font-bold text-white">Order Details</h2>
                    <span className="font-mono text-smpx-2 py-0.5 rounded-md" style={{ color: 'rgba(200,180,74,0.5)', background: 'rgba(200,180,74,0.08)' }}>
                      #{selected.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[.85rem] text-white/30">
                    {new Date(selected.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} size="sm" />
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[.06] transition-all text-sm">
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {/* Payment screenshot */}
                {selected.paymentScreenshot ? (
                  <div className="rounded-xl overflow-hidden border border-white/[.08]">
                    <div className="px-3 py-2 flex items-center gap-2 border-b border-white/[.06]"
                      style={{ background: 'rgba(16,185,129,0.08)' }}>
                      <span className="text-sm">✅</span>
                      <p className="text-sm font-bold uppercase tracking-[2px] text-emerald-400/60">Payment Screenshot</p>
                    </div>
                    <img src={selected.paymentScreenshot} alt="Payment" className="w-full max-h-64 object-contain" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-red-500/20 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.06)' }}>
                    <span>⚠️</span>
                    <p className="text-sm text-red-400 font-semibold">No payment screenshot uploaded</p>
                  </div>
                )}

                {/* Customer info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name', value: selected.name },
                    { label: 'Phone', value: selected.phone, link: `tel:${selected.phone}` },
                    { label: 'City', value: `${selected.city}${selected.isKarnataka ? ' 🏠 KA' : ''}` },
                    { label: 'Address', value: selected.address },
                  ].map(f => (
                    <div key={f.label} className={`p-3 rounded-xl border border-white/[.07] ${f.label === 'Address' ? 'col-span-2' : ''}`} style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-sm font-bold uppercase tracking-[2px] mb-0.5" style={{ color: 'rgba(200,180,74,0.4)' }}>{f.label}</p>
                      {f.link
                        ? <a href={f.link} className="text-sm font-semibold no-underline" style={{ color: '#C8B44A' }}>{f.value}</a>
                        : <p className="text-sm text-white/70 font-medium">{f.value}</p>}
                    </div>
                  ))}
                  {selected.notes && (
                    <div className="col-span-2 p-3 rounded-xl border border-brass/15" style={{ background: 'rgba(200,180,74,0.05)' }}>
                      <p className="text-sm font-bold uppercase tracking-[2px] mb-0.5" style={{ color: 'rgba(200,180,74,0.5)' }}>Notes</p>
                      <p className="text-sm text-white/60">{selected.notes}</p>
                    </div>
                  )}
                </div>

                {/* Order items */}
                <div className="rounded-xl border border-white/[.07] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/[.06]" style={{ background: 'rgba(200,180,74,0.04)' }}>
                    <p className="text-sm font-bold uppercase tracking-[2px]" style={{ color: 'rgba(200,180,74,0.4)' }}>Order Items</p>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {(() => {
                      const items = parseCartItems(selected.products);
                      if (items.length > 0) return items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-white/60">{PRODUCTS[item.productId as keyof typeof PRODUCTS]?.shortName || item.productId}
                            <span className="text-white/30 text-sm"> · {item.packSize} × {item.count}</span>
                          </span>
                        </div>
                      ));
                      return <p className="text-sm text-white/50">{getProductNames(selected.products)}</p>;
                    })()}

                    {selected.totalAmount != null && (
                      <div className="border-t border-white/[.06] pt-3 mt-3 space-y-1">
                        <div className="flex justify-between text-smtext-white/35">
                          <span>Products</span>
                          <span>₹{((selected.totalAmount ?? 0) - (selected.deliveryCharge ?? 0)).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-smtext-white/35">
                          <span>Delivery</span>
                          <span>{selected.deliveryCharge === 0 ? 'Free' : `₹${selected.deliveryCharge ?? 0}`}</span>
                        </div>
                        <div className="flex justify-between text-smfont-bold text-white pt-1 border-t border-white/[.06]">
                          <span>Total Paid</span>
                          <span style={{ color: '#C8B44A' }}>₹{selected.totalAmount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status update */}
                {(() => {
                  const flow = ['pending', 'verified', 'confirmed', 'shipped', 'delivered'];
                  const currentIdx = flow.indexOf(selected.status);
                  if (selected.status === 'cancelled' || selected.status === 'delivered') return null;
                  const forward = flow.slice(currentIdx);
                  const opts = [...forward, 'cancelled'].map(v => ORDER_STATUSES.find(s => s.value === v)!).filter(Boolean);
                  return (
                    <div className="p-4 rounded-xl border border-white/[.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-sm font-bold uppercase tracking-[2px] mb-2" style={{ color: 'rgba(200,180,74,0.4)' }}>Update Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {opts.slice(1).map(s => (
                          <button key={s.value} onClick={() => { updateStatus(selected.id, s.value, selected); setSelected({ ...selected, status: s.value }); }}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl text-smfont-semibold border-2 transition-all disabled:opacity-40"
                            style={s.value === 'cancelled'
                              ? { borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444', background: 'rgba(239,68,68,0.08)' }
                              : { borderColor: 'rgba(90,122,58,0.3)', color: '#5A7A3A', background: 'rgba(90,122,58,0.08)' }}>
                            {STATUS_META[s.value]?.icon} {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* WhatsApp */}
                <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selected.name}! Your order from Crafted by Amma has been confirmed. Thank you! 🌾`)}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-smfont-semibold text-white no-underline transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #25D366, #1da851)', boxShadow: '0 4px 16px rgba(37,211,102,0.25)' }}>
                  <span>💬</span> Message on WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
            style={{
              background: toast.type === 'success'
                ? 'linear-gradient(135deg, #1A2A14, #2d3f22)'
                : 'linear-gradient(135deg, #3b0d0d, #5c1c1c)',
              boxShadow: toast.type === 'success'
                ? '0 12px 40px rgba(26,42,20,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 12px 40px rgba(60,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
            <span className="text-base">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="text-sm font-semibold text-white/90">{toast.message}</span>
            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl origin-left"
              style={{ background: toast.type === 'success' ? '#5A7A3A' : '#ef4444' }} />
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
