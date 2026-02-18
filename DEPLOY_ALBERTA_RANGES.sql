-- =====================================================
-- DEPLOYMENT SCRIPT FOR ALBERTA ARCHERY RANGES
-- =====================================================
-- 43 ranges with photos, thumbnails, and complete data
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
  v_province_id uuid;
  v_city_id uuid;
  v_range_id uuid;
BEGIN
  -- Get Alberta province ID
  SELECT id INTO v_province_id FROM provinces WHERE slug = 'alberta' OR name ILIKE 'Alberta';

  IF v_province_id IS NULL THEN
    INSERT INTO provinces (name, slug) VALUES ('Alberta', 'alberta')
    RETURNING id INTO v_province_id;
    RAISE NOTICE 'Created Alberta province';
  END IF;

  RAISE NOTICE 'Alberta province_id: %', v_province_id;

  -- =====================================================
  -- RANGE 1: Southern Alberta Bowhunters Association (SABA)
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Lethbridge' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Lethbridge', 'lethbridge', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'southern-alberta-bowhunters-association-saba' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Southern Alberta Bowhunters Association (SABA)',
      'southern-alberta-bowhunters-association-saba',
      v_city_id, v_province_id,
      'Peenaquim Park, North Lethbridge', NULL,
      49.7214, -112.8354,
      NULL, 'info@sababowhunters.ca', 'http://www.southernalbertabowhuntersassociation.ca/',
      'Large outdoor range with block targets (20-100 yds) and 3D targets (5-100 yds).',
      'Outdoor, 3D, Bowhunting', NULL,
      '{"/alberta listing images/southern_alberta_bowhunters_association_saba.jpg"}',
      100, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'Compound, Traditional', 'Outdoor Access', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Southern Alberta Bowhunters Association (SABA)';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/southern_alberta_bowhunters_association_saba.jpg"}',
      post_content = 'Large outdoor range with block targets (20-100 yds) and 3D targets (5-100 yds).',
      post_tags = 'Outdoor, 3D, Bowhunting',
      range_length_yards = 100, facility_type = 'Outdoor',
      has_3d_course = true, membership_required = true,
      bow_types_allowed = 'Compound, Traditional', accessibility = 'Outdoor Access', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Southern Alberta Bowhunters Association (SABA)';
  END IF;

  -- =====================================================
  -- RANGE 2: Brazeau Bowbenders Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Drayton Valley' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Drayton Valley', 'drayton-valley', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'brazeau-bowbenders-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Brazeau Bowbenders Archery Club',
      'brazeau-bowbenders-archery-club',
      v_city_id, v_province_id,
      'Blue Rapids Provincial Recreation Area', 'T7A 1S4',
      53.2185, -114.9782,
      '780-515-0220', 'info@bbarchery.ca', 'https://bbarchery.ca/',
      'Outdoor range in Blue Rapids PRA and indoor facility at Tomahawk Ag Centre.',
      'Indoor, Outdoor, 3D', NULL,
      '{"/alberta listing images/brazeau_bowbenders_archery_club.jpg"}',
      50, NULL, 'Both',
      true, true, false,
      true, NULL, NULL,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Brazeau Bowbenders Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/brazeau_bowbenders_archery_club.jpg"}',
      post_content = 'Outdoor range in Blue Rapids PRA and indoor facility at Tomahawk Ag Centre.',
      post_tags = 'Indoor, Outdoor, 3D',
      range_length_yards = 50, facility_type = 'Both',
      has_pro_shop = true, has_3d_course = true, membership_required = true,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Brazeau Bowbenders Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 3: Cold Lake Fish and Game Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Cold Lake' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Cold Lake', 'cold-lake', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'cold-lake-fish-and-game-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Cold Lake Fish and Game Club',
      'cold-lake-fish-and-game-club',
      v_city_id, v_province_id,
      'Range Road 434 & Hwy 55', NULL,
      54.4642, -110.1824,
      '780-594-3302', NULL, 'https://coldlakefishandgame.com/',
      'Archery field located 13.3km west of Cold Lake. Requires gate code.',
      'Outdoor, Target', NULL,
      '{"/alberta listing images/cold_lake_fish_and_game_club.png"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Rural', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Cold Lake Fish and Game Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/cold_lake_fish_and_game_club.png"}',
      post_content = 'Archery field located 13.3km west of Cold Lake. Requires gate code.',
      post_tags = 'Outdoor, Target',
      facility_type = 'Outdoor', membership_required = true,
      bow_types_allowed = 'All', accessibility = 'Rural', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Cold Lake Fish and Game Club';
  END IF;

  -- =====================================================
  -- RANGE 4: Game Country Archers
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Grande Prairie' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Grande Prairie', 'grande-prairie', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'game-country-archers' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Game Country Archers',
      'game-country-archers',
      v_city_id, v_province_id,
      'Evergreen Park', 'T8V 3R5',
      55.1054, -118.7562,
      '780-532-3279', NULL, 'https://gamecountryarchers.com/',
      'Outdoor range and pavilion located at Evergreen Park.',
      'Outdoor, 3D', NULL,
      '{"/alberta listing images/game_country_archers.png"}',
      NULL, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Park Access', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Game Country Archers';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/game_country_archers.png"}',
      post_content = 'Outdoor range and pavilion located at Evergreen Park.',
      post_tags = 'Outdoor, 3D', facility_type = 'Outdoor',
      has_3d_course = true, membership_required = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Game Country Archers';
  END IF;

  -- =====================================================
  -- RANGE 5: Kneehill Bowhunters & Archers
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Trochu' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Trochu', 'trochu', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'kneehill-bowhunters--archers' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Kneehill Bowhunters & Archers',
      'kneehill-bowhunters--archers',
      v_city_id, v_province_id,
      'Trochu Hall Basement', 'T0M 2C0',
      51.8267, -113.2217,
      '403-350-7146', NULL, 'https://trochu.ab.ca/',
      'Indoor range located in the basement of Trochu Hall.',
      'Indoor', NULL,
      '{"/alberta listing images/kneehill_bowhunters_archers.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Kneehill Bowhunters & Archers';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/kneehill_bowhunters_archers.jpg"}',
      post_content = 'Indoor range located in the basement of Trochu Hall.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Kneehill Bowhunters & Archers';
  END IF;

  -- =====================================================
  -- RANGE 6: Parkland Bowbenders Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Spruce Grove' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Spruce Grove', 'spruce-grove', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'parkland-bowbenders-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Parkland Bowbenders Archery Club',
      'parkland-bowbenders-archery-club',
      v_city_id, v_province_id,
      '80 Acres Wooded Land', NULL,
      53.5414, -114.0044,
      '587-991-1268', 'info@parklandbowbenders.ca', 'https://parklandbowbenders.ca/',
      '80-acre wooded range with static and 3D loops open year-round.',
      'Outdoor, 3D', '24/7 member access',
      '{"/alberta listing images/parkland_bowbenders_archery_club.png"}',
      NULL, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'Compound, Traditional', 'Wooded', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Parkland Bowbenders Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/parkland_bowbenders_archery_club.png"}',
      post_content = '80-acre wooded range with static and 3D loops open year-round.',
      post_tags = 'Outdoor, 3D', business_hours = '24/7 member access',
      facility_type = 'Outdoor', has_3d_course = true, membership_required = true,
      bow_types_allowed = 'Compound, Traditional', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Parkland Bowbenders Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 7: Sherwood Park Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Sherwood Park' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Sherwood Park', 'sherwood-park', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'sherwood-park-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Sherwood Park Archery Club',
      'sherwood-park-archery-club',
      v_city_id, v_province_id,
      'Birch Bay', NULL,
      53.5411, -113.2847,
      '780-467-0085', 'info@sparchery.ca', 'https://sherwoodparckarchery.com/',
      'Outdoor FITA and Field/3D range with trails and 24/7 access.',
      'Outdoor, FITA, 3D', '24/7',
      '{"/alberta listing images/sherwood_park_archery_club.jpg"}',
      90, NULL, 'Outdoor',
      false, true, true,
      true, 280, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Sherwood Park Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/sherwood_park_archery_club.jpg"}',
      post_content = 'Outdoor FITA and Field/3D range with trails and 24/7 access.',
      post_tags = 'Outdoor, FITA, 3D', business_hours = '24/7',
      range_length_yards = 90, facility_type = 'Outdoor',
      has_3d_course = true, has_field_course = true,
      membership_required = true, membership_price_adult = 280,
      lessons_available = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Sherwood Park Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 8: Springbrook Archers
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Springbrook' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Springbrook', 'springbrook', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'springbrook-archers' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Springbrook Archers',
      'springbrook-archers',
      v_city_id, v_province_id,
      'Springbrook Multiplex', 'T4S 1W4',
      52.1814, -113.8824,
      '403-638-7418', NULL, 'https://www.facebook.com/SpringbrookArchers',
      'Family-run club in the Springbrook Multiplex training all ages.',
      'Indoor', NULL,
      '{"/alberta listing images/springbrook_archers.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Springbrook Archers';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/springbrook_archers.jpg"}',
      post_content = 'Family-run club in the Springbrook Multiplex training all ages.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Springbrook Archers';
  END IF;

  -- =====================================================
  -- RANGE 9: Stavely Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Stavely' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Stavely', 'stavely', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'stavely-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Stavely Archery Club',
      'stavely-archery-club',
      v_city_id, v_province_id,
      'Stavely Archery Lanes', NULL,
      50.1667, -113.6333,
      NULL, NULL, 'https://stavelyarcherylanes.com/',
      'Indoor range hosting 3D shoots and youth programs.',
      'Indoor, 3D', NULL,
      '{"/alberta listing images/stavely_archery_club.jpg"}',
      20, NULL, 'Indoor',
      false, true, false,
      true, NULL, NULL,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Stavely Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/stavely_archery_club.jpg"}',
      post_content = 'Indoor range hosting 3D shoots and youth programs.',
      post_tags = 'Indoor, 3D', range_length_yards = 20, facility_type = 'Indoor',
      has_3d_course = true, membership_required = true,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Stavely Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 10: Whitecourt Fish & Game Association
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Whitecourt' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Whitecourt', 'whitecourt', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'whitecourt-fish--game-association' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Whitecourt Fish & Game Association',
      'whitecourt-fish--game-association',
      v_city_id, v_province_id,
      'WFGA Grounds', NULL,
      54.1439, -115.6828,
      NULL, 'president@wfga.ca', 'https://wfga.ca/',
      'Dedicated archery range maintained by the Fish & Game Association.',
      'Outdoor', NULL,
      '{"/alberta listing images/whitecourt_fish_game_association.jpg"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Whitecourt Fish & Game Association';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/whitecourt_fish_game_association.jpg"}',
      post_content = 'Dedicated archery range maintained by the Fish & Game Association.',
      post_tags = 'Outdoor', facility_type = 'Outdoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Whitecourt Fish & Game Association';
  END IF;

  -- =====================================================
  -- RANGE 11: Vermilion River Archers
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Vermilion' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Vermilion', 'vermilion', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'vermilion-river-archers' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Vermilion River Archers',
      'vermilion-river-archers',
      v_city_id, v_province_id,
      'The Armouries Building', NULL,
      53.3533, -110.8522,
      '780-581-3888', NULL, 'https://www.facebook.com/groups/471301010064186',
      'Indoor club operating out of the historic Armouries building in Vermilion.',
      'Indoor', NULL,
      '{"/alberta listing images/vermilion_river_archers.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Vermilion River Archers';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/vermilion_river_archers.jpg"}',
      post_content = 'Indoor club operating out of the historic Armouries building in Vermilion.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Vermilion River Archers';
  END IF;

  -- =====================================================
  -- RANGE 12: Jim-Bows Archery Calgary
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Calgary' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Calgary', 'calgary', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'jim-bows-archery-calgary' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Jim-Bows Archery Calgary',
      'jim-bows-archery-calgary',
      v_city_id, v_province_id,
      '620 46 Ave NE #102', 'T2E 8M9',
      51.0942, -114.0454,
      '403-250-7713', 'info@jimbowsarchery.ca', 'https://jimbowsarchery.ca/',
      'Full-service pro shop with indoor lanes and 3D targets.',
      'Indoor, 3D, Pro Shop', '10-8 Tue-Fri',
      '{"/alberta listing images/jim_bows_archery_calgary.jpg"}',
      20, 10, 'Indoor',
      true, true, false,
      false, NULL, 14.99,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Jim-Bows Archery Calgary';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/jim_bows_archery_calgary.jpg"}',
      post_content = 'Full-service pro shop with indoor lanes and 3D targets.',
      post_tags = 'Indoor, 3D, Pro Shop', business_hours = '10-8 Tue-Fri',
      range_length_yards = 20, number_of_lanes = 10, facility_type = 'Indoor',
      has_pro_shop = true, has_3d_course = true, drop_in_price = 14.99,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Jim-Bows Archery Calgary';
  END IF;

  -- =====================================================
  -- RANGE 13: Archery World Calgary
  -- =====================================================
  -- Calgary city already created above
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Calgary' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'archery-world-calgary' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Archery World Calgary',
      'archery-world-calgary',
      v_city_id, v_province_id,
      '3420 12th St NE #106', 'T2E 6N1',
      51.0834, -114.0254,
      '403-910-6662', 'store@archeryworld.ca', 'https://archeryworld.ca/',
      'Indoor range with 20, 30, and 40-yard lanes. Offers combat archery.',
      'Indoor, Combat', 'Mon-Fri 10AM-9PM, Weekends 10AM-6PM',
      '{"/alberta listing images/archery_world_calgary.jpg"}',
      40, NULL, 'Indoor',
      true, true, false,
      false, NULL, 22,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Archery World Calgary';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/archery_world_calgary.jpg"}',
      post_content = 'Indoor range with 20, 30, and 40-yard lanes. Offers combat archery.',
      post_tags = 'Indoor, Combat', business_hours = 'Mon-Fri 10AM-9PM, Weekends 10AM-6PM',
      range_length_yards = 40, facility_type = 'Indoor',
      has_pro_shop = true, has_3d_course = true, drop_in_price = 22,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Archery World Calgary';
  END IF;

  -- =====================================================
  -- RANGE 14: Calgary Archery Centre
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Calgary' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'calgary-archery-centre' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Calgary Archery Centre',
      'calgary-archery-centre',
      v_city_id, v_province_id,
      '4855 47 St SE', NULL,
      50.9984, -113.9654,
      '403-255-6830', 'info@calgaryarcherycentre.com', 'https://archershub.com/',
      'One of Calgary''s largest indoor ranges with 10-40 yard targets.',
      'Indoor, 3D', '11-9:30 Tue-Fri',
      '{"/alberta listing images/calgary_archery_centre.png"}',
      40, 30, 'Indoor',
      true, true, false,
      false, NULL, NULL,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Calgary Archery Centre';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/calgary_archery_centre.png"}',
      post_content = 'One of Calgary''s largest indoor ranges with 10-40 yard targets.',
      post_tags = 'Indoor, 3D', business_hours = '11-9:30 Tue-Fri',
      range_length_yards = 40, number_of_lanes = 30, facility_type = 'Indoor',
      has_pro_shop = true, has_3d_course = true,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Calgary Archery Centre';
  END IF;

  -- =====================================================
  -- RANGE 15: CDTSA Milo Range
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Milo' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Milo', 'milo', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'cdtsa-milo-range' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'CDTSA Milo Range',
      'cdtsa-milo-range',
      v_city_id, v_province_id,
      'Southwest of Milo', NULL,
      50.5667, -112.8667,
      NULL, 'info@cdtsa.ca', 'https://cdtsa.ca/',
      '160-acre members-only outdoor facility with two archery bays.',
      'Outdoor', '9-9 Daily',
      '{"/alberta listing images/cdtsa_milo_range.png"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: CDTSA Milo Range';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/cdtsa_milo_range.png"}',
      post_content = '160-acre members-only outdoor facility with two archery bays.',
      post_tags = 'Outdoor', business_hours = '9-9 Daily', facility_type = 'Outdoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: CDTSA Milo Range';
  END IF;

  -- =====================================================
  -- RANGE 16: Cochrane Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Cochrane' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Cochrane', 'cochrane', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'cochrane-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Cochrane Archery Club',
      'cochrane-archery-club',
      v_city_id, v_province_id,
      'Hwy 1A & RR 43', NULL,
      51.1892, -114.4678,
      '403-932-4143', 'info@cochranearchery.ca', 'https://cochranearchery.ca/',
      'Non-profit club with 10-40m indoor lanes and 50m outdoor range.',
      'Indoor, Outdoor, 3D', 'Mon/Thu 7-9',
      '{"/alberta listing images/cochrane_archery_club.jpg"}',
      50, NULL, 'Both',
      false, true, false,
      true, NULL, NULL,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Cochrane Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/cochrane_archery_club.jpg"}',
      post_content = 'Non-profit club with 10-40m indoor lanes and 50m outdoor range.',
      post_tags = 'Indoor, Outdoor, 3D', business_hours = 'Mon/Thu 7-9',
      range_length_yards = 50, facility_type = 'Both',
      has_3d_course = true, membership_required = true,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Cochrane Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 17: AHEIA Archery Range
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Calgary' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'aheia-archery-range' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'AHEIA Archery Range',
      'aheia-archery-range',
      v_city_id, v_province_id,
      'AHEIA Conservation Center', NULL,
      51.0447, -114.0719,
      '403-256-0665', 'cfc@aheia.com', 'https://aheia.com/',
      'Dedicated archery range within an 80-acre conservation area.',
      'Outdoor', NULL,
      '{"/alberta listing images/aheia_archery_range.png"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: AHEIA Archery Range';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/aheia_archery_range.png"}',
      post_content = 'Dedicated archery range within an 80-acre conservation area.',
      post_tags = 'Outdoor', facility_type = 'Outdoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: AHEIA Archery Range';
  END IF;

  -- =====================================================
  -- RANGE 18: Jim-Bows Archery Edmonton
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Edmonton', 'edmonton', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'jim-bows-archery-edmonton' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Jim-Bows Archery Edmonton',
      'jim-bows-archery-edmonton',
      v_city_id, v_province_id,
      '13955 156 St NW', 'T6V 1J1',
      53.6014, -113.5854,
      '780-488-7705', 'edmonton@jimbowsarchery.ca', 'https://jimbowsarchery.ca/',
      'Edmonton branch of Jim-Bows featuring indoor target lanes.',
      'Indoor, Pro Shop', 'Tue-Fri 10AM-8PM, Sat 10AM-5PM',
      '{"/alberta listing images/jim_bows_archery_edmonton.jpg"}',
      20, 10, 'Indoor',
      true, false, false,
      false, NULL, 14.99,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Jim-Bows Archery Edmonton';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/jim_bows_archery_edmonton.jpg"}',
      post_content = 'Edmonton branch of Jim-Bows featuring indoor target lanes.',
      post_tags = 'Indoor, Pro Shop', business_hours = 'Tue-Fri 10AM-8PM, Sat 10AM-5PM',
      range_length_yards = 20, number_of_lanes = 10, facility_type = 'Indoor',
      has_pro_shop = true, drop_in_price = 14.99,
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Jim-Bows Archery Edmonton';
  END IF;

  -- =====================================================
  -- RANGE 19: Capital Region Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'capital-region-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Capital Region Archery Club',
      'capital-region-archery-club',
      v_city_id, v_province_id,
      '5618 76 Ave NW', 'T6B 0A6',
      53.5114, -113.4254,
      '780-450-6041', 'crac.membership@gmail.com', 'https://crarchery.ca/',
      'Volunteer-run indoor range with 24-hour access for members.',
      'Indoor', '24/7 Members',
      '{"/alberta listing images/capital_region_archery_club.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Capital Region Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/capital_region_archery_club.jpg"}',
      post_content = 'Volunteer-run indoor range with 24-hour access for members.',
      post_tags = 'Indoor', business_hours = '24/7 Members',
      range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Capital Region Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 20: Camrose Shooting Sports Association
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Camrose' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Camrose', 'camrose', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'camrose-shooting-sports-association' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Camrose Shooting Sports Association',
      'camrose-shooting-sports-association',
      v_city_id, v_province_id,
      'CSSA Grounds', NULL,
      53.0233, -112.8333,
      NULL, 'cssa2014@hotmail.com', 'https://camroseshootingsports.ca/',
      'Indoor range available for scheduled archery sessions.',
      'Indoor', NULL,
      '{"/alberta listing images/camrose_shooting_sports_association.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Camrose Shooting Sports Association';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/camrose_shooting_sports_association.jpg"}',
      post_content = 'Indoor range available for scheduled archery sessions.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Camrose Shooting Sports Association';
  END IF;

  -- =====================================================
  -- RANGE 21: Lloydminster & Area Archers
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Lloydminster' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Lloydminster', 'lloydminster', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'lloydminster--area-archers' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Lloydminster & Area Archers',
      'lloydminster--area-archers',
      v_city_id, v_province_id,
      'LAA Youth Center', NULL,
      53.2783, -110.0050,
      NULL, 'membership.lloydarchers@gmail.com', 'https://lloydarchers.ca/',
      'Indoor range up to 40 yards and a seasonal outdoor 3D course.',
      'Indoor, Outdoor, 3D', NULL,
      '{"/alberta listing images/lloydminster_area_archers.png"}',
      40, 18, 'Both',
      false, true, true,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Lloydminster & Area Archers';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/lloydminster_area_archers.png"}',
      post_content = 'Indoor range up to 40 yards and a seasonal outdoor 3D course.',
      post_tags = 'Indoor, Outdoor, 3D',
      range_length_yards = 40, number_of_lanes = 18, facility_type = 'Both',
      has_3d_course = true, has_field_course = true, membership_required = true,
      lessons_available = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Lloydminster & Area Archers';
  END IF;

  -- =====================================================
  -- RANGE 22: Storm Mountain Outfitters
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Stettler' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Stettler', 'stettler', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'storm-mountain-outfitters' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Storm Mountain Outfitters',
      'storm-mountain-outfitters',
      v_city_id, v_province_id,
      'Storm Mountain Grounds', NULL,
      52.3167, -112.7167,
      '403-740-3000', 'info@stormmountainoutfitters.ca', 'https://stormmountainoutfitters.ca/',
      'Commercial indoor archery range and professional outfitter.',
      'Indoor, Pro Shop', 'Mon-Sat 9AM-6PM',
      '{"/alberta listing images/storm_mountain_outfitters.jpg"}',
      NULL, NULL, 'Indoor',
      true, false, false,
      false, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Storm Mountain Outfitters';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/storm_mountain_outfitters.jpg"}',
      post_content = 'Commercial indoor archery range and professional outfitter.',
      post_tags = 'Indoor, Pro Shop', business_hours = 'Mon-Sat 9AM-6PM',
      facility_type = 'Indoor', has_pro_shop = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Storm Mountain Outfitters';
  END IF;

  -- =====================================================
  -- RANGE 23: Grande Central Archery
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Red Deer' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Red Deer', 'red-deer', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'grande-central-archery' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Grande Central Archery',
      'grande-central-archery',
      v_city_id, v_province_id,
      '7km South of Red Deer', NULL,
      52.2681, -113.8111,
      NULL, 'grandecentralarchery@gmail.com', 'https://grandecentralarchery.ca/',
      'Indoor range with 20 and 35-yard lanes and full service shop.',
      'Indoor, Pro Shop', NULL,
      '{"/alberta listing images/grande_central_archery.png"}',
      35, NULL, 'Indoor',
      true, false, false,
      false, NULL, NULL,
      true, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Grande Central Archery';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/grande_central_archery.png"}',
      post_content = 'Indoor range with 20 and 35-yard lanes and full service shop.',
      post_tags = 'Indoor, Pro Shop', range_length_yards = 35, facility_type = 'Indoor',
      has_pro_shop = true, equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Grande Central Archery';
  END IF;

  -- =====================================================
  -- RANGE 24: Red Deer Fish and Game Association
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Red Deer' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'red-deer-fish-and-game-association' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Red Deer Fish and Game Association',
      'red-deer-fish-and-game-association',
      v_city_id, v_province_id,
      'RDFGA Grounds', NULL,
      52.2681, -113.8111,
      '403-588-5108', 'archery@reddeerfishandgame.com', 'https://reddeerfishandgame.com/',
      'Multipurpose outdoor range with dedicated archery sections.',
      'Outdoor', NULL,
      '{"/alberta listing images/red_deer_fish_and_game_association.jpg"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Red Deer Fish and Game Association';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/red_deer_fish_and_game_association.jpg"}',
      post_content = 'Multipurpose outdoor range with dedicated archery sections.',
      post_tags = 'Outdoor', facility_type = 'Outdoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Red Deer Fish and Game Association';
  END IF;

  -- =====================================================
  -- RANGE 25: Taber Archers & Bowhunters
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Taber' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Taber', 'taber', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'taber-archers--bowhunters' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Taber Archers & Bowhunters',
      'taber-archers--bowhunters',
      v_city_id, v_province_id,
      'MD of Taber Shooting Complex', 'T0K 0B0',
      49.7833, -112.1500,
      '403-382-5717', 'secretary@shoot-taber.org', 'https://taberrange-md.com/',
      '3D archery range within Western Canada''s largest shooting complex.',
      'Outdoor, 3D', NULL,
      '{"/alberta listing images/taber_archers_bowhunters.png"}',
      100, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Taber Archers & Bowhunters';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/taber_archers_bowhunters.png"}',
      post_content = '3D archery range within Western Canada''s largest shooting complex.',
      post_tags = 'Outdoor, 3D', range_length_yards = 100, facility_type = 'Outdoor',
      has_3d_course = true, membership_required = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Taber Archers & Bowhunters';
  END IF;

  -- =====================================================
  -- RANGE 26: Medicine Hat SAAMIS Archers
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Medicine Hat' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Medicine Hat', 'medicine-hat', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'medicine-hat-saamis-archers' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Medicine Hat SAAMIS Archers',
      'medicine-hat-saamis-archers',
      v_city_id, v_province_id,
      'Medicine Hat Archery Club', 'T1A 0H1',
      50.0411, -110.6778,
      '403-581-1656', 'medhatarcheryclub@gmail.com', 'https://medicinehatarchery.ca/',
      'Club with 24/7 indoor range access and a 100yd outdoor range.',
      'Indoor, Outdoor', '24/7 Members',
      '{"/alberta listing images/medicine_hat_saamis_archers.jpg"}',
      100, NULL, 'Both',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Medicine Hat SAAMIS Archers';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/medicine_hat_saamis_archers.jpg"}',
      post_content = 'Club with 24/7 indoor range access and a 100yd outdoor range.',
      post_tags = 'Indoor, Outdoor', business_hours = '24/7 Members',
      range_length_yards = 100, facility_type = 'Both',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Medicine Hat SAAMIS Archers';
  END IF;

  -- =====================================================
  -- RANGE 27: Dragon Flight Archery
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Cremona' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Cremona', 'cremona', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'dragon-flight-archery' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Dragon Flight Archery',
      'dragon-flight-archery',
      v_city_id, v_province_id,
      'Range Rd 55', 'T0M 0R0',
      51.5439, -114.4886,
      '403-637-0266', 'dragonflightarchery@protonmail.com', 'https://dragonflightarchery.co/',
      'FOOTHILLS based range offering lessons and rentals near Water Valley.',
      'Indoor/Outdoor', NULL,
      '{"/alberta listing images/dragon_flight_archery.jpg"}',
      NULL, NULL, 'Both',
      false, false, false,
      false, NULL, NULL,
      true, true, NULL,
      'All', 'Foothills', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Dragon Flight Archery';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/dragon_flight_archery.jpg"}',
      post_content = 'FOOTHILLS based range offering lessons and rentals near Water Valley.',
      post_tags = 'Indoor/Outdoor', facility_type = 'Both',
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Dragon Flight Archery';
  END IF;

  -- =====================================================
  -- RANGE 28: Picture Butte Archery Association
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Picture Butte' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Picture Butte', 'picture-butte', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'picture-butte-archery-association' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Picture Butte Archery Association',
      'picture-butte-archery-association',
      v_city_id, v_province_id,
      'Coulees Near Picture Butte', NULL,
      49.8833, -112.7833,
      '403-332-1375', 'thebushman40@yahoo.ca', 'https://pbfishandgame.com/',
      'Outdoor 3D shoots held in the coulees; Junior and Senior programs.',
      'Outdoor, 3D', NULL,
      '{"/alberta listing images/picture_butte_archery_association.jpg"}',
      NULL, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Coulees', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Picture Butte Archery Association';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/picture_butte_archery_association.jpg"}',
      post_content = 'Outdoor 3D shoots held in the coulees; Junior and Senior programs.',
      post_tags = 'Outdoor, 3D', facility_type = 'Outdoor',
      has_3d_course = true, membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Picture Butte Archery Association';
  END IF;

  -- =====================================================
  -- RANGE 29: Ponoka & Area Archers Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Ponoka' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Ponoka', 'ponoka', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'ponoka--area-archers-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Ponoka & Area Archers Club',
      'ponoka--area-archers-club',
      v_city_id, v_province_id,
      'Moose Hall, 5000 AB-2A', 'T4J 1R7',
      52.6667, -113.5833,
      '403-783-1723', 'paacmemberfees@gmail.com', 'https://ponokaandareaarchersclub.ca/',
      'Indoor range located at the Moose Hall on the east side of Hwy 2A.',
      'Indoor', NULL,
      '{"/alberta listing images/ponoka_area_archers_club.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Ponoka & Area Archers Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/ponoka_area_archers_club.jpg"}',
      post_content = 'Indoor range located at the Moose Hall on the east side of Hwy 2A.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Ponoka & Area Archers Club';
  END IF;

  -- =====================================================
  -- RANGE 30: Foothills Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Millarville' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Millarville', 'millarville', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'foothills-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Foothills Archery Club',
      'foothills-archery-club',
      v_city_id, v_province_id,
      'Millarville Area', NULL,
      50.7333, -114.2833,
      NULL, 'fac.directors@gmail.com', 'https://foothillarcheryclub.wordpress.com/',
      'Non-profit volunteer club with range activities in the Millarville area.',
      'Outdoor, 3D', NULL,
      '{"/alberta listing images/foothills_archery_club.jpg"}',
      NULL, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Foothills Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/foothills_archery_club.jpg"}',
      post_content = 'Non-profit volunteer club with range activities in the Millarville area.',
      post_tags = 'Outdoor, 3D', facility_type = 'Outdoor',
      has_3d_course = true, membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Foothills Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 31: Outlaw Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Vauxhall' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Vauxhall', 'vauxhall', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'outlaw-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Outlaw Archery Club',
      'outlaw-archery-club',
      v_city_id, v_province_id,
      'Vauxhall/Taber Area', NULL,
      50.0500, -112.1333,
      NULL, NULL, 'https://archeryalberta.ca/',
      'Active club hosting events at regional shooting complexes.',
      'Indoor/Outdoor', NULL,
      '{"/alberta listing images/outlaw_archery_club.png"}',
      NULL, NULL, 'Both',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Outlaw Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/outlaw_archery_club.png"}',
      post_content = 'Active club hosting events at regional shooting complexes.',
      post_tags = 'Indoor/Outdoor', facility_type = 'Both',
      has_3d_course = true, membership_required = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Outlaw Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 32: Carbon Archery Range
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Carbon' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Carbon', 'carbon', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'carbon-archery-range' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Carbon Archery Range',
      'carbon-archery-range',
      v_city_id, v_province_id,
      '237 Caradoc Ave', 'T0M 0L0',
      51.4878, -113.1553,
      '403-823-1963', 'carboncurlingclub.ag@gmail.com', 'https://kneehillcounty.com/',
      'Indoor range located in the Carbon Curling Rink facility.',
      'Indoor', NULL,
      '{"/alberta listing images/carbon_archery_range.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Carbon Archery Range';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/carbon_archery_range.jpg"}',
      post_content = 'Indoor range located in the Carbon Curling Rink facility.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Carbon Archery Range';
  END IF;

  -- =====================================================
  -- RANGE 33: Garrison Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'garrison-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Garrison Archery Club',
      'garrison-archery-club',
      v_city_id, v_province_id,
      'CFB Edmonton Range', 'T0A 2H0',
      53.6667, -113.4667,
      NULL, 'Darryl.Poisson@forces.gc.ca', 'https://cfmws.ca/',
      'Archery club for military and civilians at the Garrison range.',
      'Outdoor', NULL,
      '{"/alberta listing images/garrison_archery_club.jpg"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'CFB Base', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Garrison Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/garrison_archery_club.jpg"}',
      post_content = 'Archery club for military and civilians at the Garrison range.',
      post_tags = 'Outdoor', facility_type = 'Outdoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Garrison Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 34: Archer VS Archer
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'archer-vs-archer' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Archer VS Archer',
      'archer-vs-archer',
      v_city_id, v_province_id,
      '8128 46 St NW', 'T6B 2M8',
      53.5181, -113.4150,
      '587-594-5733', 'admin@archervsarcher.ca', 'https://archervsarcher.ca/',
      'Dedicated combat archery and tag facility in Edmonton.',
      'Indoor, Combat', NULL,
      '{"/alberta listing images/archer_vs_archer.png"}',
      NULL, NULL, 'Indoor',
      false, false, false,
      false, NULL, NULL,
      true, true, NULL,
      'Tag Only', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Archer VS Archer';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/archer_vs_archer.png"}',
      post_content = 'Dedicated combat archery and tag facility in Edmonton.',
      post_tags = 'Indoor, Combat', facility_type = 'Indoor',
      equipment_rental_available = true, lessons_available = true,
      bow_types_allowed = 'Tag Only', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Archer VS Archer';
  END IF;

  -- =====================================================
  -- RANGE 35: Cabela's Edmonton North
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'cabelas-edmonton-north' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Cabela''s Edmonton North',
      'cabelas-edmonton-north',
      v_city_id, v_province_id,
      '15320 37 St NW', 'T5Y 0S5',
      53.6167, -113.3833,
      '780-670-6100', 'info@cabelas.ca', 'https://cabelas.ca/',
      'Commercial retail location with indoor archery test lanes.',
      'Indoor, Retail', NULL,
      '{"/alberta listing images/cabelas_edmonton_north.jpg"}',
      20, NULL, 'Indoor',
      true, false, false,
      false, NULL, NULL,
      true, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Cabela''s Edmonton North';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/cabelas_edmonton_north.jpg"}',
      post_content = 'Commercial retail location with indoor archery test lanes.',
      post_tags = 'Indoor, Retail', range_length_yards = 20, facility_type = 'Indoor',
      has_pro_shop = true, equipment_rental_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Cabela''s Edmonton North';
  END IF;

  -- =====================================================
  -- RANGE 36: Cabela's Edmonton South
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'cabelas-edmonton-south' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Cabela''s Edmonton South',
      'cabelas-edmonton-south',
      v_city_id, v_province_id,
      '6150 Currents Dr NW', 'T6W 0L7',
      53.4333, -113.6000,
      '780-628-9200', 'info@cabelas.ca', 'https://cabelas.ca/',
      'Commercial retail location with indoor archery test lanes.',
      'Indoor, Retail', NULL,
      '{"/alberta listing images/cabelas_edmonton_south.jpg"}',
      20, NULL, 'Indoor',
      true, false, false,
      false, NULL, NULL,
      true, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Cabela''s Edmonton South';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/cabelas_edmonton_south.jpg"}',
      post_content = 'Commercial retail location with indoor archery test lanes.',
      post_tags = 'Indoor, Retail', range_length_yards = 20, facility_type = 'Indoor',
      has_pro_shop = true, equipment_rental_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Cabela''s Edmonton South';
  END IF;

  -- =====================================================
  -- RANGE 37: Lodgepole Outdoors
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'lodgepole-outdoors' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Lodgepole Outdoors',
      'lodgepole-outdoors',
      v_city_id, v_province_id,
      '7601 91 Ave NW', 'T6C 1P7',
      53.5267, -113.4333,
      NULL, NULL, 'https://lodgepoleoutdoors.com/',
      'Local outdoors shop and guide service with archery facilities.',
      'Indoor/Outdoor', NULL,
      '{"/alberta listing images/lodgepole_outdoors.jpg"}',
      NULL, NULL, 'Both',
      true, false, false,
      false, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Lodgepole Outdoors';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/lodgepole_outdoors.jpg"}',
      post_content = 'Local outdoors shop and guide service with archery facilities.',
      post_tags = 'Indoor/Outdoor', facility_type = 'Both',
      has_pro_shop = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Lodgepole Outdoors';
  END IF;

  -- =====================================================
  -- RANGE 38: CHAS Genesee Range
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Edmonton' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'chas-genesee-range' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'CHAS Genesee Range',
      'chas-genesee-range',
      v_city_id, v_province_id,
      'Genesee Range', NULL,
      53.3333, -114.2833,
      NULL, 'archery@historical-arms.com', 'https://chascollectors.com/',
      'Large shooting range complex with dedicated archery lanes.',
      'Outdoor', NULL,
      '{"/alberta listing images/chas_genesee_range.jpg"}',
      NULL, NULL, 'Outdoor',
      false, false, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: CHAS Genesee Range';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/chas_genesee_range.jpg"}',
      post_content = 'Large shooting range complex with dedicated archery lanes.',
      post_tags = 'Outdoor', facility_type = 'Outdoor',
      membership_required = true, bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: CHAS Genesee Range';
  END IF;

  -- =====================================================
  -- RANGE 39: Lethbridge Bowbenders Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Lethbridge' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'lethbridge-bowbenders-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Lethbridge Bowbenders Archery Club',
      'lethbridge-bowbenders-archery-club',
      v_city_id, v_province_id,
      '545 30 St N', NULL,
      49.7042, -112.8080,
      NULL, 'lethbridgebowbenders@gmail.com', 'https://lethbridgebowbenders.com/',
      'Dedicated target archery club with indoor facility and junior programs.',
      'Indoor', NULL,
      '{"/alberta listing images/lethbridge_bowbenders_archery_club.jpg"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Lethbridge Bowbenders Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/lethbridge_bowbenders_archery_club.jpg"}',
      post_content = 'Dedicated target archery club with indoor facility and junior programs.',
      post_tags = 'Indoor', range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Lethbridge Bowbenders Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 40: Lethbridge Fish and Game Association
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Lethbridge' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'lethbridge-fish-and-game-association' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Lethbridge Fish and Game Association',
      'lethbridge-fish-and-game-association',
      v_city_id, v_province_id,
      'Peenaquim Park', NULL,
      49.7214, -112.8354,
      '403-382-0914', 'range.operator@lfga.club', 'https://lethbridgefishandgame.ca/',
      'Large outdoor sports facility with dedicated target and 3D archery ranges.',
      'Outdoor, 3D', 'Member access',
      '{"/alberta listing images/lethbridge_fish_and_game_association.jpg"}',
      NULL, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Lethbridge Fish and Game Association';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/lethbridge_fish_and_game_association.jpg"}',
      post_content = 'Large outdoor sports facility with dedicated target and 3D archery ranges.',
      post_tags = 'Outdoor, 3D', business_hours = 'Member access',
      facility_type = 'Outdoor', has_3d_course = true, membership_required = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Lethbridge Fish and Game Association';
  END IF;

  -- =====================================================
  -- RANGE 41: Heisler Archery Club
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Heisler' AND province_id = v_province_id;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (name, slug, province_id) VALUES ('Heisler', 'heisler', v_province_id) RETURNING id INTO v_city_id;
  END IF;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'heisler-archery-club' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Heisler Archery Club',
      'heisler-archery-club',
      v_city_id, v_province_id,
      '302 Haultain Ave', NULL,
      52.6414, -112.2086,
      '780-678-0599', NULL, 'https://villageofheisler.ca/',
      'Seasonal indoor range (Nov-Apr) located in the Heisler Bowling Alley.',
      'Indoor', 'Seasonal',
      '{"/alberta listing images/heisler_archery_club.png"}',
      20, NULL, 'Indoor',
      false, false, false,
      true, NULL, NULL,
      false, true, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Heisler Archery Club';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/heisler_archery_club.png"}',
      post_content = 'Seasonal indoor range (Nov-Apr) located in the Heisler Bowling Alley.',
      post_tags = 'Indoor', business_hours = 'Seasonal',
      range_length_yards = 20, facility_type = 'Indoor',
      membership_required = true, lessons_available = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Heisler Archery Club';
  END IF;

  -- =====================================================
  -- RANGE 42: Taber Shooting Foundation Archery
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Taber' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'taber-shooting-foundation-archery' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Taber Shooting Foundation Archery',
      'taber-shooting-foundation-archery',
      v_city_id, v_province_id,
      '104083 HWY 864', 'T0K 0B0',
      49.7833, -112.1500,
      '403-634-4958', 'secretary@shoot-taber.org', 'https://taberrange-md.com/',
      'Comprehensive 3D archery range within the MD of Taber Sport Shooting Complex.',
      'Outdoor, 3D', NULL,
      '{"/alberta listing images/taber_shooting_foundation_archery.png"}',
      100, NULL, 'Outdoor',
      false, true, false,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Standard', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Taber Shooting Foundation Archery';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/taber_shooting_foundation_archery.png"}',
      post_content = 'Comprehensive 3D archery range within the MD of Taber Sport Shooting Complex.',
      post_tags = 'Outdoor, 3D', range_length_yards = 100, facility_type = 'Outdoor',
      has_3d_course = true, membership_required = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Taber Shooting Foundation Archery';
  END IF;

  -- =====================================================
  -- RANGE 43: Calgary Archers Outdoor Range
  -- =====================================================
  SELECT id INTO v_city_id FROM cities WHERE name ILIKE 'Cochrane' AND province_id = v_province_id;

  SELECT id INTO v_range_id FROM ranges WHERE slug = 'calgary-archers-outdoor-range' AND city_id = v_city_id;
  IF v_range_id IS NULL THEN
    INSERT INTO ranges (
      name, slug, city_id, province_id, address, postal_code,
      latitude, longitude, phone_number, email, website,
      post_content, post_tags, business_hours,
      post_images,
      range_length_yards, number_of_lanes, facility_type,
      has_pro_shop, has_3d_course, has_field_course,
      membership_required, membership_price_adult, drop_in_price,
      equipment_rental_available, lessons_available, lesson_price_range,
      bow_types_allowed, accessibility, parking_available,
      is_featured, is_claimed, is_premium, subscription_tier
    ) VALUES (
      'Calgary Archers Outdoor Range',
      'calgary-archers-outdoor-range',
      v_city_id, v_province_id,
      '15m North of Cochrane', NULL,
      51.3500, -114.4833,
      '403-259-5505', 'info@calgaryarchers.com', 'https://calgaryarchers.com/',
      'New outdoor range facility featuring FITA, Field, and 3D courses.',
      'Outdoor, FITA, 3D', NULL,
      '{"/alberta listing images/calgary_archers_outdoor_range.png"}',
      90, 24, 'Outdoor',
      false, true, true,
      true, NULL, NULL,
      false, false, NULL,
      'All', 'Rural', true,
      false, false, false, 'free'
    );
    RAISE NOTICE 'Inserted: Calgary Archers Outdoor Range';
  ELSE
    UPDATE ranges SET
      post_images = '{"/alberta listing images/calgary_archers_outdoor_range.png"}',
      post_content = 'New outdoor range facility featuring FITA, Field, and 3D courses.',
      post_tags = 'Outdoor, FITA, 3D',
      range_length_yards = 90, number_of_lanes = 24, facility_type = 'Outdoor',
      has_3d_course = true, has_field_course = true, membership_required = true,
      bow_types_allowed = 'All', parking_available = true
    WHERE id = v_range_id;
    RAISE NOTICE 'Updated: Calgary Archers Outdoor Range';
  END IF;

  -- =====================================================
  -- DEPLOYMENT COMPLETE
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'ALBERTA DEPLOYMENT COMPLETE - 43 RANGES PROCESSED';
  RAISE NOTICE '=====================================================';

END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT
  r.name,
  r.slug,
  c.name as city,
  r.facility_type,
  r.post_images,
  r.post_tags,
  r.range_length_yards,
  r.bow_types_allowed,
  r.has_3d_course,
  r.has_pro_shop,
  r.membership_required,
  r.phone_number,
  r.email,
  r.website
FROM ranges r
LEFT JOIN cities c ON r.city_id = c.id
LEFT JOIN provinces p ON r.province_id = p.id
WHERE p.slug = 'alberta'
ORDER BY r.name;
