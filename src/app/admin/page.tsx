'use client';

import { useState, useEffect, useCallback } from 'react';
import { ORDER_STATUSES, PRODUCTS } from '@/lib/constants';

type Order = {
  id: string; name: string; phone: string; products: string; quantity: string;
  city: string; address: string; paymentScreenshot: string | null; notes: string | null;
  status: string; totalAmount: number | null; createdAt: string;
};

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });

  const fetchOrders = useCallback(async () => {
    const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders || []);
    // Calculate stats
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

  useEffect(() => { if (loggedIn) fetchOrders(); }, [loggedIn, filter, fetchOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (res.ok) setLoggedIn(true);
    else alert('Invalid credentials');
  };

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    await fetchOrders();
    if (selected?.id === id) setSelected({ ...selected, status });
    setLoading(false);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setSelected(null);
    fetchOrders();
  };

  const getProductNames = (json: string) => {
    try {
      const ids = JSON.parse(json) as string[];
      return ids.map(id => PRODUCTS[id as keyof typeof PRODUCTS]?.shortName || id).join(', ');
    } catch { return json; }
  };

  const statusColor = (s: string) => ORDER_STATUSES.find(st => st.value === s)?.color || '#888';

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
          <h1 className="font-display text-2xl font-bold text-forest text-center mb-1">Admin Panel</h1>
          <p className="text-xs text-forest/40 text-center mb-6">Crafted by Amma</p>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
            className="w-full px-4 py-3 border border-forest/10 rounded-xl mb-3 text-sm outline-none focus:border-sage" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"
            className="w-full px-4 py-3 border border-forest/10 rounded-xl mb-4 text-sm outline-none focus:border-sage" />
          <button className="w-full py-3 bg-sage text-white rounded-xl font-semibold text-sm">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-forest text-cream-light px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">🌾 Crafted by Amma — Admin</h1>
        <button onClick={() => setLoggedIn(false)} className="text-xs text-brass/60 hover:text-brass">Logout</button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          { label: 'Total Orders', val: stats.total, color: 'bg-forest' },
          { label: 'Pending', val: stats.pending, color: 'bg-amber-600' },
          { label: 'Confirmed', val: stats.confirmed, color: 'bg-sage' },
          { label: 'Revenue', val: `₹${stats.revenue}`, color: 'bg-brass' },
        ].map(s => (
          <div key={s.label} className={`${s.color} text-white rounded-xl p-4`}>
            <p className="text-xs opacity-70">{s.label}</p>
            <p className="text-2xl font-bold font-display">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 flex gap-2 flex-wrap mb-4">
        {['all', ...ORDER_STATUSES.map(s => s.value)].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === s ? 'bg-sage text-white' : 'bg-white text-forest/60 border border-forest/10'}`}>
            {s === 'all' ? 'All' : ORDER_STATUSES.find(st => st.value === s)?.label || s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="px-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-forest/[.03] text-left text-xs text-forest/50 uppercase tracking-wider">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 hidden md:table-cell">Products</th>
                <th className="px-4 py-3 hidden md:table-cell">City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-forest/[.03] hover:bg-sage/[.02] cursor-pointer" onClick={() => setSelected(order)}>
                  <td className="px-4 py-3 text-xs text-forest/40 font-mono">{order.id.slice(-6)}</td>
                  <td className="px-4 py-3"><div className="font-semibold text-forest">{order.name}</div><div className="text-xs text-forest/40">{order.phone}</div></td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-forest/50">{getProductNames(order.products)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-forest/50">{order.city}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-[.65rem] font-semibold text-white" style={{ background: statusColor(order.status) }}>
                      {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.status} onClick={e => e.stopPropagation()} onChange={e => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-forest/10 rounded-lg px-2 py-1 outline-none" disabled={loading}>
                      {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-forest/30">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Order #{selected.id.slice(-6)}</h2>
                <p className="text-xs text-forest/40">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: statusColor(selected.status) }}>
                {ORDER_STATUSES.find(s => s.value === selected.status)?.label}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selected.name}</p>
              <p><strong>Phone:</strong> <a href={`tel:${selected.phone}`} className="text-sage">{selected.phone}</a></p>
              <p><strong>Products:</strong> {getProductNames(selected.products)}</p>
              <p><strong>Quantity:</strong> {selected.quantity}</p>
              <p><strong>City:</strong> {selected.city}</p>
              <p><strong>Address:</strong> {selected.address}</p>
              {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
              {selected.paymentScreenshot && (
                <div><strong>Payment Screenshot:</strong><img src={selected.paymentScreenshot} alt="Payment" className="mt-2 rounded-lg max-w-full max-h-64 object-contain border" /></div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selected.name}! Your order from Crafted by Amma has been confirmed. Thank you! 🌾`)}`}
                target="_blank" className="flex-1 py-2.5 bg-green-500 text-white text-center rounded-xl text-xs font-semibold no-underline">
                💬 WhatsApp
              </a>
              <button onClick={() => deleteOrder(selected.id)} className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-xs font-semibold">Delete</button>
              <button onClick={() => setSelected(null)} className="px-4 py-2.5 bg-forest/5 text-forest rounded-xl text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
