-- Generate invite codes for existing groups that don't have them
UPDATE groups 
SET invite_code = substring(encode(gen_random_bytes(6), 'base64') from 1 for 8)
WHERE invite_code IS NULL;

-- Make invite_code required and add constraint
ALTER TABLE groups ALTER COLUMN invite_code SET NOT NULL;
ALTER TABLE groups ADD CONSTRAINT groups_invite_code_unique UNIQUE (invite_code);

-- Create function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN substring(encode(gen_random_bytes(6), 'base64') from 1 for 8);
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to generate invite codes
CREATE OR REPLACE FUNCTION handle_new_group()
RETURNS trigger AS $$
BEGIN
  -- Generate invite code if not provided
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new groups
DROP TRIGGER IF EXISTS on_group_created ON groups;
CREATE TRIGGER on_group_created
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_group();

-- Add policy to allow finding groups by invite code
CREATE POLICY "Anyone can find groups by invite code" 
ON groups 
FOR SELECT 
USING (invite_code IS NOT NULL);