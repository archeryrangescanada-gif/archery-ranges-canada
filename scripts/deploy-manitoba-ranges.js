/**
 * Deploy Manitoba Archery Ranges to Supabase
 * 
 * Reads manitoba_archery_ranges_enriched.csv from the project root,
 * parses each row, and inserts them as live listings via the Supabase service role client.
 * 
 * Usage: node scripts/deploy-manitoba-ranges.js
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
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
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
    const num = parseFloat(val);
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
    console.log('🏹 Manitoba Ranges Deployment');
    console.log('──────────────────────────────────────────');

    // 1. Read CSV
    const csvPath = path.join(__dirname, '..', 'manitoba_archery_ranges_enriched.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ manitoba_archery_ranges_enriched.csv not found in project root');
        process.exit(1);
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const ranges = parseCSV(csvText);
    console.log(`📊 Found ${ranges.length} ranges in CSV\n`);

    // 2. Get or create province
    let provinceId = null;
    const { data: existingProv } = await supabase
        .from('provinces')
        .select('id')
        .ilike('name', 'Manitoba')
        .single();

    if (existingProv) {
        provinceId = existingProv.id;
        console.log(`✅ Province "Manitoba" already exists (ID: ${provinceId})`);
    } else {
        const { data: newProv, error: provErr } = await supabase
            .from('provinces')
            .insert({ name: 'Manitoba', slug: 'manitoba' })
            .select('id')
            .single();

        if (provErr) {
            console.error('❌ Failed to create Manitoba province:', provErr.message);
            process.exit(1);
        }
        provinceId = newProv.id;
        console.log(`✅ Created province "Manitoba" (ID: ${provinceId})`);
    }

    // 3. Pre-fetch existing cities for Manitoba
    const { data: existingCities } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', provinceId);

    const cityMap = new Map();
    if (existingCities) {
        existingCities.forEach(c => cityMap.set(c.name.toLowerCase(), c.id));
    }

    // 4. Import each range
    let success = 0;
    let failed = 0;
    let skipped = 0;
    const errors = [];

    for (const row of ranges) {
        const name = row.post_title?.trim() || row.name?.trim() || row[Object.keys(row)[0]]?.trim();
        if (!name) {
            console.log('  ⚠️  Skipping row with no name');
            failed++;
            continue;
        }

        try {
            // Check if range already exists
            const { data: existingRange } = await supabase
                .from('ranges')
                .select('id')
                .eq('province_id', provinceId)
                .ilike('name', name)
                .single();

            if (existingRange) {
                console.log(`  ⏩ Skipping ${name} (already exists)`);
                skipped++;
                continue;
            }

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
                        .insert({
                            name: cityName,
                            slug: generateSlug(cityName),
                            province_id: provinceId
                        })
                        .select('id')
                        .single();

                    if (!cityErr && newCity) {
                        cityId = newCity.id;
                        cityMap.set(cityKey, cityId);
                        console.log(`  🏙️  Created city: ${cityName}`);
                    } else if (cityErr) {
                        console.log(`  ⚠️  Failed to create city ${cityName}: ${cityErr.message}`);
                    }
                }
            }

            // Parse amenities
            const tagString = row.post_tags || '';
            let amenities = [];
            if (tagString) {
                amenities = tagString.split(';').map(t => t.trim()).filter(Boolean);
            }

            // Ensure filler image
            const images = row.post_images ? [row.post_images] : ['/filler-image.jpg'];

            // Build the insert object
            const rangeData = {
                name: name,
                slug: generateSlug(name),
                city_id: cityId,
                province_id: provinceId,
                address: row.post_address || null,
                postal_code: row.post_zip || null,
                latitude: toNumber(row.post_latitude) || toNumber(row.latitude) || null,
                longitude: toNumber(row.post_longitude) || toNumber(row.longitude) || null,
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
                amenities: amenities,
                post_images: images,
                is_featured: false,
            };

            const { error: insertErr } = await supabase
                .from('ranges')
                .insert(rangeData);

            if (insertErr) {
                console.log(`  ❌ ${name}: ${insertErr.message}`);
                failed++;
                errors.push(`${name}: ${insertErr.message}`);
            } else {
                console.log(`  ✅ ${name}`);
                success++;
            }
        } catch (e) {
            console.error(`  ❌ ${name}: ${e.message}`);
            failed++;
            errors.push(`${name}: ${e.message}`);
        }
    }

    console.log('\n──────────────────────────────────────────');
    console.log(`📊 Results: ${success} imported, ${skipped} skipped, ${failed} failed`);

    // Final count
    const { count } = await supabase.from('ranges').select('*', { count: 'exact', head: true }).eq('province_id', provinceId);
    console.log(`📊 Total Manitoba ranges in DB now: ${count}`);

    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(e => console.log(`  - ${e}`));
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
