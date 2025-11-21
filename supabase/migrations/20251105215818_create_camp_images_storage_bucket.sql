/*
  # Create camp-images storage bucket

  1. Storage Setup
    - Creates a public storage bucket called 'camp-images' for storing camp submission images
    - Allows authenticated users to upload images
    - Allows public access to view images
  
  2. Security Policies
    - Authenticated users can upload images (INSERT)
    - Anyone can view images (SELECT)
    - Only authenticated users can update their own uploads (UPDATE)
    - Only authenticated users can delete their own uploads (DELETE)
*/

-- Create the storage bucket for camp images
INSERT INTO storage.buckets (id, name, public)
VALUES ('camp-images', 'camp-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload camp images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'camp-images');

-- Allow public access to view images
CREATE POLICY "Anyone can view camp images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'camp-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Users can update their own camp images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'camp-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Users can delete their own camp images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'camp-images' AND (storage.foldername(name))[1] = auth.uid()::text);