-- First, let's add event_date to proposals table to support automatic event creation
ALTER TABLE public.proposals 
ADD COLUMN event_date timestamp with time zone;

-- Create a function to automatically create events from accepted proposals
CREATE OR REPLACE FUNCTION public.create_event_from_proposal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create event if proposal is marked as 'passed' and has an event_date
  IF NEW.status = 'passed' AND NEW.event_date IS NOT NULL AND OLD.status != 'passed' THEN
    INSERT INTO public.events (
      title,
      description, 
      start_date,
      group_id,
      created_by
    ) VALUES (
      NEW.title,
      NEW.description,
      NEW.event_date,
      NEW.group_id,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create events from accepted proposals
CREATE TRIGGER create_event_from_accepted_proposal
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_from_proposal();