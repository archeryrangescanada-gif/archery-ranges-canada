-- FORCE FIX v3: Nuclear Option with CASCADE
-- Use this if the previous script didn't seem to work.

ALTER TABLE ranges DISABLE ROW LEVEL SECURITY;

-- 1. Drop problematic columns with CASCADE to remove any lingering dependencies
ALTER TABLE ranges DROP COLUMN IF EXISTS membership_price_adult CASCADE;
ALTER TABLE ranges DROP COLUMN IF EXISTS drop_in_price CASCADE;
ALTER TABLE ranges DROP COLUMN IF EXISTS lesson_price_range CASCADE;
ALTER TABLE ranges DROP COLUMN IF EXISTS range_length_yards CASCADE;
ALTER TABLE ranges DROP COLUMN IF EXISTS number_of_lanes CASCADE;
ALTER TABLE ranges DROP COLUMN IF EXISTS parking_available CASCADE;
ALTER TABLE ranges DROP COLUMN IF EXISTS accessibility CASCADE;

-- 2. Re-create them explicitly as TEXT
ALTER TABLE ranges ADD COLUMN membership_price_adult TEXT;
ALTER TABLE ranges ADD COLUMN drop_in_price TEXT;
ALTER TABLE ranges ADD COLUMN lesson_price_range TEXT;
ALTER TABLE ranges ADD COLUMN range_length_yards TEXT;
ALTER TABLE ranges ADD COLUMN number_of_lanes TEXT;
ALTER TABLE ranges ADD COLUMN parking_available TEXT;
ALTER TABLE ranges ADD COLUMN accessibility TEXT;

-- 3. Re-enable RLS
ALTER TABLE ranges ENABLE ROW LEVEL SECURITY;
