-- =====================================================
-- COMPREHENSIVE SCHEMA DIAGNOSTIC
-- =====================================================
-- This will show us EXACTLY what your database expects
-- Run this FIRST before trying to import

-- Step 1: Show ALL columns in ranges table with their EXACT types
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  CASE
    WHEN data_type = 'ARRAY' THEN 'ARRAY TYPE - needs special handling'
    WHEN data_type = 'jsonb' THEN 'JSONB TYPE - needs special handling'
    WHEN data_type = 'USER-DEFINED' THEN 'ENUM/CUSTOM TYPE - needs special handling'
    WHEN is_nullable = 'NO' THEN 'REQUIRED FIELD - cannot be null'
    ELSE 'OK - regular field'
  END as notes
FROM information_schema.columns
WHERE table_name = 'ranges'
ORDER BY ordinal_position;

-- Step 2: Check for ENUM types (like facility_type might be)
SELECT
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- Step 3: Show which columns are causing problems (arrays, jsonb, enums)
SELECT
  column_name,
  data_type,
  udt_name,
  'FIX: Convert to TEXT' as recommended_action
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND (
    data_type = 'ARRAY'
    OR data_type = 'jsonb'
    OR data_type = 'USER-DEFINED'
  )
ORDER BY column_name;

-- Step 4: Show NOT NULL constraints that might cause issues
SELECT
  column_name,
  data_type,
  'FIX: Make nullable or ensure CSV has values' as recommended_action
FROM information_schema.columns
WHERE table_name = 'ranges'
  AND is_nullable = 'NO'
  AND column_name NOT IN ('id', 'created_at', 'updated_at', 'slug')
ORDER BY column_name;
