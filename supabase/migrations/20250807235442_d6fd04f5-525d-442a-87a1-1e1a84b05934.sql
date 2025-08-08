-- Allow admins to delete groups and creators to delete proposals
-- and add cascading delete triggers; also create bucket for group images with proper policies

-- DELETE policy for groups (admins only)
CREATE POLICY "Group admins can delete groups"
ON public.groups
FOR DELETE
USING (public.is_group_admin(auth.uid(), id));

-- DELETE policy for proposals (creators only)
CREATE POLICY "Proposal creators can delete proposals"
ON public.proposals
FOR DELETE
USING (auth.uid() = created_by);

-- Function to cascade delete related group data
CREATE OR REPLACE FUNCTION public.cascade_delete_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete messages in chats of the group
  DELETE FROM public.messages m
  USING public.chats c
  WHERE c.id = m.chat_id AND c.group_id = OLD.id;

  -- Delete chats in the group
  DELETE FROM public.chats c WHERE c.group_id = OLD.id;

  -- Delete votes on proposals in the group
  DELETE FROM public.votes v
  USING public.proposals p
  WHERE v.proposal_id = p.id AND p.group_id = OLD.id;

  -- Delete comments on proposals in the group
  DELETE FROM public.proposal_comments pc
  USING public.proposals p
  WHERE pc.proposal_id = p.id AND p.group_id = OLD.id;

  -- Delete proposals in the group
  DELETE FROM public.proposals p WHERE p.group_id = OLD.id;

  -- Delete event attendees for events in the group
  DELETE FROM public.event_attendees ea
  USING public.events e
  WHERE ea.event_id = e.id AND e.group_id = OLD.id;

  -- Delete events in the group
  DELETE FROM public.events e WHERE e.group_id = OLD.id;

  -- Delete group members
  DELETE FROM public.group_members gm WHERE gm.group_id = OLD.id;

  RETURN OLD;
END;
$$;

-- Trigger to run cascade deletion before deleting a group
DROP TRIGGER IF EXISTS trg_cascade_delete_group ON public.groups;
CREATE TRIGGER trg_cascade_delete_group
BEFORE DELETE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_group();

-- Cascade deletes for proposals
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

DROP TRIGGER IF EXISTS trg_cascade_delete_proposal ON public.proposals;
CREATE TRIGGER trg_cascade_delete_proposal
BEFORE DELETE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_proposal();

-- Cascade deletes for events
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

DROP TRIGGER IF EXISTS trg_cascade_delete_event ON public.events;
CREATE TRIGGER trg_cascade_delete_event
BEFORE DELETE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_event();

-- Create a bucket for group images
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-images', 'group-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for group images
DO $$ BEGIN
  -- Public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Group images are publicly accessible'
  ) THEN
    CREATE POLICY "Group images are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'group-images');
  END IF;

  -- Admins can upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Group admins can upload group images'
  ) THEN
    CREATE POLICY "Group admins can upload group images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'group-images'
      AND public.is_group_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    );
  END IF;

  -- Admins can update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Group admins can update group images'
  ) THEN
    CREATE POLICY "Group admins can update group images"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'group-images'
      AND public.is_group_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    );
  END IF;

  -- Admins can delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Group admins can delete group images'
  ) THEN
    CREATE POLICY "Group admins can delete group images"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'group-images'
      AND public.is_group_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    );
  END IF;
END $$;