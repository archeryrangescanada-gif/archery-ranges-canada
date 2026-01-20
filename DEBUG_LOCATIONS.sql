-- Check if Ontario province and cities exist
SELECT 'Provinces:' as section;
SELECT * FROM provinces LIMIT 10;

SELECT 'Cities:' as section;
SELECT * FROM cities LIMIT 10;

SELECT 'Sample Ontario ranges with their city/province data:' as section;
SELECT
  r.name,
  r.city_id,
  r.province_id,
  c.name as city_name,
  p.name as province_name
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id
WHERE r.name LIKE '%Toronto%' OR r.name LIKE '%Kingston%'
LIMIT 5;
