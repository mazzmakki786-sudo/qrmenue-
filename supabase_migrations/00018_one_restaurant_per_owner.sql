-- ============================================================================
-- Migration 00018: One restaurant per owner
-- ============================================================================
-- Business rule: one restaurant account per owner (a restaurant owner is
-- identified by restaurants.owner_id → auth.users.id).
--
-- 1) Backfill: converge existing multi-restaurant owners to a single restaurant
--    by keeping the owner's OLDEST restaurant (earliest created_at) and deleting
--    the duplicates.
-- 2) Enforce the invariant at the DATABASE level with a partial unique index on
--    owner_id — no future app code path (or missed frontend guard) can create a
--    second restaurant for an owner.
--
-- NOTE ON ORDERING: never ORDER BY id (UUIDs sort byte-wise, NOT by creation
-- time). Keep the row with the earliest created_at instead.
--
-- Safe-guards in the backfill:
--   * Only touches owners with >1 restaurant.
--   * Keeps the owner's OLDEST restaurant (earliest created_at); only deletes
--     the others.
--   * Runs in a single transaction — if any delete violates a FK, EVERYTHING
--     rolls back and the migration fails loudly instead of half-applying.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  o RECORD;
  keep_id uuid;
  del_ids uuid[];
  cnt integer := 0;
BEGIN
  FOR o IN
    SELECT r.owner_id, u.email
    FROM restaurants r
    JOIN auth.users u ON u.id = r.owner_id
    GROUP BY r.owner_id, u.email
    HAVING COUNT(*) > 1
  LOOP
    -- Oldest restaurant (earliest created_at) is the canonical one to keep.
    SELECT id INTO keep_id
    FROM restaurants
    WHERE owner_id = o.owner_id
    ORDER BY created_at ASC NULLS LAST, id ASC
    LIMIT 1;

    -- Everything else owned by this owner.
    SELECT array_agg(id) INTO del_ids
    FROM restaurants
    WHERE owner_id = o.owner_id AND id <> keep_id;

    IF array_length(del_ids, 1) > 0 THEN
      RAISE NOTICE '[dedupe] owner %  keep=%@ deleting=%', o.email, keep_id, del_ids;
      DELETE FROM restaurants WHERE id = ANY(del_ids);
      cnt := cnt + array_length(del_ids, 1);
    END IF;
  END LOOP;

  RAISE NOTICE '[dedup] DONE — deleted % duplicate restaurant row(s)', cnt;
END $$;

-- ============================================================================
-- Enforce one restaurant per owner at the database level.
-- Partial index: applies only to owners (NULL owner_id rows excluded) and
-- blocks the second restaurant for any owner.
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'restaurants'
      AND indexname  = 'restaurants_owner_id_unique'
  ) THEN
    RAISE NOTICE '[dedup] restaurants_owner_id_unique already exists — skipping';
  ELSE
    CREATE UNIQUE INDEX restaurants_owner_id_unique
      ON public.restaurants (owner_id)
      WHERE owner_id IS NOT NULL;
    RAISE NOTICE '[dedup] created unique index restaurants_owner_id_unique';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- Verification (expected: ZERO rows = every owner has at most one restaurant)
-- ============================================================================
SELECT owner_id, COUNT(*) AS n
FROM public.restaurants
WHERE owner_id IS NOT NULL
GROUP BY owner_id
HAVING COUNT(*) > 1;