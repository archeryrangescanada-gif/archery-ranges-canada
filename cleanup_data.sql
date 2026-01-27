-- =====================================================
-- DATABASE CLEANUP - ARCHERY RANGES CANADA
-- =====================================================

-- 1. Fix post_images formatting
-- Convert '{"/path/to/image.jpg"}' to '/path/to/image.jpg'
-- This handles the case where ARRAY['...'] was used on a TEXT column
UPDATE ranges 
SET post_images = trim(both '{}' from post_images) 
WHERE post_images LIKE '{%}' AND post_images LIKE '%}';

-- Also remove literal quotes if they exist inside the brackets
UPDATE ranges
SET post_images = trim(both '"' from post_images)
WHERE post_images NOT LIKE '{%' AND post_images LIKE '"%';

-- 2. Clean up "N/A" values in various columns
UPDATE ranges
SET 
  facility_type = NULLIF(NULLIF(facility_type, 'N/A'), 'n/a'),
  phone_number = NULLIF(NULLIF(phone_number, 'N/A'), 'n/a'),
  address = NULLIF(NULLIF(address, 'N/A'), 'n/a'),
  postal_code = NULLIF(NULLIF(postal_code, 'N/A'), 'n/a'),
  website = NULLIF(NULLIF(website, 'N/A'), 'n/a'),
  description = NULLIF(NULLIF(description, 'N/A'), 'n/a'),
  post_content = NULLIF(NULLIF(post_content, 'N/A'), 'n/a'),
  business_hours = NULLIF(NULLIF(business_hours, 'N/A'), 'n/a'),
  post_tags = NULLIF(NULLIF(post_tags, 'N/A'), 'n/a'),
  bow_types_allowed = NULLIF(NULLIF(bow_types_allowed, 'N/A'), 'n/a'),
  lesson_price_range = NULLIF(NULLIF(lesson_price_range, 'N/A'), 'n/a');

-- 3. Standardize facility_type to lowercase
UPDATE ranges
SET facility_type = LOWER(facility_type)
WHERE facility_type IS NOT NULL;

-- 4. Fix any lingering "Both" or other casing in facility_type
UPDATE ranges
SET facility_type = 'both'
WHERE facility_type IN ('Both', 'indoor/outdoor', 'Indoor/Outdoor');

-- 5. Final check
SELECT name, post_images, facility_type, phone_number 
FROM ranges 
LIMIT 20;
