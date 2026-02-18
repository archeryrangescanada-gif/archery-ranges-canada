/**
 * Migration script: Update post_tags on ranges based on crawl analysis data.
 *
 * This reads the crawl_analysis.json from the crawl4ai project and matches
 * ranges by name to update their post_tags with category-relevant tags.
 *
 * Also sets boolean fields (lessons_available, has_3d_course, has_pro_shop,
 * equipment_rental_available) based on detected features.
 *
 * Usage: node scripts/update-category-tags.js [--dry-run]
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DRY_RUN = process.argv.includes('--dry-run');

// Load crawl analysis
const analysisPath = path.resolve(__dirname, '../../../crawl4ai-project/crawl_analysis.json');
if (!fs.existsSync(analysisPath)) {
  console.error('crawl_analysis.json not found at:', analysisPath);
  console.error('Expected location relative to this script: ../../crawl4ai-project/crawl_analysis.json');
  process.exit(1);
}
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

// Build a map: rangeName (lowered) -> { tags: Set, booleans: {} }
function buildFeatureMap() {
  const map = new Map();

  function getOrCreate(name) {
    const key = name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, { tags: new Set(), booleans: {} });
    }
    return map.get(key);
  }

  // Youth programs
  for (const entry of analysis.youth_programs || []) {
    const rec = getOrCreate(entry.name);
    for (const tag of entry.tags || []) rec.tags.add(tag);
    rec.tags.add('youth');
  }

  // Lessons & coaching
  for (const entry of analysis.lessons_coaching || []) {
    const rec = getOrCreate(entry.name);
    for (const tag of entry.tags || []) rec.tags.add(tag);
    rec.booleans.lessons_available = true;
  }

  // Birthday parties
  for (const entry of analysis.birthday_party || []) {
    const rec = getOrCreate(entry.name);
    for (const tag of entry.tags || []) rec.tags.add(tag);
    rec.tags.add('birthday');
    rec.tags.add('party');
  }

  // Competitions / 3D
  for (const entry of analysis.competitions || []) {
    const rec = getOrCreate(entry.name);
    for (const tag of entry.tags || []) rec.tags.add(tag);
    rec.booleans.has_3d_course = true;
  }

  // Pro shop / rental
  for (const entry of analysis.pro_shop_rental || []) {
    const rec = getOrCreate(entry.name);
    for (const tag of entry.tags || []) rec.tags.add(tag);
    if ((entry.tags || []).some(t => t.includes('shop') || t.includes('pro'))) {
      rec.booleans.has_pro_shop = true;
    }
    if ((entry.tags || []).some(t => t.includes('rental'))) {
      rec.booleans.equipment_rental_available = true;
    }
    // If only generic tags, set both
    if (!rec.booleans.has_pro_shop && !rec.booleans.equipment_rental_available) {
      rec.booleans.has_pro_shop = true;
      rec.booleans.equipment_rental_available = true;
    }
  }

  // Women's programs
  for (const entry of analysis.womens_programs || []) {
    const rec = getOrCreate(entry.name);
    for (const tag of entry.tags || []) rec.tags.add(tag);
    rec.tags.add('women');
  }

  return map;
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');

  const featureMap = buildFeatureMap();
  console.log(`Feature map built: ${featureMap.size} unique range names from crawl data\n`);

  // Fetch all ranges from DB
  const { data: ranges, error } = await supabase
    .from('ranges')
    .select('id, name, post_tags, lessons_available, has_3d_course, has_pro_shop, equipment_rental_available');

  if (error) {
    console.error('Error fetching ranges:', error);
    process.exit(1);
  }

  console.log(`Ranges in database: ${ranges.length}\n`);

  let matched = 0;
  let updated = 0;
  let skipped = 0;

  for (const range of ranges) {
    const key = range.name.toLowerCase().trim();
    const features = featureMap.get(key);

    if (!features) {
      skipped++;
      continue;
    }

    matched++;

    // Merge existing post_tags with new tags
    let existingTags = [];
    if (Array.isArray(range.post_tags)) {
      existingTags = range.post_tags;
    } else if (typeof range.post_tags === 'string') {
      const trimmed = range.post_tags.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const inner = trimmed.slice(1, -1);
        existingTags = inner ? inner.split(',').map(t => t.trim().replace(/^"|"$/g, '')).filter(Boolean) : [];
      } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try { existingTags = JSON.parse(trimmed); } catch { existingTags = []; }
      } else if (trimmed) {
        existingTags = [trimmed];
      }
    }

    const mergedTags = [...new Set([...existingTags, ...features.tags])]

    // Build update object
    const updateObj = { post_tags: mergedTags };
    if (features.booleans.lessons_available) updateObj.lessons_available = true;
    if (features.booleans.has_3d_course) updateObj.has_3d_course = true;
    if (features.booleans.has_pro_shop) updateObj.has_pro_shop = true;
    if (features.booleans.equipment_rental_available) updateObj.equipment_rental_available = true;

    // Check if anything actually changed
    const tagsChanged = JSON.stringify(mergedTags.sort()) !== JSON.stringify([...existingTags].sort());
    const booleansChanged = Object.entries(features.booleans).some(
      ([field, val]) => range[field] !== val
    );

    if (!tagsChanged && !booleansChanged) {
      console.log(`  [SKIP] "${range.name}" - no changes needed`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [DRY] "${range.name}"`);
      if (tagsChanged) console.log(`        tags: [${existingTags.join(', ')}] -> [${mergedTags.join(', ')}]`);
      if (booleansChanged) console.log(`        booleans:`, features.booleans);
    } else {
      const { error: updateError } = await supabase
        .from('ranges')
        .update(updateObj)
        .eq('id', range.id);

      if (updateError) {
        console.error(`  [ERROR] "${range.name}":`, updateError.message);
      } else {
        console.log(`  [OK] "${range.name}"`);
        updated++;
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total ranges in DB: ${ranges.length}`);
  console.log(`Matched by name:    ${matched}`);
  console.log(`Not matched:        ${skipped}`);
  console.log(`Updated:            ${DRY_RUN ? '(dry run)' : updated}`);
}

main().catch(console.error);
