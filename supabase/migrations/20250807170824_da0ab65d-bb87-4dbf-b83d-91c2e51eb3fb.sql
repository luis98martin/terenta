-- Fix infinite recursion in RLS policies by creating security definer functions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;

-- Create security definer functions to check membership and roles
CREATE OR REPLACE FUNCTION public.is_group_member(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_group_admin(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_id_param AND user_id = user_id_param AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_user_groups()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT gm.group_id FROM public.group_members gm 
  WHERE gm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Create new safe policies for groups
CREATE POLICY "Users can view groups they are members of" ON public.groups 
FOR SELECT USING (id IN (SELECT public.get_user_groups()));

CREATE POLICY "Users can create groups" ON public.groups 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" ON public.groups 
FOR UPDATE USING (public.is_group_admin(id, auth.uid()));

-- Create new safe policies for group_members
CREATE POLICY "Users can view group members of their groups" ON public.group_members 
FOR SELECT USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups" ON public.group_members 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group admins can manage members" ON public.group_members 
FOR ALL USING (public.is_group_admin(group_id, auth.uid()));

-- Fix other policies that might have similar issues
DROP POLICY IF EXISTS "Users can view chats in their groups" ON public.chats;
CREATE POLICY "Users can view chats in their groups" ON public.chats 
FOR SELECT USING (
  group_id IS NULL OR 
  public.is_group_member(group_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view messages in accessible chats" ON public.messages;
CREATE POLICY "Users can view messages in accessible chats" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chats c 
    WHERE c.id = messages.chat_id AND (
      c.group_id IS NULL OR 
      public.is_group_member(c.group_id, auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Users can view events in their groups" ON public.events;
CREATE POLICY "Users can view events in their groups" ON public.events 
FOR SELECT USING (
  group_id IS NULL OR 
  public.is_group_member(group_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view proposals in their groups" ON public.proposals;
CREATE POLICY "Users can view proposals in their groups" ON public.proposals 
FOR SELECT USING (public.is_group_member(group_id, auth.uid()));

-- Add trigger to automatically add group creator as admin
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS add_group_creator_trigger ON public.groups;
CREATE TRIGGER add_group_creator_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.add_group_creator_as_admin();