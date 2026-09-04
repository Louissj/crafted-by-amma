import type { Metadata, Viewport } from 'next';
import './globals.css';
import PageTracker from '@/components/ui/PageTracker';
import FloatingButtons from '@/components/ui/FloatingButtons';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://craftedbyamma.com';
const OG_TITLE = 'Crafted by Amma — Homemade Powders, Snacks & Sweets · Mysuru';
const OG_DESCRIPTION = "Pure. Homemade. Crafted with Love. From Amma's kitchen in Mysuru.";
// Square brand image; WhatsApp and friends crop it themselves. Made absolute by metadataBase.
const OG_IMAGE = { url: '/images/logo.png', width: 1254, height: 1254, alt: 'Crafted by Amma' };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Crafted by Amma — Homemade Powders, Snacks & Sweets | Mysuru',
  description: 'Homemade millet & masala powders, chutney pudi, snacks and sweets from Mysuru. 21+ natural ingredients. Zero preservatives. Ships worldwide.',
  keywords: 'millet, malt powder, dosa powder, rasam powder, sambar powder, chutney pudi, snacks, sweets, homemade, Mysuru, healthy food, organic, natural',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: '/',
    siteName: 'Crafted by Amma',
    type: 'website',
    locale: 'en_IN',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTracker />
        {children}
        <FloatingButtons />
      </body>
    </html>
  );
}
