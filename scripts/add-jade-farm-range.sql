-- Script to add Jade Farm Archery Club & Gallery (Salt Spring Archery Society)
-- Run this in Supabase SQL Editor

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

    -- Get or create Salt Spring Island city
    SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Salt Spring Island' AND province_id = v_province_id;

    IF v_city_id IS NULL THEN
        SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Salt Spring Island';

        IF v_city_id IS NOT NULL THEN
            UPDATE cities SET province_id = v_province_id WHERE id = v_city_id;
            RAISE NOTICE 'Updated Salt Spring Island city to link to BC';
        ELSE
            INSERT INTO cities (name, slug, province_id)
            VALUES ('Salt Spring Island', 'salt-spring-island', v_province_id)
            RETURNING id INTO v_city_id;
            RAISE NOTICE 'Created Salt Spring Island city with id: %', v_city_id;
        END IF;
    END IF;

    RAISE NOTICE 'Using city_id: %', v_city_id;

    -- Check if a range with this slug already exists
    SELECT id INTO v_existing_range_id FROM ranges WHERE slug = 'jade-farm-archery-club-gallery';

    IF v_existing_range_id IS NOT NULL THEN
        -- Update existing range with all details
        UPDATE ranges SET
            city_id = v_city_id,
            province_id = v_province_id,
            address = 'Salt Spring Island, 872 Long Harbour Rd, Salt Spring Island, BC V8K 2L8',
            postal_code = 'V8K 2L8',
            latitude = 48.8529,
            longitude = -123.4490,
            phone_number = '604-537-8843',
            website = 'https://www.jadefarm.ca',
            post_content = 'Jade Farm Archery Club & Gallery, home of the Salt Spring Archery Society, is a non-profit traditional archery club located on beautiful Salt Spring Island, BC. The facility features one of the most beautiful field archery courses in Canada, with outdoor ranges catering to both beginners and experienced archers. Targets are set at various distances from 10 metres to 80 metres across flat terrain and a scenic hillside 3D course winding through wooded trails. The on-site gallery showcases local artists'' work and sells bows, arrows, carvings, and leatherworks. The club offers introductory lessons, member classes, combat archery, tournaments, festivals, and a bowhunting apprenticeship program for experienced archers with their own equipment. Equipment is provided for beginners. Conveniently located just 0.5 km from the Long Harbour Ferry terminal and a 10-minute drive to Ganges Village.',
            business_hours = 'Thu-Sun: 11:00 AM - 4:30 PM; Mon-Wed: Closed',
            facility_type = 'Outdoor',
            has_pro_shop = true,
            has_3d_course = true,
            has_field_course = true,
            equipment_rental_available = true,
            lessons_available = true,
            accessibility = false,
            parking_available = true,
            membership_required = false,
            bow_types_allowed = 'Traditional, Recurve, Longbow',
            range_length_yards = 87,
            post_tags = ARRAY['Traditional Archery', 'Field Archery', '3D Course', 'Combat Archery', 'Tournaments', 'Gallery', 'Non-Profit', 'Lessons'],
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
            bow_types_allowed,
            range_length_yards,
            post_tags,
            status,
            is_featured,
            is_claimed,
            is_premium,
            views_count
        ) VALUES (
            'Jade Farm Archery Club & Gallery',
            'jade-farm-archery-club-gallery',
            v_city_id,
            v_province_id,
            'Salt Spring Island, 872 Long Harbour Rd, Salt Spring Island, BC V8K 2L8',
            'V8K 2L8',
            48.8529,
            -123.4490,
            '604-537-8843',
            'https://www.jadefarm.ca',
            'Jade Farm Archery Club & Gallery, home of the Salt Spring Archery Society, is a non-profit traditional archery club located on beautiful Salt Spring Island, BC. The facility features one of the most beautiful field archery courses in Canada, with outdoor ranges catering to both beginners and experienced archers. Targets are set at various distances from 10 metres to 80 metres across flat terrain and a scenic hillside 3D course winding through wooded trails. The on-site gallery showcases local artists'' work and sells bows, arrows, carvings, and leatherworks. The club offers introductory lessons, member classes, combat archery, tournaments, festivals, and a bowhunting apprenticeship program for experienced archers with their own equipment. Equipment is provided for beginners. Conveniently located just 0.5 km from the Long Harbour Ferry terminal and a 10-minute drive to Ganges Village.',
            'Thu-Sun: 11:00 AM - 4:30 PM; Mon-Wed: Closed',
            'Outdoor',
            true,
            true,
            true,
            true,
            true,
            false,
            true,
            false,
            'Traditional, Recurve, Longbow',
            87,
            ARRAY['Traditional Archery', 'Field Archery', '3D Course', 'Combat Archery', 'Tournaments', 'Gallery', 'Non-Profit', 'Lessons'],
            'active',
            false,
            false,
            false,
            0
        );

        RAISE NOTICE 'Created new range: Jade Farm Archery Club & Gallery';
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
    r.business_hours,
    r.facility_type,
    r.has_3d_course,
    r.has_field_course,
    r.lessons_available,
    r.status
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id
WHERE r.slug = 'jade-farm-archery-club-gallery';
