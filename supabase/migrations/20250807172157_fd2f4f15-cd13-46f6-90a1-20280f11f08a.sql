-- Remove all dummy data from tables
-- Delete in order to respect foreign key constraints

DELETE FROM public.votes;
DELETE FROM public.messages;
DELETE FROM public.chats;
DELETE FROM public.event_attendees;
DELETE FROM public.events;
DELETE FROM public.proposals;
DELETE FROM public.group_members;
DELETE FROM public.groups;
DELETE FROM public.profiles;