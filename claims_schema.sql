-- Create claims table for manual contact-based verification
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.ranges(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email_address TEXT NOT NULL, -- The claimant's preferred contact email
    role_at_range TEXT NOT NULL, -- 'Owner', 'Manager', 'President', 'Board Member', 'Volunteer', 'Other'
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    admin_notes TEXT, -- For internal tracking of the verification call/email
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_listing_id ON public.claims(listing_id);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

-- Enable RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own claims') THEN
        CREATE POLICY "Users can view own claims" ON public.claims FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own claims') THEN
        CREATE POLICY "Users can create own claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all claims') THEN
        CREATE POLICY "Admins can manage all claims" ON public.claims FOR ALL TO authenticated USING (
            auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
        );
    END IF;
END $$;

COMMENT ON TABLE public.claims IS 'Stores business verification claims for manual outreach review';
