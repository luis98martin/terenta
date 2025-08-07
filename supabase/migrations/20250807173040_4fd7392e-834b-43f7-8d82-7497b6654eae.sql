-- Remove duplicate trigger that's causing the duplicate key violation
-- We have two triggers both calling add_group_creator_as_admin function
-- This causes the same user to be added twice as admin

-- First, let's see what triggers exist
SELECT trigger_name, event_object_table, action_statement, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'groups'
AND trigger_name LIKE '%group_creator%';

-- Drop the duplicate trigger (keep add_group_creator_as_admin_trigger)
DROP TRIGGER IF EXISTS add_group_creator_trigger ON public.groups;