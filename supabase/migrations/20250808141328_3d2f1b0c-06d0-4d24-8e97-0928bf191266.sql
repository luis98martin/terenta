-- Security hardening migration

-- 1) Lock down group membership joining via RPC and policies
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;

DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
CREATE POLICY "Group admins can add members"
ON public.group_members
FOR INSERT
WITH CHECK (public.is_group_admin(auth.uid(), group_id));

-- 2) Replace broad groups visibility by invite code
DROP POLICY IF EXISTS "Anyone can find groups by invite code" ON public.groups;

-- 3) Harden SECURITY DEFINER helper functions
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
      AND role = 'admin'
  );
$function$;

-- 4) Create secure RPCs for joining and lookup by invite code
DROP FUNCTION IF EXISTS public.join_group(text);
CREATE OR REPLACE FUNCTION public.join_group(invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_group_id uuid;
  v_exists boolean;
BEGIN
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE invite_code = upper(invite_code)
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = auth.uid()
  ) INTO v_exists;

  IF NOT v_exists THEN
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_group_id, auth.uid(), 'member')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_group_id;
END;
$$;

DROP FUNCTION IF EXISTS public.get_group_by_invite(text);
CREATE OR REPLACE FUNCTION public.get_group_by_invite(invite_code text)
RETURNS TABLE(id uuid, name text, image_url text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id, name, image_url
  FROM public.groups
  WHERE invite_code = upper(invite_code)
$$;

-- 5) Protect PII in profiles while allowing group-based visibility
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of their group members" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles of their group members"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = public.profiles.user_id
  )
);

-- 6) Storage policies for buckets
-- Public read for images
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for group-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for proposal-images" ON storage.objects;

CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Public read access for group-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'group-images');

CREATE POLICY "Public read access for proposal-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'proposal-images');

-- Avatars: users can manage files under their own folder (user_id/...)
DROP POLICY IF EXISTS "Users manage own avatar uploads" ON storage.objects;
CREATE POLICY "Users manage own avatar uploads"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Group images: only group admins can manage files under group_id/... folders
DROP POLICY IF EXISTS "Group admins manage group images" ON storage.objects;
CREATE POLICY "Group admins manage group images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'group-images'
  AND public.is_group_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
)
WITH CHECK (
  bucket_id = 'group-images'
  AND public.is_group_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Proposal images: users manage their own folders (user_id/...)
DROP POLICY IF EXISTS "Users manage own proposal images" ON storage.objects;
CREATE POLICY "Users manage own proposal images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'proposal-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'proposal-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
