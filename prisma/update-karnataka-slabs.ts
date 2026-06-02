import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SLABS = JSON.stringify([
  { maxGrams: 500,  charge: 40  },
  { maxGrams: 1000, charge: 60  },
  { maxGrams: 1500, charge: 100 },
  { maxGrams: 2000, charge: 120 },
  { maxGrams: 2500, charge: 160 },
  { maxGrams: 3000, charge: 180 },
]);

async function main() {
  await prisma.$executeRawUnsafe(
    `UPDATE "DeliverySettings" SET "karnatakaSlabs" = $1::jsonb WHERE id = 'singleton'`,
    SLABS
  );
  console.log('✅ Karnataka slabs updated');
  console.log('  0–500g   → ₹40');
  console.log('  501–1000g → ₹60');
  console.log('  1001–1500g → ₹100');
  console.log('  1501–2000g → ₹120');
  console.log('  2001–2500g → ₹160');
  console.log('  2501–3000g → ₹180');
}

main().catch(console.error).finally(() => prisma.$disconnect());
