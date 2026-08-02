-- Add requested_plan column to restaurants table
-- Stores the paid plan (starter/growth/premium) requested during signup
-- Nullified or consumed when superadmin activates the plan
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS requested_plan TEXT DEFAULT NULL;

COMMENT ON COLUMN public.restaurants.requested_plan IS 'Paid plan requested by owner during signup (starter/growth/premium). Null when owner signed up for trial, or after superadmin activates it.';
