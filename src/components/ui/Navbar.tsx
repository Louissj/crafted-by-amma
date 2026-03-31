'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Lightweight cart badge — reads from localStorage, listens for cartUpdate events
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
    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full text-xs font-bold text-white leading-none px-1"
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

  const links = [
    { href: '#about', label: 'Story' },
    { href: '#prods', label: 'Products' },
    { href: '#why', label: 'Why Us' },
    { href: '#testi', label: 'Love' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-[9000] px-4 py-2.5 flex items-center justify-between transition-all duration-400
        ${scrolled ? 'bg-forest/95 backdrop-blur-lg shadow-[0_2px_12px_rgba(0,0,0,.20)]' : 'bg-gradient-to-b from-black/50 to-transparent'}`}>
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
        <ul className="hidden md:flex gap-5 items-center list-none">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className="no-underline text-sm font-medium tracking-[2px] uppercase transition-colors text-white/90 hover:text-brass/90">
                {l.label}
              </a>
            </li>
          ))}

          {/* Cart icon */}
          <li>
            <Link href="/cart" className="relative inline-flex items-center no-underline p-1.5 rounded-full transition-colors hover:bg-forest/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <CartBadge />
            </Link>
          </li>

          <li>
            <Link href="/track" className="no-underline text-sm font-medium tracking-[2px] uppercase transition-colors text-white/90 hover:text-brass/90">
              Track
            </Link>
          </li>
          <li>
            <Link href={cartCount > 0 ? '/cart' : '/#prods'} className="bg-gradient-to-br from-sage to-sage-light text-cream-light px-5 py-2 rounded-full text-sm font-medium tracking-[2px] uppercase shadow-md no-underline">
              {cartCount > 0 ? `Cart (${cartCount})` : 'Order Now'}
            </Link>
          </li>
        </ul>

        {/* Mobile right side: cart + burger */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/cart" className="relative p-1.5 rounded-full no-underline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <CartBadge />
          </Link>

          <button className="flex flex-col gap-[5px] p-1.5 z-[9100]" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`w-[22px] h-[1.5px] rounded transition-all bg-cream-light
              ${menuOpen ? 'rotate-45 translate-x-[4.5px] translate-y-[4.5px]' : ''}`} />
            <span className={`w-[22px] h-[1.5px] rounded transition-all bg-cream-light
              ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-[22px] h-[1.5px] rounded transition-all bg-cream-light
              ${menuOpen ? '-rotate-45 translate-x-[4.5px] -translate-y-[4.5px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-cream z-[9050] flex flex-col items-center justify-center gap-6 transition-all duration-400
        ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        {links.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
            className="font-display text-2xl font-semibold text-forest no-underline">
            {l.label}
          </a>
        ))}
        <Link href="/cart" onClick={() => setMenuOpen(false)}
          className="font-display text-2xl font-semibold text-brass no-underline">
          🛒 Cart
        </Link>
        <Link href="/track" onClick={() => setMenuOpen(false)}
          className="font-display text-2xl font-semibold text-forest/60 no-underline">Track Order</Link>
        <Link href={cartCount > 0 ? '/cart' : '/#prods'} onClick={() => setMenuOpen(false)}
          className="font-display text-2xl font-semibold text-sage no-underline">
          {cartCount > 0 ? `🛒 Cart (${cartCount})` : 'Order Now'}
        </Link>
      </div>
    </>
  );
}
