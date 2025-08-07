-- Drop existing problematic policies
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view chats in their groups" ON public.chats;
DROP POLICY IF EXISTS "Group members can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages in accessible chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in accessible chats" ON public.messages;
DROP POLICY IF EXISTS "Users can view events in their groups" ON public.events;
DROP POLICY IF EXISTS "Group members can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators can update events" ON public.events;
DROP POLICY IF EXISTS "Users can view proposals in their groups" ON public.proposals;
DROP POLICY IF EXISTS "Group members can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Proposal creators can update proposals" ON public.proposals;

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_groups(_user_id uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT gm.group_id
  FROM public.group_members gm
  WHERE gm.user_id = _user_id;
$$;

-- Create function to add group creator as admin
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

-- Create trigger to automatically add group creator as admin
CREATE TRIGGER add_group_creator_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_group_creator_as_admin();

-- Create safe RLS policies for groups
CREATE POLICY "Users can view groups they are members of"
ON public.groups
FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), id));

CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
ON public.groups
FOR UPDATE
TO authenticated
USING (public.is_group_admin(auth.uid(), id));

-- Create safe RLS policies for group_members
CREATE POLICY "Users can view members of their groups"
ON public.group_members
FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group admins can manage members"
ON public.group_members
FOR ALL
TO authenticated
USING (public.is_group_admin(auth.uid(), group_id));

-- Create safe RLS policies for chats
CREATE POLICY "Users can view chats in their groups"
ON public.chats
FOR SELECT
TO authenticated
USING (
  group_id IS NULL OR 
  public.is_group_member(auth.uid(), group_id)
);

CREATE POLICY "Group members can create chats"
ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  (group_id IS NULL OR public.is_group_member(auth.uid(), group_id))
);

-- Create safe RLS policies for messages
CREATE POLICY "Users can view messages in accessible chats"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = messages.chat_id
    AND (c.group_id IS NULL OR public.is_group_member(auth.uid(), c.group_id))
  )
);

CREATE POLICY "Users can create messages in accessible chats"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = messages.chat_id
    AND (c.group_id IS NULL OR public.is_group_member(auth.uid(), c.group_id))
  )
);

-- Create safe RLS policies for events
CREATE POLICY "Users can view events in their groups"
ON public.events
FOR SELECT
TO authenticated
USING (
  group_id IS NULL OR 
  public.is_group_member(auth.uid(), group_id)
);

CREATE POLICY "Group members can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  (group_id IS NULL OR public.is_group_member(auth.uid(), group_id))
);

CREATE POLICY "Event creators can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Create safe RLS policies for proposals
CREATE POLICY "Users can view proposals in their groups"
ON public.proposals
FOR SELECT
TO authenticated
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Group members can create proposals"
ON public.proposals
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  public.is_group_member(auth.uid(), group_id)
);

CREATE POLICY "Proposal creators can update proposals"
ON public.proposals
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);