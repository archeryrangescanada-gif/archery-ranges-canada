-- Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  range_id UUID NOT NULL REFERENCES public.ranges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  business_license_url TEXT NOT NULL,
  insurance_certificate_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_verification_requests_range_id ON public.verification_requests(range_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own verification requests
CREATE POLICY "Users can view own verification requests"
ON public.verification_requests FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own verification requests
CREATE POLICY "Users can create own verification requests"
ON public.verification_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can view all verification requests
CREATE POLICY "Service role can view all verification requests"
ON public.verification_requests FOR SELECT
USING (true);

-- Policy: Service role can update verification requests
CREATE POLICY "Service role can update verification requests"
ON public.verification_requests FOR UPDATE
USING (true);

-- Add comment
COMMENT ON TABLE public.verification_requests IS 'Stores business verification requests for range claims';
