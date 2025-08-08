-- Remove all abstain votes as requested
DELETE FROM public.votes WHERE vote_type = 'abstain';