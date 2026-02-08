-- Script to add Mission & District Rod & Gun Club
-- Run this in Supabase SQL Editor

-- First, let's verify the city exists and get the IDs we need
DO $$
DECLARE
    v_city_id uuid;
    v_province_id uuid;
    v_existing_range_id uuid;
BEGIN
    -- Get British Columbia province ID
    SELECT id INTO v_province_id FROM provinces WHERE slug = 'british-columbia' OR name ILIKE 'British Columbia';

    IF v_province_id IS NULL THEN
        RAISE EXCEPTION 'British Columbia province not found in database';
    END IF;

    RAISE NOTICE 'Found BC province_id: %', v_province_id;

    -- Get Mission city ID (should be linked to BC)
    SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Mission' AND province_id = v_province_id;

    IF v_city_id IS NULL THEN
        -- Try without province filter in case city exists but isn't linked
        SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Mission';

        IF v_city_id IS NOT NULL THEN
            -- Update the city to link to BC
            UPDATE cities SET province_id = v_province_id WHERE id = v_city_id;
            RAISE NOTICE 'Updated Mission city to link to BC';
        ELSE
            -- Create the city
            INSERT INTO cities (name, slug, province_id)
            VALUES ('Mission', 'mission', v_province_id)
            RETURNING id INTO v_city_id;
            RAISE NOTICE 'Created Mission city with id: %', v_city_id;
        END IF;
    END IF;

    RAISE NOTICE 'Using city_id: %', v_city_id;

    -- Check if a range with this slug already exists
    SELECT id INTO v_existing_range_id FROM ranges WHERE slug = 'mission-district-rod-gun-club';

    IF v_existing_range_id IS NOT NULL THEN
        -- Update existing range with proper city_id and all details
        UPDATE ranges SET
            city_id = v_city_id,
            province_id = v_province_id,
            address = '10969 Dewdney Trunk Road, Mission, BC V4S 1L1',
            postal_code = 'V4S 1L1',
            latitude = 49.2015126,
            longitude = -122.3263567,
            phone_number = '604-826-6515',
            email = 'assistant@mdrgc.ca',
            website = 'https://missionrodandgun.com',
            post_content = 'Looking for archery in Mission, BC? The Mission & District Rod & Gun Club offers one of the Fraser Valley''s premier outdoor archery experiences. Established as one of the Lower Mainland''s most longstanding shooting sports facilities, this club features an exciting 3D archery trail course winding through scenic wooded terrain with multiple target stations at varying distances. Perfect for both beginners and experienced archers, the club provides PSE compound bows for member use and welcomes recurve and compound shooters. Annual memberships start at just $170 for adults, with family options available. Located at 10969 Dewdney Trunk Road, the range is open daily from 9AM to 9PM, making it convenient for after-work practice sessions. Whether you''re training for competition or enjoying recreational archery, Mission & District Rod & Gun Club provides a welcoming community atmosphere in a beautiful natural setting.',
            business_hours = 'Range: Daily 9AM-9PM; Clubhouse: Wed-Sun 9AM-3PM',
            facility_type = 'Outdoor',
            has_pro_shop = false,
            has_3d_course = true,
            has_field_course = true,
            equipment_rental_available = true,
            lessons_available = false,
            accessibility = false,
            parking_available = true,
            membership_required = true,
            membership_price_adult = 170,
            bow_types_allowed = 'Compound, Recurve',
            post_images = ARRAY['/british columbia listing images/Mission & District Rod & Gun Club.jpg'],
            status = 'active',
            updated_at = NOW()
        WHERE id = v_existing_range_id;

        RAISE NOTICE 'Updated existing range: %', v_existing_range_id;
    ELSE
        -- Insert new range
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
            business_hours,
            facility_type,
            has_pro_shop,
            has_3d_course,
            has_field_course,
            equipment_rental_available,
            lessons_available,
            accessibility,
            parking_available,
            membership_required,
            membership_price_adult,
            bow_types_allowed,
            post_images,
            status,
            is_featured,
            is_claimed,
            is_premium,
            views_count
        ) VALUES (
            'Mission & District Rod & Gun Club',
            'mission-district-rod-gun-club',
            v_city_id,
            v_province_id,
            '10969 Dewdney Trunk Road, Mission, BC V4S 1L1',
            'V4S 1L1',
            49.2015126,
            -122.3263567,
            '604-826-6515',
            'assistant@mdrgc.ca',
            'https://missionrodandgun.com',
            'Looking for archery in Mission, BC? The Mission & District Rod & Gun Club offers one of the Fraser Valley''s premier outdoor archery experiences. Established as one of the Lower Mainland''s most longstanding shooting sports facilities, this club features an exciting 3D archery trail course winding through scenic wooded terrain with multiple target stations at varying distances. Perfect for both beginners and experienced archers, the club provides PSE compound bows for member use and welcomes recurve and compound shooters. Annual memberships start at just $170 for adults, with family options available. Located at 10969 Dewdney Trunk Road, the range is open daily from 9AM to 9PM, making it convenient for after-work practice sessions. Whether you''re training for competition or enjoying recreational archery, Mission & District Rod & Gun Club provides a welcoming community atmosphere in a beautiful natural setting.',
            'Range: Daily 9AM-9PM; Clubhouse: Wed-Sun 9AM-3PM',
            'Outdoor',
            false,
            true,
            true,
            true,
            false,
            false,
            true,
            true,
            170,
            'Compound, Recurve',
            ARRAY['/british columbia listing images/Mission & District Rod & Gun Club.jpg'],
            'active',
            false,
            false,
            false,
            0
        );

        RAISE NOTICE 'Created new range: Mission & District Rod & Gun Club';
    END IF;
END $$;

-- Verify the result
SELECT
    r.id,
    r.name,
    r.slug,
    r.city_id,
    r.province_id,
    c.name as city_name,
    c.slug as city_slug,
    p.name as province_name,
    p.slug as province_slug,
    r.address,
    r.phone_number,
    r.website,
    r.status
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id
WHERE r.slug = 'mission-district-rod-gun-club';
