-- =====================================================
-- DEPLOYMENT SCRIPT FOR BC RANGES IMPORT
-- =====================================================
-- This script creates the necessary database function for importing BC ranges
-- Run this in your Supabase SQL Editor before uploading the BC CSV file

-- PostgreSQL RPC Function for Atomic Batch Range Import
-- This function handles all city/province creation and range insertion in a single transaction

CREATE OR REPLACE FUNCTION import_ranges_batch(ranges_json JSONB)
RETURNS TABLE (
  success BOOLEAN,
  range_id UUID,
  range_name TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  range_record JSONB;
  city_record_id UUID;
  province_record_id UUID;
  new_range_id UUID;
  city_slug_val TEXT;
  province_slug_val TEXT;
BEGIN
  -- Process each range in the JSON array
  FOR range_record IN SELECT * FROM jsonb_array_elements(ranges_json)
  LOOP
    BEGIN
      -- Reset variables
      city_record_id := NULL;
      province_record_id := NULL;
      new_range_id := NULL;

      -- Handle Province
      IF range_record->>'post_region' IS NOT NULL AND range_record->>'post_region' != '' THEN
        province_slug_val := lower(regexp_replace(regexp_replace(range_record->>'post_region', '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

        -- Get or create province
        SELECT id INTO province_record_id
        FROM provinces
        WHERE LOWER(name) = LOWER(range_record->>'post_region')
        LIMIT 1;

        IF province_record_id IS NULL THEN
          INSERT INTO provinces (name, slug)
          VALUES (range_record->>'post_region', province_slug_val)
          RETURNING id INTO province_record_id;
        END IF;
      END IF;

      -- Handle City
      IF range_record->>'post_city' IS NOT NULL AND range_record->>'post_city' != '' THEN
        city_slug_val := lower(regexp_replace(regexp_replace(range_record->>'post_city', '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

        -- Get or create city
        SELECT id INTO city_record_id
        FROM cities
        WHERE LOWER(name) = LOWER(range_record->>'post_city')
        LIMIT 1;

        IF city_record_id IS NULL THEN
          INSERT INTO cities (name, slug)
          VALUES (range_record->>'post_city', city_slug_val)
          RETURNING id INTO city_record_id;
        END IF;
      END IF;

      -- Insert Range
      INSERT INTO ranges (
        name,
        slug,
        city_id,
        province_id,
        address,
        postal_code,
        latitude,
        longitude,
        phone_number,
        email,
        website,
        description,
        tags,
        business_hours,
        range_length_yards,
        number_of_lanes,
        facility_type,
        has_pro_shop,
        has_3d_course,
        has_field_course,
        membership_required,
        membership_price_adult,
        drop_in_price,
        equipment_rental_available,
        lessons_available,
        lesson_price_range,
        bow_types_allowed,
        accessibility,
        parking_available,
        status
      ) VALUES (
        range_record->>'post_title',
        lower(regexp_replace(regexp_replace(range_record->>'post_title', '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')),
        city_record_id,
        province_record_id,
        NULLIF(range_record->>'post_address', ''),
        NULLIF(range_record->>'post_zip', ''),
        NULLIF(range_record->>'post_latitude', '')::NUMERIC,
        NULLIF(range_record->>'post_longitude', '')::NUMERIC,
        NULLIF(range_record->>'phone', ''),
        NULLIF(range_record->>'email', ''),
        NULLIF(range_record->>'website', ''),
        NULLIF(range_record->>'post_content', ''),
        NULLIF(range_record->>'post_tags', ''),
        NULLIF(range_record->>'business_hours', ''),
        COALESCE((range_record->>'range_length_yards')::INTEGER, 0),
        COALESCE((range_record->>'number_of_lanes')::INTEGER, 0),
        COALESCE(range_record->>'facility_type', 'Indoor'),
        COALESCE((range_record->>'has_pro_shop')::BOOLEAN, FALSE),
        COALESCE((range_record->>'has_3d_course')::BOOLEAN, FALSE),
        COALESCE((range_record->>'has_field_course')::BOOLEAN, FALSE),
        COALESCE((range_record->>'membership_required')::BOOLEAN, FALSE),
        COALESCE((range_record->>'membership_price_adult')::NUMERIC, 0),
        COALESCE((range_record->>'drop_in_price')::NUMERIC, 0),
        COALESCE((range_record->>'equipment_rental_available')::BOOLEAN, FALSE),
        COALESCE((range_record->>'lessons_available')::BOOLEAN, FALSE),
        NULLIF(range_record->>'lesson_price_range', ''),
        NULLIF(range_record->>'bow_types_allowed', ''),
        COALESCE((range_record->>'accessibility')::BOOLEAN, FALSE),
        COALESCE((range_record->>'parking_available')::BOOLEAN, FALSE),
        'active'
      )
      RETURNING id INTO new_range_id;

      -- Return success for this range
      success := TRUE;
      range_id := new_range_id;
      range_name := range_record->>'post_title';
      error_message := NULL;
      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      -- Return error for this range but continue processing
      success := FALSE;
      range_id := NULL;
      range_name := range_record->>'post_title';
      error_message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION import_ranges_batch(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION import_ranges_batch(JSONB) TO service_role;

-- Verify the function was created
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'import_ranges_batch';
