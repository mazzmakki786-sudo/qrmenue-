# Technical Requirements Document (TRD)
## QRMenu.pk — Pakistan's QR-Based Digital Menu & Ordering Platform
**Version:** 1.0  
**Date:** May 30, 2026  
**Stack:** Next.js 14 + Supabase + Vercel  
**Budget:** $0 (free tiers only, domain purchased separately)

---

## 1. FINAL TECH STACK

### 1.1 Complete Stack Decision Table

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | 14.2+ | SSR for fast load, file-based routing, free Vercel hosting, best DX |
| **UI Styling** | Tailwind CSS | 3.4+ | Utility-first, no runtime CSS, fast builds |
| **UI Components** | shadcn/ui | Latest | Copy-paste components, accessible, customizable |
| **Font** | Inter | via next/font | Clean, minimal, best readability |
| **Urdu Font** | Noto Naskh Arabic | Google Fonts | Best Urdu web rendering |
| **Icons** | Lucide React | 0.383+ | Lightweight, consistent |
| **State Management** | Zustand | 4.0+ | Cart state, simple, no boilerplate |
| **Forms** | React Hook Form | 7.0+ | Fast, minimal re-renders |
| **Validation** | Zod | 3.0+ | Type-safe schema validation |
| **Database** | Supabase (PostgreSQL) | Latest | Free tier, real-time, auth, storage |
| **Authentication** | Supabase Auth | Built-in | Google OAuth + Email, JWT |
| **Backend API** | Next.js API Routes | Built-in | No separate server needed |
| **Real-time** | Supabase Realtime | Built-in | Dashboard bell notifications |
| **File Storage** | Supabase Storage | Free tier | Food photos (500MB free) |
| **Email** | Resend | Free tier | 3,000 emails/month free |
| **QR Generation** | qrcode.react | 3.1+ | Client-side QR generation |
| **Charts** | Recharts | 2.0+ | Lightweight, React-native |
| **Hosting** | Vercel | Free hobby | Next.js optimized, global CDN |
| **WhatsApp** | wa.me redirect | Free | No API needed — URL scheme |
| **Language i18n** | next-intl | 3.0+ | EN + UR translations |

### 1.2 Why NOT These (Rejected Options)

| Technology | Rejected Reason |
|---|---|
| Firebase | Supabase better for PostgreSQL relational data |
| Redux | Too complex — Zustand is simpler for cart |
| Prisma | Supabase client handles DB directly |
| WhatsApp Business API | Paid, needs business verification |
| Twilio SMS | Paid — Resend email is free |
| Netlify | Vercel is better for Next.js (native support) |
| React Native | PWA sufficient for MVP |
| MongoDB | PostgreSQL better for relational menu data |

---

## 2. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    USERS                                        │
│  Customer (Mobile)    Owner (Mobile/Desktop)    Super Admin     │
└────────┬──────────────────────┬────────────────────────┬────────┘
         │                      │                        │
         ▼                      ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (CDN + Hosting)                       │
