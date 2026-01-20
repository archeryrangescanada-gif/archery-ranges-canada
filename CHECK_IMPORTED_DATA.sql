-- Check what was actually imported

-- Check BC ranges
SELECT
  name,
  city_id,
  province_id,
  created_at
FROM ranges
WHERE name LIKE '%Big Horn%' OR name LIKE '%Sagittarius%'
ORDER BY created_at DESC
LIMIT 5;

-- Check if British Columbia province exists
SELECT * FROM provinces WHERE name LIKE '%British%';

-- Check if BC cities exist
SELECT * FROM cities WHERE province_id IN (
  SELECT id FROM provinces WHERE name LIKE '%British%'
)
LIMIT 10;

-- Count ranges without city/province
SELECT
  COUNT(*) as total_ranges,
  COUNT(city_id) as with_city,
  COUNT(province_id) as with_province
FROM ranges;
