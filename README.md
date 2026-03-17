# 🌾 Crafted by Amma — Complete Project Guide

---

## 📁 PROJECT STRUCTURE

```
crafted-by-amma/
│
├── FRONTEND
│   ├── src/app/
│   │   ├── page.tsx                    ← Homepage (assembles all sections)
│   │   ├── layout.tsx                  ← Root layout (fonts, SEO metadata)
│   │   ├── globals.css                 ← Theme colors, animations, Tailwind
│   │   └── error.tsx                   ← Error boundary page
│   │
│   ├── src/components/sections/        ← All page sections
│   │   ├── Hero.tsx                    ← Hero with millet bg, bokeh, stalks
│   │   ├── BioCard.tsx                 ← Instagram-style profile card
│   │   ├── Marquee.tsx                 ← Scrolling trust strip
│   │   ├── About.tsx                   ← Story + product photo
│   │   ├── Products.tsx                ← Product cards with image carousel + pricing
│   │   ├── OrderForm.tsx               ← Order form + file upload + success modal
│   │   └── Sections.tsx                ← Ingredients, Benefits, WhyUs, Testimonials,
│   │                                      Shipping, CTA, Footer (grouped)
│   │
│   ├── src/components/ui/              ← Reusable components
│   │   ├── Navbar.tsx                  ← Fixed nav with scroll state + mobile menu
│   │   ├── RevealSection.tsx           ← Scroll-triggered fade-in animations
│   │   └── SectionHeader.tsx           ← Section title + subtitle + divider
│   │
│   └── public/
│       ├── images/                     ← Product images, logo, benefits photo
│       │   ├── logo.png
│       │   ├── malt-bowl.jpg
│       │   ├── malt-pack.jpg
│       │   ├── dosa-bowl.jpg
│       │   ├── dosa-pack.jpg
│       │   └── benefits.jpg
│       ├── uploads/                    ← Payment screenshots (auto-created)
│       └── robots.txt                  ← SEO
│
├── BACKEND
│   ├── src/app/api/
│   │   ├── orders/route.ts             ← POST: create order (public, rate limited)
│   │   │                                  GET: list orders (admin only)
│   │   ├── orders/[id]/route.ts        ← GET/PATCH/DELETE single order (admin only)
│   │   ├── auth/route.ts               ← POST: admin login, DELETE: logout
│   │   └── health/route.ts             ← GET: health check for monitoring
│   │
│   ├── src/app/admin/
│   │   ├── page.tsx                    ← Admin dashboard (login + order management)
│   │   └── layout.tsx                  ← Admin layout (noindex meta)
│   │
│   ├── src/lib/                        ← Backend utilities
│   │   ├── db.ts                       ← Prisma client (PostgreSQL connection)
│   │   ├── auth.ts                     ← JWT token create/verify, password hashing
│   │   ├── constants.ts                ← Products, prices, contact info, offers
│   │   ├── validators.ts               ← Zod schemas for form/API validation
│   │   ├── security.ts                 ← Input sanitization, file validation, IP extraction
│   │   ├── rateLimit.ts                ← Rate limiting (login, orders, API)
│   │   └── whatsapp.ts                 ← WhatsApp message link generators
│   │
│   ├── src/middleware.ts               ← Security headers + admin route protection
│   │
│   └── prisma/
│       ├── schema.prisma               ← Database schema (Order + Admin tables)
│       └── seed.ts                     ← Creates initial admin user
│
├── CONFIG
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.js
│   ├── .env.local                      ← Environment variables (DO NOT commit)
│   ├── .env.example                    ← Template for .env.local
│   └── .gitignore
│
└── DOCS
    ├── README.md                       ← This file
    └── AWS-DEPLOY.md                   ← Step-by-step AWS deployment
```

---

## 🎨 FRONTEND GUIDE

### Theme: Earthy Green & Gold
```
Forest (dark bg):    #1A2A14
Sage (primary):      #5A7A3A
Millet (accent):     #8AA050
Brass (gold):        #C8B44A
Cream (light bg):    #FBF5EC
```

### Page Flow (top to bottom)
```
Navbar          → Fixed, transparent → solid on scroll
Hero            → Millet background + dark overlay + golden bokeh + millet stalks animation
BioCard         → Profile card with stats + detail grid + highlights
Marquee         → Scrolling trust strip (No Preservatives, Ships Worldwide...)
About           → Product photo (malt bowl) + brand story + feature cards
Products        → 2 product cards with image carousel, full details, pricing
Ingredients     → Chip grid of all ingredients
Why Us          → 4 value cards (Love, Natural, Nutrient Dense, Worldwide)
Benefits        → Millet scoop photo + 6 health benefit cards
Testimonials    → 3 customer review cards
Order Form      → Steps guide + form with file upload + QR placeholder
Shipping        → Golden pill badges with delivery info
CTA             → Instagram + WhatsApp buttons + phone numbers
Footer          → Brand, navigation, products, contact links
```

