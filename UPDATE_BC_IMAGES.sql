-- =====================================================
-- UPDATE BC RANGE IMAGES
-- =====================================================
-- This script updates the post_images for each BC archery range
-- Using ARRAY[] syntax for the TEXT[] column type

-- Armstrong District Fish & Game Assoc
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Armstrong District Fish & Game Assoc.jpg']
WHERE name ILIKE '%Armstrong District Fish%' OR name ILIKE '%Armstrong%Fish%Game%';

-- Burnaby Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/burnaby archers.jpg']
WHERE name ILIKE '%Burnaby Archers%';

-- New Totem Archery - Outdoor Range
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/New Totem Archery - Outdoor Range.jpg']
WHERE name ILIKE '%New Totem%Outdoor%';

-- Chilliwack Fish and Game
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Chilliwack Fish and Game.jpg']
WHERE name ILIKE '%Chilliwack Fish%Game%';

-- Sagittarius Archers / Abbotsford Fish and Game Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Sagittarius Archers  Abbotsford Fish and Game Club.jpg']
WHERE name ILIKE '%Sagittarius%' OR name ILIKE '%Abbotsford Fish%Game%';

-- Burke Mountain Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Burke Mountain Archers.jpg']
WHERE name ILIKE '%Burke Mountain%';

-- Courtenay & District Fish & Game Protective Assoc
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Courtenay & District Fish & Game Protective Assoc.jpg']
WHERE name ILIKE '%Courtenay%District%Fish%';

-- Cranbrook Archery Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Cranbrook Archery Club.jpg']
WHERE name ILIKE '%Cranbrook Archery%';

-- Cowichan Bowmen
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Cowichan Bowmen.jpg']
WHERE name ILIKE '%Cowichan Bowmen%';

-- Fernie Rod and Gun Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Fernie Rod and Gun Club.jpg']
WHERE name ILIKE '%Fernie Rod%Gun%';

-- New Totem Archery Club - Indoor Range
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/New Totem Archery Club - Indoor Range.jpg']
WHERE name ILIKE '%New Totem%Indoor%';

-- Kamloops Target Sports Association - Bowbenders
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Kamloops Target Sports Association - Bowbenders.jpg']
WHERE name ILIKE '%Kamloops%Bowbenders%' OR name ILIKE '%Kamloops Target Sports%';

-- The Feathered Fletch Archery School & Range
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/The Feathered Fletch Archery School & Range.jpg']
WHERE name ILIKE '%Feathered Fletch%';

-- Kelowna & District Fish & Game Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Kelowna & District Fish & Game Club.jpg']
WHERE name ILIKE '%Kelowna%District%Fish%';

-- Langley Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Langley Archers.jpg']
WHERE name ILIKE '%Langley Archers%';

-- Langley Rod & Gun Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Langley Rod & Gun Club.jpg']
WHERE name ILIKE '%Langley Rod%Gun%';

-- Maple Ridge Archery Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Maple Ridge Archery Club.jpg']
WHERE name ILIKE '%Maple Ridge Archery%';

-- Ridgedale Rod and Gun Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Ridgedale Rod and Gun Club.jpg']
WHERE name ILIKE '%Ridgedale%';

-- Nelson & District Rod & Gun Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Nelson & District Rod & Gun Club.jpg']
WHERE name ILIKE '%Nelson%District%Rod%Gun%';

-- Bowsmith Archery
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Bowsmith Archery.jpg']
WHERE name ILIKE '%Bowsmith%';

-- Boorman Archery
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Boorman Archery.jpg']
WHERE name ILIKE '%Boorman%';

-- North Shore Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/North Shore Archers.jpg']
WHERE name ILIKE '%North Shore Archers%';

-- SOSA Archers - Southern Okanagan Sportsmen's Association
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/SOSA Archers - Southern Okanagan Sportsmen''s Association.jpg']
WHERE name ILIKE '%SOSA%' OR name ILIKE '%Southern Okanagan Sportsmen%';

-- Silvertip Archers - Indoor Range
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Silvertip Archers - Indoor Range.jpg']
WHERE name ILIKE '%Silvertip%Indoor%';

-- Arrowsmith Archers Parksville-Qualicum Fish & Game
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Arrowsmith Archers Parksville-Qualicum Fish & Game.jpg']
WHERE name ILIKE '%Arrowsmith%' OR name ILIKE '%Parksville%Qualicum%';

-- Penticton Archery Club - Penticton Shooting Sports
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Penticton Archery Club - Penticton Shooting Sports.jpg']
WHERE name ILIKE '%Penticton Archery%' OR name ILIKE '%Penticton Shooting%';

-- Silvertip Archers - Outdoor
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Silvertip Archers - Outdoor.jpg']
WHERE name ILIKE '%Silvertip%Outdoor%';

-- Quesnel River Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Quesnel River Archers.jpg']
WHERE name ILIKE '%Quesnel River%';

-- Richmond Rod and Gun Club - Indoor Archery Range
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Richmond Rod and Gun Club - Indoor Archery Range.jpg']
WHERE name ILIKE '%Richmond Rod%Gun%';

-- Gum Ying Richmond Archery Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Gum Ying Richmond Archery Club.jpg']
WHERE name ILIKE '%Gum Ying%';

-- Squamish Valley Rod & Gun Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Squamish Valley Rod & Gun Club.jpg']
WHERE name ILIKE '%Squamish Valley%';

-- Bulkley Valley Bowmen
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Bulkley Valley Bowmen.jpg']
WHERE name ILIKE '%Bulkley Valley%';

-- Sunshine Coast Rod and Gun Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Sunshine Coast Rod and Gun Club.jpg']
WHERE name ILIKE '%Sunshine Coast%';

-- Terrace Whiskey-Jack Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Terrace Whiskey-Jack Archers.jpg']
WHERE name ILIKE '%Terrace Whiskey%' OR name ILIKE '%Whiskey-Jack%';

-- West Kootenay Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/West Kootenay Archers.jpg']
WHERE name ILIKE '%West Kootenay%';

-- UBC Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/UBC Archers.jpg']
WHERE name ILIKE '%UBC Archers%';

-- Semiahmoo Fish & Game Club - Semiahmoo Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Semiahmoo Fish & Game Club - Semiahmoo Archers.jpg']
WHERE name ILIKE '%Semiahmoo%';

-- Lykopis Archery
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Lykopis Archery.jpg']
WHERE name ILIKE '%Lykopis%';

-- Vanderhoof Fish & Game Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Vanderhoof Fish & Game Club.jpg']
WHERE name ILIKE '%Vanderhoof%';

-- Victoria Bowmen
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Victoria Bowmen.jpg']
WHERE name ILIKE '%Victoria Bowmen%';

-- UVic Archery Club
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/UVic Archery Club.jpg']
WHERE name ILIKE '%UVic%';

-- Cariboo Archers
UPDATE ranges SET post_images = ARRAY['/british columbia listing images/Cariboo Archers.jpg']
WHERE name ILIKE '%Cariboo Archers%';

-- Verify updates
SELECT name, post_images FROM ranges
WHERE province_id IN (SELECT id FROM provinces WHERE name = 'British Columbia')
AND post_images IS NOT NULL
ORDER BY name;

SELECT '✅ BC range images updated!' as status;
