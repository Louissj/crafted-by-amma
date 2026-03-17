import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Crafted by Amma',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
