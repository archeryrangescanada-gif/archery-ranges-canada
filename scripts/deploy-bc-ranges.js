/**
 * Deploy British Columbia Archery Ranges to Supabase
 *
 * Updates existing ranges, inserts new ones, and deletes removed ranges.
 * 
 * Usage: node scripts/deploy-bc-ranges.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── CSV Parser ────────────────────────────────────────────────────────
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
    // Use the first non-empty line as headers (stripping BOM if present)
    let headerLine = lines[0];
    if (headerLine.charCodeAt(0) === 0xFEFF) {
        headerLine = headerLine.slice(1);
    }
    const headers = parseCSVLine(headerLine);
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

// ─── Helpers ─────────────────────────────────────────────────────────────
function toBool(val) {
    if (!val) return false;
    const s = val.toString().toLowerCase().trim();
    return s === 'yes' || s === 'true' || s === '1' || s === 'y';
}

function toNumber(val) {
    if (!val || val.toString().trim() === '') return null;
    const num = parseFloat(val.toString().replace(/[^0-9.-]+/g, ''));
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

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
    console.log('🌲 British Columbia Ranges Deployment');
    console.log('──────────────────────────────────────────');

    // 1. Read CSV
    const csvPath = path.join(__dirname, '..', 'british_columbia_archery_ranges_enriched.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ british_columbia_archery_ranges_enriched.csv not found');
        process.exit(1);
    }

    const csvText = fs.readFileSync(csvPath, 'utf8');
    const enrichedRanges = parseCSV(csvText);
    console.log(`📊 Found ${enrichedRanges.length} ranges in enriched CSV`);

    // 2. Get Province ID
    const { data: provinceData, error: provErr } = await supabase
        .from('provinces')
        .select('id')
        .ilike('name', 'British Columbia')
        .single();

    if (provErr || !provinceData) {
        console.error('❌ Failed to find British Columbia in provinces table:', provErr?.message);
        process.exit(1);
    }
    const provinceId = provinceData.id;
    console.log(`✅ Province "British Columbia" ID: ${provinceId}`);

    // Pre-fetch cities
    const { data: existingCities } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', provinceId);

    const cityMap = new Map();
    if (existingCities) {
        existingCities.forEach(c => cityMap.set(c.name.toLowerCase(), c.id));
    }

    // 3. Get existing ranges from DB
    const { data: dbRanges, error: dbErr } = await supabase
        .from('ranges')
        .select('*')
        .eq('province_id', provinceId);

    if (dbErr) {
        console.error('❌ Failed to fetch existing ranges from DB:', dbErr.message);
        process.exit(1);
    }

    // Create maps for easy lookup
    const dbRangesByName = new Map();
    dbRanges.forEach(r => dbRangesByName.set(r.name.toLowerCase().trim(), r));

    const csvNames = new Set();

    let updated = 0, inserted = 0, deleted = 0, skipped = 0;
    const errors = [];

    // ─── INSERT OR UPDATE ────────────────────────────────────────────────
    for (const row of enrichedRanges) {
        // Find the name column (handles varying column names)
        const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name') || k === 'post_title') || Object.keys(row)[0];
        const name = row[nameKey]?.trim();

        if (!name) {
            console.log('  ⚠️  Skipping row with no name');
            errors.push('Skipped row with empty name');
            continue;
        }

        csvNames.add(name.toLowerCase());

        try {
            // Find or create city
            let cityId = null;
            const cityName = row.post_city?.trim() || row.City?.trim() || row.city?.trim() || 'Unknown';
            if (cityName && cityName !== 'Unknown') {
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
                    }
                }
            }

            // Amenities from tags
            const tagString = row.post_tags || '';
            const amenitiesArray = tagString ? tagString.split(';').map(t => t.trim()).filter(Boolean) : [];

            // Images logic
            // We use filler image for all as requested or fallback if empty
            let heroImageStr = '/filler-image.jpg';
            let thumbImageStr = '/filler-image.jpg';

            // Build range data
            const rangeData = {
                name: name,
                slug: generateSlug(name),
                province_id: provinceId,
                city_id: cityId,
                description: row.post_content || row.Description || null,
                phone: row.phone || row.Phone || null,
                email: row.email || row.Email || null,
                website: row.website || row.Website || null,
                address: row.post_address || row.Address || null,
                latitude: toNumber(row.post_latitude || row.latitude || row.Latitude),
                longitude: toNumber(row.post_longitude || row.longitude || row.Longitude),
                facility_type: toFacilityType(row.facility_type || row['Facility Type']),
                number_of_lanes: row.number_of_lanes ? toNumber(row.number_of_lanes) : null,
                range_length_yards: row.range_length_yards ? toNumber(row.range_length_yards) : null,
                has_3d_course: toBool(row.has_3d_course || row['3D Course']),
                has_field_course: toBool(row.has_field_course),
                equipment_rental_available: toBool(row.equipment_rental_available),
                lessons_available: toBool(row.lessons_available) || (row.lesson_price_range ? true : false),
                lesson_price_range: row.lesson_price_range || null,
                has_pro_shop: toBool(row.has_pro_shop),
                bow_types_allowed: row.bow_types_allowed || null,
                membership_required: toBool(row.membership_required) || (row.membership_price_adult ? true : false),
                membership_price_adult: row.membership_price_adult ? toNumber(row.membership_price_adult) : null,
                drop_in_price: row.drop_in_price ? toNumber(row.drop_in_price) : null,
                parking_available: toBool(row.parking_available),
                business_hours: row.business_hours || null,
                amenities: amenitiesArray,
                post_images: [heroImageStr],
            };

            const existingRange = dbRangesByName.get(name.toLowerCase());

            if (existingRange) {
                // UPDATE existing
                const { error: updateErr } = await supabase
                    .from('ranges')
                    .update(rangeData)
                    .eq('id', existingRange.id);

                if (updateErr) {
                    console.log(`  ❌ Failed to update ${name}: ${updateErr.message}`);
                    errors.push(`Update ${name}: ${updateErr.message}`);
                } else {
                    console.log(`  ✅ Updated ${name}`);
                    updated++;
                }
            } else {
                const { error: insertErr } = await supabase
                    .from('ranges')
                    .insert(rangeData);

                if (insertErr) {
                    console.log(`  ❌ Failed to insert ${name}: ${insertErr.message}`);
                    errors.push(`Insert ${name}: ${insertErr.message}`);
                } else {
                    console.log(`  ✅ Inserted ${name}`);
                    inserted++;
                }
            }
        } catch (e) {
            console.error(`  ❌ Error processing ${name}: ${e.message}`);
            errors.push(`System Error ${name}: ${e.message}`);
        }
    }

    // ─── DELETE ──────────────────────────────────────────────────────────
    // Delete ranges that are in the database but no longer in the CSV
    for (const dbRange of dbRanges) {
        if (!csvNames.has(dbRange.name.toLowerCase().trim())) {
            const { error: delErr } = await supabase
                .from('ranges')
                .delete()
                .eq('id', dbRange.id);

            if (delErr) {
                console.log(`  ❌ Failed to delete ${dbRange.name}: ${delErr.message}`);
                errors.push(`Delete ${dbRange.name}: ${delErr.message}`);
            } else {
                console.log(`  🗑️ Deleted ${dbRange.name}`);
                deleted++;
            }
        }
    }

    console.log('\n──────────────────────────────────────────');
    console.log(`📊 Results: ${inserted} inserted, ${updated} updated, ${deleted} deleted`);

    if (errors.length > 0) {
        console.log('\n⚠️ Errors:');
        errors.forEach(e => console.log(`  - ${e}`));
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
