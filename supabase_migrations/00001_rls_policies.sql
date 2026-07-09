-- ============================================
-- QRMenu.pk — Row Level Security Policies
-- Run AFTER initial schema migration
-- ============================================

-- ============================================
-- RESTAURANTS: RLS
-- ============================================
ALTER TABLE IF EXISTS restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active restaurants" ON restaurants;
CREATE POLICY "Public can read active restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Owner can manage own restaurant" ON restaurants;
CREATE POLICY "Owner can manage own restaurant"
  ON restaurants FOR ALL
  USING (owner_id = auth.uid());

-- ============================================
-- CATEGORIES: RLS
-- ============================================
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owner manages own categories" ON categories;
CREATE POLICY "Owner manages own categories"
  ON categories FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- DISHES: RLS
-- ============================================
ALTER TABLE IF EXISTS dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read available dishes" ON dishes;
CREATE POLICY "Public can read available dishes"
  ON dishes FOR SELECT
  USING (is_available = true);

DROP POLICY IF EXISTS "Owner manages own dishes" ON dishes;
CREATE POLICY "Owner manages own dishes"
  ON dishes FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- ORDERS: RLS
-- ============================================
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can read own restaurant orders" ON orders;
CREATE POLICY "Owner can read own restaurant orders"
  ON orders FOR SELECT
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Customer can read own orders" ON orders;
CREATE POLICY "Customer can read own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Owner can update own restaurant orders" ON orders;
CREATE POLICY "Owner can update own restaurant orders"
  ON orders FOR UPDATE
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- CUSTOMERS: RLS
-- ============================================
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customer can see own profile" ON customers;
CREATE POLICY "Customer can see own profile"
  ON customers FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Customer can insert own profile" ON customers;
CREATE POLICY "Customer can insert own profile"
  ON customers FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Customer can update own profile" ON customers;
CREATE POLICY "Customer can update own profile"
  ON customers FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- DEALS: RLS
-- ============================================
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active deals" ON deals;
CREATE POLICY "Public can read active deals"
  ON deals FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Owner manages own deals" ON deals;
CREATE POLICY "Owner manages own deals"
  ON deals FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- SUBSCRIPTIONS: RLS
-- ============================================
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Restaurant owner can read own subscriptions" ON subscriptions;
CREATE POLICY "Restaurant owner can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- COMPANY SETTINGS: RLS
-- ============================================
ALTER TABLE IF EXISTS company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read company settings" ON company_settings;
CREATE POLICY "Public can read company settings"
  ON company_settings FOR SELECT
  USING (true);

-- ============================================
-- NOTIFICATION LOGS: RLS
-- ============================================
ALTER TABLE IF EXISTS notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Restaurant owner can read own notification logs" ON notification_logs;
CREATE POLICY "Restaurant owner can read own notification logs"
  ON notification_logs FOR SELECT
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- FAVORITES: RLS
-- ============================================
ALTER TABLE IF EXISTS favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customer can manage own favorites" ON favorites;
CREATE POLICY "Customer can manage own favorites"
  ON favorites FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- ============================================
-- AI POSTS: RLS
-- ============================================
ALTER TABLE IF EXISTS ai_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own ai posts" ON ai_posts;
CREATE POLICY "Owner can manage own ai posts"
  ON ai_posts FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- AI POST IMAGES: RLS
-- ============================================
ALTER TABLE IF EXISTS ai_post_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own ai post images" ON ai_post_images;
CREATE POLICY "Owner can manage own ai post images"
  ON ai_post_images FOR ALL
  USING (
    ai_post_id IN (SELECT id FROM ai_posts WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))
  );

-- ============================================
-- AI USAGE: RLS
-- ============================================
ALTER TABLE IF EXISTS ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can read own ai usage" ON ai_usage;
CREATE POLICY "Owner can read own ai usage"
  ON ai_usage FOR SELECT
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- OWNER NOTIFICATIONS: RLS
-- ============================================
ALTER TABLE IF EXISTS owner_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own notifications" ON owner_notifications;
CREATE POLICY "Owner can manage own notifications"
  ON owner_notifications FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- PUSH SUBSCRIPTIONS: RLS
-- ============================================
ALTER TABLE IF EXISTS push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Owner can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- ============================================
-- RATE LIMITS: RLS (service role only)
-- ============================================
ALTER TABLE IF EXISTS rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages rate limits" ON rate_limits;
CREATE POLICY "Service role manages rate limits"
  ON rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- CUSTOMER AUDIT LOG: RLS
-- ============================================
ALTER TABLE IF EXISTS customer_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages customer audit" ON customer_audit_log;
CREATE POLICY "Service role manages customer audit"
  ON customer_audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- TRIAL REMINDER EMAILS: RLS
-- ============================================
ALTER TABLE IF EXISTS trial_reminder_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage trial reminders" ON trial_reminder_emails;
CREATE POLICY "Service role can manage trial reminders"
  ON trial_reminder_emails FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET: RLS
-- ============================================
DROP POLICY IF EXISTS "Public can view dish-images" ON storage.objects;
CREATE POLICY "Public can view dish-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

DROP POLICY IF EXISTS "Restaurant owners can upload dish images" ON storage.objects;
CREATE POLICY "Restaurant owners can upload dish images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dish-images' AND
    (auth.uid() IN (
      SELECT owner_id FROM public.restaurants WHERE id::text = (storage.foldername(name))[1]
    ))
  );

DROP POLICY IF EXISTS "Owners can update/delete own dish-images" ON storage.objects;
CREATE POLICY "Owners can update/delete own dish-images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');