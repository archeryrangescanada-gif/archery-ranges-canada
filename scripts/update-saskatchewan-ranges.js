/**
 * Update Saskatchewan Archery Ranges in Supabase
 * 
 * Reads saskatchewan_ranges_final.csv from the project root, parses each row,
 * and updates them as live listings via the Supabase service role client, matching by name.
 * 
 * Usage: node scripts/update-saskatchewan-ranges.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── CSV Parser (handles quoted fields with commas) ──────────────────
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

// ─── Boolean/Number helpers ──────────────────────────────────────────
function toBool(val) {
    if (!val) return false;
    return ['yes', 'true', '1'].includes(val.toString().toLowerCase().trim());
}

function toNumber(val) {
    if (!val || val.toString().trim() === '') return null;
    let v = val.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(v);
    return isNaN(num) ? null : num;
}

function toFacilityType(val) {
    if (!val) return null;
    const v = val.trim().toLowerCase();
    if (v.includes('indoor') && v.includes('outdoor')) return 'Both';
    if (v === 'both') return 'Both';
    if (v === 'indoor') return 'Indoor';
    if (v === 'outdoor') return 'Outdoor';
    return val.trim();
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
    console.log('🏹 Saskatchewan Ranges Update (Upsert)');
    console.log('──────────────────────────────────────');

    // 1. Read CSV
    const csvPath = path.join(__dirname, '..', 'saskatchewan_ranges_final.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ saskatchewan_ranges_final.csv not found in project root');
        process.exit(1);
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const ranges = parseCSV(csvText);
    console.log(`📊 Found ${ranges.length} ranges in CSV\n`);

    // 2. Get province
    let provinceId = null;
    const { data: existingProv } = await supabase
        .from('provinces')
        .select('id')
        .ilike('name', 'Saskatchewan')
        .single();

    if (existingProv) {
        provinceId = existingProv.id;
        console.log(`✅ Province "Saskatchewan" exists (ID: ${provinceId})`);
    } else {
        console.error('❌ Province "Saskatchewan" not found! Run initial deploy first.');
        process.exit(1);
    }

    // 3. Pre-fetch existing cities
    const { data: existingCities } = await supabase
        .from('cities')
        .select('id, name');

    const cityMap = new Map();
    if (existingCities) {
        existingCities.forEach(c => cityMap.set(c.name.toLowerCase(), c.id));
    }

    // 4. Pre-fetch existing ranges for this province to match by slug
    const { data: existingRanges } = await supabase
        .from('ranges')
        .select('id, slug')
        .eq('province_id', provinceId);

    const rangeSlugMap = new Map();
    if (existingRanges) {
        existingRanges.forEach(r => rangeSlugMap.set(r.slug, r.id));
    }

    // 5. Update/Insert each range
    let updated = 0;
    let inserted = 0;
    let failed = 0;
    const errors = [];

    for (const row of ranges) {
        const name = row.post_title?.trim();
        if (!name) {
            console.log('  ⚠️  Skipping row with no post_title');
            failed++;
            continue;
        }

        try {
            // Find or create city
            let cityId = null;
            const cityName = row.post_city?.trim();
            if (cityName) {
                const cityKey = cityName.toLowerCase();
                if (cityMap.has(cityKey)) {
                    cityId = cityMap.get(cityKey);
                } else {
                    const { data: newCity, error: cityErr } = await supabase
                        .from('cities')
                        .insert({ name: cityName })
                        .select('id')
                        .single();

                    if (!cityErr && newCity) {
                        cityId = newCity.id;
                        cityMap.set(cityKey, cityId);
                        console.log(`  🏙️  Created city: ${cityName}`);
                    }
                }
            }

            const slug = generateSlug(name);

            // Build the data object
            const rangeData = {
                name: name,
                slug: slug,
                city_id: cityId,
                province_id: provinceId,
                address: row.post_address || '',
                postal_code: row.post_zip || null,
                latitude: toNumber(row.post_latitude),
                longitude: toNumber(row.post_longitude),
                phone_number: row.phone || null,
                email: row.email || null,
                website: row.website || null,
                description: row.post_content || null,
                business_hours: row.business_hours || null,
                range_length_yards: toNumber(row.range_length_yards),
                number_of_lanes: toNumber(row.number_of_lanes),
                facility_type: toFacilityType(row.facility_type),
                has_pro_shop: toBool(row.has_pro_shop),
                has_3d_course: toBool(row.has_3d_course),
                has_field_course: toBool(row.has_field_course),
                membership_required: toBool(row.membership_required),
                membership_price_adult: toNumber(row.membership_price_adult),
                drop_in_price: toNumber(row.drop_in_price),
                equipment_rental_available: toBool(row.equipment_rental_available),
                lessons_available: toBool(row.lessons_available),
                lesson_price_range: row.lesson_price_range || null,
                bow_types_allowed: row.bow_types_allowed || null,
                parking_available: toBool(row.parking_available),
                is_featured: false,
            };

            const existingRangeId = rangeSlugMap.get(slug);

            if (existingRangeId) {
                // Update
                const { error: updateErr } = await supabase
                    .from('ranges')
                    .update(rangeData)
                    .eq('id', existingRangeId);

                if (updateErr) {
                    console.log(`  ❌ ${name} (update): ${updateErr.message}`);
                    failed++;
                    errors.push(`${name} (update): ${updateErr.message}`);
                } else {
                    console.log(`  🔄 ${name} (updated)`);
                    updated++;
                }
            } else {
                // Insert
                const { error: insertErr } = await supabase
                    .from('ranges')
                    .insert(rangeData);

                if (insertErr) {
                    console.log(`  ❌ ${name} (insert): ${insertErr.message}`);
                    failed++;
                    errors.push(`${name} (insert): ${insertErr.message}`);
                } else {
                    console.log(`  ✅ ${name} (inserted)`);
                    inserted++;
                }
            }
        } catch (e) {
            console.error(`  ❌ ${name}: ${e.message}`);
            failed++;
            errors.push(`${name}: ${e.message}`);
        }
    }

    console.log('\n──────────────────────────────────────');
    console.log(`📊 Results: ${updated} updated, ${inserted} inserted, ${failed} failed`);
    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(e => console.log(`  - ${e}`));
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
