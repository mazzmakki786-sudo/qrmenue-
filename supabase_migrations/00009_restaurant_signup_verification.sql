-- 00009: Restaurant signup email verification codes
--
-- Stores the 6-digit confirmation code + Supabase confirmation action link
-- for email-based restaurant signups. Lets the user verify via a code we
-- generate ourselves (primary path) or via the Supabase confirmation link.
-- Service-role only — no RLS policies are added, so the table is closed to
-- the public/anonymous role.

create table if not exists public.restaurant_signup_verification (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  action_link text,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurant_signup_verification enable row level security;
