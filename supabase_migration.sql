-- Migration: add_personal_branding_fields (2026-06-15)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS brand_primary_color TEXT DEFAULT '#25D366';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS brand_accent_color TEXT DEFAULT '#000000';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS banner_link_url TEXT;
-- ============================================

-- Migration: add_dish_tags (2026-05-31)
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
-- ============================================
-- QRMenu.pk â€” Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABLE 1: RESTAURANTS
-- ============================================
CREATE TABLE restaurants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  name_ur         TEXT,
  slug            TEXT UNIQUE NOT NULL,
  phone           TEXT,
  city            TEXT NOT NULL,
  address         TEXT,
  logo_url        TEXT,
  cuisine_type    TEXT,
  language        TEXT DEFAULT 'en',

  -- Subscription
  plan            TEXT DEFAULT 'trial'
                  CHECK (plan IN ('trial', 'starter', 'growth', 'premium')),
  plan_start_date TIMESTAMPTZ DEFAULT NOW(),
  plan_end_date   TIMESTAMPTZ,
  trial_start     TIMESTAMPTZ DEFAULT NOW(),
  trial_end       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  image_upload_allowed BOOLEAN DEFAULT true,

  -- Status
  is_active       BOOLEAN DEFAULT true,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

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
  price           INTEGER NOT NULL,
  image_url       TEXT,
  is_available    BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category ON dishes(category_id);

-- ============================================
-- TABLE 4: CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT,
  phone           TEXT,
  email           TEXT UNIQUE,
  city            TEXT,
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

  order_number    TEXT UNIQUE NOT NULL,

  items           JSONB NOT NULL,

  total_price     INTEGER NOT NULL,

  order_type      TEXT NOT NULL
                  CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),

  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  table_number    TEXT,
  delivery_address TEXT,

  payment_method  TEXT DEFAULT 'cod'
                  CHECK (payment_method IN ('cod', 'bank_transfer', 'jazzcash', 'easypaisa')),
  payment_status  TEXT DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'failed')),

  order_status    TEXT DEFAULT 'received'
                  CHECK (order_status IN ('received', 'preparing', 'ready', 'completed', 'cancelled')),

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
-- TABLE 6: SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id),
  plan            TEXT NOT NULL,
  amount_pkr      INTEGER NOT NULL,
  payment_method  TEXT,
  payment_ref     TEXT,
  start_date      TIMESTAMPTZ DEFAULT NOW(),
  end_date        TIMESTAMPTZ,
  activated_by    UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 7: COMPANY SETTINGS
-- ============================================
CREATE TABLE company_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT UNIQUE NOT NULL,
  value           TEXT NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO company_settings (key, value) VALUES
  ('jazzcash_number', '03001234567'),
  ('easypaisa_number', '03001234567'),
  ('bank_name', 'Meezan Bank'),
  ('account_title', 'QRMenu Pakistan'),
  ('account_number', '01234567890123'),
  ('whatsapp_support', '03001234567'),
  ('company_email', 'support@qrmenu.pk');

-- ============================================
-- TABLE 8: NOTIFICATION LOGS
-- ============================================
CREATE TABLE notification_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id),
  order_id        UUID REFERENCES orders(id),
  type            TEXT NOT NULL,
  recipient_email TEXT,
  status          TEXT DEFAULT 'sent',
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

CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $func$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats;
  RETURN NULL;
END;
$func$;

CREATE TRIGGER refresh_daily_stats_trigger
  AFTER INSERT OR UPDATE OF order_status ON orders
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_daily_stats();

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

-- ============================================
-- STORAGE: dish-images bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can view dish-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can upload to dish-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can update/delete own dish-images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Restaurants: public read, owner manage
CREATE POLICY "Public can read active restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owner can manage own restaurant"
  ON restaurants FOR ALL
  USING (owner_id = auth.uid());

-- Categories: public read, owner manage
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

-- Dishes: read available, owner manage all
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

-- Orders: anyone can view (by order ID UUID), owner reads own, anyone can create
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

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

-- Orders: owner can update own restaurant orders
CREATE POLICY "Owner can update own restaurant orders"
  ON orders FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- Customers: can see own profile
CREATE POLICY "Customer can see own profile"
  ON customers FOR SELECT
  USING (id = auth.uid());

-- Customers: can insert own profile
CREATE POLICY "Customer can insert own profile"
  ON customers FOR INSERT
  WITH CHECK (id = auth.uid());

-- Customers: can update own profile
CREATE POLICY "Customer can update own profile"
  ON customers FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- REALTIME: enable for orders table
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

