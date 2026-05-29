import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const S3 = 'https://crafted-by-amma.s3.ap-south-1.amazonaws.com/products';

const products = [
  {
    id: 'flaxseed-chutneypudi',
    name: 'Flaxseed Chutneypudi',
    shortName: 'Flaxseed Chutneypudi',
    badge: 'New',
    description: 'A nutritious Karnataka-style chutney powder packed with the goodness of flaxseeds. Rich in Omega-3 fatty acids, fibre and antioxidants. Pairs beautifully with idli, dosa or hot rice with a drizzle of ghee.',
    ingredients: 'Flax Seeds, Chana Dal (Bengal Gram), Byadagi Chillies, Guntur Chillies, Dry Coconut (Kopra), Mustard Seeds, Curry Leaves, Tamarind, Jaggery, Asafoetida (Hing), Salt',
    usage: [
      { type: 'With Idli / Dosa', instructions: 'Serve alongside idli or dosa with a drizzle of ghee or coconut oil.' },
      { type: 'With Rice', instructions: 'Mix 1–2 tsp with hot rice and a spoon of ghee or sesame oil for a quick, wholesome meal.' },
    ],
    prices: { '150g': 80, '300g': 150 },
    images: [`${S3}/flaxseed.PNG`],
    sortOrder: 3,
  },
  {
    id: 'kadalebele-chutneypudi',
    name: 'Kadalebele Chutneypudi',
    shortName: 'Kadalebele Chutneypudi',
    badge: 'New',
    description: 'A classic Karnataka chutney powder made with roasted chana dal and aromatic spices. Crispy, tangy and mildly spicy — the perfect everyday accompaniment for idli, dosa or rice mixed with ghee.',
    ingredients: 'Chana Dal (Bengal Gram), Byadagi Chillies, Guntur Chillies, Dry Coconut (Kopra), Curry Leaves, Tamarind, Jaggery, Asafoetida (Hing), Salt',
    usage: [
      { type: 'With Idli / Dosa', instructions: 'Serve alongside idli or dosa with a drizzle of ghee or coconut oil.' },
      { type: 'With Rice', instructions: 'Mix with hot rice and sesame oil for a quick and satisfying meal.' },
    ],
    prices: { '150g': 75, '300g': 140 },
    images: [`${S3}/kadalebele.PNG`],
    sortOrder: 4,
  },
  {
    id: 'karibevu-chutneypudi',
    name: 'Karibevu Chutneypudi',
    shortName: 'Karibevu Chutneypudi',
    badge: 'New',
    description: 'Made with fresh curry leaves as the star ingredient, this chutney powder is packed with iron, calcium and vitamins. Deeply aromatic and flavourful — a staple in every authentic South Indian kitchen.',
    ingredients: 'Fresh Curry Leaves (Karibevu), Urad Dal, Chana Dal, Byadagi Chillies, Guntur Chillies, Cumin Seeds, Dry Coconut (Kopra), Black Peppercorns, Tamarind, Jaggery, Asafoetida (Hing), Salt',
    usage: [
      { type: 'With Idli / Dosa', instructions: 'Serve with idli or dosa with a drizzle of ghee for a classic combination.' },
      { type: 'With Rice', instructions: 'Mix with hot rice and ghee. A small amount goes a long way!' },
    ],
    prices: { '150g': 80, '300g': 150 },
    images: [`${S3}/karibevu.PNG`],
    sortOrder: 5,
  },
  {
    id: 'sambar-powder',
    name: 'Homemade Sambar Powder',
    shortName: 'Sambar Powder',
    badge: 'New',
    description: 'An authentic Karnataka-style sambar powder, freshly ground from hand-selected spices. Adds depth, warmth and that unmistakable homemade flavour to your sambar. No artificial colours or preservatives.',
    ingredients: 'Coriander Seeds (Dhania), Byadagi Red Chillies, Chana Dal, Urad Dal, Fenugreek Seeds (Methi), Cumin Seeds, Black Peppercorns, Turmeric Powder, Asafoetida (Hing), Coconut Oil (for roasting)',
    usage: [
      { type: 'For Sambar', instructions: 'Add 1–2 tsp while making sambar with toor dal and vegetables of your choice. Adjust to taste.' },
      { type: 'Storage', instructions: 'Store in an airtight container in a cool, dry place. Best used within 3 months.' },
    ],
    prices: { '100g': 70, '200g': 130 },
    images: [`${S3}/sambar.PNG`],
    sortOrder: 6,
  },
  {
    id: 'rasam-powder',
    name: 'Homemade Rasam Powder',
    shortName: 'Rasam Powder',
    badge: 'New',
    description: 'A light, aromatic rasam powder with the perfect balance of pepper, cumin and coriander. Makes a deeply comforting rasam that aids digestion and warms the soul. Traditionally made, no shortcuts.',
    ingredients: 'Coriander Seeds (Dhania), Byadagi Red Chillies, Black Peppercorns, Cumin Seeds, Curry Leaves, Turmeric Powder, Asafoetida (Hing), Coconut Oil (for roasting)',
    usage: [
      { type: 'For Rasam', instructions: 'Add ½–1 tsp while making rasam with tomato, tamarind water and a tempering of mustard and curry leaves.' },
      { type: 'Storage', instructions: 'Store in an airtight container. Best used within 3 months.' },
    ],
    prices: { '100g': 65, '200g': 120 },
    images: [`${S3}/rasam.PNG`],
    sortOrder: 7,
  },
  {
    id: 'vangibath-powder',
    name: 'Vangibath Powder',
    shortName: 'Vangibath Powder',
    badge: 'New',
    description: 'The soul of Karnataka\'s beloved Vangibath — a bold, complex spice blend with a perfect harmony of cinnamon, cloves and roasted dals. Use it for vangibath rice, pulao or as a versatile everyday seasoning.',
    ingredients: 'Coriander Seeds (Dhania), Byadagi Chillies, Guntur Chillies, Chana Dal, Urad Dal, Cinnamon (Chakke), Cloves (Lavanga), Fenugreek Seeds (Methi), White Sesame Seeds, Curry Leaves, Asafoetida (Hing)',
    usage: [
      { type: 'For Vangibath', instructions: 'Sauté brinjal with onions and tempering, add 1–2 tbsp powder, mix with cooked rice and season to taste.' },
      { type: 'As Seasoning', instructions: 'Use as a flavourful seasoning for mixed rice, pulao or stir-fried vegetables.' },
    ],
    prices: { '100g': 75, '200g': 140 },
    images: [`${S3}/vangibath.PNG`],
    sortOrder: 8,
  },
  {
    id: 'sprouted-ragi-flour',
    name: 'Sprouted Ragi Flour',
    shortName: 'Sprouted Ragi Flour',
    badge: 'New',
    description: 'Pure 100% sprouted ragi flour — naturally rich in calcium, iron and amino acids. Sprouting enhances nutrient absorption and improves digestibility. Perfect for a wholesome morning drink or healthy recipes.',
    ingredients: '100% Sprouted Ragi (Finger Millet)',
    usage: [
      { type: 'Porridge / Drink', instructions: 'Take one cup of water and add half a spoon of Sprouted Ragi Flour. Mix thoroughly to avoid lumps before boiling. Add sweetener, milk & ghee as desired.' },
    ],
    prices: { '250g': 90, '500g': 170, '1kg': 320 },
    images: [`${S3}/ragi.PNG`],
    sortOrder: 2,
  },
  {
    id: 'bisibele-bath-powder',
    name: 'Bisibele Bath Powder',
    shortName: 'Bisibele Bath Powder',
    badge: 'New',
    description: 'The secret to an authentic Bisibele Bath — a rich, fragrant spice blend that brings Karnataka\'s most beloved comfort dish to life. Slow-roasted spices for maximum depth and aroma. Pure, fresh, homemade.',
    ingredients: 'Coriander Seeds (Dhania), Byadagi Dried Red Chillies, Guntur Dried Red Chillies, Cumin Seeds, Fenugreek Seeds (Methi), Black Peppercorns, Chana Dal, Urad Dal, Marathi Moggu (Kapok Buds), Cinnamon (Chakke), Cloves (Lavanga), Cardamom (Yelakki), Asafoetida (Hing), Curry Leaves, Poppy Seeds (Gasagase)',
    usage: [
      { type: 'For Bisibele Bath', instructions: 'Cook rice and toor dal together. Add chopped vegetables, tamarind water and 2–3 tbsp of this powder. Simmer till everything blends. Finish with a generous tempering of ghee, cashews and curry leaves.' },
      { type: 'Storage', instructions: 'Store in an airtight container in a cool, dry place. Best used within 3 months.' },
    ],
    prices: { '100g': 80, '200g': 150 },
    images: [`${S3}/bisibele.PNG`],
    sortOrder: 8,
  },
];

async function main() {
  console.log('Adding 7 new products...\n');
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name, shortName: p.shortName, badge: p.badge,
        description: p.description, ingredients: p.ingredients,
        usage: p.usage, prices: p.prices, images: p.images,
        sortOrder: p.sortOrder, active: true,
      },
      create: { ...p, active: true },
    });
    console.log(`✅  ${p.name}`);
  }
  console.log('\nDone!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
