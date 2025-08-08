-- Ensure group creators become admins and invite codes are set
-- 1) Create/refresh triggers on groups
DROP TRIGGER IF EXISTS trg_groups_handle_new_group ON public.groups;
CREATE TRIGGER trg_groups_handle_new_group
BEFORE INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_group();

DROP TRIGGER IF EXISTS trg_groups_set_invite_code ON public.groups;
CREATE TRIGGER trg_groups_set_invite_code
BEFORE INSERT OR UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.set_group_invite_code();

DROP TRIGGER IF EXISTS trg_groups_add_creator_admin ON public.groups;
CREATE TRIGGER trg_groups_add_creator_admin
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.add_group_creator_as_admin();

-- 2) Backfill: make existing group creators admins if missing
INSERT INTO public.group_members (group_id, user_id, role)
SELECT g.id, g.created_by, 'admin'
FROM public.groups g
LEFT JOIN public.group_members gm
  ON gm.group_id = g.id AND gm.user_id = g.created_by
WHERE gm.id IS NULL;