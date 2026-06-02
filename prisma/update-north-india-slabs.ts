import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ₹100 per 500g increment, 500g to 15000g
const slabs = Array.from({ length: 30 }, (_, i) => ({
  maxGrams: (i + 1) * 500,
  charge: (i + 1) * 100,
}));

async function main() {
  await prisma.$executeRaw`
    UPDATE "DeliverySettings"
    SET "northIndiaSlabs" = ${JSON.stringify(slabs)}::jsonb
    WHERE id = 'singleton'
  `;
  console.log(`Updated ${slabs.length} North India slabs.`);

  const rows = await prisma.$queryRaw<[{ northIndiaSlabs: unknown }]>`
    SELECT "northIndiaSlabs" FROM "DeliverySettings" WHERE id = 'singleton'
  `;
  console.log('Verified slabs in DB:');
  console.log(JSON.stringify(rows[0]?.northIndiaSlabs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
