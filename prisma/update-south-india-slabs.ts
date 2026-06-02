import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const slabs = [
  { maxGrams: 500,   charge: 70 },
  { maxGrams: 1000,  charge: 120 },
  { maxGrams: 1500,  charge: 190 },
  { maxGrams: 2000,  charge: 240 },
  { maxGrams: 2500,  charge: 310 },
  { maxGrams: 3000,  charge: 360 },
  { maxGrams: 3500,  charge: 430 },
  { maxGrams: 4000,  charge: 480 },
  { maxGrams: 4500,  charge: 550 },
  { maxGrams: 5000,  charge: 600 },
  { maxGrams: 5500,  charge: 670 },
  { maxGrams: 6000,  charge: 720 },
  { maxGrams: 6500,  charge: 790 },
  { maxGrams: 7000,  charge: 840 },
  { maxGrams: 7500,  charge: 910 },
  { maxGrams: 8000,  charge: 960 },
  { maxGrams: 8500,  charge: 1030 },
  { maxGrams: 9000,  charge: 1080 },
  { maxGrams: 9500,  charge: 1150 },
  { maxGrams: 10000, charge: 1200 },
  { maxGrams: 10500, charge: 1270 },
  { maxGrams: 11000, charge: 1320 },
  { maxGrams: 11500, charge: 1390 },
  { maxGrams: 12000, charge: 1440 },
  { maxGrams: 12500, charge: 1510 },
  { maxGrams: 13000, charge: 1560 },
  { maxGrams: 13500, charge: 1630 },
  { maxGrams: 14000, charge: 1680 },
  { maxGrams: 14500, charge: 1750 },
  { maxGrams: 15000, charge: 1800 },
];

async function main() {
  await prisma.$executeRaw`
    UPDATE "DeliverySettings"
    SET "southIndiaSlabs" = ${JSON.stringify(slabs)}::jsonb
    WHERE id = 'singleton'
  `;
  console.log(`Updated ${slabs.length} South India slabs.`);

  const rows = await prisma.$queryRaw<[{ southIndiaSlabs: unknown }]>`
    SELECT "southIndiaSlabs" FROM "DeliverySettings" WHERE id = 'singleton'
  `;
  console.log('Verified slabs in DB:');
  console.log(JSON.stringify(rows[0]?.southIndiaSlabs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
