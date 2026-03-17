import type { Metadata } from 'next';
import './globals.css';
import PageTracker from '@/components/ui/PageTracker';

export const metadata: Metadata = {
  title: 'Crafted by Amma — Homemade Millet Products | Mysuru',
  description: 'Homemade Millet Malt Powder & Instant Multigrain Dosa Powder from Mysuru. 21+ natural ingredients. Zero preservatives. Ships worldwide.',
  keywords: 'millet, malt powder, dosa powder, homemade, Mysuru, healthy food, organic, natural',
  openGraph: {
    title: 'Crafted by Amma — Homemade Millet Products',
    description: 'Pure. Homemade. Crafted with Love. From Amma\'s kitchen in Mysuru.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
