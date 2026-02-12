-- 1. Ensure the bucket is public so images can be viewed by anyone
UPDATE storage.buckets 
SET public = true 
WHERE id = 'range-images';

-- 2. Allow anyone to view images (SELECT)
-- This is technically redundant if public=true, but good practice
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'range-images');

-- 3. Allow authenticated users to upload to their own range folders
-- Logic: path is range-photos/[rangeId]/...
-- We check if the user owns the range by looking at the ranges table
CREATE POLICY "Users can upload to their range folders" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'range-images' AND 
    (storage.foldername(name))[2] IN (
        SELECT id::text FROM public.ranges WHERE owner_id = auth.uid()
    )
);

-- 4. Allow users to delete their own photos
CREATE POLICY "Users can delete their own range photos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'range-images' AND 
    (storage.foldername(name))[2] IN (
        SELECT id::text FROM public.ranges WHERE owner_id = auth.uid()
    )
);
