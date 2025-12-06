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
