-- Create storage bucket for proposal images
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-images', 'proposal-images', true);

-- Add image_url column to proposals table
ALTER TABLE proposals ADD COLUMN image_url TEXT;

-- Create storage policies for proposal images
CREATE POLICY "Users can view proposal images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proposal-images');

CREATE POLICY "Group members can upload proposal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'proposal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own proposal images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'proposal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own proposal images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'proposal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add storage bucket for profile avatars if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);