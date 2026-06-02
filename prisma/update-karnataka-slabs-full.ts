import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const slabs = [
  { maxGrams: 500,   charge: 40 },
  { maxGrams: 1000,  charge: 60 },
  { maxGrams: 1500,  charge: 100 },
  { maxGrams: 2000,  charge: 120 },
  { maxGrams: 2500,  charge: 160 },
  { maxGrams: 3000,  charge: 180 },
  { maxGrams: 3500,  charge: 220 },
  { maxGrams: 4000,  charge: 240 },
  { maxGrams: 4500,  charge: 280 },
  { maxGrams: 5000,  charge: 300 },
  { maxGrams: 5500,  charge: 340 },
  { maxGrams: 6000,  charge: 360 },
  { maxGrams: 6500,  charge: 400 },
  { maxGrams: 7000,  charge: 420 },
  { maxGrams: 7500,  charge: 460 },
  { maxGrams: 8000,  charge: 480 },
  { maxGrams: 8500,  charge: 520 },
  { maxGrams: 9000,  charge: 540 },
  { maxGrams: 9500,  charge: 580 },
  { maxGrams: 10000, charge: 600 },
  { maxGrams: 10500, charge: 640 },
  { maxGrams: 11000, charge: 660 },
  { maxGrams: 11500, charge: 700 },
  { maxGrams: 12000, charge: 720 },
  { maxGrams: 12500, charge: 760 },
  { maxGrams: 13000, charge: 780 },
  { maxGrams: 13500, charge: 820 },
  { maxGrams: 14000, charge: 840 },
  { maxGrams: 14500, charge: 880 },
  { maxGrams: 15000, charge: 900 },
];

async function main() {
  await prisma.$executeRaw`
    UPDATE "DeliverySettings"
    SET "karnatakaSlabs" = ${JSON.stringify(slabs)}::jsonb
    WHERE id = 'singleton'
  `;
  console.log(`Updated ${slabs.length} Karnataka slabs.`);

  const rows = await prisma.$queryRaw<[{ karnatakaSlabs: unknown }]>`
    SELECT "karnatakaSlabs" FROM "DeliverySettings" WHERE id = 'singleton'
  `;
  console.log('Verified slabs in DB:');
  console.log(JSON.stringify(rows[0]?.karnatakaSlabs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
