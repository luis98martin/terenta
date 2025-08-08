BEGIN;

-- Replace generate_invite_code to avoid dependency on pgcrypto/gen_random_bytes
-- Uses built-in md5 + random + clock_timestamp for sufficient randomness
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  -- 8-char uppercase code, avoids special chars from base64
  v_code := upper(substring(md5(random()::text || clock_timestamp()::text) for 8));
  RETURN v_code;
END;
$$;

COMMIT;