-- Add RLS policy to allow owners to manage their own ranges
-- This ensures owners can update, delete, and fully manage their claimed listings

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Owners can manage their ranges" ON ranges;

-- Create policy for owners to manage their own ranges
CREATE POLICY "Owners can manage their ranges" 
  ON ranges 
  FOR ALL 
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'ranges' AND policyname = 'Owners can manage their ranges';
