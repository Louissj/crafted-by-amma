'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const stored = localStorage.getItem('cba-cart');
        const items: Array<{ count: number }> = stored ? JSON.parse(stored) : [];
        setCount(items.reduce((s, i) => s + (i.count || 0), 0));
      } catch { setCount(0); }
    };
    read();
    window.addEventListener('cartUpdate', read);
    return () => window.removeEventListener('cartUpdate', read);
  }, []);
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full text-xs font-bold text-white leading-none px-1"
      style={{ background: 'linear-gradient(135deg,#D4942A,#B87323)', boxShadow: '0 1px 6px rgba(212,148,42,0.5)' }}>
      {count > 9 ? '9+' : count}
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const read = () => {
      try {
        const stored = localStorage.getItem('cba-cart');
        const items: Array<{ count: number }> = stored ? JSON.parse(stored) : [];
        setCartCount(items.reduce((s, i) => s + (i.count || 0), 0));
      } catch { setCartCount(0); }
    };
    read();
    window.addEventListener('cartUpdate', read);
    return () => window.removeEventListener('cartUpdate', read);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const links = [
    { href: '#about', label: 'Story', icon: '📖' },
    { href: '#prods', label: 'Products', icon: '🌾' },
    { href: '#why', label: 'Why Us', icon: '💚' },
    { href: '#testi', label: 'Reviews', icon: '⭐' },
  ];

  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hi! I want to order from Crafted by Amma 🌾')}`;

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-[9000] px-4 py-2.5 flex items-center justify-between transition-all duration-400
        ${scrolled ? 'bg-forest/95 backdrop-blur-lg shadow-[0_2px_12px_rgba(0,0,0,.20)]' : 'bg-gradient-to-b from-black/50 to-transparent'}`}>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40}
            className="rounded-full border-[1.5px] border-brass/20 flex-shrink-0" />
          <div>
            <span className="font-display text-[1.12rem] font-semibold leading-tight block text-white [text-shadow:0_1px_8px_rgba(0,0,0,.4)]">
              Crafted by Amma
            </span>
            <span className="font-kannada text-[0.48rem] block mt-px text-white/70">
              ಅಮ್ಮನಿಂದ ಕರಕುಶಲ
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-5 items-center list-none m-0 p-0">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className="no-underline text-sm font-medium tracking-[2px] uppercase transition-colors text-white/90 hover:text-brass/90">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/cart" className="relative inline-flex items-center no-underline p-1.5 rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <CartBadge />
            </Link>
          </li>
          <li>
            <Link href="/track" className="no-underline text-sm font-medium tracking-[2px] uppercase text-white/90 hover:text-brass/90 transition-colors">
              Track
            </Link>
          </li>
          <li>
            <Link href={cartCount > 0 ? '/cart' : '/#prods'}
              className="bg-gradient-to-br from-sage to-sage-light text-cream-light px-5 py-2 rounded-full text-sm font-medium tracking-[2px] uppercase shadow-md no-underline">
              {cartCount > 0 ? `Cart (${cartCount})` : 'Order Now'}
            </Link>
          </li>
        </ul>

        {/* Mobile right: track + cart + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/track"
            className="no-underline flex items-center gap-1 text-[0.6rem] font-bold tracking-[1.5px] uppercase text-white/80 border border-white/20 px-2.5 py-1 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
            </svg>
            Track
          </Link>
          <Link href="/cart" className="relative p-1.5 no-underline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <CartBadge />
          </Link>

          {/* Hamburger — 3 lines animate to clean X */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="relative w-9 h-9 flex flex-col items-center justify-center gap-[5px] z-[9100] flex-shrink-0"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            <span className={`block w-[22px] h-[2px] rounded-full bg-white origin-center transition-all duration-300
              ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-[22px] h-[2px] rounded-full bg-white transition-all duration-300
              ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-[22px] h-[2px] rounded-full bg-white origin-center transition-all duration-300
              ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile fullscreen menu ── */}
      <div className={`fixed inset-0 z-[9050] flex flex-col transition-all duration-400
        ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        style={{ background: 'linear-gradient(160deg,#0C1A08 0%,#142210 50%,#0A1406 100%)' }}>

        {/* Gold top shimmer */}
        <div className="h-[2px] flex-shrink-0"
          style={{ background: 'linear-gradient(90deg,transparent 5%,rgba(200,180,74,0.5) 50%,transparent 95%)' }} />

        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="Logo" width={36} height={36}
              className="rounded-full border border-brass/30" />
            <span className="font-display text-base font-semibold text-white/90">Crafted by Amma</span>
          </div>
          <button onClick={close}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: 'rgba(200,180,74,0.12)' }} />

        {/* Nav links */}
        <div className="flex-1 flex flex-col justify-center px-6 gap-1">
          {links.map((l, i) => (
            <a key={l.href} href={l.href} onClick={close}
              className="group flex items-center gap-4 py-4 no-underline border-b transition-all active:scale-[.98]"
              style={{
                borderColor: 'rgba(255,255,255,0.05)',
                transitionDelay: menuOpen ? `${i * 50}ms` : '0ms',
              }}>
              <span className="text-xl w-8 text-center flex-shrink-0">{l.icon}</span>
              <span className="font-display text-[1.4rem] font-semibold text-white/90 group-active:text-brass transition-colors">
                {l.label}
              </span>
              <svg className="ml-auto opacity-20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="px-5 pb-10 flex-shrink-0 space-y-3">

          {/* Cart / Order Now CTA */}
          <Link href={cartCount > 0 ? '/cart' : '/#prods'} onClick={close}
            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl no-underline transition-all active:scale-[.98]"
            style={{
              background: 'linear-gradient(135deg,#5A7A3A,#4a6830)',
              boxShadow: '0 8px 24px rgba(90,122,58,0.30)',
            }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🛒</span>
              <div>
                <p className="text-xs font-bold tracking-[2px] uppercase text-white/60">
                  {cartCount > 0 ? `${cartCount} pack${cartCount > 1 ? 's' : ''} in cart` : 'Ready to order?'}
                </p>
                <p className="font-display text-base font-bold text-white">
                  {cartCount > 0 ? 'View Cart' : 'Order Now'}
                </p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

          {/* Track + WhatsApp row */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/track" onClick={close}
              className="flex items-center justify-center gap-2 py-3 rounded-xl no-underline transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,180,74,0.20)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8B44A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              <span className="text-xs font-bold tracking-[1.5px] uppercase text-brass/80">Track</span>
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={close}
              className="flex items-center justify-center gap-2 py-3 rounded-xl no-underline transition-all active:scale-95"
              style={{ background: 'rgba(37,211,102,0.10)', border: '1px solid rgba(37,211,102,0.25)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: 'rgba(37,211,102,0.85)' }}>WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
