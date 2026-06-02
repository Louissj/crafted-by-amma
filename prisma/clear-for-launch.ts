import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing test data before launch...\n');

  const orders = await prisma.order.deleteMany();
  console.log(`✓ Orders deleted: ${orders.count}`);

  const analytics = await prisma.analyticsEvent.deleteMany();
  console.log(`✓ Analytics events deleted: ${analytics.count}`);

  console.log('\nKept intact:');
  console.log('  ✓ Admin credentials');
  console.log('  ✓ Products');
  console.log('  ✓ Delivery settings & slabs');
  console.log('  ✓ Offers');
  console.log('  ✓ Sample packs');
  console.log('  ✓ Reviews');
  console.log('\nReady to go live! 🚀');
}

main().catch(console.error).finally(() => prisma.$disconnect());
