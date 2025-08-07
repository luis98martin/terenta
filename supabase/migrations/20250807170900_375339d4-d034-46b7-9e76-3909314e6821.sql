-- Fix infinite recursion by completely rebuilding the problematic policies

-- Drop ALL existing policies on the problematic tables
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;

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
CREATE POLICY "Users can view their groups" ON public.groups 
FOR SELECT USING (id IN (SELECT public.get_user_groups()));

CREATE POLICY "Users can create new groups" ON public.groups 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their groups" ON public.groups 
FOR UPDATE USING (public.is_group_admin(id, auth.uid()));

-- Create new safe policies for group_members  
CREATE POLICY "Users can view members of their groups" ON public.group_members 
FOR SELECT USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups themselves" ON public.group_members 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage group members" ON public.group_members 
FOR ALL USING (public.is_group_admin(group_id, auth.uid()));

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