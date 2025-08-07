-- First check if the trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'groups';

-- Drop the old conflicting policy and recreate it properly
DROP POLICY IF EXISTS "group_insert_policy" ON public.groups;

-- Create the correct insert policy for authenticated users
CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Ensure we have the trigger to add creator as admin
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

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS add_group_creator_as_admin_trigger ON public.groups;
CREATE TRIGGER add_group_creator_as_admin_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_group_creator_as_admin();