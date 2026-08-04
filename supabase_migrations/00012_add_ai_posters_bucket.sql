-- Migration: Public ai-posters storage bucket + owner-scoped policies
-- Applied to DB via MCP as "add_ai_posters_bucket" + "restrict_ai_posters_storage_policies"

-- 1. Create public ai-posters storage bucket for generated posters
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ai-posters', 'ai-posters', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2. Owner-scoped policies (path convention: {restaurant_id}/{generation_id}.png)
-- API routes use the service-role client (bypasses RLS); these policies close the
-- hole where any authenticated user could write to the public bucket.

-- Allow authenticated owners to upload posters (scoped by restaurant path prefix)
drop policy if exists "Owners upload ai posters" on storage.objects;
create policy "Owners upload ai posters"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'ai-posters'
    and auth.role() = 'authenticated'
    and split_part(name, '/', 1) in (
      select (r.id)::text from public.restaurants r
      where r.owner_id = auth.uid() and r.is_active = true and coalesce(r.is_suspended, false) = false
    )
  );

-- Allow anyone to read (public bucket serving)
create policy "Public read ai posters"
  on storage.objects
  for select
  to public
  using (bucket_id = 'ai-posters');

-- Allow owners to delete their ai posters
drop policy if exists "Owners delete own ai posters" on storage.objects;
create policy "Owners delete own ai posters"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'ai-posters'
    and auth.role() = 'authenticated'
    and split_part(name, '/', 1) in (
      select (r.id)::text from public.restaurants r
      where r.owner_id = auth.uid()
    )
  );