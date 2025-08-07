-- Fix all group policies with unique names
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create new groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Create new policies with clear names
CREATE POLICY "group_insert_policy" ON public.groups 
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "group_select_policy" ON public.groups 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = groups.id AND user_id = auth.uid()
  )
);