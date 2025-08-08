-- Add image_url to events and propagate from proposals via trigger
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;

-- Update trigger function to include image_url when creating event from proposal
CREATE OR REPLACE FUNCTION public.create_event_from_proposal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.event_date IS NOT NULL THEN
    INSERT INTO public.events (title, description, location, start_date, group_id, created_by, image_url)
    VALUES (NEW.title, NEW.description, NEW.location, NEW.event_date, NEW.group_id, NEW.created_by, NEW.image_url);
  END IF;
  RETURN NEW;
END;
$function$;