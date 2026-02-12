-- Storage policies for the 'ranges' bucket
-- Run this in Supabase SQL Editor AFTER creating the bucket
-- (Create bucket via: node scripts/create-ranges-bucket.js)

-- Allow authenticated users to upload range photos
CREATE POLICY "Authenticated users can upload range photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ranges');

-- Allow anyone to view range photos (public bucket)
CREATE POLICY "Anyone can view range photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ranges');

-- Allow authenticated users to update their range photos
CREATE POLICY "Authenticated users can update range photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ranges');

-- Allow authenticated users to delete range photos
CREATE POLICY "Authenticated users can delete range photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ranges');
