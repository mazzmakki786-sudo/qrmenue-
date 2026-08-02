-- Replace the single ALL policy on restaurants with command-specific policies.
-- The INSERT policy now rejects any authenticated user who already has a
-- customer account, so a customer can never become a restaurant owner
-- with the same account.

DROP POLICY IF EXISTS "Owner can manage own restaurant" ON public.restaurants;

-- Owner can read their own restaurant (public SELECT only covers active rows)
CREATE POLICY "Owner can read own restaurant"
  ON public.restaurants
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Owner can create a restaurant ONLY if they are NOT already a customer
CREATE POLICY "Owner can insert restaurant if not a customer"
  ON public.restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.customers c WHERE c.id = auth.uid()
    )
  );

-- Owner can update their own restaurant
CREATE POLICY "Owner can update own restaurant"
  ON public.restaurants
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Owner can delete their own restaurant
CREATE POLICY "Owner can delete own restaurant"
  ON public.restaurants
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());
