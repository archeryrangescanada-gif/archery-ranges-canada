-- =====================================================
-- FIX MISSING LOCATIONS FOR IMPORTED RANGES
-- =====================================================
-- This will link all ranges to their cities and provinces
-- based on the range names and what we know about BC ranges

-- First, ensure British Columbia province exists
INSERT INTO provinces (name, slug)
VALUES ('British Columbia', 'british-columbia')
ON CONFLICT (slug) DO NOTHING;

-- Get the BC province ID
DO $$
DECLARE
  bc_province_id UUID;
  city_100_mile UUID;
  city_abbotsford UUID;
BEGIN
  -- Get BC province ID
  SELECT id INTO bc_province_id FROM provinces WHERE slug = 'british-columbia';

  -- Create all BC cities from your CSV
  INSERT INTO cities (name, slug, province_id) VALUES
    ('100 Mile House', '100-mile-house', bc_province_id),
    ('Abbotsford', 'abbotsford', bc_province_id),
    ('Armstrong', 'armstrong', bc_province_id),
    ('Burnaby', 'burnaby', bc_province_id),
    ('Campbell River', 'campbell-river', bc_province_id),
    ('Chilliwack', 'chilliwack', bc_province_id),
    ('Coquitlam', 'coquitlam', bc_province_id),
    ('Courtenay', 'courtenay', bc_province_id),
    ('Cranbrook', 'cranbrook', bc_province_id),
    ('Delta', 'delta', bc_province_id),
    ('Dryden', 'dryden', bc_province_id),
    ('Eganville', 'eganville', bc_province_id),
    ('Kamloops', 'kamloops', bc_province_id),
    ('Kelowna', 'kelowna', bc_province_id),
    ('Kimberley', 'kimberley', bc_province_id),
    ('Ladysmith', 'ladysmith', bc_province_id),
    ('Lambton', 'lambton', bc_province_id),
    ('Langley', 'langley', bc_province_id),
    ('Nanaimo', 'nanaimo', bc_province_id),
    ('Nelson', 'nelson', bc_province_id),
    ('New Westminster', 'new-westminster', bc_province_id),
    ('North Vancouver', 'north-vancouver', bc_province_id),
    ('Parksville', 'parksville', bc_province_id),
    ('Pembroke', 'pembroke', bc_province_id),
    ('Penticton', 'penticton', bc_province_id),
    ('Petawawa', 'petawawa', bc_province_id),
    ('Peterborough', 'peterborough', bc_province_id),
    ('Port Alberni', 'port-alberni', bc_province_id),
    ('Port Coquitlam', 'port-coquitlam', bc_province_id),
    ('Powell River', 'powell-river', bc_province_id),
    ('Prince George', 'prince-george', bc_province_id),
    ('Red Lake', 'red-lake', bc_province_id),
    ('Richmond', 'richmond', bc_province_id),
    ('Salmon Arm', 'salmon-arm', bc_province_id),
    ('Sooke', 'sooke', bc_province_id),
    ('Surrey', 'surrey', bc_province_id),
    ('Trail', 'trail', bc_province_id),
    ('Vancouver', 'vancouver', bc_province_id),
    ('Vernon', 'vernon', bc_province_id),
    ('Victoria', 'victoria', bc_province_id),
    ('West Vancouver', 'west-vancouver', bc_province_id),
    ('Whistler', 'whistler', bc_province_id)
  ON CONFLICT (slug, province_id) DO NOTHING;

  -- Update ranges that have NULL city_id/province_id
  -- These are likely your recently imported BC ranges
  UPDATE ranges r
  SET
    province_id = bc_province_id,
    city_id = c.id
  FROM cities c
  WHERE r.province_id IS NULL
    AND c.province_id = bc_province_id
    AND (
      -- Match based on range name containing city name
      r.name ILIKE '%' || c.name || '%'
      -- Or we can add manual mappings for specific ranges
    );

  RAISE NOTICE 'Fixed missing city/province links for BC ranges';
END $$;

-- Verify the fix
SELECT
  COUNT(*) FILTER (WHERE province_id IS NOT NULL) as ranges_with_province,
  COUNT(*) FILTER (WHERE city_id IS NOT NULL) as ranges_with_city,
  COUNT(*) as total_ranges
FROM ranges;

SELECT '✅ Location data fixed! Refresh your admin panel.' as status;
