-- =====================================================
-- CHECK ACTUAL DATABASE SCHEMA
-- =====================================================
-- This will show us the REAL column types in your database

SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ranges'
ORDER BY ordinal_position;

-- Let's specifically check for array columns and JSONB columns
SELECT
  column_name,
  data_type,
  CASE
    WHEN data_type = 'ARRAY' THEN 'This is an array column'
    WHEN data_type = 'jsonb' THEN 'This is a JSONB column'
    ELSE 'Regular column'
  END as column_type_info
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND (data_type = 'ARRAY' OR data_type = 'jsonb' OR udt_name LIKE '%\_%')
ORDER BY column_name;
