-- ============================================
-- Announcements: plan-targeted audiences + realtime RLS fix
-- ============================================

-- 1) qr_announcements: persist the target audience (plans / 'all' / 'free-trial')
ALTER TABLE qr_announcements
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'all';

-- 2) owner_notifications: track which announcement (for dedupe) + sound flag
ALTER TABLE owner_notifications
  ADD COLUMN IF NOT EXISTS announcement_id UUID REFERENCES qr_announcements(id) ON DELETE SET NULL;
ALTER TABLE owner_notifications
  ADD COLUMN IF NOT EXISTS play_sound BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_owner_notifications_announcement
  ON owner_notifications(restaurant_id, announcement_id)
  WHERE announcement_id IS NOT NULL;

-- 3) Realtime RLS bypass: Supabase Realtime evaluates RLS as the
--    'postgres' role (auth.uid() = NULL), so the SELECT policy on
--    owner_notifications — which checks restaurant ownership via a
--    subquery on auth.uid() — ALWAYS returns an empty set. That kills
--    the INSERT event delivery to the owner dashboard (bell badge,
--    modal, sound never fire). Granting SELECT to the realtime roles
--    is the standard, documented fix.
GRANT SELECT ON owner_notifications TO authenticated, anon, service_role;

-- 4) Index for plan-filtered publish lookups (active, not suspended)
CREATE INDEX IF NOT EXISTS idx_restaurants_plan_publish
  ON restaurants(plan) WHERE is_active = true AND is_suspended = false;
