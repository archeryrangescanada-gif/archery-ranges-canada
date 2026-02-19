-- Fix: Allow admin users to read range_submissions
-- The FIX_SECURITY_ADVISOR.sql dropped the "Allow authenticated read access" policy
-- and replaced it with service_role only. This restores admin access.
--
-- Run this in Supabase SQL Editor.

-- Allow authenticated admins to read all submissions
CREATE POLICY "Admins can read range_submissions"
  ON public.range_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated admins to update submissions (approve/reject)
CREATE POLICY "Admins can update range_submissions"
  ON public.range_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
