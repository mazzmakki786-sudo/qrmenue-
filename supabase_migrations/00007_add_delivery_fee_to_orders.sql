-- ============================================
-- QRMenu.pk — Add delivery_fee to orders table
-- Migration 00007: Add delivery_fee column
-- ============================================

-- Add delivery_fee column to orders table for per-order delivery fee tracking
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS delivery_fee INTEGER DEFAULT 0;

-- Refresh the materialized view to include new column if needed
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats;
