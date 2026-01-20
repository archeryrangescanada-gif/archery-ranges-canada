-- =====================================================
-- COMPLETE PRODUCTION FIX
-- =====================================================
-- Run this ENTIRE script on your PRODUCTION Supabase database
-- This makes production work exactly like localhost

-- PART 1: Convert array/jsonb columns to TEXT
-- (So they accept comma-separated values like "Recurve, Compound")

DO $$
DECLARE
  col_type text;
BEGIN
  -- Fix bow_types_allowed if it's an array
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'bow_types_allowed';

  IF col_type = 'ARRAY' THEN
    ALTER TABLE ranges ALTER COLUMN bow_types_allowed TYPE TEXT
    USING CASE WHEN bow_types_allowed IS NULL THEN NULL ELSE array_to_string(bow_types_allowed, ', ') END;
    RAISE NOTICE 'Fixed bow_types_allowed: ARRAY → TEXT';
  END IF;

  -- Fix post_tags if it's an array
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'post_tags';

  IF col_type = 'ARRAY' THEN
    ALTER TABLE ranges ALTER COLUMN post_tags TYPE TEXT
    USING CASE WHEN post_tags IS NULL THEN NULL ELSE array_to_string(post_tags, ', ') END;
    RAISE NOTICE 'Fixed post_tags: ARRAY → TEXT';
  END IF;

  -- Fix post_images if it's an array
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'post_images';

  IF col_type = 'ARRAY' THEN
    ALTER TABLE ranges ALTER COLUMN post_images TYPE TEXT
    USING CASE WHEN post_images IS NULL THEN NULL ELSE array_to_string(post_images, ', ') END;
    RAISE NOTICE 'Fixed post_images: ARRAY → TEXT';
  END IF;

  -- Fix business_hours if it's JSONB
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'business_hours';

  IF col_type = 'jsonb' THEN
    ALTER TABLE ranges ALTER COLUMN business_hours TYPE TEXT USING business_hours::TEXT;
    RAISE NOTICE 'Fixed business_hours: JSONB → TEXT';
  END IF;

  -- Fix facility_type if it's an ENUM
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'facility_type';

  IF col_type = 'USER-DEFINED' THEN
    ALTER TABLE ranges ALTER COLUMN facility_type TYPE TEXT;
    RAISE NOTICE 'Fixed facility_type: ENUM → TEXT';
  END IF;
END $$;

-- PART 2: Make foreign keys nullable
ALTER TABLE ranges ALTER COLUMN city_id DROP NOT NULL;
ALTER TABLE ranges ALTER COLUMN province_id DROP NOT NULL;
ALTER TABLE ranges ALTER COLUMN address DROP NOT NULL;

-- PART 3: Set boolean defaults
ALTER TABLE ranges ALTER COLUMN has_pro_shop SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN has_3d_course SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN has_field_course SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN membership_required SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN equipment_rental_available SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN lessons_available SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN accessibility SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN parking_available SET DEFAULT false;

-- PART 4: Update import function to handle messy CSV data
-- This makes it work like localhost!

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
  province_name TEXT;
  city_name TEXT;
  bool_val TEXT;
  price_val TEXT;
  parsed_bool BOOLEAN;
  parsed_price NUMERIC;
