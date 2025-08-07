-- Check current triggers
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE event_object_table IN ('groups', 'group_members');

-- Fix the select policy for groups - the issue is it requires group membership to see groups
DROP POLICY IF EXISTS "group_select_policy" ON public.groups;

-- Create a new select policy that allows users to see groups they are members of
-- OR groups they've just created (before the trigger adds them as member)
CREATE POLICY "Users can view their groups" ON public.groups
FOR SELECT
TO authenticated
USING (
  -- User is a member of the group
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
  -- OR user created the group (needed for immediate after insert)
  OR created_by = auth.uid()
);