│                    Next.js 14 App Router                        │
│                                                                 │
│  /menu/[slug]          → Customer Menu (SSR)                   │
│  /checkout             → Checkout Flow                          │
│  /auth/login           → Login Page                            │
│  /dashboard/*          → Owner Admin Panel                      │
│  /superadmin/*         → Super Admin Panel                      │
│  /restaurants          → Nearby Directory                       │
│  /pricing              → Pricing + Company Details              │
│  /api/*                → API Routes (serverless)               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │   SUPABASE        │     │   EXTERNAL APIs   │
        │                   │     │                   │
        │ PostgreSQL DB     │     │ Resend (Email)    │
        │ Auth (Google+     │     │ wa.me (WhatsApp   │
        │   Email)          │     │   redirect)       │
        │ Realtime          │     │ Google OAuth      │
        │ Storage (images)  │     │                   │
        │ Row Level Security│     └───────────────────┘
        └───────────────────┘
```

---

## 3. PROJECT FOLDER STRUCTURE

```
qrmenu/
├── app/                              # Next.js App Router
│   ├── (customer)/                   # Customer-facing routes
│   │   ├── menu/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # /menu/al-habib-grill
│   │   ├── cart/
│   │   │   └── page.tsx              # Cart review
│   │   ├── checkout/
│   │   │   └── page.tsx              # Order type + info form
│   │   ├── order-confirm/
│   │   │   └── page.tsx              # Order confirmation
│   │   └── restaurants/
│   │       └── page.tsx              # Nearby directory
│   │
│   ├── (auth)/                       # Auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   │
│   ├── (owner)/                      # Owner dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx              # Dashboard home (analytics)
│   │       ├── menu/
│   │       │   └── page.tsx          # Menu management
│   │       ├── orders/
│   │       │   └── page.tsx          # Orders list
│   │       ├── analytics/
│   │       │   └── page.tsx          # Detailed analytics
│   │       ├── settings/
│   │       │   └── page.tsx          # Restaurant settings
│   │       └── subscription/
│   │           └── page.tsx          # Plan + billing
│   │
│   ├── (superadmin)/                 # Super admin routes
│   │   └── superadmin/
│   │       ├── page.tsx              # All restaurants list
│   │       ├── restaurants/
│   │       │   └── [id]/
│   │       │       └── page.tsx      # Restaurant detail + edit
│   │       └── settings/
│   │           └── page.tsx          # Pricing page settings
│   │
│   ├── pricing/
│   │   └── page.tsx                  # Public pricing page
│   │
│   ├── api/                          # API Routes
│   │   ├── orders/
│   │   │   ├── route.ts              # POST /api/orders
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET/PATCH /api/orders/[id]
│   │   ├── menu/
│   │   │   └── [slug]/
│   │   │       └── route.ts          # GET /api/menu/[slug]
│   │   ├── notifications/
│   │   │   └── email/
│   │   │       └── route.ts          # POST send email
│   │   ├── admin/
│   │   │   ├── dishes/
│   │   │   │   └── route.ts
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   └── subscription/
│   │   │       └── route.ts
│   │   └── superadmin/
│   │       └── route.ts
│   │
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── components/                       # Reusable components
│   ├── ui/                           # shadcn/ui components
│   ├── customer/                     # Customer-specific
│   │   ├── MenuHeader.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── DishList.tsx
│   │   ├── DishItem.tsx
│   │   ├── CartBar.tsx               # Sticky bottom cart
│   │   └── CartDrawer.tsx
│   ├── checkout/
│   │   ├── OrderTypeSelector.tsx
│   │   ├── DineInForm.tsx
│   │   ├── TakeawayForm.tsx
│   │   ├── DeliveryForm.tsx
│   │   └── WhatsAppRedirect.tsx
│   ├── owner/                        # Owner dashboard
│   │   ├── DashboardStats.tsx
│   │   ├── OrdersChart.tsx           # Recharts line graph
│   │   ├── RecentOrders.tsx
│   │   ├── BellNotification.tsx
│   │   ├── DishCard.tsx
│   │   └── AddDishForm.tsx
│   ├── superadmin/
│   │   ├── RestaurantTable.tsx
│   │   └── PlanEditor.tsx
│   └── shared/
│       ├── LanguageToggle.tsx        # EN/UR toggle
│       ├── QRCodeDisplay.tsx
│       └── SubscriptionBanner.tsx    # Trial days remaining
│
├── lib/                              # Utilities & helpers
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   ├── resend.ts                     # Email helper
│   ├── whatsapp.ts                   # WhatsApp URL builder
│   ├── qr.ts                         # QR code helpers
│   └── utils.ts                      # General helpers
│
├── stores/                           # Zustand stores
│   ├── cartStore.ts                  # Cart state
│   └── orderStore.ts                 # Current order state
│
├── types/                            # TypeScript types
│   └── index.ts                      # All types/interfaces
│
├── messages/                         # i18n translations
│   ├── en.json                       # English
│   └── ur.json                       # Urdu
│
├── middleware.ts                     # Route protection
├── next.config.js
├── tailwind.config.js
├── .env.local                        # Environment variables
└── package.json
```

---

## 4. DATABASE SCHEMA (Supabase PostgreSQL)

### 4.1 Complete Schema

```sql
-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for search

-- ============================================
-- TABLE 1: RESTAURANTS
-- ============================================
CREATE TABLE restaurants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  name_ur         TEXT,                          -- Urdu name
  slug            TEXT UNIQUE NOT NULL,          -- qrmenu.pk/menu/slug
  phone           TEXT,                          -- WhatsApp number for redirect
  city            TEXT NOT NULL,                 -- Lahore / Karachi / Islamabad
  address         TEXT,
  logo_url        TEXT,
  cuisine_type    TEXT,                          -- Pakistani / Chinese / Fast Food
  language        TEXT DEFAULT 'en',            -- 'en' or 'ur' or 'both'
  
  -- Subscription
  plan            TEXT DEFAULT 'trial'          -- 'trial', 'starter', 'growth', 'premium'
                  CHECK (plan IN ('trial', 'starter', 'growth', 'premium')),
  plan_start_date TIMESTAMPTZ DEFAULT NOW(),
  plan_end_date   TIMESTAMPTZ,
  trial_start     TIMESTAMPTZ DEFAULT NOW(),
  trial_end       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  image_upload_allowed BOOLEAN DEFAULT true,    -- false after trial day 3
  
  -- Status
  is_active       BOOLEAN DEFAULT true,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookup (most common query)
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);

-- ============================================
-- TABLE 2: CATEGORIES
-- ============================================
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name_en         TEXT NOT NULL,
  name_ur         TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

-- ============================================
-- TABLE 3: DISHES
-- ============================================
CREATE TABLE dishes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_en         TEXT NOT NULL,
  name_ur         TEXT,
  description_en  TEXT,
  description_ur  TEXT,
  price           INTEGER NOT NULL,             -- in PKR (no decimals)
  image_url       TEXT,                         -- null if no image
  is_available    BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category ON dishes(category_id);

-- ============================================
-- TABLE 4: CUSTOMERS (extends auth.users)
-- ============================================
CREATE TABLE customers (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT,
  phone           TEXT,
  email           TEXT UNIQUE,
  city            TEXT,                         -- for nearby restaurants
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login      TIMESTAMPTZ
);

-- ============================================
-- TABLE 5: ORDERS
-- ============================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id),
  customer_id     UUID REFERENCES customers(id),
  
  -- Order identifier
  order_number    TEXT UNIQUE NOT NULL,         -- ORD-2026-XXXX
  
  -- Items (JSONB for flexibility)
  items           JSONB NOT NULL,
  /*
  items format:
  [
    {
      "dish_id": "uuid",
      "name_en": "Biryani",
      "name_ur": "بریانی",
      "price": 300,
      "quantity": 2,
      "subtotal": 600
    }
  ]
  */
  
  total_price     INTEGER NOT NULL,             -- in PKR
  
  -- Order type
  order_type      TEXT NOT NULL                 -- 'dine_in', 'takeaway', 'delivery'
                  CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  
  -- Customer info
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  table_number    TEXT,                         -- dine_in only
  delivery_address TEXT,                        -- delivery only
  
  -- Payment
  payment_method  TEXT DEFAULT 'cod'            -- 'cod', 'bank_transfer', 'jazzcash', 'easypaisa'
                  CHECK (payment_method IN ('cod', 'bank_transfer', 'jazzcash', 'easypaisa')),
  payment_status  TEXT DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'failed')),
  
  -- Status
  order_status    TEXT DEFAULT 'received'
                  CHECK (order_status IN ('received', 'preparing', 'ready', 'completed', 'cancelled')),
  
  -- Notifications
  whatsapp_sent   BOOLEAN DEFAULT false,
  email_sent      BOOLEAN DEFAULT false,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(order_status);

