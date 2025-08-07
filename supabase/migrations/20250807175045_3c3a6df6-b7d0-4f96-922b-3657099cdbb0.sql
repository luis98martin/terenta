-- Remove all data from all tables while preserving structure
-- Order matters due to foreign key constraints

-- Clear tables with dependencies first
DELETE FROM public.votes;
DELETE FROM public.event_attendees;
DELETE FROM public.messages;
DELETE FROM public.proposals;
DELETE FROM public.events;
DELETE FROM public.chats;
DELETE FROM public.group_members;
DELETE FROM public.groups;
DELETE FROM public.profiles;

-- Reset any sequences if they exist
-- This ensures IDs start from 1 again for any tables with auto-incrementing IDs