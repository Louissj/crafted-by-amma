import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SOUTH = JSON.stringify([
  { maxGrams: 500,  charge: 70  },
  { maxGrams: 1000, charge: 120 },
  { maxGrams: 1500, charge: 190 },
  { maxGrams: 2000, charge: 240 },
  { maxGrams: 2500, charge: 310 },
  { maxGrams: 3000, charge: 360 },
]);

const NORTH = JSON.stringify([
  { maxGrams: 500,  charge: 100 },
  { maxGrams: 1000, charge: 200 },
  { maxGrams: 1500, charge: 300 },
  { maxGrams: 2000, charge: 400 },
  { maxGrams: 2500, charge: 500 },
  { maxGrams: 3000, charge: 600 },
]);

async function main() {
  await prisma.$executeRawUnsafe(
    `UPDATE "DeliverySettings" SET "southIndiaSlabs" = $1::jsonb, "northIndiaSlabs" = $2::jsonb WHERE id = 'singleton'`,
    SOUTH, NORTH
  );
  console.log('✅ South India + North India slabs seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