-- ============================================
-- TABLE 6: SUBSCRIPTIONS (Manual billing log)
-- ============================================
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id),
  plan            TEXT NOT NULL,
  amount_pkr      INTEGER NOT NULL,
  payment_method  TEXT,                         -- 'jazzcash', 'easypaisa', 'bank'
  payment_ref     TEXT,                         -- sender's transaction ID
  start_date      TIMESTAMPTZ DEFAULT NOW(),
  end_date        TIMESTAMPTZ,
  activated_by    UUID,                         -- super admin who activated
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 7: COMPANY SETTINGS (Super Admin)
-- ============================================
CREATE TABLE company_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT UNIQUE NOT NULL,
  value           TEXT NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO company_settings (key, value) VALUES
  ('jazzcash_number', '03001234567'),
  ('easypaisa_number', '03001234567'),
  ('bank_name', 'Meezan Bank'),
  ('account_title', 'QRMenu Pakistan'),
  ('account_number', '01234567890123'),
  ('whatsapp_support', '03001234567'),
  ('company_email', 'support@qrmenu.pk');

-- ============================================
-- TABLE 8: NOTIFICATIONS LOG
-- ============================================
CREATE TABLE notification_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id),
  order_id        UUID REFERENCES orders(id),
  type            TEXT NOT NULL,                -- 'order_email', 'new_dish_email'
  recipient_email TEXT,
  status          TEXT DEFAULT 'sent',          -- 'sent', 'failed'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATERIALIZED VIEW: DAILY ANALYTICS
