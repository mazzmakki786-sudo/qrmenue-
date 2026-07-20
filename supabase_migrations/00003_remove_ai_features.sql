-- Migration: Remove all AI-related features
-- Drops tables, functions, and storage bucket for AI posts/generation

-- 1. Drop RLS policies
DROP POLICY IF EXISTS "Owner can manage own ai posts" ON ai_posts;
DROP POLICY IF EXISTS "Owner can manage own post images" ON ai_post_images;
DROP POLICY IF EXISTS "Owner can read own usage" ON ai_usage;

-- 2. Drop tables (order matters for FK constraints)
DROP TABLE IF EXISTS ai_generation_logs;
DROP TABLE IF EXISTS ai_post_images;
DROP TABLE IF EXISTS ai_posts;
DROP TABLE IF EXISTS ai_usage;

-- 3. Drop increment_ai_usage function if it exists
DROP FUNCTION IF EXISTS increment_ai_usage;

-- 4. Remove ai_posts_per_month column from plans table
ALTER TABLE IF EXISTS plans DROP COLUMN IF EXISTS ai_posts_per_month;

-- 5. Drop ai-post-images storage bucket (via supabase storage API)
-- This is handled separately via the Supabase dashboard or API
