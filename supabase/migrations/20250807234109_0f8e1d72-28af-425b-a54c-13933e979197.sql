-- Enable Realtime and updated_at triggers for collaborative updates

-- 1) Ensure REPLICA IDENTITY FULL so updates stream full row
ALTER TABLE public.proposals REPLICA IDENTITY FULL;
ALTER TABLE public.votes REPLICA IDENTITY FULL;
ALTER TABLE public.groups REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.proposal_comments REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.chats REPLICA IDENTITY FULL;

-- 2) Add tables to supabase_realtime publication if not already present
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'proposals','votes','groups','group_members','events','proposal_comments','messages','chats'
  ]) LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- 3) Create BEFORE UPDATE triggers to auto-maintain updated_at
DO $$
DECLARE t text;
DECLARE trigger_name text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'proposals','votes','groups','group_members','events','proposal_comments','messages','chats'
  ]) LOOP
    trigger_name := 'set_' || t || '_updated_at';
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = trigger_name
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
        trigger_name,
        t
      );
    END IF;
  END LOOP;
END $$;