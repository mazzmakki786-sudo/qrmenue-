-- ─────────────────────────────────────────────────────────────────────────────
-- 00015 — Fix analytics refresh: drop per-row triggers, add cron-driven refresh
--
-- Problem (production audit, Aug 2026):
--   Two triggers (refresh_daily_stats_trigger + trg_refresh_stats) ran on EVERY
--   orders INSERT/UPDATE, each performing a full
--   REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats.
--   As order volume grows this adds a full stats recompute to every order —
--   a severe and growing write-path penalty.
--
--   Additionally, the cron route /api/cron/refresh-stats called an RPC
--   (refresh_daily_stats_cron) that never existed in the live DB.
--
-- Fix:
--   1. Drop both triggers (row-level trigger refresh_daily stats removed in 00013).
--   2. Create refresh_daily_stats_cron() so the cron route works.
--   3. Stats freshness is now maintained by Vercel Cron: /api/cron/refresh-stats
--      every 4 hours (see vercel.json "crons").
--
-- Already applied to production on 2026-08-04 via Supabase Management API.
-- This file is kept in sync for future deployments/replays.
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS refresh_daily_stats_trigger ON public.orders;
DROP TRIGGER IF EXISTS trg_refresh_stats ON public.orders;

CREATE OR REPLACE FUNCTION public.refresh_daily_stats_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'refresh_daily_stats_cron failed: %', SQLERRM;
  END;
END;
$function$;
