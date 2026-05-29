import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.samplePack.upsert({
    where: { id: 'sample-pack-main' },
    update: {
      options: [
        { key: 'pack-3',  label: 'Pack of 3',  count: 3,  price: 199 },
        { key: 'pack-5',  label: 'Pack of 5',  count: 5,  price: 299 },
        { key: 'pack-10', label: 'Pack of 10', count: 10, price: 549 },
      ],
    },
    create: {
      id: 'sample-pack-main',
      name: 'Sample Pack',
      description: 'Try before you buy — pick your favourite products in smaller sample sizes.',
      options: [
        { key: 'pack-3',  label: 'Pack of 3',  count: 3,  price: 199 },
        { key: 'pack-5',  label: 'Pack of 5',  count: 5,  price: 299 },
        { key: 'pack-10', label: 'Pack of 10', count: 10, price: 549 },
      ],
      active: true,
      sortOrder: 0,
    },
  });
  console.log('✅ Sample pack seeded');
}
main().catch(console.error).finally(() => prisma.$disconnect());
