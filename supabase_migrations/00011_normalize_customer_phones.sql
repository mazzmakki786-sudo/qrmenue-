-- Normalize customer phone numbers to canonical 11-digit Pakistan form and
-- re-sync the internal auth email derived from the phone.
--
-- Canonical form: 03XXXXXXXXX (11 digits starting with "03")
-- Handles: dashes/spaces, +92/92 country code, missing leading 0.
-- Applied as a one-time data migration (already run on prod).

DO $$
DECLARE
  c RECORD;
  digits TEXT;
  canon TEXT;
  new_email TEXT;
BEGIN
  FOR c IN SELECT id, phone, email FROM public.customers LOOP
    -- Strip non-digits
    digits := regexp_replace(coalesce(c.phone, ''), '\D', '', 'g');
    -- Strip Pakistan country code 92 when followed by 10 more digits (12 total)
    IF digits ~ '^92[0-9]{10}$' THEN
      digits := substr(digits, 3);
    END IF;
    -- International form without leading 0: 3XXXXXXXXX -> 03XXXXXXXXX
    IF digits ~ '^3[0-9]{9}$' THEN
      digits := '0' || digits;
    END IF;
    -- Only update when the result is a plausible 11-digit "03" number
    IF digits ~ '^03[0-9]{9}$' AND digits <> c.phone THEN
      canon := digits;
      new_email := 'customer_' || canon || '@customer.digitalmenue.com';
      UPDATE public.customers
         SET phone = canon,
             email = new_email
       WHERE id = c.id;
    END IF;
  END LOOP;
END $$;

-- Also fix the auth.users email for customers so Supabase Auth stays in sync
-- with the normalized customers.email (login resolves phone -> email -> auth).
UPDATE auth.users au
   SET email = c.email
  FROM public.customers c
 WHERE au.id = c.id
   AND c.email IS NOT NULL
   AND au.email <> c.email;
