import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(
    `UPDATE "DeliverySettings" SET "launchMode" = true WHERE id = 'singleton'`
  );
  console.log('✅ launchMode = true (launch page active)');
}
main().catch(console.error).finally(() => prisma.$disconnect());
