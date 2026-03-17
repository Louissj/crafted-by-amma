'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SectionHeader from '../ui/SectionHeader';
import { PRODUCTS } from '@/lib/constants';
import { RevealSection } from '../ui/RevealSection';

function ProductCard({ product }: { product: typeof PRODUCTS[keyof typeof PRODUCTS] }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveImg(prev => prev === 0 ? 1 : 0), 4000);
    return () => clearInterval(interval);
  }, []);

  const prices = Object.entries(product.prices);

  return (
    <div className="bg-cream-light/[.03] border border-cream-light/[.04] rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:border-sage/10 hover:shadow-[0_20px_50px_rgba(0,0,0,.15)]">
      {/* Image carousel */}
      <div className="relative overflow-hidden bg-forest">
        {product.images.map((img, i) => (
          <Image key={i} src={img} alt={product.name} width={500} height={300}
            className={`w-full h-[240px] md:h-[300px] lg:h-[340px] object-cover transition-opacity duration-500 ${i === activeImg ? 'block' : 'hidden'}`} />
        ))}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-[3]">
          {product.images.map((_, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className={`h-2 rounded-full transition-all border border-white/20 ${i === activeImg ? 'bg-white/80 w-5' : 'bg-white/30 w-2'}`} />
          ))}
        </div>
        <span className="absolute top-3 left-3 bg-gradient-to-br from-brass to-turmeric text-forest px-3.5 py-1 rounded-full text-[.58rem] font-bold tracking-[1.5px] uppercase z-[3]">
          {product.badge}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-cream-light mb-2 leading-snug">{product.name}</h3>
        <p className="text-[.76rem] text-cream-light/40 leading-relaxed mb-3.5">{product.description}</p>

        {/* Ingredients */}
        <div className="mb-3 p-2.5 px-3 bg-sage/[.04] border border-sage/[.04] rounded-[10px]">
          <span className="text-[.52rem] font-bold tracking-[2px] uppercase text-millet block mb-1">Ingredients</span>
          <p className="text-[.72rem] text-cream-light/35 leading-relaxed">{product.ingredients}</p>
        </div>

        {/* Usage */}
        <div className="mb-3.5 p-2.5 px-3 bg-sage/[.04] border border-sage/[.04] rounded-[10px]">
          <span className="text-[.52rem] font-bold tracking-[2px] uppercase text-millet block mb-1">How to Use</span>
          {product.usage.map((u, i) => (
            <p key={i} className="text-[.72rem] text-cream-light/35 leading-relaxed">
              <strong className="text-cream-light/50">{u.type}:</strong> {u.instructions}
            </p>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex gap-2 mb-4">
          {prices.map(([qty, price], i) => (
            <div key={qty} className={`flex-1 text-center py-2.5 px-1.5 rounded-[10px] border relative
              ${i === prices.length - 1 ? 'border-brass/15 bg-brass/[.06]' : 'border-sage/[.06] bg-forest/30'}`}>
              <span className="block text-[.58rem] text-brass/50 tracking-[1px] uppercase mb-0.5">{qty}</span>
              <span className="font-display text-xl font-bold text-brass">₹{price}</span>
              {i === prices.length - 1 && (
                <span className="absolute -top-2 -right-1 text-[.42rem] bg-brass text-forest px-1.5 py-0.5 rounded-[10px] font-bold tracking-[1px] uppercase">Best Value</span>
              )}
            </div>
          ))}
        </div>

        <a href="#order" className="block text-center py-3.5 bg-gradient-to-br from-sage to-sage-light text-cream-light rounded-xl text-[.78rem] font-semibold tracking-[1.5px] uppercase no-underline transition-all active:scale-[.97] hover:shadow-lg">
          🛒 Order Now
        </a>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <section id="prods" className="py-20 md:py-24 px-4 relative" style={{ background: 'linear-gradient(170deg,#1A2A14,#223218,#1A2A14)' }}>
      <SectionHeader tag="Our Products" title="Amma's Signature Recipes" dark />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 max-w-[1000px] lg:max-w-[1100px] mx-auto relative z-[2]">
        {Object.values(PRODUCTS).map(product => (
          <RevealSection key={product.id}>
            <ProductCard product={product} />
          </RevealSection>
        ))}
      </div>
    </section>
  );
}
