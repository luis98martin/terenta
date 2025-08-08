-- Address linter: set stable search_path on functions missing it

CREATE OR REPLACE FUNCTION public.get_user_groups(_user_id uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT gm.group_id
  FROM public.group_members gm
  WHERE gm.user_id = _user_id;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Generate invite code if not provided
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := public.generate_invite_code();
  END IF;
  
  RETURN NEW;
END;
$function$;