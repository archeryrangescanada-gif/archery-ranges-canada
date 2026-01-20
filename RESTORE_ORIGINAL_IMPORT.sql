-- =====================================================
-- RESTORE ORIGINAL WORKING IMPORT FUNCTION
-- =====================================================
-- This restores the import function that worked for Ontario

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
        COALESCE(range_record->>'name', range_record->>'post_title', 'Unnamed Range'),
        lower(regexp_replace(regexp_replace(COALESCE(range_record->>'name', range_record->>'post_title', 'unnamed-range'), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')),
        city_record_id,
        province_record_id,
        NULLIF(range_record->>'post_address', ''),
        NULLIF(range_record->>'post_zip', ''),
        CASE WHEN NULLIF(range_record->>'post_latitude', '') IS NULL THEN NULL ELSE (range_record->>'post_latitude')::NUMERIC END,
        CASE WHEN NULLIF(range_record->>'post_longitude', '') IS NULL THEN NULL ELSE (range_record->>'post_longitude')::NUMERIC END,
        NULLIF(range_record->>'phone', ''),
        NULLIF(range_record->>'email', ''),
        NULLIF(range_record->>'website', ''),
        NULLIF(range_record->>'post_content', ''),
        NULLIF(range_record->>'business_hours', ''),
        CASE WHEN NULLIF(range_record->>'range_length_yards', '') ~ '^\d+$' THEN (range_record->>'range_length_yards')::INTEGER ELSE NULL END,
        CASE WHEN NULLIF(range_record->>'number_of_lanes', '') ~ '^\d+$' THEN (range_record->>'number_of_lanes')::INTEGER ELSE NULL END,
        COALESCE(NULLIF(range_record->>'facility_type', ''), 'Indoor'),
        COALESCE((range_record->>'has_pro_shop')::BOOLEAN, FALSE),
        COALESCE((range_record->>'has_3d_course')::BOOLEAN, FALSE),
        COALESCE((range_record->>'has_field_course')::BOOLEAN, FALSE),
        COALESCE((range_record->>'membership_required')::BOOLEAN, FALSE),
        CASE WHEN NULLIF(range_record->>'membership_price_adult', '') ~ '^\d+\.?\d*$' THEN (range_record->>'membership_price_adult')::NUMERIC ELSE NULL END,
        CASE WHEN NULLIF(range_record->>'drop_in_price', '') ~ '^\d+\.?\d*$' THEN (range_record->>'drop_in_price')::NUMERIC ELSE NULL END,
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
      range_name := COALESCE(range_record->>'name', range_record->>'post_title', 'Unnamed Range');
      error_message := NULL;
      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      -- Return error for this range but continue processing
      success := FALSE;
      range_id := NULL;
      range_name := COALESCE(range_record->>'name', range_record->>'post_title', 'Unknown');
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

SELECT '✅ Original import function restored!' as status;
