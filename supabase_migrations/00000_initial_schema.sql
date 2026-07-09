-- ============================================
-- QRMenu.pk — Complete Database Schema
-- Migration 00000: Initial Schema
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- TABLE 1: RESTAURANTS
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
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
  plan_limits_override JSONB,
  trial_start     TIMESTAMPTZ DEFAULT NOW(),
  trial_end       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  image_upload_allowed BOOLEAN DEFAULT true,

  -- Status
  is_active       BOOLEAN DEFAULT true,
  is_suspended    BOOLEAN DEFAULT false,

  -- Branding
  brand_primary_color TEXT DEFAULT '#25D366',
  brand_accent_color  TEXT DEFAULT '#000000',
  banner_enabled      BOOLEAN DEFAULT false,
  banner_image_url    TEXT,
  banner_link_url     TEXT,

  -- Hours & delivery
  is_open         BOOLEAN DEFAULT true,
  opening_time    TIME,
  closing_time    TIME,
  opening_hours   JSONB,
  delivery_fee    INTEGER DEFAULT 0,
  delivery_time_min INTEGER,

  -- Tracking
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;

-- ============================================
-- TABLE 2: CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name_en         TEXT NOT NULL,
  name_ur         TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);

-- ============================================
-- TABLE 3: DISHES
-- ============================================
CREATE TABLE IF NOT EXISTS dishes (
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
  tags            JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_available ON dishes(restaurant_id, is_available);

-- ============================================
-- TABLE 4: CUSTOMERS (registered users)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
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
CREATE TABLE IF NOT EXISTS orders (
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
  deal_id         UUID,
  discount_amount INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_date ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, order_status);

-- ============================================
-- TABLE 6: DEALS / DISCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  dish_id         UUID REFERENCES dishes(id) ON DELETE SET NULL,
  title_en        TEXT NOT NULL,
  title_ur        TEXT,
  description_en  TEXT,
  description_ur  TEXT,
  deal_type       TEXT NOT NULL CHECK (deal_type IN ('percentage', 'flat', 'bundle')),
  deal_value      INTEGER NOT NULL,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_restaurant ON deals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(restaurant_id, is_active);

-- ============================================
-- TABLE 6: SUBSCRIPTIONS (payment records)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
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

CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant ON subscriptions(restaurant_id);

-- ============================================
-- TABLE 7: PLANS (dynamic plan definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  name_ur         TEXT,
  description     TEXT,
  price           INTEGER NOT NULL,
  original_price  INTEGER,
  features        JSONB DEFAULT '[]'::jsonb,
  custom_features JSONB DEFAULT '[]'::jsonb,
  limits          JSONB DEFAULT '{}'::jsonb,
  is_active       BOOLEAN DEFAULT true,
  is_popular      BOOLEAN DEFAULT false,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);

-- ============================================
-- TABLE 8: COMPANY SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS company_settings (
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
  ('company_email', 'support@digitalmenue.com'),
  ('trial_max_dishes', '20'),
  ('trial_max_categories', '20'),
  ('trial_max_orders', '10'),
  ('trial_duration_days', '7'),
  ('trial_grace_period_days', '3')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- TABLE 9: NOTIFICATION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS notification_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id),
  order_id        UUID REFERENCES orders(id),
  type            TEXT NOT NULL,
  recipient_email TEXT,
  status          TEXT DEFAULT 'sent',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_restaurant ON notification_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at);

-- ============================================
-- TABLE 10: FAVORITES (customer likes)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_customer ON favorites(customer_id);

-- ============================================
-- TABLE 11: AI POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  prompt          TEXT NOT NULL,
  language        TEXT DEFAULT 'en',
  ratio           TEXT DEFAULT '1:1',
  caption         TEXT,
  image_url       TEXT,
  template_used   TEXT,
  settings        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_posts_restaurant ON ai_posts(restaurant_id);

-- ============================================
-- TABLE 12: AI POST IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS ai_post_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_post_id      UUID NOT NULL REFERENCES ai_posts(id) ON DELETE CASCADE,
  dish_id         UUID REFERENCES dishes(id) ON DELETE SET NULL,
  image_url       TEXT NOT NULL,
  position        INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ai_post_images_post ON ai_post_images(ai_post_id);

-- ============================================
-- TABLE 13: AI USAGE (monthly tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_usage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month           TEXT NOT NULL,
  count           INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, month)
);

-- ============================================
-- TABLE 14: AI GENERATION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id),
  type            TEXT NOT NULL,
  prompt          TEXT,
  model           TEXT,
  tokens_used     INTEGER,
  duration_ms     INTEGER,
  success         BOOLEAN DEFAULT true,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_restaurant ON ai_generation_logs(restaurant_id);

