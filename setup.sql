-- ============================================
-- QRMenu.pk — Complete Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Customer Audit Log Table
CREATE TABLE IF NOT EXISTS customer_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customer_audit_customer_id 
  ON customer_audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_audit_created_at 
  ON customer_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup 
  ON rate_limits(window_start);

-- 3. Enable pg_cron for auto cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Auto-delete old rate limits every minute
SELECT cron.schedule(
  'cleanup-rate-limits',
  '* * * * *',
  $$DELETE FROM rate_limits WHERE window_start < now() - interval '2 minutes'$$
);

-- 5. Auto-delete old login attempts every hour
SELECT cron.schedule(
  'cleanup-login-attempts',
  '0 * * * *',
  $$DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 hour'$$
);

-- 6. Auto-delete old superadmin login attempts every hour
SELECT cron.schedule(
  'cleanup-superadmin-attempts',
  '5 * * * *',
  $$DELETE FROM superadmin_login_attempts WHERE attempted_at < now() - interval '1 hour'$$
);

-- 7. Order number auto-generate trigger
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

-- 8. Daily stats refresh trigger
CREATE OR REPLACE FUNCTION refresh_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_daily_stats_cron();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_stats ON orders;
CREATE TRIGGER trg_refresh_stats
  AFTER INSERT OR UPDATE ON orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_stats_on_order();

-- 9. RLS for customer_audit_log
ALTER TABLE customer_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages customer audit" 
  ON customer_audit_log FOR ALL 
  USING (auth.role() = 'service_role');

-- 10. RLS for rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits" 
  ON rate_limits FOR ALL 
  USING (auth.role() = 'service_role');
