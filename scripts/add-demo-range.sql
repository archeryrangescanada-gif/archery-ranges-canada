-- Demo range for testing the claim listing flow
-- Run this in Supabase SQL Editor
-- This range has NO owner_id so it will appear in claim search results

DO $$
DECLARE
    v_city_id uuid;
    v_province_id uuid;
    v_existing_range_id uuid;
BEGIN
    -- Get Ontario province ID
    SELECT id INTO v_province_id FROM provinces WHERE slug = 'ontario' OR name ILIKE 'Ontario';

    IF v_province_id IS NULL THEN
        RAISE EXCEPTION 'Ontario province not found in database';
    END IF;

    -- Get or create Whitby city
    SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Whitby' AND province_id = v_province_id;

    IF v_city_id IS NULL THEN
        INSERT INTO cities (name, slug, province_id)
        VALUES ('Whitby', 'whitby', v_province_id)
        RETURNING id INTO v_city_id;
        RAISE NOTICE 'Created Whitby city with id: %', v_city_id;
    END IF;

    -- Check if demo range already exists
    SELECT id INTO v_existing_range_id FROM ranges WHERE slug = 'durham-archery-demo-range';

    IF v_existing_range_id IS NOT NULL THEN
        RAISE NOTICE 'Demo range already exists: %', v_existing_range_id;
    ELSE
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
            post_content,
            facility_type,
            has_pro_shop,
            has_3d_course,
            has_field_course,
            equipment_rental_available,
            lessons_available,
            parking_available,
            membership_required,
            subscription_tier,
            owner_id,
            status
        ) VALUES (
            'Durham Archery Demo Range',
            'durham-archery-demo-range',
            v_city_id,
            v_province_id,
            '123 Test Street, Whitby, ON L1N 1A1',
            'L1N 1A1',
            43.8971,
            -78.9429,
            '905-555-0199',
            'demo@durhamarchery.ca',
            'https://example.com',
            'This is a demo archery range for testing the claim listing flow. Features include indoor and outdoor ranges, a 3D course through wooded trails, equipment rentals for beginners, and a well-stocked pro shop. Open year-round with flexible hours for members and drop-in visitors.',
            'both',
            true,
            true,
            false,
            true,
            true,
            true,
            false,
            'free',
            NULL,  -- No owner = claimable
            'active'
        );

        RAISE NOTICE 'Created demo range: Durham Archery Demo Range';
    END IF;
END $$;

-- Verify
SELECT id, name, slug, owner_id, status
FROM ranges
WHERE slug = 'durham-archery-demo-range';