-- ============================================
-- TABLE 15: OWNER NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS owner_notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}'::jsonb,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_notifications_restaurant ON owner_notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_unread ON owner_notifications(restaurant_id, is_read) WHERE is_read = false;

-- ============================================
-- TABLE 16: QR ANNOUNCEMENTS (superadmin broadcast)
-- ============================================
CREATE TABLE IF NOT EXISTS qr_announcements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  body            TEXT,
  type            TEXT DEFAULT 'info',
  is_published    BOOLEAN DEFAULT false,
  audience        TEXT DEFAULT 'all',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_announcements_published ON qr_announcements(is_published, published_at);

-- ============================================
-- TABLE 17: PUSH SUBSCRIPTIONS (web push)
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  endpoint        TEXT UNIQUE NOT NULL,
  p256dh_key      TEXT NOT NULL,
  auth_key        TEXT NOT NULL,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_restaurant ON push_subscriptions(restaurant_id);

-- ============================================
-- TABLE 18: RATE LIMITS
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier      TEXT NOT NULL,
  endpoint        TEXT NOT NULL,
  count           INTEGER DEFAULT 1,
  window_start    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, endpoint, window_start DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created ON rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start);

-- ============================================
-- TABLE 19: LOGIN ATTEMPTS (account lockout)
-- ============================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL,
  ip_address      TEXT,
  success         BOOLEAN DEFAULT false,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);

-- ============================================
-- TABLE 20: SUPER ADMIN
-- ============================================
CREATE TABLE IF NOT EXISTS super_admins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  role            TEXT DEFAULT 'admin',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 21: SUPERADMIN AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS superadmin_audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id        UUID,
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       TEXT,
  details         JSONB DEFAULT '{}'::jsonb,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_superadmin_audit_admin ON superadmin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_audit_created ON superadmin_audit_log(created_at);

-- ============================================
-- TABLE 22: SUPERADMIN LOGIN ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS superadmin_login_attempts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL,
  ip_address      TEXT,
  success         BOOLEAN DEFAULT false,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_superadmin_login_email ON superadmin_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_superadmin_login_time ON superadmin_login_attempts(attempted_at);

-- ============================================
-- TABLE 23: OWNER AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS owner_audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id),
  owner_id        UUID,
  action          TEXT NOT NULL,
  details         JSONB DEFAULT '{}'::jsonb,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_audit_restaurant ON owner_audit_log(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_owner_audit_created ON owner_audit_log(created_at);

-- ============================================
-- TABLE 24: CUSTOMER AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS customer_audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID,
  action          TEXT NOT NULL,
  details         JSONB DEFAULT '{}'::jsonb,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_audit_customer_id ON customer_audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_audit_created_at ON customer_audit_log(created_at);

-- ============================================
-- TABLE 25: TRIAL REMINDER EMAILS
-- ============================================
CREATE TABLE IF NOT EXISTS trial_reminder_emails (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  reminder_type   TEXT NOT NULL,
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  email           TEXT NOT NULL,
  UNIQUE(restaurant_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_trial_reminders_restaurant ON trial_reminder_emails(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_trial_reminders_sent_at ON trial_reminder_emails(sent_at);

-- ============================================
-- MATERIALIZED VIEW: DAILY ANALYTICS
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_order_stats AS
SELECT DISTINCT ON (restaurant_id, order_date)
  restaurant_id,
  DATE(created_at AT TIME ZONE 'Asia/Karachi') as order_date,
  COUNT(*) as total_orders,
  SUM(total_price) as total_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE order_status != 'cancelled'
GROUP BY restaurant_id, DATE(created_at AT TIME ZONE 'Asia/Karachi');

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_order_stats_unique ON daily_order_stats(restaurant_id, order_date);

CREATE OR REPLACE FUNCTION refresh_daily_stats_cron()
RETURNS void
LANGUAGE plpgsql
AS $func$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats;
END;
$func$;

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

CREATE TRIGGER IF NOT EXISTS restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ORDER NUMBER AUTO-GENERATOR
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number_func()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_number ON orders;
CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number_func();

-- ============================================
-- PG_CRON CLEANUP JOBS
-- ============================================
SELECT cron.schedule(
  'cleanup-rate-limits',
  '* * * * *',
  $$DELETE FROM rate_limits WHERE window_start < now() - interval '2 minutes'$$
);

SELECT cron.schedule(
  'cleanup-login-attempts',
  '0 * * * *',
  $$DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 hour'$$
);

SELECT cron.schedule(
  'cleanup-superadmin-attempts',
  '5 * * * *',
  $$DELETE FROM superadmin_login_attempts WHERE attempted_at < now() - interval '1 hour'$$
);

-- ============================================
-- STORAGE: dish-images bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE company_settings;