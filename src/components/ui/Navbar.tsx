'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
        ${scrolled ? 'bg-cream/97 backdrop-blur-lg shadow-[0_1px_0_rgba(26,42,20,.04)]' : ''}`}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40}
            className="rounded-full border-[1.5px] border-brass/20 flex-shrink-0" />
          <div>
            <span className={`font-display text-[1.12rem] font-semibold leading-tight block transition-colors
              ${scrolled ? 'text-forest' : 'text-cream-light [text-shadow:0_1px_6px_rgba(0,0,0,.25)]'}`}>
              Crafted by Amma
            </span>
            <span className={`font-kannada text-[0.48rem] block mt-px transition-colors
              ${scrolled ? 'text-clay' : 'text-sand/55'}`}>
              ಅಮ್ಮನಿಂದ ಕರಕುಶಲ
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-5 items-center list-none">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className={`no-underline text-[0.68rem] font-medium tracking-[2.5px] uppercase transition-colors
                ${scrolled ? 'text-forest' : 'text-cream-light/65'} hover:text-sage`}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#order" className="bg-gradient-to-br from-sage to-sage-light text-cream-light px-5 py-2 rounded-full text-[0.68rem] font-medium tracking-[2.5px] uppercase shadow-md no-underline">
              Order Now
            </a>
          </li>
        </ul>

        {/* Mobile burger */}
        <button className="flex md:hidden flex-col gap-[5px] p-1.5 z-[9100]" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-[22px] h-[1.5px] rounded transition-all ${scrolled ? 'bg-forest' : 'bg-cream-light'}
            ${menuOpen ? 'rotate-45 translate-x-[4.5px] translate-y-[4.5px]' : ''}`} />
          <span className={`w-[22px] h-[1.5px] rounded transition-all ${scrolled ? 'bg-forest' : 'bg-cream-light'}
            ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-[22px] h-[1.5px] rounded transition-all ${scrolled ? 'bg-forest' : 'bg-cream-light'}
            ${menuOpen ? '-rotate-45 translate-x-[4.5px] -translate-y-[4.5px]' : ''}`} />
        </button>
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
        <a href="#order" onClick={() => setMenuOpen(false)}
          className="font-display text-2xl font-semibold text-sage no-underline">Order</a>
      </div>
    </>
  );
}
