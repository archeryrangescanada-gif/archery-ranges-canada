-- Sample archery ranges for testing
-- This adds 12 sample ranges across different cities

-- Toronto Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Toronto Archery Hub',
    'toronto-archery-hub',
    '123 Archery Lane, Toronto, ON M5H 2N2',
    '(416) 555-0100',
    'https://example.com',
    'Premier indoor and outdoor archery facility in the heart of Toronto. Offering lessons, equipment rentals, and competitive leagues for all skill levels.',
    (SELECT id FROM cities WHERE slug = 'toronto'),
    (SELECT id FROM provinces WHERE slug = 'ontario'),
    true
  ),
  (
    'Downtown Target Range',
    'downtown-target-range',
    '456 Bay Street, Toronto, ON M5J 2T3',
    '(416) 555-0101',
    'https://example.com',
    'Modern indoor archery range featuring 20 lanes with electronic scoring systems. Perfect for beginners and experienced archers.',
    (SELECT id FROM cities WHERE slug = 'toronto'),
    (SELECT id FROM provinces WHERE slug = 'ontario'),
    false
  )
ON CONFLICT (slug, city_id) DO NOTHING;

-- Vancouver Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Vancouver Island Archery',
    'vancouver-island-archery',
    '789 Pacific Boulevard, Vancouver, BC V6B 5E7',
    '(604) 555-0200',
    'https://example.com',
    'Beautiful outdoor 3D archery course with mountain views. Indoor facility available year-round with professional instruction.',
    (SELECT id FROM cities WHERE slug = 'vancouver'),
    (SELECT id FROM provinces WHERE slug = 'british-columbia'),
    true
  ),
  (
    'Coastal Bow Sports',
    'coastal-bow-sports',
    '321 Marine Drive, Vancouver, BC V7W 2R1',
    '(604) 555-0201',
    'https://example.com',
    'Family-friendly archery center offering traditional, compound, and crossbow experiences.',
    (SELECT id FROM cities WHERE slug = 'vancouver'),
    (SELECT id FROM provinces WHERE slug = 'british-columbia'),
    false
  )
ON CONFLICT (slug, city_id) DO NOTHING;

-- Calgary Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Calgary Archery Centre',
    'calgary-archery-centre',
    '555 17th Avenue SW, Calgary, AB T2S 0B1',
    '(403) 555-0300',
    'https://example.com',
    'Alberta''s largest indoor archery facility with 30 lanes, pro shop, and certified coaching programs.',
    (SELECT id FROM cities WHERE slug = 'calgary'),
    (SELECT id FROM provinces WHERE slug = 'alberta'),
    true
  ),
  (
    'Foothills Archery Range',
    'foothills-archery-range',
    '888 Crowchild Trail NW, Calgary, AB T3G 4J8',
    '(403) 555-0301',
    NULL,
    'Outdoor field archery range nestled in the foothills. Scenic 28-target course suitable for all levels.',
    (SELECT id FROM cities WHERE slug = 'calgary'),
    (SELECT id FROM provinces WHERE slug = 'alberta'),
    false
  )
ON CONFLICT (slug, city_id) DO NOTHING;

-- Montreal Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Montreal Archery Club',
    'montreal-archery-club',
    '1500 Rue Saint-Jacques, Montreal, QC H3C 4M8',
    '(514) 555-0400',
    'https://example.com',
    'Historic archery club established in 1962. Indoor and outdoor facilities with Olympic-standard equipment.',
    (SELECT id FROM cities WHERE slug = 'montreal'),
    (SELECT id FROM provinces WHERE slug = 'quebec'),
    false
  ),
  (
    'Plateau Archery Studio',
    'plateau-archery-studio',
    '3200 Avenue du Parc, Montreal, QC H2X 2H7',
    '(514) 555-0401',
    'https://example.com',
    'Boutique indoor archery studio offering personalized instruction and equipment fitting services.',
    (SELECT id FROM cities WHERE slug = 'montreal'),
    (SELECT id FROM provinces WHERE slug = 'quebec'),
    false
  )
ON CONFLICT (slug, city_id) DO NOTHING;

-- Ottawa Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Capital City Archery',
    'capital-city-archery',
    '2100 Bank Street, Ottawa, ON K1V 7Z4',
    '(613) 555-0500',
    'https://example.com',
    'Premier archery destination in Canada''s capital. Features include indoor range, outdoor 3D course, and full-service pro shop.',
    (SELECT id FROM cities WHERE slug = 'ottawa'),
    (SELECT id FROM provinces WHERE slug = 'ontario'),
    true
  )
ON CONFLICT (slug, city_id) DO NOTHING;

-- Winnipeg Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Prairie Archery Club',
    'prairie-archery-club',
    '1850 Portage Avenue, Winnipeg, MB R3J 0H1',
    '(204) 555-0600',
    'https://example.com',
    'Community-focused archery club with indoor winter range and outdoor summer facilities. Beginner-friendly programs available.',
    (SELECT id FROM cities WHERE slug = 'winnipeg'),
    (SELECT id FROM provinces WHERE slug = 'manitoba'),
    false
  )
ON CONFLICT (slug, city_id) DO NOTHING;

-- Halifax Ranges
INSERT INTO ranges (name, slug, address, phone_number, website, description, city_id, province_id, is_featured) VALUES
  (
    'Atlantic Archery Range',
    'atlantic-archery-range',
    '5670 Spring Garden Road, Halifax, NS B3J 1H6',
    '(902) 555-0700',
    'https://example.com',
    'Maritime''s premier archery facility offering traditional and modern archery experiences with ocean views.',
    (SELECT id FROM cities WHERE slug = 'halifax'),
    (SELECT id FROM provinces WHERE slug = 'nova-scotia'),
    false
  )
ON CONFLICT (slug, city_id) DO NOTHING;
