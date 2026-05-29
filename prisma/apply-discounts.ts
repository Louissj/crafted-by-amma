import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DISCOUNTS: Record<string, number> = {
  // 20% off
  'millet-malt':        0.20,
  'instant-dosa':       0.20,
  'sprouted-ragi-flour':0.20,
  // 15% off
  'rasam-powder':       0.15,
  'sambar-powder':      0.15,
  'vangibath-powder':   0.15,
  'bisibele-bath-powder':0.15,
  'karibevu-chutneypudi':0.15,
  'kadalebele-chutneypudi':0.15,
  'flaxseed-chutneypudi':0.15,
};

async function main() {
  const products = await prisma.product.findMany({
    where: { id: { in: Object.keys(DISCOUNTS) } },
  });

  for (const product of products) {
    const disc = DISCOUNTS[product.id];
    const currentPrices = product.prices as Record<string, number>;

    // Current prices become MRP
    const mrp = { ...currentPrices };

    // New selling prices = round(mrp * (1 - discount))
    const prices: Record<string, number> = {};
    for (const [size, price] of Object.entries(currentPrices)) {
      prices[size] = Math.round(price * (1 - disc));
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { mrp, prices },
    });

    const pct = Math.round(disc * 100);
    const preview = Object.entries(prices)
      .map(([s, p]) => `${s}: ₹${mrp[s]} → ₹${p}`)
      .join(', ');
    console.log(`✅ ${product.name} (${pct}% off) — ${preview}`);
  }

  console.log('\nDone! Prices updated with MRP and discounted selling prices.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
