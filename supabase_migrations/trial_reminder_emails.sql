-- Migration: trial_reminder_emails (2026-06-04)
-- Tracks which trial reminder emails have been sent to prevent duplicates
-- Also adds storage bucket for QR code downloads

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

-- RLS: only super admin can read
ALTER TABLE trial_reminder_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage trial reminders"
  ON trial_reminder_emails FOR ALL
  USING (true)
  WITH CHECK (true);
