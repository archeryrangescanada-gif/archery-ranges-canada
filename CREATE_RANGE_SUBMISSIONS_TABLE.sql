-- Create range_submissions table for the "Notify Missing Ranges" feature
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS range_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    range_name TEXT NOT NULL,
    address TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    socials TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_range_submissions_status ON range_submissions(status);

-- Enable RLS
ALTER TABLE range_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for public submissions)
CREATE POLICY "Allow public inserts" ON range_submissions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access" ON range_submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON range_submissions TO anon;
GRANT ALL ON range_submissions TO authenticated;
GRANT ALL ON range_submissions TO service_role;
