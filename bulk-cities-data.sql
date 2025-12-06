-- Insert major cities across Canadian provinces
-- This adds 100+ cities to populate the directory

-- Ontario Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Toronto', 'toronto', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Ottawa', 'ottawa', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Mississauga', 'mississauga', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Brampton', 'brampton', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Hamilton', 'hamilton', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('London', 'london', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Markham', 'markham', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Vaughan', 'vaughan', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Kitchener', 'kitchener', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Windsor', 'windsor', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Richmond Hill', 'richmond-hill', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Burlington', 'burlington', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Oakville', 'oakville', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Oshawa', 'oshawa', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Barrie', 'barrie', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('St. Catharines', 'st-catharines', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Cambridge', 'cambridge', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Waterloo', 'waterloo', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Guelph', 'guelph', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Kingston', 'kingston', (SELECT id FROM provinces WHERE slug = 'ontario'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- British Columbia Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Vancouver', 'vancouver', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Surrey', 'surrey', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Burnaby', 'burnaby', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Richmond', 'richmond', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Abbotsford', 'abbotsford', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Coquitlam', 'coquitlam', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Kelowna', 'kelowna', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Victoria', 'victoria', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Langley', 'langley', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Saanich', 'saanich', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Delta', 'delta', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Kamloops', 'kamloops', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Nanaimo', 'nanaimo', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('New Westminster', 'new-westminster', (SELECT id FROM provinces WHERE slug = 'british-columbia')),
  ('Prince George', 'prince-george', (SELECT id FROM provinces WHERE slug = 'british-columbia'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Alberta Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Calgary', 'calgary', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Edmonton', 'edmonton', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Red Deer', 'red-deer', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Lethbridge', 'lethbridge', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('St. Albert', 'st-albert', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Medicine Hat', 'medicine-hat', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Grande Prairie', 'grande-prairie', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Airdrie', 'airdrie', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Spruce Grove', 'spruce-grove', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Okotoks', 'okotoks', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Fort McMurray', 'fort-mcmurray', (SELECT id FROM provinces WHERE slug = 'alberta')),
  ('Leduc', 'leduc', (SELECT id FROM provinces WHERE slug = 'alberta'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Quebec Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Montreal', 'montreal', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Quebec City', 'quebec-city', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Laval', 'laval', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Gatineau', 'gatineau', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Longueuil', 'longueuil', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Sherbrooke', 'sherbrooke', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Saguenay', 'saguenay', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Levis', 'levis', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Trois-Rivieres', 'trois-rivieres', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Terrebonne', 'terrebonne', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Saint-Jean-sur-Richelieu', 'saint-jean-sur-richelieu', (SELECT id FROM provinces WHERE slug = 'quebec')),
  ('Repentigny', 'repentigny', (SELECT id FROM provinces WHERE slug = 'quebec'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Manitoba Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Winnipeg', 'winnipeg', (SELECT id FROM provinces WHERE slug = 'manitoba')),
  ('Brandon', 'brandon', (SELECT id FROM provinces WHERE slug = 'manitoba')),
  ('Steinbach', 'steinbach', (SELECT id FROM provinces WHERE slug = 'manitoba')),
  ('Thompson', 'thompson', (SELECT id FROM provinces WHERE slug = 'manitoba')),
  ('Portage la Prairie', 'portage-la-prairie', (SELECT id FROM provinces WHERE slug = 'manitoba')),
  ('Winkler', 'winkler', (SELECT id FROM provinces WHERE slug = 'manitoba')),
  ('Selkirk', 'selkirk', (SELECT id FROM provinces WHERE slug = 'manitoba'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Saskatchewan Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Saskatoon', 'saskatoon', (SELECT id FROM provinces WHERE slug = 'saskatchewan')),
  ('Regina', 'regina', (SELECT id FROM provinces WHERE slug = 'saskatchewan')),
  ('Prince Albert', 'prince-albert', (SELECT id FROM provinces WHERE slug = 'saskatchewan')),
  ('Moose Jaw', 'moose-jaw', (SELECT id FROM provinces WHERE slug = 'saskatchewan')),
  ('Swift Current', 'swift-current', (SELECT id FROM provinces WHERE slug = 'saskatchewan')),
  ('Yorkton', 'yorkton', (SELECT id FROM provinces WHERE slug = 'saskatchewan')),
  ('North Battleford', 'north-battleford', (SELECT id FROM provinces WHERE slug = 'saskatchewan'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Nova Scotia Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Halifax', 'halifax', (SELECT id FROM provinces WHERE slug = 'nova-scotia')),
  ('Dartmouth', 'dartmouth', (SELECT id FROM provinces WHERE slug = 'nova-scotia')),
  ('Sydney', 'sydney', (SELECT id FROM provinces WHERE slug = 'nova-scotia')),
  ('Truro', 'truro', (SELECT id FROM provinces WHERE slug = 'nova-scotia')),
  ('New Glasgow', 'new-glasgow', (SELECT id FROM provinces WHERE slug = 'nova-scotia')),
  ('Glace Bay', 'glace-bay', (SELECT id FROM provinces WHERE slug = 'nova-scotia'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- New Brunswick Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Moncton', 'moncton', (SELECT id FROM provinces WHERE slug = 'new-brunswick')),
  ('Saint John', 'saint-john', (SELECT id FROM provinces WHERE slug = 'new-brunswick')),
  ('Fredericton', 'fredericton', (SELECT id FROM provinces WHERE slug = 'new-brunswick')),
  ('Dieppe', 'dieppe', (SELECT id FROM provinces WHERE slug = 'new-brunswick')),
  ('Miramichi', 'miramichi', (SELECT id FROM provinces WHERE slug = 'new-brunswick')),
  ('Bathurst', 'bathurst', (SELECT id FROM provinces WHERE slug = 'new-brunswick'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Newfoundland and Labrador Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('St. Johns', 'st-johns', (SELECT id FROM provinces WHERE slug = 'newfoundland-and-labrador')),
  ('Mount Pearl', 'mount-pearl', (SELECT id FROM provinces WHERE slug = 'newfoundland-and-labrador')),
  ('Corner Brook', 'corner-brook', (SELECT id FROM provinces WHERE slug = 'newfoundland-and-labrador')),
  ('Conception Bay South', 'conception-bay-south', (SELECT id FROM provinces WHERE slug = 'newfoundland-and-labrador')),
  ('Paradise', 'paradise', (SELECT id FROM provinces WHERE slug = 'newfoundland-and-labrador')),
  ('Grand Falls-Windsor', 'grand-falls-windsor', (SELECT id FROM provinces WHERE slug = 'newfoundland-and-labrador'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Prince Edward Island Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Charlottetown', 'charlottetown', (SELECT id FROM provinces WHERE slug = 'prince-edward-island')),
  ('Summerside', 'summerside', (SELECT id FROM provinces WHERE slug = 'prince-edward-island')),
  ('Stratford', 'stratford', (SELECT id FROM provinces WHERE slug = 'prince-edward-island')),
  ('Cornwall', 'cornwall', (SELECT id FROM provinces WHERE slug = 'prince-edward-island'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Northwest Territories Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Yellowknife', 'yellowknife', (SELECT id FROM provinces WHERE slug = 'northwest-territories')),
  ('Hay River', 'hay-river', (SELECT id FROM provinces WHERE slug = 'northwest-territories')),
  ('Inuvik', 'inuvik', (SELECT id FROM provinces WHERE slug = 'northwest-territories')),
  ('Fort Smith', 'fort-smith', (SELECT id FROM provinces WHERE slug = 'northwest-territories'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Yukon Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Whitehorse', 'whitehorse', (SELECT id FROM provinces WHERE slug = 'yukon')),
  ('Dawson City', 'dawson-city', (SELECT id FROM provinces WHERE slug = 'yukon')),
  ('Watson Lake', 'watson-lake', (SELECT id FROM provinces WHERE slug = 'yukon'))
ON CONFLICT (slug, province_id) DO NOTHING;

-- Nunavut Cities
INSERT INTO cities (name, slug, province_id) VALUES
  ('Iqaluit', 'iqaluit', (SELECT id FROM provinces WHERE slug = 'nunavut')),
  ('Rankin Inlet', 'rankin-inlet', (SELECT id FROM provinces WHERE slug = 'nunavut')),
  ('Arviat', 'arviat', (SELECT id FROM provinces WHERE slug = 'nunavut')),
  ('Cambridge Bay', 'cambridge-bay', (SELECT id FROM provinces WHERE slug = 'nunavut'))
ON CONFLICT (slug, province_id) DO NOTHING;
