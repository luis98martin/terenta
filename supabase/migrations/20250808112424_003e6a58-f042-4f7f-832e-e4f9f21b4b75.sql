-- Allow users to leave groups by deleting their own membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'group_members' AND policyname = 'Users can leave groups (delete own membership)'
  ) THEN
    CREATE POLICY "Users can leave groups (delete own membership)"
    ON public.group_members
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;