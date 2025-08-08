-- Add updated_at to group_members and keep it fresh
ALTER TABLE public.group_members
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create/refresh trigger to auto-update updated_at on changes
DROP TRIGGER IF EXISTS update_group_members_updated_at ON public.group_members;
CREATE TRIGGER update_group_members_updated_at
BEFORE UPDATE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();