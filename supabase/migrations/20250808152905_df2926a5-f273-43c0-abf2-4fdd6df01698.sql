-- Fix ambiguous column reference issues in invite-based functions
-- Keep parameter name `invite_code` to preserve existing RPC calls

-- get_group_by_invite: ensure table column is fully qualified
CREATE OR REPLACE FUNCTION public.get_group_by_invite(invite_code text)
RETURNS TABLE(id uuid, name text, image_url text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT g.id, g.name, g.image_url
  FROM public.groups AS g
  WHERE g.invite_code = upper(invite_code)
$function$;

-- join_group: qualify column references and keep existing behavior
CREATE OR REPLACE FUNCTION public.join_group(invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_group_id uuid;
  v_exists boolean;
BEGIN
  SELECT g.id INTO v_group_id
  FROM public.groups AS g
  WHERE g.invite_code = upper(invite_code)
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = v_group_id AND gm.user_id = auth.uid()
  ) INTO v_exists;

  IF NOT v_exists THEN
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_group_id, auth.uid(), 'member')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_group_id;
END;
$function$;