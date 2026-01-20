-- =====================================================
-- FIX ARRAY AND JSONB COLUMN TYPE MISMATCHES
-- =====================================================
-- This fixes the "text[] vs text" and "jsonb vs text" errors

-- Step 1: Check current schema to see what we're dealing with
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND column_name IN ('bow_types_allowed', 'business_hours', 'post_tags', 'post_images', 'video_urls')
ORDER BY column_name;

-- Step 2: Convert array columns to TEXT
-- If bow_types_allowed is text[], change it to TEXT
-- The CSV provides comma-separated values like "Recurve, Compound, Crossbow"
-- We'll store these as plain text, not arrays

ALTER TABLE ranges ALTER COLUMN bow_types_allowed TYPE TEXT USING
  CASE
    WHEN bow_types_allowed IS NULL THEN NULL
    ELSE array_to_string(bow_types_allowed, ', ')
  END;

-- If post_tags is text[], convert to TEXT
ALTER TABLE ranges ALTER COLUMN post_tags TYPE TEXT USING
  CASE
    WHEN post_tags IS NULL THEN NULL
    ELSE array_to_string(post_tags, ', ')
  END;

-- If post_images is text[], convert to TEXT
ALTER TABLE ranges ALTER COLUMN post_images TYPE TEXT USING
  CASE
    WHEN post_images IS NULL THEN NULL
    ELSE array_to_string(post_images, ', ')
  END;

-- If video_urls exists and is text[], convert to TEXT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ranges' AND column_name = 'video_urls') THEN
    ALTER TABLE ranges ALTER COLUMN video_urls TYPE TEXT USING
      CASE
        WHEN video_urls IS NULL THEN NULL
        ELSE array_to_string(video_urls, ', ')
      END;
  END IF;
END $$;

-- If business_hours is JSONB, convert to TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ranges'
      AND column_name = 'business_hours'
      AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE ranges ALTER COLUMN business_hours TYPE TEXT USING business_hours::TEXT;
  END IF;
END $$;

-- Step 3: Verify the changes
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND column_name IN ('bow_types_allowed', 'business_hours', 'post_tags', 'post_images', 'video_urls')
ORDER BY column_name;

-- Step 4: Success message
SELECT 'All array and JSONB columns converted to TEXT! Import should now work.' as status;
