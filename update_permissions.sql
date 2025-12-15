-- FORCE OPEN PERMISSIONS for Import
-- Run this in Supabase Dashboard > SQL Editor
-- This fixes the "violates row-level security policy" error.

-- 1. Provinces
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Provinces are viewable by everyone" ON provinces;
DROP POLICY IF EXISTS "Public full access provinces" ON provinces;
CREATE POLICY "Public full access provinces" ON provinces FOR ALL USING (true) WITH CHECK (true);

-- 2. Cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;
DROP POLICY IF EXISTS "Public full access cities" ON cities;
CREATE POLICY "Public full access cities" ON cities FOR ALL USING (true) WITH CHECK (true);

-- 3. Ranges
ALTER TABLE ranges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ranges are viewable by everyone" ON ranges;
DROP POLICY IF EXISTS "Public full access ranges" ON ranges;
CREATE POLICY "Public full access ranges" ON ranges FOR ALL USING (true) WITH CHECK (true);
