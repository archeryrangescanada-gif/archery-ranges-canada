-- =====================================================
-- VERIFY LOCATIONS ARE WORKING
-- =====================================================
-- This checks if your data is actually fine

-- Check if the Eganville range has proper city/province linked
SELECT
  r.name,
  r.city_id,
  r.province_id,
  c.name as city_name,
  p.name as province_name
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id
WHERE r.name LIKE '%Eganville%'
LIMIT 5;

-- Check all ranges to see if they have valid city/province relationships
SELECT
  COUNT(*) as total_ranges,
  COUNT(c.name) as ranges_with_valid_city,
  COUNT(p.name) as ranges_with_valid_province
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id;
