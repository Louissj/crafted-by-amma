'use client';

import { useState, useEffect } from 'react';
import VIPLaunch from '@/components/sections/VIPLaunch';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/sections/Hero';
import BioCard from '@/components/sections/BioCard';
import Marquee from '@/components/sections/Marquee';
import FssaiBadge from '@/components/sections/FssaiBadge';
import About from '@/components/sections/About';
import OffersSection from '@/components/sections/OffersSection';
import Products from '@/components/sections/Products';
import { Ingredients, BenefitsSection, WhyUs, Testimonials, Shipping, CTA, Footer, CheckoutCTA } from '@/components/sections/Sections';

export default function RootPage() {
  const [launchMode, setLaunchMode] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/settings/launch')
      .then(r => r.json())
      .then(data => setLaunchMode(data.launchMode ?? false))
      .catch(() => setLaunchMode(false));
  }, []);

  return (
    <>
      {/* Home content always rendered underneath */}
      <div className="overflow-x-hidden w-full">
        <Navbar />
        <Hero />
        <BioCard />
        <Marquee />
        <FssaiBadge />
        <OffersSection />
        <Products />
        <About />
        <Ingredients />
        <WhyUs />
        <BenefitsSection />
        <Testimonials />
        <CheckoutCTA />
        <Shipping />
        <CTA />
        <Footer />
      </div>

      {/* Launch overlay sits on top — hides when dismissed */}
      {launchMode === true && <VIPLaunch onDismiss={() => setLaunchMode(false)} />}

      {/* While checking — dark cover to avoid flash */}
      {launchMode === null && (
        <div className="fixed inset-0 z-[99998]" style={{ background: '#050B03' }} />
      )}
    </>
  );
}
