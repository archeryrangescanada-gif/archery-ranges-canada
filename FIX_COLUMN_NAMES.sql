-- =====================================================
-- FIX COLUMN NAME MISMATCH
-- =====================================================
-- This updates the import function to accept BOTH "name" and "post_title"
-- So it works with both your Ontario CSV and BC CSV

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
  range_slug TEXT;
  range_title TEXT;
  slug_suffix INTEGER;
  slug_exists BOOLEAN;
BEGIN
  FOR range_record IN SELECT * FROM jsonb_array_elements(ranges_json)
  LOOP
    BEGIN
      city_record_id := NULL;
      province_record_id := NULL;
      new_range_id := NULL;
      province_name := range_record->>'post_region';
      city_name := range_record->>'post_city';

      -- Accept BOTH "name" and "post_title" column names
      range_title := COALESCE(
        NULLIF(range_record->>'post_title', ''),
        NULLIF(range_record->>'name', ''),
        'Unnamed'
      );

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

      -- Generate unique slug
      range_slug := lower(regexp_replace(regexp_replace(range_title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

      -- Check if slug already exists for this city
      slug_suffix := 0;
      LOOP
        IF slug_suffix = 0 THEN
          SELECT EXISTS(SELECT 1 FROM ranges WHERE slug = range_slug AND city_id = city_record_id) INTO slug_exists;
        ELSE
          SELECT EXISTS(SELECT 1 FROM ranges WHERE slug = range_slug || '-' || slug_suffix AND city_id = city_record_id) INTO slug_exists;
        END IF;

        EXIT WHEN NOT slug_exists;
        slug_suffix := slug_suffix + 1;
      END LOOP;

      -- Append suffix if needed
      IF slug_suffix > 0 THEN
        range_slug := range_slug || '-' || slug_suffix;
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
        range_title,  -- Use the variable that accepts both column names
        range_slug,
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
        CASE WHEN LOWER(COALESCE(range_record->>'has_pro_shop', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'has_3d_course', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'has_field_course', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
        CASE WHEN LOWER(COALESCE(range_record->>'membership_required', 'no')) IN ('yes', 'true', '1', 'y') THEN true ELSE false END,
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
      range_name := range_title;
      error_message := NULL;
      RETURN NEXT;

    EXCEPTION WHEN OTHERS THEN
      success := FALSE;
      range_id := NULL;
      range_name := COALESCE(
        NULLIF(range_record->>'post_title', ''),
        NULLIF(range_record->>'name', ''),
        'Unknown'
      );
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

SELECT '✅ Import function now accepts both "name" and "post_title" columns!' as status;
SELECT 'Delete the "Unnamed" ranges, then import your BC CSV again.' as next_step;
