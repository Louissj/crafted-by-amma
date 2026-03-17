import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'craftedbyamma2026';
  const hash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash: hash },
    create: { username, passwordHash: hash },
  });
  console.log(`✅ Admin: ${admin.username}`);

  // Products
  const products = [
    {
      id: 'millet-malt',
      name: 'Homemade Millet (Malt) Powder',
      shortName: 'Millet Malt Powder',
      badge: 'Bestseller',
      description: 'Rich source of proteins, fiber, vitamins & minerals. Boosts energy, builds strength & stamina. Great for digestion, immunity & overall wellness.',
      ingredients: 'All types of millets, Ragi, Sprouts, Dry fruits, Nuts, Soya bean & Seeds',
      usage: [
        { type: 'Sweet', instructions: 'Mix with milk & water, boil 5 min, add jaggery & ghee' },
        { type: 'Salt', instructions: 'Mix with steamed veggies, season with salt & pepper' },
      ],
      prices: { '250g': 110, '500g': 190, '1kg': 350 },
      images: ['/images/malt-bowl.jpg', '/images/malt-pack.jpg'],
      sortOrder: 0,
    },
    {
      id: 'instant-dosa',
      name: 'Instant Multigrain Dosa Powder',
      shortName: 'Instant Dosa Powder',
      badge: 'Popular',
      description: 'Naturally rich in fiber, protein & essential minerals. Low glycemic index for balanced energy. Authentic homemade taste — crispy dosas in minutes!',
      ingredients: 'Rice, Ragi, Whole wheat, Pulses, all types of Millets, Spices & Soya bean',
      usage: [
        { type: 'Method', instructions: 'Mix powder with water & salt to dosa batter consistency. Optional: add onions, carrot & coriander.' },
      ],
      prices: { '250g': 85, '500g': 160, '1kg': 280 },
      images: ['/images/dosa-bowl.jpg', '/images/dosa-pack.jpg'],
      sortOrder: 1,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { ...p },
      create: { ...p },
    });
    console.log(`✅ Product: ${p.name}`);
  }

  // Delivery settings
  await prisma.deliverySettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      baseCharge: 50,
      freeAboveAmt: 350,
      karnatakFree: true,
      note: 'Free delivery in Karnataka for orders ₹350+',
    },
  });
  console.log('✅ Delivery settings ready');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
