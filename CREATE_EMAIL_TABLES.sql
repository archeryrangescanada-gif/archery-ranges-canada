-- Create email system tables for the Admin Email Dashboard
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. EMAIL CONTACTS TABLE (Audience)
-- =====================================================
CREATE TABLE IF NOT EXISTS email_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'bounced', 'unsubscribed', 'complained')),
    source TEXT DEFAULT 'manual',
    tags TEXT[] DEFAULT '{}',
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status);
CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);

-- =====================================================
-- 2. EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT,
    preheader TEXT,
    body_html TEXT,
    body_text TEXT,
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- =====================================================
-- 3. EMAIL CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT,
    template_id UUID REFERENCES email_templates(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

-- =====================================================
-- 4. EMAIL SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO email_settings (setting_key, setting_value) VALUES
    ('from_name', 'Josh from Archery Ranges'),
    ('from_email', 'josh@archeryrangescanada.ca'),
    ('reply_to', 'support@archeryrangescanada.ca'),
    ('track_opens', 'true'),
    ('track_clicks', 'true'),
    ('google_analytics', 'false')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS POLICIES - Allow service role full access
-- =====================================================

-- email_contacts policies
CREATE POLICY "Allow authenticated read access to email_contacts" ON email_contacts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access to email_contacts" ON email_contacts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- email_templates policies
CREATE POLICY "Allow authenticated read access to email_templates" ON email_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access to email_templates" ON email_templates
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- email_campaigns policies
CREATE POLICY "Allow authenticated read access to email_campaigns" ON email_campaigns
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access to email_campaigns" ON email_campaigns
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- email_settings policies
CREATE POLICY "Allow authenticated read access to email_settings" ON email_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access to email_settings" ON email_settings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON email_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_settings TO authenticated;

GRANT ALL ON email_contacts TO service_role;
GRANT ALL ON email_templates TO service_role;
GRANT ALL ON email_campaigns TO service_role;
GRANT ALL ON email_settings TO service_role;

-- =====================================================
-- 8. SAMPLE DATA (Optional - remove if not needed)
-- =====================================================

-- Sample templates
INSERT INTO email_templates (name, subject, preheader, category, status, body_html) VALUES
    ('Welcome Email', 'Welcome to Archery Ranges Canada!', 'Start your archery journey', 'Welcome Series', 'published', '<h1>Welcome!</h1><p>Thank you for joining us.</p>'),
    ('Monthly Newsletter', 'Archery News - {{month}}', 'Latest updates from the archery world', 'Newsletter', 'draft', '<h1>Monthly Newsletter</h1><p>Here are the latest updates...</p>'),
    ('Range Listing Confirmation', 'Your range listing is live!', 'Your listing has been approved', 'Transactional', 'published', '<h1>Congratulations!</h1><p>Your archery range listing is now live on our directory.</p>')
ON CONFLICT DO NOTHING;
