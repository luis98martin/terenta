-- Use CASCADE to drop functions and all dependent policies

DROP FUNCTION IF EXISTS public.is_group_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_group_admin(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_groups() CASCADE;

-- Create new security definer functions
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = target_group_id AND user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_group_admin(target_group_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = target_group_id AND user_id = target_user_id AND role = 'admin'
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

-- Recreate all the policies that were dropped

-- Groups policies
CREATE POLICY "Users can view their groups" ON public.groups 
FOR SELECT USING (id IN (SELECT public.get_user_groups()));

CREATE POLICY "Users can create new groups" ON public.groups 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their groups" ON public.groups 
FOR UPDATE USING (public.is_group_admin(id, auth.uid()));

-- Group members policies
CREATE POLICY "Users can view members of their groups" ON public.group_members 
FOR SELECT USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups themselves" ON public.group_members 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage group members" ON public.group_members 
FOR ALL USING (public.is_group_admin(group_id, auth.uid()));

-- Chat policies
CREATE POLICY "Users can view chats in their groups" ON public.chats 
FOR SELECT USING (
  group_id IS NULL OR 
  public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Group members can create chats" ON public.chats 
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Message policies
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

CREATE POLICY "Users can create messages in accessible chats" ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Event policies
CREATE POLICY "Users can view events in their groups" ON public.events 
FOR SELECT USING (
  group_id IS NULL OR 
  public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Group members can create events" ON public.events 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update events" ON public.events 
FOR UPDATE USING (auth.uid() = created_by);

-- Event attendees policies
CREATE POLICY "Users can view attendees of accessible events" ON public.event_attendees 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_attendees.event_id AND (
      e.group_id IS NULL OR 
      public.is_group_member(e.group_id, auth.uid())
    )
  )
);

CREATE POLICY "Users can manage their own attendance" ON public.event_attendees 
FOR ALL USING (auth.uid() = user_id);

-- Proposal policies
CREATE POLICY "Users can view proposals in their groups" ON public.proposals 
FOR SELECT USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Group members can create proposals" ON public.proposals 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Proposal creators can update proposals" ON public.proposals 
FOR UPDATE USING (auth.uid() = created_by);

-- Vote policies
CREATE POLICY "Users can view votes on accessible proposals" ON public.votes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.proposals p 
    WHERE p.id = votes.proposal_id AND 
    public.is_group_member(p.group_id, auth.uid())
  )
);

CREATE POLICY "Users can manage their own votes" ON public.votes 
FOR ALL USING (auth.uid() = user_id);

-- Add trigger to automatically add group creator as admin
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER add_group_creator_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.add_group_creator_as_admin();