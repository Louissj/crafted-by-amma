import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pack = await prisma.samplePack.findFirst();
  if (!pack) { console.log('No sample pack found'); return; }

  const options = pack.options as Array<{ key: string; label: string; count: number; price: number; mrp?: number }>;

  // Set MRP ~25% above selling price (round to nearest 9)
  const updated = options.map(opt => ({
    ...opt,
    mrp: Math.ceil(opt.price * 1.25 / 10) * 10 - 1,
  }));

  await prisma.samplePack.update({
    where: { id: pack.id },
    data: { options: updated },
  });

  updated.forEach(o =>
    console.log(`✅ ${o.label}: ₹${o.price} (MRP ₹${o.mrp}) — ${Math.round((1 - o.price / o.mrp!) * 100)}% off`)
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());
