-- Set invite code on group insert using generate_invite_code()
BEGIN;

-- Function to set invite code before insert
CREATE OR REPLACE FUNCTION public.set_group_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    LOOP
      NEW.invite_code := public.generate_invite_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.groups g WHERE g.invite_code = NEW.invite_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_group_invite_code_trigger ON public.groups;
CREATE TRIGGER set_group_invite_code_trigger
BEFORE INSERT ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.set_group_invite_code();

-- Automatically add group creator as admin member
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS add_group_creator_as_admin_trigger ON public.groups;
CREATE TRIGGER add_group_creator_as_admin_trigger
AFTER INSERT ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.add_group_creator_as_admin();

-- Create an event automatically when a proposal includes an event_date
CREATE OR REPLACE FUNCTION public.create_event_from_proposal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.event_date IS NOT NULL THEN
    INSERT INTO public.events (title, description, location, start_date, group_id, created_by)
    VALUES (NEW.title, NEW.description, NEW.location, NEW.event_date, NEW.group_id, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_event_from_proposal_trigger ON public.proposals;
CREATE TRIGGER create_event_from_proposal_trigger
AFTER INSERT ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.create_event_from_proposal();

-- Cascade deletes for proposals (votes, comments)
CREATE OR REPLACE FUNCTION public.cascade_delete_proposal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.votes WHERE proposal_id = OLD.id;
  DELETE FROM public.proposal_comments WHERE proposal_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS cascade_delete_proposal_trigger ON public.proposals;
CREATE TRIGGER cascade_delete_proposal_trigger
BEFORE DELETE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_proposal();

-- Cascade deletes for events (attendees)
CREATE OR REPLACE FUNCTION public.cascade_delete_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.event_attendees WHERE event_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS cascade_delete_event_trigger ON public.events;
CREATE TRIGGER cascade_delete_event_trigger
BEFORE DELETE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_event();

-- Cascade deletes for groups across related tables
CREATE OR REPLACE FUNCTION public.cascade_delete_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete messages belonging to chats in the group
  DELETE FROM public.messages
  WHERE chat_id IN (
    SELECT id FROM public.chats WHERE group_id = OLD.id
  );

  -- Delete chats in the group
  DELETE FROM public.chats WHERE group_id = OLD.id;

  -- Delete attendees for events in the group
  DELETE FROM public.event_attendees
  WHERE event_id IN (
    SELECT id FROM public.events WHERE group_id = OLD.id
  );

  -- Delete events in the group
  DELETE FROM public.events WHERE group_id = OLD.id;

  -- Delete votes and comments for proposals in the group
  DELETE FROM public.votes
  WHERE proposal_id IN (
    SELECT id FROM public.proposals WHERE group_id = OLD.id
  );

  DELETE FROM public.proposal_comments
  WHERE proposal_id IN (
    SELECT id FROM public.proposals WHERE group_id = OLD.id
  );

  -- Delete proposals in the group
  DELETE FROM public.proposals WHERE group_id = OLD.id;

  -- Delete memberships
  DELETE FROM public.group_members WHERE group_id = OLD.id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS cascade_delete_group_trigger ON public.groups;
CREATE TRIGGER cascade_delete_group_trigger
BEFORE DELETE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_group();

COMMIT;