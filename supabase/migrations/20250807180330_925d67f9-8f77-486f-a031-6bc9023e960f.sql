-- First, let's insert the missing profile for the existing user
INSERT INTO public.profiles (user_id, display_name, first_name, last_name)
SELECT 
  u.id,
  u.raw_user_meta_data ->> 'display_name',
  COALESCE(u.raw_user_meta_data ->> 'first_name', split_part(u.raw_user_meta_data ->> 'display_name', ' ', 1)),
  COALESCE(u.raw_user_meta_data ->> 'last_name', split_part(u.raw_user_meta_data ->> 'display_name', ' ', 2))
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Update the handle_new_user function to handle cases where display_name needs to be split
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username, first_name, last_name, birth_date, country)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'username',
    COALESCE(
      NEW.raw_user_meta_data ->> 'first_name', 
      split_part(NEW.raw_user_meta_data ->> 'display_name', ' ', 1)
    ), 
    COALESCE(
      NEW.raw_user_meta_data ->> 'last_name',
      split_part(NEW.raw_user_meta_data ->> 'display_name', ' ', 2)
    ),
    (NEW.raw_user_meta_data ->> 'birth_date')::date,
    NEW.raw_user_meta_data ->> 'country'
  );
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();