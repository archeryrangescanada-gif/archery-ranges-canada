-- =====================================================
-- FIX IMPORT FUNCTION - Make it handle messy CSV data
-- =====================================================
-- This updates the import function to accept "N/A", "Yes/No", pricing text, etc.
-- Just like your localhost does!

-- First, run the schema fix to convert arrays/jsonb to TEXT
-- (Copy from COMPLETE_SCHEMA_FIX.sql lines 1-130)

-- Then, update the import function to handle messy data:

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

  -- Helper function to convert messy boolean values
  FUNCTION parse_boolean(val TEXT) RETURNS BOOLEAN AS $func$
  BEGIN
    IF val IS NULL OR val = '' OR LOWER(val) IN ('n/a', 'na', 'null', 'none') THEN
      RETURN false;
    ELSIF LOWER(val) IN ('yes', 'true', '1', 'y', 't') THEN
      RETURN true;
    ELSIF LOWER(val) IN ('no', 'false', '0', 'n', 'f') THEN
      RETURN false;
    ELSE
      RETURN false;  -- Default to false for any other text
    END IF;
  END;
  $func$ LANGUAGE plpgsql IMMUTABLE;

  -- Helper function to extract numbers from pricing text
  FUNCTION parse_price(val TEXT) RETURNS NUMERIC AS $func$
  BEGIN
    IF val IS NULL OR val = '' OR LOWER(val) IN ('n/a', 'na', 'null', 'none', 'included') THEN
      RETURN NULL;
    ELSE
      -- Extract first number from text like "$10 (Adult) / $5 (Child)"
      RETURN (regexp_match(val, '\$?(\d+\.?\d*)'))[1]::NUMERIC;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  $func$ LANGUAGE plpgsql IMMUTABLE;

BEGIN
  -- Process each range in the JSON array
  FOR range_record IN SELECT * FROM jsonb_array_elements(ranges_json)
  LOOP
    BEGIN
      -- Reset variables
      city_record_id := NULL;
      province_record_id := NULL;
      new_range_id := NULL;
      province_name := range_record->>'post_region';
      city_name := range_record->>'post_city';

      -- Handle Province
      IF province_name IS NOT NULL AND province_name != '' THEN
        province_slug_val := lower(regexp_replace(regexp_replace(province_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

        -- Get or create province
        SELECT id INTO province_record_id
        FROM provinces
        WHERE LOWER(name) = LOWER(province_name)
        LIMIT 1;

        IF province_record_id IS NULL THEN
          INSERT INTO provinces (name, slug)
          VALUES (province_name, province_slug_val)
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id INTO province_record_id;
        END IF;
      END IF;

      -- Handle City (only if we have a province)
      IF city_name IS NOT NULL AND city_name != '' AND province_record_id IS NOT NULL THEN
        city_slug_val := lower(regexp_replace(regexp_replace(city_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

        -- Get or create city
        SELECT id INTO city_record_id
        FROM cities
        WHERE LOWER(name) = LOWER(city_name)
          AND province_id = province_record_id
        LIMIT 1;

        IF city_record_id IS NULL THEN
          INSERT INTO cities (name, slug, province_id)
          VALUES (city_name, city_slug_val, province_record_id)
          ON CONFLICT (slug, province_id) DO UPDATE SET name = EXCLUDED.name
          RETURNING id INTO city_record_id;
        END IF;
      END IF;

      -- Insert Range with FORGIVING data parsing
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
        business_hours,
        post_tags,
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
        COALESCE(NULLIF(range_record->>'post_title', ''), NULLIF(range_record->>'name', ''), 'Unnamed Range'),
        lower(regexp_replace(regexp_replace(COALESCE(NULLIF(range_record->>'post_title', ''), NULLIF(range_record->>'name', ''), 'unnamed-range'), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')),
        city_record_id,
        province_record_id,
        NULLIF(range_record->>'post_address', ''),
        NULLIF(range_record->>'post_zip', ''),
        CASE
          WHEN NULLIF(range_record->>'post_latitude', '') IS NULL THEN NULL
          WHEN NULLIF(range_record->>'post_latitude', '') ~ '^-?\d+\.?\d*$' THEN (range_record->>'post_latitude')::NUMERIC
          ELSE NULL
        END,
        CASE
          WHEN NULLIF(range_record->>'post_longitude', '') IS NULL THEN NULL
          WHEN NULLIF(range_record->>'post_longitude', '') ~ '^-?\d+\.?\d*$' THEN (range_record->>'post_longitude')::NUMERIC
          ELSE NULL
        END,
        NULLIF(range_record->>'phone', ''),
        NULLIF(NULLIF(range_record->>'email', ''), 'N/A'),
        NULLIF(NULLIF(range_record->>'website', ''), 'N/A'),
        NULLIF(range_record->>'post_content', ''),
        NULLIF(NULLIF(range_record->>'business_hours', ''), 'N/A'),  -- Store as TEXT
        NULLIF(NULLIF(range_record->>'post_tags', ''), 'N/A'),  -- Store as TEXT
        CASE
          WHEN NULLIF(range_record->>'range_length_yards', '') ~ '^\d+$' THEN (range_record->>'range_length_yards')::INTEGER
          ELSE NULL
        END,
        CASE
          WHEN NULLIF(range_record->>'number_of_lanes', '') ~ '^\d+$' THEN (range_record->>'number_of_lanes')::INTEGER
          ELSE NULL
        END,
        COALESCE(NULLIF(NULLIF(range_record->>'facility_type', ''), 'N/A'), 'Indoor'),
        parse_boolean(range_record->>'has_pro_shop'),
        parse_boolean(range_record->>'has_3d_course'),
        parse_boolean(range_record->>'has_field_course'),
        parse_boolean(range_record->>'membership_required'),
        parse_price(range_record->>'membership_price_adult'),
        parse_price(range_record->>'drop_in_price'),
        parse_boolean(range_record->>'equipment_rental_available'),
        parse_boolean(range_record->>'lessons_available'),
        NULLIF(NULLIF(range_record->>'lesson_price_range', ''), 'N/A'),
        NULLIF(NULLIF(range_record->>'bow_types_allowed', ''), 'N/A'),
        parse_boolean(range_record->>'accessibility'),
        parse_boolean(range_record->>'parking_available'),
        'active'
      )
      RETURNING id INTO new_range_id;

      -- Return success for this range
      success := TRUE;
      range_id := new_range_id;
      range_name := COALESCE(NULLIF(range_record->>'post_title', ''), NULLIF(range_record->>'name', ''), 'Unnamed Range');
      error_message := NULL;
      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      -- Return error for this range but continue processing
      success := FALSE;
      range_id := NULL;
      range_name := COALESCE(NULLIF(range_record->>'post_title', ''), NULLIF(range_record->>'name', ''), 'Unknown');
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

SELECT '✅ Import function updated! Now handles N/A, Yes/No, pricing text, etc.' as status;
