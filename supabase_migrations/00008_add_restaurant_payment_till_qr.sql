-- ============================================
-- QRMenu.pk — Add payment TILL ID + QR for Bank Transfer
-- Migration 00008: Add payment_till_id + payment_qr_url columns
-- ============================================

-- TILL ID for bank wallet transfers (JazzCash/Easypaisa)
ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS payment_till_id TEXT;

-- Uploaded QR code image URL for the payment wallet
ALTER TABLE IF EXISTS restaurants
  ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;
