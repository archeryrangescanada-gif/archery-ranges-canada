-- =====================================================
-- FIX TYPE MISMATCH FOR BC RANGES IMPORT
-- =====================================================
-- This script fixes the JSONB vs TEXT type mismatch errors

-- Step 1: First, let's check what the actual schema looks like
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ranges'
ORDER BY ordinal_position;

-- Step 2: Change problematic JSONB columns to TEXT
-- The CSV import provides plain text, not JSON objects
-- So we need to change these columns from JSONB to TEXT

ALTER TABLE ranges ALTER COLUMN business_hours TYPE TEXT USING business_hours::TEXT;

-- If there are other JSONB columns that should be TEXT, uncomment these:
-- ALTER TABLE ranges ALTER COLUMN range_length_yards TYPE INTEGER USING (business_hours->>'range_length_yards')::INTEGER;
-- ALTER TABLE ranges ALTER COLUMN number_of_lanes TYPE INTEGER USING (business_hours->>'number_of_lanes')::INTEGER;

-- Step 3: Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND column_name IN ('business_hours', 'range_length_yards', 'number_of_lanes')
ORDER BY column_name;

-- Step 4: The import function from FIX_IMPORT_ERRORS.sql should now work
-- You don't need to run it again, it's already deployed

SELECT 'Type mismatch fixed! business_hours is now TEXT. Try importing your CSV again.' as status;