-- ============================================
CREATE MATERIALIZED VIEW daily_order_stats AS
SELECT 
  restaurant_id,
  DATE(created_at AT TIME ZONE 'Asia/Karachi') as order_date,
  COUNT(*) as total_orders,
  SUM(total_price) as total_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE order_status != 'cancelled'
GROUP BY restaurant_id, DATE(created_at AT TIME ZONE 'Asia/Karachi');

CREATE UNIQUE INDEX ON daily_order_stats(restaurant_id, order_date);

-- Refresh function (call via cron/API)
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: auto updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.2 Row Level Security (RLS) Policies

```sql
-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RESTAURANTS policies
-- Public: anyone can read active restaurants (for menu)
CREATE POLICY "Public can read active restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true);

-- Owner: can only see/edit their own restaurant
CREATE POLICY "Owner can manage own restaurant"
  ON restaurants FOR ALL
  USING (owner_id = auth.uid());

-- CATEGORIES policies
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Owner manages own categories"
  ON categories FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- DISHES policies
CREATE POLICY "Public can read available dishes"
  ON dishes FOR SELECT
  USING (is_available = true);

CREATE POLICY "Owner manages own dishes"
  ON dishes FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ORDERS policies
CREATE POLICY "Owner can read own restaurant orders"
  ON orders FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- CUSTOMERS policies
CREATE POLICY "Customer can see own profile"
  ON customers FOR ALL
  USING (id = auth.uid());
```

---

## 5. API ROUTES (Next.js Route Handlers)

### 5.1 Public APIs (No auth required)

```typescript
// GET /api/menu/[slug]
// Returns full menu for a restaurant
// Used by customer menu page
Response: {
  restaurant: Restaurant,
  categories: Category[],
  dishes: Dish[]
}

// GET /api/restaurants?city=Lahore
// Returns restaurants list for directory
Response: {
  restaurants: RestaurantSummary[]
}
```

### 5.2 Order APIs

```typescript
// POST /api/orders
// Create new order
Body: {
  restaurant_id: string,
  items: CartItem[],
  order_type: 'dine_in' | 'takeaway' | 'delivery',
  customer_name: string,
  customer_phone?: string,
  table_number?: string,
  delivery_address?: string,
  payment_method: 'cod' | 'bank_transfer',
  customer_id?: string  // if logged in
}
Response: {
  order: Order,
  whatsapp_url: string  // pre-built wa.me URL
}

// GET /api/orders/[id]
// Get order details
// Auth: customer (own order) or owner (restaurant order)
Response: { order: Order }

// PATCH /api/orders/[id]/status
// Update order status (owner only)
Body: { status: OrderStatus }
```

### 5.3 Owner APIs (Auth required)

```typescript
// GET /api/dashboard/stats
// Get dashboard stats for owner
Response: {
  today_orders: number,
  today_revenue: number,
  graph_7day: DailyStats[],
  graph_30day: DailyStats[],
  top_dishes: DishStats[],
  recent_orders: Order[]
}

// POST /api/dishes
// Add new dish (triggers email to subscribers)
Body: { 
  category_id, name_en, name_ur, 
  description_en, description_ur, 
  price, image_url 
}

// PATCH /api/dishes/[id]
// Update dish

// DELETE /api/dishes/[id]
// Delete dish

// POST /api/categories
// Add category

// PATCH /api/categories/[id]
// PATCH /api/settings
// Update restaurant settings
```

### 5.4 Notification APIs

```typescript
// POST /api/notifications/order-email
// Send order notification email to owner
// Called internally after order creation
Body: { order_id: string }

// POST /api/notifications/new-dish
// Send email to customers when new dish added
// Called when owner adds new dish
Body: { dish_id: string, restaurant_id: string }
```

### 5.5 Super Admin APIs

```typescript
// GET /api/superadmin/restaurants
// All restaurants with stats

// PATCH /api/superadmin/restaurants/[id]
// Edit any restaurant

// PATCH /api/superadmin/restaurants/[id]/plan
// Change subscription plan
Body: { plan: string, end_date: string }

// GET /api/superadmin/settings
// PATCH /api/superadmin/settings
// Company payment details
```

---

## 6. WHATSAPP REDIRECT IMPLEMENTATION

