-- ════════════════════════════════════════════════════════════════════════════
-- Migration 00017: FK index audit (Phase 3 — performance)
-- ════════════════════════════════════════════════════════════════════════════
-- Postgres does NOT create indexes on foreign-key columns automatically.
-- A missing FK index means:
--   1. JOINs from parent → child tables run sequential scans.
--   2. DELETE/UPDATE on the parent table scans the ENTIRE child table to
--      enforce referential integrity (this is the big one — parent-row
--      deletes become O(child-table-size)).
--
-- This migration is DYNAMIC and IDEMPOTENT: it scans pg_constraint for every
-- FK in `public`, checks whether an existing (non-partial) index already
-- leads with exactly the FK columns, and creates one only where missing.
-- Safe to re-run any number of times. Uses plain CREATE INDEX inside a DO
-- block (tables are small; non-concurrent is fine). Run in Supabase SQL
-- Editor like migrations 00015/00016.
-- ════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  fk         RECORD;
  v_idx_name text;
  v_created  int := 0;
BEGIN
  FOR fk IN
    WITH fk_cols AS (
      -- Every FK constraint in public, with its ordered column list
      SELECT con.conrelid AS table_oid,
             cls.relname  AS table_name,
             array_agg(att.attname ORDER BY u.ord) AS cols
      FROM pg_constraint con
      JOIN pg_class      cls ON cls.oid = con.conrelid
      JOIN pg_namespace  ns  ON ns.oid  = cls.relnamespace
      JOIN unnest(con.conkey) WITH ORDINALITY AS u(attnum, ord) ON true
      JOIN pg_attribute  att ON att.attrelid = con.conrelid AND att.attnum = u.attnum
      WHERE con.contype = 'f'
        AND ns.nspname  = 'public'
        AND cls.relkind = 'r'          -- ordinary tables only
      GROUP BY con.oid, con.conrelid, cls.relname
    ),
    idx_cols AS (
      -- Every non-partial index in public, with its ordered column list
      SELECT ix.indrelid AS table_oid,
             array_agg(att.attname ORDER BY u.ord) AS cols
      FROM pg_index ix
      JOIN unnest(ix.indkey::smallint[]) WITH ORDINALITY AS u(attnum, ord) ON true
      JOIN pg_attribute att ON att.attrelid = ix.indrelid AND att.attnum = u.attnum
      WHERE ix.indpred IS NULL           -- ignore partial indexes (don't cover FK lookups)
      GROUP BY ix.indexrelid, ix.indrelid
    )
    SELECT f.table_oid, f.table_name, f.cols
    FROM fk_cols f
    WHERE NOT EXISTS (
      -- Covered if an index's LEADING columns exactly match the FK columns
      SELECT 1 FROM idx_cols i
      WHERE i.table_oid = f.table_oid
        AND i.cols[1 : array_length(f.cols, 1)] = f.cols
    )
    ORDER BY f.table_name
  LOOP
    v_idx_name := left('idx_' || fk.table_name || '_fk_' || array_to_string(fk.cols, '_'), 63);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (%s)',
      v_idx_name,
      fk.table_name,
      (SELECT string_agg(quote_ident(c), ', ') FROM unnest(fk.cols) AS c)
    );
    v_created := v_created + 1;
    RAISE NOTICE 'Created index % on public.%(%)', v_idx_name, fk.table_name, array_to_string(fk.cols, ', ');
  END LOOP;

  RAISE NOTICE 'FK index audit complete: % new index(es) created.', v_created;
END $$;

-- ── Verification query (expected result: ZERO rows) ──
-- Lists any remaining public-schema FK that still has no supporting index.
SELECT cls.relname AS table_name,
       con.conname AS foreign_key
FROM pg_constraint con
JOIN pg_class     cls ON cls.oid = con.conrelid
JOIN pg_namespace ns  ON ns.oid  = cls.relnamespace
WHERE con.contype = 'f'
  AND ns.nspname  = 'public'
  AND cls.relkind = 'r'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_index ix
    JOIN unnest(ix.indkey::smallint[]) WITH ORDINALITY AS u(attnum, ord) ON true
    JOIN pg_attribute att ON att.attrelid = ix.indrelid AND att.attnum = u.attnum
    WHERE ix.indrelid = con.conrelid AND ix.indpred IS NULL
    GROUP BY ix.indexrelid
    HAVING (array_agg(att.attname ORDER BY u.ord))[1 : array_length(con.conkey, 1)]
           = (SELECT array_agg(a2.attname ORDER BY u2.ord)
              FROM unnest(con.conkey) WITH ORDINALITY AS u2(attnum, ord)
              JOIN pg_attribute a2 ON a2.attrelid = con.conrelid AND a2.attnum = u2.attnum)
  );
