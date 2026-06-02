import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Karnataka — continues at ~₹30-40 per 500g
const KARNATAKA = JSON.stringify([
  { maxGrams: 500,   charge: 40  },
  { maxGrams: 1000,  charge: 60  },
  { maxGrams: 1500,  charge: 100 },
  { maxGrams: 2000,  charge: 120 },
  { maxGrams: 2500,  charge: 160 },
  { maxGrams: 3000,  charge: 180 },
  { maxGrams: 3500,  charge: 220 },
  { maxGrams: 4000,  charge: 260 },
  { maxGrams: 5000,  charge: 320 },
  { maxGrams: 6000,  charge: 380 },
  { maxGrams: 8000,  charge: 460 },
  { maxGrams: 10000, charge: 560 },
  { maxGrams: 15000, charge: 700 },
]);

// South India — roughly 2x Karnataka
const SOUTH_INDIA = JSON.stringify([
  { maxGrams: 500,   charge: 70   },
  { maxGrams: 1000,  charge: 120  },
  { maxGrams: 1500,  charge: 190  },
  { maxGrams: 2000,  charge: 240  },
  { maxGrams: 2500,  charge: 310  },
  { maxGrams: 3000,  charge: 360  },
  { maxGrams: 3500,  charge: 420  },
  { maxGrams: 4000,  charge: 480  },
  { maxGrams: 5000,  charge: 570  },
  { maxGrams: 6000,  charge: 660  },
  { maxGrams: 8000,  charge: 800  },
  { maxGrams: 10000, charge: 980  },
  { maxGrams: 15000, charge: 1200 },
]);

// North India — ₹100 per 500g step
const NORTH_INDIA = JSON.stringify([
  { maxGrams: 500,   charge: 100  },
  { maxGrams: 1000,  charge: 200  },
  { maxGrams: 1500,  charge: 300  },
  { maxGrams: 2000,  charge: 400  },
  { maxGrams: 2500,  charge: 500  },
  { maxGrams: 3000,  charge: 600  },
  { maxGrams: 3500,  charge: 700  },
  { maxGrams: 4000,  charge: 800  },
  { maxGrams: 5000,  charge: 950  },
  { maxGrams: 6000,  charge: 1100 },
  { maxGrams: 8000,  charge: 1350 },
  { maxGrams: 10000, charge: 1600 },
  { maxGrams: 15000, charge: 2000 },
]);

async function main() {
  await prisma.$executeRawUnsafe(
    `UPDATE "DeliverySettings"
     SET "karnatakaSlabs" = $1::jsonb,
         "southIndiaSlabs" = $2::jsonb,
         "northIndiaSlabs" = $3::jsonb
     WHERE id = 'singleton'`,
    KARNATAKA, SOUTH_INDIA, NORTH_INDIA
  );

  console.log('✅ All slabs extended to 15kg\n');
  console.log('Karnataka:');
  JSON.parse(KARNATAKA).forEach((s: { maxGrams: number; charge: number }) =>
    console.log(`  up to ${s.maxGrams}g → ₹${s.charge}`));
  console.log('\nSouth India:');
  JSON.parse(SOUTH_INDIA).forEach((s: { maxGrams: number; charge: number }) =>
    console.log(`  up to ${s.maxGrams}g → ₹${s.charge}`));
  console.log('\nNorth India:');
  JSON.parse(NORTH_INDIA).forEach((s: { maxGrams: number; charge: number }) =>
    console.log(`  up to ${s.maxGrams}g → ₹${s.charge}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
