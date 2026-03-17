import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/sections/Hero';
import BioCard from '@/components/sections/BioCard';
import Marquee from '@/components/sections/Marquee';
import About from '@/components/sections/About';
import Products from '@/components/sections/Products';
import { Ingredients, BenefitsSection, WhyUs, Testimonials, Shipping, CTA, Footer } from '@/components/sections/Sections';
import OrderForm from '@/components/sections/OrderForm';

export default function Home() {
  return (
    <>
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
      <OrderForm />
      <Shipping />
      <CTA />
      <Footer />
    </>
  );
}
