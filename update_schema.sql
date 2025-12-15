-- Add new columns to ranges table for expanded facility details
-- We use separate statements to ensure robustness.

-- 1. Contact & Basic Info
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS post_tags TEXT[];
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS business_hours TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS post_images TEXT[];

-- 2. Facility Details - EVERYTHING TEXT capable
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS range_length_yards TEXT;
ALTER TABLE ranges ALTER COLUMN range_length_yards TYPE TEXT USING range_length_yards::text;

-- User specifically requested flexible descriptions for everything
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS number_of_lanes TEXT;
ALTER TABLE ranges ALTER COLUMN number_of_lanes TYPE TEXT USING number_of_lanes::text;

ALTER TABLE ranges ADD COLUMN IF NOT EXISTS facility_type TEXT;

-- 3. Amenities (Booleans) - These remain Boolean as they are checkboxes in UI
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS has_pro_shop BOOLEAN DEFAULT false;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS has_3d_course BOOLEAN DEFAULT false;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS has_field_course BOOLEAN DEFAULT false;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS equipment_rental_available BOOLEAN DEFAULT false;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS lessons_available BOOLEAN DEFAULT false;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS membership_required BOOLEAN DEFAULT false;

-- 4. Pricing - EVERYTHING TEXT
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS membership_price_adult TEXT;
ALTER TABLE ranges ALTER COLUMN membership_price_adult TYPE TEXT USING membership_price_adult::text;

ALTER TABLE ranges ADD COLUMN IF NOT EXISTS drop_in_price TEXT;
ALTER TABLE ranges ALTER COLUMN drop_in_price TYPE TEXT USING drop_in_price::text;

ALTER TABLE ranges ADD COLUMN IF NOT EXISTS lesson_price_range TEXT;
ALTER TABLE ranges ALTER COLUMN lesson_price_range TYPE TEXT USING lesson_price_range::text;

-- 5. Other Info
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS bow_types_allowed TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS accessibility TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS parking_available TEXT;

-- 6. Update RLS policies
DROP POLICY IF EXISTS "Public full access ranges" ON ranges;
CREATE POLICY "Public full access ranges" ON ranges FOR ALL USING (true) WITH CHECK (true);
