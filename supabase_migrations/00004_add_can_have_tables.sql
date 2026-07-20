-- Migration: Add can_have_tables column to plans table
-- Gating tables feature behind Growth+ plans

ALTER TABLE plans ADD COLUMN IF NOT EXISTS can_have_tables BOOLEAN NOT NULL DEFAULT false;

-- Update existing DB plans
UPDATE plans SET can_have_tables = true WHERE slug IN ('growth', 'growth-yearly', 'premium', 'premium-yearly');
UPDATE plans SET can_have_tables = false WHERE slug IN ('trial', 'starter', 'starter-yearly');