```typescript
// lib/whatsapp.ts

interface OrderDetails {
  orderNumber: string;
  items: CartItem[];
  totalPrice: number;
  paymentMethod: string;
  customerName: string;
  customerPhone?: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  deliveryAddress?: string;
  restaurantPhone: string;
}

export function buildWhatsAppURL(order: OrderDetails): string {
  const itemsList = order.items
    .map(item => `• ${item.name_en} x${item.quantity} — Rs ${item.subtotal}`)
    .join('\n');

  const orderTypeLabel = {
    dine_in: '🪑 Dine-in',
    takeaway: '🥡 Takeaway',
    delivery: '🛵 Delivery',
  }[order.orderType];

  const locationInfo = order.orderType === 'dine_in'
    ? `🪑 Table: ${order.tableNumber}`
    : order.orderType === 'delivery'
    ? `📍 Address: ${order.deliveryAddress}`
    : '🥡 Takeaway (will collect)';

  const message = `
🍽️ *New Order — QRMenu.pk*
🔖 Order #${order.orderNumber}

📋 *Items:*
${itemsList}

💰 *Total: Rs ${order.totalPrice}*
💵 Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}

👤 Customer: ${order.customerName}
📞 Phone: ${order.customerPhone || 'Not provided'}
${locationInfo}
📦 Type: ${orderTypeLabel}

⏰ Time: ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}

_Sent via QRMenu.pk_
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const phone = order.restaurantPhone.replace(/[^0-9]/g, '');
  
  return `https://wa.me/92${phone.slice(1)}?text=${encodedMessage}`;
}
```

---

## 7. EMAIL SYSTEM (Resend)

### 7.1 Order Notification Email (to Owner)

```typescript
// lib/resend.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(order: Order, restaurant: Restaurant) {
  await resend.emails.send({
    from: 'orders@qrmenu.pk',
    to: restaurant.owner_email,
    subject: `🍽️ New Order #${order.order_number} — ${restaurant.name}`,
    html: `
      <h2>New Order Received!</h2>
      <p><strong>Order #${order.order_number}</strong></p>
      <p>Time: ${new Date(order.created_at).toLocaleString('en-PK')}</p>
      
      <h3>Items:</h3>
      <ul>
        ${order.items.map(i => `<li>${i.name_en} x${i.quantity} — Rs ${i.subtotal}</li>`).join('')}
      </ul>
      
      <p><strong>Total: Rs ${order.total_price}</strong></p>
      <p>Payment: ${order.payment_method}</p>
      <p>Customer: ${order.customer_name} | ${order.customer_phone}</p>
      ${order.order_type === 'delivery' ? `<p>Address: ${order.delivery_address}</p>` : ''}
      ${order.order_type === 'dine_in' ? `<p>Table: ${order.table_number}</p>` : ''}
      
      <a href="https://qrmenu.pk/dashboard/orders">View in Dashboard →</a>
    `
  });
}

// New dish notification (to customers who ordered from this restaurant)
export async function sendNewDishEmail(
  dish: Dish,
  restaurant: Restaurant,
  customerEmails: string[]
) {
  await resend.emails.send({
    from: 'updates@qrmenu.pk',
    to: customerEmails, // batch send
    subject: `🆕 New dish at ${restaurant.name}: ${dish.name_en}`,
    html: `
      <h2>${restaurant.name} ne nayi dish add ki!</h2>
      <h3>${dish.name_en} — Rs ${dish.price}</h3>
      <p>${dish.description_en}</p>
      <a href="https://qrmenu.pk/menu/${restaurant.slug}">Order Now →</a>
    `
  });
}
```

---

## 8. REAL-TIME NOTIFICATIONS (Dashboard Bell)

```typescript
// Dashboard bell using Supabase Realtime
// components/owner/BellNotification.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function BellNotification({ restaurantId }: { restaurantId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Subscribe to new orders for this restaurant
    const channel = supabase
      .channel(`orders:${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
          setUnreadCount(prev => prev + 1);
          // Browser notification (if permission granted)
          if (Notification.permission === 'granted') {
            new Notification(`New Order #${newOrder.order_number}`, {
              body: `Rs ${newOrder.total_price} — ${newOrder.order_type}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return (
    <button className="relative">
      🔔
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                         text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

---

## 9. AUTHENTICATION & MIDDLEWARE

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Protect owner dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/dashboard', request.url));
    }
    // Check if user is restaurant owner
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();
    
    if (!restaurant) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect super admin routes
  if (pathname.startsWith('/superadmin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Check if super admin (env variable)
    if (session.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/superadmin/:path*'],
};
```

---

## 10. ENVIRONMENT VARIABLES

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # Server-side only

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Super Admin
SUPER_ADMIN_EMAIL=admin@qrmenu.pk

# App
NEXT_PUBLIC_APP_URL=https://qrmenu.vercel.app
NEXT_PUBLIC_APP_NAME=QRMenu.pk
```

---

## 11. QR CODE GENERATION

```typescript
// components/shared/QRCodeDisplay.tsx
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  restaurantSlug: string;
  restaurantName: string;
}

