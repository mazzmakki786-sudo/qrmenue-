-- Migration: AI Poster Generation for restaurants (Gemini image API)
-- History table for generated posters + monthly usage counting (plan-gated)

-- 1. ai_poster_generations table
create table if not exists public.ai_poster_generations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  template_key text not null default 'classic',
  color_scheme text not null default 'appetizing',
  ratio text not null default '1:1',
  dish_names text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  image_path text,
  image_url text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_poster_generations_restaurant
  on public.ai_poster_generations(restaurant_id, created_at desc);

create index if not exists idx_ai_poster_generations_owner
  on public.ai_poster_generations(owner_id);

-- 2. RLS
alter table public.ai_poster_generations enable row level security;

create policy "Owners manage own ai poster generations"
  on public.ai_poster_generations
  for all
  using (
    auth.uid() = owner_id
    and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id
        and r.owner_id = auth.uid()
        and r.is_active = true
        and coalesce(r.is_suspended, false) = false
    )
  )
  with check (auth.uid() = owner_id);

create policy "Superadmin manages all ai poster generations"
  on public.ai_poster_generations
  for all
  using (
    exists (
      select 1 from public.super_admins sa
      where sa.email = (select email from auth.users where id = auth.uid())
    )
  )
  with check (true);

-- 3. Realtime publication (so the dashboard can live-update on completion)
alter publication supabase_realtime add table public.ai_poster_generations;
