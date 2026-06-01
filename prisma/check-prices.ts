import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { id: true, prices: true, mrp: true } });
  for (const p of products) {
    const prices = p.prices as Record<string, number>;
    const mrp = p.mrp as Record<string, number>;
    const hasMrp = Object.keys(mrp).length > 0;
    console.log(`${p.id}`);
    for (const [size, price] of Object.entries(prices)) {
      const m = mrp[size];
      const disc = m ? `  MRP ₹${m} → Selling ₹${price} (${Math.round((1 - price/m)*100)}% off)` : `  ₹${price} (no MRP set)`;
      console.log(`  ${size}:${disc}`);
    }
    if (!hasMrp) console.log('  ⚠️  No MRP set — discounts not showing');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
