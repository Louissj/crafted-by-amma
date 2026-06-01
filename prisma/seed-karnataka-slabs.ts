import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEFAULT_SLABS = [
  { maxGrams: 500,  charge: 40  },
  { maxGrams: 1000, charge: 60  },
  { maxGrams: 1500, charge: 100 },
  { maxGrams: 2000, charge: 160 },
  { maxGrams: 2500, charge: 200 },
  { maxGrams: 3000, charge: 260 },
];

async function main() {
  await prisma.deliverySettings.upsert({
    where: { id: 'singleton' },
    update: { karnatakaSlabs: DEFAULT_SLABS },
    create: {
      id: 'singleton',
      baseCharge: 50,
      outstationCharge: 120,
      freeAboveAmt: 350,
      karnatakFree: true,
      note: 'Weight-based delivery for Karnataka',
      karnatakaSlabs: DEFAULT_SLABS,
    },
  });
  console.log('✅ Karnataka slabs seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
