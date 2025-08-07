-- Fix function search path security warnings
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.generate_invite_code() SET search_path = '';
ALTER FUNCTION public.set_group_invite_code() SET search_path = '';