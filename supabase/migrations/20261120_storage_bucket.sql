-- =========================================================================
-- Migration: Create public storage bucket for site images and uploads
-- =========================================================================

-- 1. Insert bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Storage Policies for site-images bucket

-- Allow public read access to all objects in 'site-images'
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
CREATE POLICY "Public can view site images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'site-images');

-- Allow admins or service role to upload images
DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
CREATE POLICY "Admins can upload site images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins or service role to update/delete images
DROP POLICY IF EXISTS "Admins can update and delete site images" ON storage.objects;
CREATE POLICY "Admins can update and delete site images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'site-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
