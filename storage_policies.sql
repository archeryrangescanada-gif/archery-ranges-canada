-- Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload verification docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own verification documents
CREATE POLICY "Users can read own verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role to read all verification documents
CREATE POLICY "Service role can read verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-documents');

-- Allow service role to delete verification documents
CREATE POLICY "Service role can delete verification docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'verification-documents');
