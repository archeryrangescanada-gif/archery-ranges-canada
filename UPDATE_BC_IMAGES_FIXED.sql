-- =====================================================
-- UPDATE BC RANGE IMAGES - EXACT NAME MATCHING
-- =====================================================
-- Using exact name matches based on actual database values

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Armstrong District Fish & Game Assoc.jpg']
WHERE name = 'Armstrong District Fish & Game Assoc.';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Arrowsmith Archers Parksville-Qualicum Fish & Game.jpg']
WHERE name = 'Arrowsmith Archers / Parksville-Qualicum Fish & Game';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Big Horn Archery Club.jfif']
WHERE name = 'Big Horn Archery Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Boorman Archery.jpg']
WHERE name = 'Boorman Archery';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Bowsmith Archery.jpg']
WHERE name = 'Bowsmith Archery';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Bulkley Valley Bowmen.jpg']
WHERE name = 'Bulkley Valley Bowmen';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Burke Mountain Archers.jpg']
WHERE name = 'Burke Mountain Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/burnaby archers.jpg']
WHERE name = 'Burnaby Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Cariboo Archers.jpg']
WHERE name = 'Cariboo Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Chilliwack Fish and Game.jpg']
WHERE name = 'Chilliwack Fish and Game';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Courtenay & District Fish & Game Protective Assoc.jpg']
WHERE name = 'Courtenay & District Fish & Game Protective Assoc.';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Cowichan Bowmen.jpg']
WHERE name = 'Cowichan Bowmen';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Cranbrook Archery Club.jpg']
WHERE name = 'Cranbrook Archery Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Fernie Rod and Gun Club.jpg']
WHERE name = 'Fernie Rod and Gun Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Gum Ying Richmond Archery Club.jpg']
WHERE name = 'Gum Ying Richmond Archery Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Kamloops Target Sports Association - Bowbenders.jpg']
WHERE name = 'Kamloops Target Sports Association - Bowbenders';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Kelowna & District Fish & Game Club.jpg']
WHERE name = 'Kelowna & District Fish & Game Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Langley Rod & Gun Club.jpg']
WHERE name = 'Langley Rod & Gun Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Lykopis Archery.jpg']
WHERE name = 'Lykopis Archery';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Maple Ridge Archery Club.jpg']
WHERE name = 'Maple Ridge Archery Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Nelson & District Rod & Gun Club.jpg']
WHERE name = 'Nelson & District Rod & Gun Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/New Totem Archery - Outdoor Range.jpg']
WHERE name = 'New Totem Archery - Outdoor Range';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/New Totem Archery Club - Indoor Range.jpg']
WHERE name = 'New Totem Archery Club - Indoor Range';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/North Shore Archers.jpg']
WHERE name = 'North Shore Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Penticton Archery Club - Penticton Shooting Sports.jpg']
WHERE name = 'Penticton Archery Club / Penticton Shooting Sports';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Quesnel River Archers.jpg']
WHERE name = 'Quesnel River Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Richmond Rod and Gun Club - Indoor Archery Range.jpg']
WHERE name = 'Richmond Rod and Gun Club - Indoor Archery Range';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Ridgedale Rod and Gun Club.jpg']
WHERE name = 'Ridgedale Rod and Gun Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Sagittarius Archers  Abbotsford Fish and Game Club.jpg']
WHERE name = 'Sagittarius Archers / Abbotsford Fish and Game Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Semiahmoo Fish & Game Club - Semiahmoo Archers.jpg']
WHERE name = 'Semiahmoo Fish & Game Club / Semiahmoo Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Silvertip Archers - Indoor Range.jpg']
WHERE name = 'Silvertip Archers - Indoor Range';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Silvertip Archers - Outdoor.jpg']
WHERE name = 'Silvertip Archers - Outdoor';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/SOSA Archers - Southern Okanagan Sportsmen''s Association.jpg']
WHERE name = 'SOSA Archers - Southern Okanagan Sportsmen''s Association';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Squamish Valley Rod & Gun Club.jpg']
WHERE name = 'Squamish Valley Rod & Gun Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Sunshine Coast Rod and Gun Club.jpg']
WHERE name = 'Sunshine Coast Rod and Gun Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Terrace Whiskey-Jack Archers.jpg']
WHERE name = 'Terrace Whiskey-Jack Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/The Feathered Fletch Archery School & Range.jpg']
WHERE name = 'The Feathered Fletch Archery School & Range';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/UBC Archers.jpg']
WHERE name = 'UBC Archers';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/UVic Archery Club.jpg']
WHERE name = 'UVic Archery Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Vanderhoof Fish & Game Club.jpg']
WHERE name = 'Vanderhoof Fish & Game Club';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Victoria Bowmen.jpg']
WHERE name = 'Victoria Bowmen';

UPDATE ranges SET post_images = ARRAY['/british columbia listing images/West Kootenay Archers.jpg']
WHERE name = 'West Kootenay Archers';

-- Verify updates
SELECT name, post_images FROM ranges
WHERE province_id IN (SELECT id FROM provinces WHERE name = 'British Columbia')
AND post_images IS NOT NULL
ORDER BY name;
