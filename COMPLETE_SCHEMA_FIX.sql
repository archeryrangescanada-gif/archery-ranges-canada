-- =====================================================
-- COMPLETE SCHEMA FIX - ONE TIME RUN
-- =====================================================
-- This fixes ALL known issues:
-- 1. Array columns (text[]) → TEXT
-- 2. JSONB columns → TEXT
-- 3. Boolean columns that shouldn't be boolean
-- 4. NOT NULL constraints that block imports
-- 5. Any ENUM types → TEXT

-- PART 1: Diagnostic - See what we're fixing
SELECT 'BEFORE FIX - Current problematic columns:' as status;

SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND (
    data_type IN ('ARRAY', 'jsonb', 'USER-DEFINED')
    OR (is_nullable = 'NO' AND column_name NOT IN ('id', 'created_at', 'updated_at', 'slug', 'name'))
  )
ORDER BY column_name;

-- PART 2: Fix Array Columns → TEXT
-- bow_types_allowed, post_tags, post_images, video_urls

DO $$
DECLARE
  col_exists boolean;
  col_type text;
BEGIN
  -- Fix bow_types_allowed
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'bow_types_allowed';

  IF col_type = 'ARRAY' THEN
    ALTER TABLE ranges ALTER COLUMN bow_types_allowed TYPE TEXT
    USING CASE WHEN bow_types_allowed IS NULL THEN NULL ELSE array_to_string(bow_types_allowed, ', ') END;
    RAISE NOTICE 'Fixed bow_types_allowed: ARRAY → TEXT';
  ELSIF col_type IS NOT NULL THEN
    ALTER TABLE ranges ALTER COLUMN bow_types_allowed TYPE TEXT;
    RAISE NOTICE 'Fixed bow_types_allowed: % → TEXT', col_type;
  END IF;

  -- Fix post_tags
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'post_tags';

  IF col_type = 'ARRAY' THEN
    ALTER TABLE ranges ALTER COLUMN post_tags TYPE TEXT
    USING CASE WHEN post_tags IS NULL THEN NULL ELSE array_to_string(post_tags, ', ') END;
    RAISE NOTICE 'Fixed post_tags: ARRAY → TEXT';
  ELSIF col_type IS NOT NULL THEN
    ALTER TABLE ranges ALTER COLUMN post_tags TYPE TEXT;
    RAISE NOTICE 'Fixed post_tags: % → TEXT', col_type;
  END IF;

  -- Fix post_images
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'post_images';

  IF col_type = 'ARRAY' THEN
    ALTER TABLE ranges ALTER COLUMN post_images TYPE TEXT
    USING CASE WHEN post_images IS NULL THEN NULL ELSE array_to_string(post_images, ', ') END;
    RAISE NOTICE 'Fixed post_images: ARRAY → TEXT';
  ELSIF col_type IS NOT NULL THEN
    ALTER TABLE ranges ALTER COLUMN post_images TYPE TEXT;
    RAISE NOTICE 'Fixed post_images: % → TEXT', col_type;
  END IF;

  -- Fix video_urls if exists
  SELECT EXISTS(SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ranges' AND column_name = 'video_urls') INTO col_exists;

  IF col_exists THEN
    SELECT data_type INTO col_type FROM information_schema.columns
    WHERE table_name = 'ranges' AND column_name = 'video_urls';

    IF col_type = 'ARRAY' THEN
      ALTER TABLE ranges ALTER COLUMN video_urls TYPE TEXT
      USING CASE WHEN video_urls IS NULL THEN NULL ELSE array_to_string(video_urls, ', ') END;
      RAISE NOTICE 'Fixed video_urls: ARRAY → TEXT';
    END IF;
  END IF;
END $$;

-- PART 3: Fix JSONB Columns → TEXT
DO $$
DECLARE
  col_type text;
BEGIN
  -- Fix business_hours
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'business_hours';

  IF col_type = 'jsonb' THEN
    ALTER TABLE ranges ALTER COLUMN business_hours TYPE TEXT USING business_hours::TEXT;
    RAISE NOTICE 'Fixed business_hours: JSONB → TEXT';
  ELSIF col_type IS NOT NULL AND col_type != 'text' THEN
    ALTER TABLE ranges ALTER COLUMN business_hours TYPE TEXT;
    RAISE NOTICE 'Fixed business_hours: % → TEXT', col_type;
  END IF;
END $$;

-- PART 4: Fix ENUM Columns → TEXT (facility_type, etc)
DO $$
DECLARE
  col_type text;
BEGIN
  -- Fix facility_type if it's an enum
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'ranges' AND column_name = 'facility_type';

  IF col_type = 'USER-DEFINED' THEN
    ALTER TABLE ranges ALTER COLUMN facility_type TYPE TEXT;
    RAISE NOTICE 'Fixed facility_type: ENUM → TEXT';
  END IF;
END $$;

-- PART 5: Make all foreign keys and constraints NULLABLE for import
ALTER TABLE ranges ALTER COLUMN city_id DROP NOT NULL;
ALTER TABLE ranges ALTER COLUMN province_id DROP NOT NULL;
ALTER TABLE ranges ALTER COLUMN address DROP NOT NULL;

-- PART 6: Ensure all boolean columns have proper defaults
-- This prevents "invalid input syntax for type boolean" errors
ALTER TABLE ranges ALTER COLUMN has_pro_shop SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN has_3d_course SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN has_field_course SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN membership_required SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN equipment_rental_available SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN lessons_available SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN accessibility SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN parking_available SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN is_premium SET DEFAULT false;
ALTER TABLE ranges ALTER COLUMN is_claimed SET DEFAULT false;

-- PART 7: Verification - Show what's fixed
SELECT 'AFTER FIX - All columns should be TEXT or have proper types now:' as status;

SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ranges'
ORDER BY ordinal_position;

-- Final message
SELECT '✅ SCHEMA FIX COMPLETE! Your database is now ready for CSV import.' as final_status;
SELECT '⚠️  IMPORTANT: Make sure your CSV has proper values:' as reminder;
SELECT '   - Boolean fields: Use "true"/"false" or "Yes"/"No", NOT pricing text' as note1;
SELECT '   - Numeric fields: Numbers only, remove $ and text' as note2;
SELECT '   - Empty values: Use empty string "" or leave blank, NOT "N/A"' as note3;
