import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/sections/Hero';
import BioCard from '@/components/sections/BioCard';
import Marquee from '@/components/sections/Marquee';
import About from '@/components/sections/About';
import Products from '@/components/sections/Products';
import { Ingredients, BenefitsSection, WhyUs, Testimonials, Shipping, CTA, Footer, CheckoutCTA } from '@/components/sections/Sections';

export default function Home() {
  return (
    <div className="overflow-x-hidden w-full">
      <Navbar />
      <Hero />
      <BioCard />
      <Marquee />
      <About />
      <Products />
      <Ingredients />
      <WhyUs />
      <BenefitsSection />
      <Testimonials />
      <CheckoutCTA />
      <Shipping />
      <CTA />
      <Footer />
    </div>
  );
}
