-- ============================================
-- Phase 2: Realtime PII removal + RLS initPlan optimization
-- ============================================
-- A) Remove `customers` (PII: names, phones, addresses) from the realtime
--    publication. Codebase audit: no client subscribes to customers realtime
--    events (customer account page uses filtered orders/notifications only).
--    This silently stops PII from broadcasting over the realtime channel.
--
-- B) initPlan rewrite: bare `auth.uid()` inside RLS policy qual/with_check is
--    re-executed per ROW. Wrapping it as `(SELECT auth.uid())` lets Postgres
--    evaluate it once per query (initPlan) — a major win on hot tables
--    (orders, notifications) scanned by owners/superadmin.
--
-- This migration is IDEMPOTENT and DRIFT-SAFE: part B is dynamic — it reads
-- live policies from pg_policies, only rewrites ones that still contain a
-- bare auth.uid() call, and leaves everything else untouched.
-- ============================================

-- ── A) Realtime PII removal ────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE customers;
    RAISE NOTICE 'Dropped customers from supabase_realtime publication';
  ELSE
    RAISE NOTICE 'customers not in supabase_realtime — nothing to do';
  END IF;
END $$;

-- ── B) RLS initPlan rewrite (dynamic, idempotent) ─────────────────────────
DO $$
DECLARE
  pol        RECORD;
  new_qual   TEXT;
  new_check  TEXT;
  roles_str  TEXT;
  rewritten  INTEGER := 0;
  skipped    INTEGER := 0;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    new_qual  := pol.qual;
    new_check := pol.with_check;

    -- Protect already-optimized forms (pg deparse emits "( SELECT auth.uid() ...)")
    IF new_qual IS NOT NULL THEN
      new_qual := replace(new_qual, '( SELECT auth.uid()', '@@P@@');
      new_qual := replace(new_qual, '(select auth.uid()', '@@P@@');
      new_qual := replace(new_qual, 'auth.uid()', '(SELECT auth.uid())');
      new_qual := replace(new_qual, '@@P@@', '(SELECT auth.uid()');
    END IF;
    IF new_check IS NOT NULL THEN
      new_check := replace(new_check, '( SELECT auth.uid()', '@@P@@');
      new_check := replace(new_check, '(select auth.uid()', '@@P@@');
      new_check := replace(new_check, 'auth.uid()', '(SELECT auth.uid())');
      new_check := replace(new_check, '@@P@@', '(SELECT auth.uid()');
    END IF;

    -- Nothing to change → skip (idempotency)
    IF new_qual IS NOT DISTINCT FROM pol.qual
       AND new_check IS NOT DISTINCT FROM pol.with_check THEN
      skipped := skipped + 1;
      CONTINUE;
    END IF;

    roles_str := array_to_string(pol.roles, ', ');

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s',
      pol.policyname, pol.schemaname, pol.tablename,
      pol.permissive,
      pol.cmd,
      roles_str,
      CASE WHEN new_qual  IS NOT NULL THEN format(' USING (%s)', new_qual)       ELSE '' END,
      CASE WHEN new_check IS NOT NULL THEN format(' WITH CHECK (%s)', new_check) ELSE '' END
    );
    rewritten := rewritten + 1;
    RAISE NOTICE 'Rewrote policy % on %', pol.policyname, pol.tablename;
  END LOOP;

  RAISE NOTICE 'initPlan rewrite complete: % policies rewritten, % skipped', rewritten, skipped;
END $$;