### Key Frontend Features
- **Scroll reveal animations** — `RevealSection` component uses IntersectionObserver
- **Product image carousel** — Auto-swipes every 4 seconds, manual dot navigation
- **Mobile menu** — Hamburger → full screen overlay
- **Order form** — Client-side validation, file upload with preview, success modal
- **Earthy green theme** — Consistent across all sections

### To Edit Products
Open `src/lib/constants.ts` — all product names, descriptions, prices, images are here.

### To Edit Sections
Each section is in `src/components/sections/`. Edit the JSX directly.

### To Change Colors
Edit `tailwind.config.ts` → `colors` section and `src/app/globals.css` → `:root` variables.

---

## ⚙️ BACKEND GUIDE

### Database Schema (PostgreSQL)
```
Order
├── id                 (auto-generated unique ID)
├── name               (customer name)
├── phone              (WhatsApp number)
├── products           (JSON array: ["millet-malt", "instant-dosa"])
├── quantity           ("250g", "500g", "1kg", "2kg")
├── city
├── address
├── paymentScreenshot  (file path)
├── notes
├── status             (pending → verified → confirmed → shipped → delivered)
├── totalAmount        (calculated server-side)
├── createdAt
└── updatedAt

Admin
├── id
├── username
├── passwordHash       (bcrypt)
└── createdAt
```

### API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/orders` | Public | Create new order (rate limited: 10/hr) |
| GET | `/api/orders` | Admin | List all orders (filterable by status) |
| GET | `/api/orders/[id]` | Admin | Get single order details |
| PATCH | `/api/orders/[id]` | Admin | Update order status/notes |
| DELETE | `/api/orders/[id]` | Admin | Delete order |
| POST | `/api/auth` | Public | Admin login (rate limited: 5/15min) |
| DELETE | `/api/auth` | Any | Logout (clears cookie) |
| GET | `/api/health` | Public | Health check |

### Security Features
- **Rate limiting** — Login: 5 attempts/15min, Orders: 10/hour, API: 100/min
- **Input sanitization** — HTML stripping, dangerous char removal
- **Phone validation** — Indian format only (starts with 6-9, 10 digits)
- **File validation** — Max 5MB, JPG/PNG/WebP only, secure random filenames
- **Server-side price calculation** — Prevents frontend tampering
- **JWT auth** — HTTP-only cookies, 7-day expiry
- **bcrypt** — Password hashing with 12 rounds
- **Security headers** — X-Frame-Options, XSS protection, nosniff
- **Constant-time auth** — Prevents user enumeration

### Admin Panel (`/admin`)
- Login → Dashboard with stats (total orders, pending, revenue)
- Filter orders by status
- Click order → Detail modal with customer info + payment screenshot
- Change status via dropdown
- WhatsApp customer directly from order detail
- Delete orders

### Order Flow
```
Customer fills form → POST /api/orders
                      ↓
              Order saved in DB (status: pending)
                      ↓
              Admin sees in dashboard
                      ↓
              Admin verifies payment screenshot
                      ↓
              Admin changes status → verified → confirmed
                      ↓
              Admin WhatsApps customer confirmation
                      ↓
              Status → shipped → delivered
```

---

## 🖥️ LOCAL DEVELOPMENT

```bash
# 1. Extract project
tar -xzf crafted-by-amma.tar.gz
cd crafted-by-amma

# 2. Install dependencies
npm install

# 3. Set up local database
#    Option A: Use Neon free PostgreSQL (easiest)
#      - Go to neon.tech → Create project → Copy connection string
#    Option B: Install PostgreSQL locally
#      - brew install postgresql (Mac)
#      - sudo apt install postgresql (Ubuntu)
#      - createdb craftedbyamma

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local — paste your DATABASE_URL

# 5. Push schema to database
npx prisma db push

# 6. Create admin user
npx tsx prisma/seed.ts

# 7. Start dev server
npm run dev
```

Open:
- http://localhost:3000 → Website
- http://localhost:3000/admin → Admin panel
  - Username: `admin`
  - Password: `craftedbyamma2026`

---

## 🔄 COMMON TASKS

### Add a new product
1. Edit `src/lib/constants.ts` → add to `PRODUCTS` object
2. Add product images to `public/images/`
3. Update order form checkbox in `src/components/sections/OrderForm.tsx`
4. Update `calculateOrderTotal()` in `src/lib/security.ts`

### Change prices
Edit `src/lib/constants.ts` → `prices` object in each product.
Also update `src/lib/security.ts` → `PRICES` in `calculateOrderTotal()`.

### Add UPI QR code
Replace the QR placeholder in `src/components/sections/OrderForm.tsx`:
- Add your QR image to `public/images/upi-qr.png`
- Replace the emoji placeholder div with `<Image src="/images/upi-qr.png" />`

### Change WhatsApp number
Edit `src/lib/constants.ts` → `CONTACT.whatsapp`

### Change admin password
Edit `.env.local` → `ADMIN_PASSWORD`, then re-run `npx tsx prisma/seed.ts`