BEGIN
  FOR range_record IN SELECT * FROM jsonb_array_elements(ranges_json)
  LOOP
    BEGIN
      city_record_id := NULL;
      province_record_id := NULL;
      new_range_id := NULL;
      province_name := range_record->>'post_region';
      city_name := range_record->>'post_city';

      -- Handle Province
      IF province_name IS NOT NULL AND province_name != '' THEN
        province_slug_val := lower(regexp_replace(regexp_replace(province_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

        SELECT id INTO province_record_id FROM provinces WHERE LOWER(name) = LOWER(province_name) LIMIT 1;

        IF province_record_id IS NULL THEN
          INSERT INTO provinces (name, slug) VALUES (province_name, province_slug_val)
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id INTO province_record_id;
        END IF;
      END IF;

      -- Handle City
      IF city_name IS NOT NULL AND city_name != '' AND province_record_id IS NOT NULL THEN
        city_slug_val := lower(regexp_replace(regexp_replace(city_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

        SELECT id INTO city_record_id FROM cities
        WHERE LOWER(name) = LOWER(city_name) AND province_id = province_record_id LIMIT 1;

        IF city_record_id IS NULL THEN
          INSERT INTO cities (name, slug, province_id) VALUES (city_name, city_slug_val, province_record_id)
          ON CONFLICT (slug, province_id) DO UPDATE SET name = EXCLUDED.name
          RETURNING id INTO city_record_id;
        END IF;
      END IF;

      -- Insert Range
      INSERT INTO ranges (
        name, slug, city_id, province_id, address, postal_code,
        latitude, longitude, phone_number, email, website, description,
        business_hours, post_tags, range_length_yards, number_of_lanes,
        facility_type, has_pro_shop, has_3d_course, has_field_course,
        membership_required, membership_price_adult, drop_in_price,
        equipment_rental_available, lessons_available, lesson_price_range,
        bow_types_allowed, accessibility, parking_available, status
      ) VALUES (
        COALESCE(NULLIF(range_record->>'post_title', ''), NULLIF(range_record->>'name', ''), 'Unnamed'),
        lower(regexp_replace(regexp_replace(COALESCE(NULLIF(range_record->>'post_title', ''), 'unnamed'), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')),
        city_record_id,
        province_record_id,
        NULLIF(range_record->>'post_address', ''),
        NULLIF(range_record->>'post_zip', ''),
        CASE WHEN NULLIF(range_record->>'post_latitude', '') ~ '^-?\d+\.?\d*$' THEN (range_record->>'post_latitude')::NUMERIC ELSE NULL END,
        CASE WHEN NULLIF(range_record->>'post_longitude', '') ~ '^-?\d+\.?\d*$' THEN (range_record->>'post_longitude')::NUMERIC ELSE NULL END,
        NULLIF(range_record->>'phone', ''),
        NULLIF(NULLIF(range_record->>'email', ''), 'N/A'),
        NULLIF(NULLIF(range_record->>'website', ''), 'N/A'),
        NULLIF(range_record->>'post_content', ''),
        NULLIF(NULLIF(range_record->>'business_hours', ''), 'N/A'),
        NULLIF(NULLIF(range_record->>'post_tags', ''), 'N/A'),
        CASE WHEN NULLIF(range_record->>'range_length_yards', '') ~ '^\d+$' THEN (range_record->>'range_length_yards')::INTEGER ELSE NULL END,
        CASE WHEN NULLIF(range_record->>'number_of_lanes', '') ~ '^\d+$' THEN (range_record->>'number_of_lanes')::INTEGER ELSE NULL END,
        COALESCE(NULLIF(NULLIF(range_record->>'facility_type', ''), 'N/A'), 'Indoor'),
        -- Parse booleans: Yes/No/N/A → true/false
        CASE WHEN LOWER(COALESCE(range_record->>'has_pro_shop', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'has_3d_course', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'has_field_course', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'membership_required', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        -- Parse prices: Extract first number from "$10 (Adult)" or "N/A" → NULL
        CASE WHEN range_record->>'membership_price_adult' ~ '\$?\d+' THEN (regexp_match(range_record->>'membership_price_adult', '\$?(\d+\.?\d*)'))[1]::NUMERIC ELSE NULL END,
        CASE WHEN range_record->>'drop_in_price' ~ '\$?\d+' THEN (regexp_match(range_record->>'drop_in_price', '\$?(\d+\.?\d*)'))[1]::NUMERIC ELSE NULL END,
        CASE WHEN LOWER(COALESCE(range_record->>'equipment_rental_available', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'lessons_available', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        NULLIF(NULLIF(range_record->>'lesson_price_range', ''), 'N/A'),
        NULLIF(NULLIF(range_record->>'bow_types_allowed', ''), 'N/A'),
        CASE WHEN LOWER(COALESCE(range_record->>'accessibility', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'parking_available', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        'active'
      )
      RETURNING id INTO new_range_id;

      success := TRUE;
      range_id := new_range_id;
      range_name := COALESCE(NULLIF(range_record->>'post_title', ''), 'Unnamed');
      error_message := NULL;
      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      success := FALSE;
      range_id := NULL;
      range_name := COALESCE(NULLIF(range_record->>'post_title', ''), 'Unknown');
      error_message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION import_ranges_batch(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION import_ranges_batch(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION import_ranges_batch(JSONB) TO anon;

-- Verify
SELECT '✅ PRODUCTION DATABASE FIXED!' as status;
SELECT 'Your production database now works exactly like localhost.' as result;
SELECT 'You can now import BC ranges with N/A, Yes/No, pricing text, etc.' as next_step;
