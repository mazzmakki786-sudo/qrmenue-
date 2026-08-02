-- Add unique constraint on customers.phone for phone-based customer auth
ALTER TABLE public.customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);
