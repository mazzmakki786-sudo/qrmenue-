-- Migration: security_rls_fix (2026-06-14)
-- Adds missing RLS policies for subscriptions, company_settings, notification_logs
-- Fixes overly permissive policies on trial_reminder_emails

-- ============================================
-- SUBSCRIPTIONS: enable RLS, owner-only access
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Owner of the restaurant can read their subscription
CREATE POLICY "Restaurant owner can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- Owner of the restaurant can update their subscription
CREATE POLICY "Restaurant owner can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ============================================
-- COMPANY SETTINGS: public read, super admin write
-- ============================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read company settings (customers need payment info)
CREATE POLICY "Public can read company settings"
  ON company_settings FOR SELECT
  USING (true);

-- Only super admin can modify company settings
CREATE POLICY "Super admin can manage company settings"
  ON company_settings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE lower(email) = lower(coalesce(current_setting('app.settings.super_admin_email', true), ''))
    )
  );

-- ============================================
-- NOTIFICATION LOGS: restaurant owner read only
-- ============================================
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Restaurant owner can read their own notification logs
CREATE POLICY "Restaurant owner can read own notification logs"
  ON notification_logs FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ============================================
-- FIX trial_reminder_emails: replace permissive policy
-- ============================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage trial reminders" ON trial_reminder_emails;

-- Super admin can read trial reminders
CREATE POLICY "Super admin can read trial reminders"
  ON trial_reminder_emails FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE lower(email) = lower(coalesce(current_setting('app.settings.super_admin_email', true), ''))
    )
  );

-- Service role can insert trial reminders (used by server-side cron)
CREATE POLICY "Service role can insert trial reminders"
  ON trial_reminder_emails FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Service role can update trial reminders (marking as sent)
CREATE POLICY "Service role can update trial reminders"
  ON trial_reminder_emails FOR UPDATE
  USING (auth.role() = 'service_role');
