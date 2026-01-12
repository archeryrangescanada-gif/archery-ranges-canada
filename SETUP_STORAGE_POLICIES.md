# Setup Storage Policies for Verification Documents

The verification form upload is failing because the storage bucket needs RLS (Row Level Security) policies.

## Quick Fix

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
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

-- Allow service role (admins) to read all verification documents
CREATE POLICY "Service role can read verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-documents');

-- Allow service role (admins) to delete verification documents
CREATE POLICY "Service role can delete verification docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'verification-documents');
```

## What this does:

1. **Upload Policy**: Allows authenticated users to upload files ONLY to their own folder (`user_id/range_id/filename`)
2. **Read Policy**: Allows users to read ONLY their own uploaded documents
3. **Admin Read**: Allows service role (admins) to read all verification documents
4. **Admin Delete**: Allows service role (admins) to delete documents if needed

## After running the SQL:

Try the verification form again. The upload should work!
