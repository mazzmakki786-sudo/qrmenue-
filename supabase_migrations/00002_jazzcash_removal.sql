-- ============================================
-- QRMenu.pk — Remove JazzCash from Payment Flow
-- 1. Drop & recreate orders.payment_method CHECK
-- 2. Add missing columns to subscriptions
-- ============================================

-- ============================================
-- 1. ORDERS: Drop old CHECK, add new without jazzcash
-- ============================================
ALTER TABLE IF EXISTS orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE IF EXISTS orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'bank_transfer', 'easypaisa'));

-- ============================================
-- 2. SUBSCRIPTIONS: Add missing columns
-- ============================================
ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';

ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS transaction_ref TEXT;

ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