export function QRCodeDisplay({ restaurantSlug, restaurantName }: Props) {
  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${restaurantSlug}`;

  const downloadQR = () => {
    const svg = document.getElementById('restaurant-qr');
    const svgData = new XMLSerializer().serializeToString(svg!);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx!.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `${restaurantSlug}-qr-code.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG
        id="restaurant-qr"
        value={menuUrl}
        size={256}
        level="H"
        includeMargin={true}
      />
      <p className="text-sm text-gray-500">{restaurantName}</p>
      <button onClick={downloadQR}>Download QR Code (PNG)</button>
    </div>
  );
}
```

---

## 12. SUBSCRIPTION TRIAL LOGIC

```typescript
// lib/subscription.ts

export type Plan = 'trial' | 'starter' | 'growth' | 'premium';

export interface SubscriptionStatus {
  plan: Plan;
  daysRemaining: number;
  isExpired: boolean;
  canUploadImages: boolean;
  isInGracePeriod: boolean;
}

export function getSubscriptionStatus(restaurant: Restaurant): SubscriptionStatus {
  const now = new Date();
  const trialEnd = new Date(restaurant.trial_end);
  const planEnd = restaurant.plan_end_date ? new Date(restaurant.plan_end_date) : null;

  // Trial logic
  if (restaurant.plan === 'trial') {
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const trialStart = new Date(restaurant.trial_start);
    const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const graceEnd = new Date(trialEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
    const isInGracePeriod = now > trialEnd && now < graceEnd;
    const isExpired = now > graceEnd;

    return {
      plan: 'trial',
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      canUploadImages: daysSinceStart <= 3, // first 3 days only
      isInGracePeriod,
    };
  }

  // Paid plans
  const daysRemaining = planEnd
    ? Math.ceil((planEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  return {
    plan: restaurant.plan as Plan,
    daysRemaining: Math.max(0, daysRemaining),
    isExpired: planEnd ? now > planEnd : false,
    canUploadImages: ['growth', 'premium'].includes(restaurant.plan),
    isInGracePeriod: false,
  };
}

export const PLAN_LIMITS = {
  trial: { maxImages: 4, analytics: true, customBranding: false },
  starter: { maxImages: 0, analytics: true, customBranding: false },
  growth: { maxImages: 50, analytics: true, customBranding: true },
  premium: { maxImages: Infinity, analytics: true, customBranding: true },
};

export const PLAN_PRICES = {
  starter: 800,
  growth: 1800,
  premium: 2500,
};
```

---

## 13. PERFORMANCE OPTIMIZATIONS

```typescript
// 1. Menu page — Static generation with revalidation
// app/(customer)/menu/[slug]/page.tsx
export async function generateStaticParams() {
  // Pre-generate for top restaurants
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug')
    .limit(100);
  return restaurants?.map(r => ({ slug: r.slug })) ?? [];
}

export const revalidate = 60; // Revalidate every 60 seconds

// 2. Image optimization
// All images served via Supabase Storage with transforms
const optimizedImageUrl = `${imageUrl}?width=400&height=300&format=webp&quality=80`;

// 3. Database query optimization
// Menu query — single query with joins (no N+1)
const { data } = await supabase
  .from('restaurants')
  .select(`
    *,
    categories (
      *,
      dishes (*)
    )
  `)
  .eq('slug', slug)
  .eq('is_active', true)
  .single();
```

---

## 14. DEPLOYMENT CONFIGURATION

### Vercel Config (vercel.json)
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://qrmenu.vercel.app"
  }
}
```

### Next.js Config (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
```

---

## 15. DEVELOPMENT COMMANDS

```bash
# Initial Setup
npx create-next-app@latest qrmenu --typescript --tailwind --eslint --app
cd qrmenu

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zustand react-hook-form @hookform/resolvers zod
npm install recharts lucide-react qrcode.react
npm install resend
npm install next-intl
npm install @radix-ui/react-dialog @radix-ui/react-tabs

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog tabs badge

# Development
npm run dev

# Build
npm run build

# Deploy (connect GitHub to Vercel)
# vercel.com → New Project → Import from GitHub → Deploy
```

---

*End of TRD v1.0*
