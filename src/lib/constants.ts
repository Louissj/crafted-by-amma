export const PRODUCTS = {
  'millet-malt': {
    id: 'millet-malt',
    name: 'Homemade Millet (Malt) Powder',
    shortName: 'Millet Malt Powder',
    badge: 'Bestseller',
    description: 'Rich source of proteins, fiber, vitamins & minerals. Boosts energy, builds strength & stamina. Great for digestion, immunity & overall wellness.',
    ingredients: 'All types of millets, Ragi, Sprouts, Dry fruits, Nuts, Soya bean & Seeds',
    usage: [
      { type: 'Sweet', instructions: 'Mix with milk & water, boil 5 min, add jaggery & ghee' },
      { type: 'Salt', instructions: 'Mix with steamed veggies, season with salt & pepper' },
    ],
    prices: {
      '250g': 110,
      '500g': 190,
      '1kg': 350,
    },
    images: ['/images/malt-bowl.jpg', '/images/malt-pack.jpg'],
  },
  'instant-dosa': {
    id: 'instant-dosa',
    name: 'Instant Multigrain Dosa Powder',
    shortName: 'Instant Dosa Powder',
    badge: 'Popular',
    description: 'Naturally rich in fiber, protein & essential minerals. Low glycemic index for balanced energy. Authentic homemade taste — crispy dosas in minutes!',
    ingredients: 'Rice, Ragi, Whole wheat, Pulses, all types of Millets, Spices & Soya bean',
    usage: [
      { type: 'Method', instructions: 'Mix powder with water & salt to dosa batter consistency. Optional: add onions, carrot & coriander.' },
    ],
    prices: {
      '250g': 85,
      '500g': 160,
      '1kg': 280,
    },
    images: ['/images/dosa-bowl.jpg', '/images/dosa-pack.jpg'],
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type QuantityOption = '250g' | '500g' | '1kg' | '2kg';

export const QUANTITY_OPTIONS: QuantityOption[] = ['250g', '500g', '1kg', '2kg'];

export const CONTACT = {
  phone1: '7411895085',
  phone2: '9483707934',
  whatsapp: '917411895085',
  instagram: 'https://www.instagram.com/craftedbyamma/',
  location: 'Mysuru, Karnataka',
};

export const OFFERS = [
  { icon: '✨', text: '5% OFF on every purchase' },
  { icon: '👥', text: 'Refer 5 friends → Get 50% OFF' },
  { icon: '📦', text: 'Free shipping all over Karnataka (1 kg+)' },
  { icon: '🌍', text: 'Worldwide shipping available' },
];

export const BENEFITS = [
  { title: 'Gluten Free', desc: 'Safe for gluten-sensitive diets' },
  { title: 'Rich in Fibre', desc: 'Supports healthy digestion' },
  { title: 'High Protein', desc: 'Essential for muscle & growth' },
  { title: 'Vitamins & Minerals', desc: 'Packed with antioxidants' },
  { title: 'Blood Sugar Control', desc: 'Helps manage sugar levels' },
  { title: 'Gut Health', desc: 'Supports a healthy gut' },
];

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#D4942A' },
  { value: 'verified', label: 'Payment Verified', color: '#5A7A3A' },
  { value: 'confirmed', label: 'Confirmed', color: '#5A7A3A' },
  { value: 'shipped', label: 'Shipped', color: '#3B82F6' },
  { value: 'delivered', label: 'Delivered', color: '#10B981' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
] as const;
