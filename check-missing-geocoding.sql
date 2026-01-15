-- Find all listings that are missing geocoding data (lat/long)
-- These listings won't show a map on their detail pages

SELECT
  r.id,
  r.name,
  r.address,
  c.name as city,
  p.name as province,
  r.latitude,
  r.longitude,
  r.owner_id,
  CASE
    WHEN r.owner_id IS NULL THEN 'Unclaimed'
    ELSE 'Claimed'
  END as claim_status
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id
WHERE r.latitude IS NULL OR r.longitude IS NULL
ORDER BY p.name, c.name, r.name;

-- Count summary
SELECT
  COUNT(*) as total_listings_without_geocoding,
  COUNT(CASE WHEN owner_id IS NULL THEN 1 END) as unclaimed_without_geocoding,
  COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as claimed_without_geocoding
FROM ranges
WHERE latitude IS NULL OR longitude IS NULL;

-- Total stats for comparison
SELECT
  COUNT(*) as total_listings,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_geocoding,
  COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as without_geocoding,
  ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) / COUNT(*), 2) as percent_with_geocoding
FROM ranges;
