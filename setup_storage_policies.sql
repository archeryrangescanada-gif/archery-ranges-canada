-- Storage policies for verification-documents bucket
-- Run this in Supabase SQL Editor

-- Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own verification documents
CREATE POLICY "Users can read their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role (admins) to read all verification documents
CREATE POLICY "Admins can read all verification documents"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'verification-documents');

-- Allow service role (admins) to delete verification documents
CREATE POLICY "Admins can delete verification documents"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'verification-documents');
