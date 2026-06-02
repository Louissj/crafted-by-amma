import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$queryRaw<[{ karnatakaSlabs: unknown }]>`
    SELECT "karnatakaSlabs" FROM "DeliverySettings" WHERE id = 'singleton'
  `;
  console.log('Current Karnataka slabs in DB:');
  console.log(JSON.stringify(result[0]?.karnatakaSlabs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
