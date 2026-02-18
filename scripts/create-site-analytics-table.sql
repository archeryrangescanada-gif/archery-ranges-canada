-- Create site_analytics table for tracking site-wide events
-- (category clicks, searches, province selections, etc.)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying by event type and date range
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_type ON site_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_created_at ON site_analytics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_created ON site_analytics (event_type, created_at DESC);

-- Enable RLS
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (API routes use service role via server client)
CREATE POLICY "Service role can insert site analytics"
  ON site_analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow admin read access
CREATE POLICY "Admins can read site analytics"
  ON site_analytics FOR SELECT
  TO authenticated
  USING (true);
