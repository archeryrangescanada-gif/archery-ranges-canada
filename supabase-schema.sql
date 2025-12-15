-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, province_id)
);

-- Create ranges table
CREATE TABLE IF NOT EXISTS ranges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT,
  website TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, city_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cities_province_id ON cities(province_id);
CREATE INDEX IF NOT EXISTS idx_ranges_city_id ON ranges(city_id);
CREATE INDEX IF NOT EXISTS idx_ranges_province_id ON ranges(province_id);
CREATE INDEX IF NOT EXISTS idx_ranges_is_featured ON ranges(is_featured);

-- Enable Row Level Security
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranges ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Provinces are viewable by everyone" 
  ON provinces FOR SELECT 
  USING (true);

CREATE POLICY "Cities are viewable by everyone" 
  ON cities FOR SELECT 
  USING (true);

CREATE POLICY "Ranges are viewable by everyone" 
  ON ranges FOR SELECT 
  USING (true);

-- Insert all Canadian provinces
INSERT INTO provinces (name, slug) VALUES
  ('Alberta', 'alberta'),
  ('British Columbia', 'british-columbia'),
  ('Manitoba', 'manitoba'),
  ('New Brunswick', 'new-brunswick'),
  ('Newfoundland and Labrador', 'newfoundland-and-labrador'),
  ('Northwest Territories', 'northwest-territories'),
  ('Nova Scotia', 'nova-scotia'),
  ('Nunavut', 'nunavut'),
  ('Ontario', 'ontario'),
  ('Prince Edward Island', 'prince-edward-island'),
  ('Quebec', 'quebec'),
  ('Saskatchewan', 'saskatchewan'),
  ('Yukon', 'yukon')
ON CONFLICT (slug) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ranges table
CREATE TRIGGER update_ranges_updated_at 
  BEFORE UPDATE ON ranges 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- --- AD SYSTEM SCHEMA ---

-- Ad Placements (Zones)
CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g. "Homepage Top"
  description TEXT,
  page_pattern TEXT NOT NULL, -- e.g. "/", "/listings/*"
  position TEXT NOT NULL, -- e.g. "top", "sidebar", "footer", "content_middle"
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  current_price DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  multiplier DECIMAL(5, 2) DEFAULT 1.0, -- Multiplier for high-traffic days
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_pattern, position)
);

-- Ad Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  budget DECIMAL(10, 2),
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link Campaigns to Placements (Many-to-Many)
CREATE TABLE IF NOT EXISTS campaign_placements (
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES ad_placements(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, placement_id)
);

-- Page Analytics (For Dynamic Pricing)
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  views_daily INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path, date)
);

-- RLS Policies
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ads" ON ad_placements FOR SELECT USING (true);
CREATE POLICY "Public read campaigns" ON ad_campaigns FOR SELECT USING (true); -- Maybe restrict only active?
CREATE POLICY "Public read campaign_placements" ON campaign_placements FOR SELECT USING (true);
CREATE POLICY "Public write analytics" ON page_analytics FOR INSERT WITH CHECK (true); -- Allow anon to log views (be careful with abuse)
CREATE POLICY "Public  read analytics" ON page_analytics FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_path_date ON page_analytics(path, date);

