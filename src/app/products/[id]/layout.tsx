import type { Metadata } from 'next';
import prisma from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://craftedbyamma.com';

// The page itself is a client component, so per-product share previews live here.
// Returning {} falls through to the site-wide metadata in the root layout.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await prisma.product
    .findUnique({
      where: { id: params.id },
      select: { name: true, description: true, images: true, active: true },
    })
    .catch(() => null);

  if (!product || !product.active) return {};

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const image = images[0] || '/images/logo.png';
  const title = `${product.name} \u00b7 Crafted by Amma`;
  const description =
    product.description.length > 200
      ? product.description.slice(0, 197).trimEnd() + '\u2026'
      : product.description;

  return {
    title,
    description,
    alternates: { canonical: `/products/${params.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${params.id}`,
      siteName: 'Crafted by Amma',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: image, alt: product.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
