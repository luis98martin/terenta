-- Remove events tied to a deleted proposal and clean up votes when a user leaves a group
-- 1) Extend cascade delete for proposals to also remove matching events
CREATE OR REPLACE FUNCTION public.cascade_delete_proposal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove dependent votes and comments
  DELETE FROM public.votes WHERE proposal_id = OLD.id;
  DELETE FROM public.proposal_comments WHERE proposal_id = OLD.id;

  -- Also remove any events that originated from this proposal
  -- We don't have a direct proposal_id on events, so match by group/title/date
  DELETE FROM public.events
  WHERE group_id = OLD.group_id
    AND title IS NOT DISTINCT FROM OLD.title
    AND start_date IS NOT DISTINCT FROM OLD.event_date;

  RETURN OLD;
END;
$$;

-- Ensure trigger exists to invoke the cascade on proposal delete
DROP TRIGGER IF EXISTS trg_proposals_after_delete_cascade ON public.proposals;
CREATE TRIGGER trg_proposals_after_delete_cascade
AFTER DELETE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_proposal();

-- 2) When a user leaves a group, delete their votes for proposals in that group
CREATE OR REPLACE FUNCTION public.remove_user_votes_when_leaving_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.votes v
  USING public.proposals p
  WHERE v.proposal_id = p.id
    AND p.group_id = OLD.group_id
    AND v.user_id = OLD.user_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_group_members_after_delete_votes_cleanup ON public.group_members;
CREATE TRIGGER trg_group_members_after_delete_votes_cleanup
AFTER DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.remove_user_votes_when_leaving_group();