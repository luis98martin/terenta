-- Fix the group creation policy issue
DROP POLICY IF EXISTS "Users can create new groups" ON public.groups;

-- Create a simpler policy for group creation
CREATE POLICY "Users can create groups" ON public.groups 
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Also ensure we have a simpler select policy
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;

CREATE POLICY "Users can view their groups" ON public.groups 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = groups.id AND user_id = auth.uid()
  )
);