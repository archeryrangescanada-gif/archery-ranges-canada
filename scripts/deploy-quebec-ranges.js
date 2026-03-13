require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

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

async function main() {
    console.log("Starting Quebec archery ranges deployment...");

    const csvContent = fs.readFileSync('quebec_archery_ranges_enriched.csv', 'utf-8');
    const records = parseCSV(csvContent);

    const provinceName = 'Quebec';
    const provinceSlug = 'quebec';

    let provinceId;
    const { data: existingProvince } = await supabase
        .from('provinces')
        .select('id')
        .eq('slug', provinceSlug)
        .single();

    if (existingProvince) {
        provinceId = existingProvince.id;
    } else {
        const { data: newProvince, error: provErr } = await supabase
            .from('provinces')
            .insert({ name: provinceName, slug: provinceSlug })
            .select('id')
            .single();
        if (provErr) throw provErr;
        provinceId = newProvince.id;
    }

    const citiesMap = new Map();

    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
        const rangeName = record.post_title;
        if (!rangeName) continue;

        try {
            // Check if already exists
            const { data: existingRange } = await supabase
                .from('ranges')
                .select('id')
                .ilike('name', rangeName)
                .single();

            if (existingRange) {
                console.log(`Skipping ${rangeName} - already exists.`);
                continue;
            }

            // Handle city
            const cityName = record.post_city || 'Unknown';
            let cityId = citiesMap.get(cityName);

            if (!cityId) {
                const citySlug = slugify(cityName);
                const { data: existingCity } = await supabase
                    .from('cities')
                    .select('id')
                    .eq('province_id', provinceId)
                    .eq('slug', citySlug)
                    .single();

                if (existingCity) {
                    cityId = existingCity.id;
                } else {
                    const { data: newCity, error: cityErr } = await supabase
                        .from('cities')
                        .insert({ name: cityName, slug: citySlug, province_id: provinceId })
                        .select('id')
                        .single();
                    if (cityErr) throw cityErr;
                    cityId = newCity.id;
                }
                citiesMap.set(cityName, cityId);
            }

            // Build range data
            const rangeData = {
                name: rangeName,
                slug: slugify(rangeName),
                address: record.post_address !== 'N/A' ? record.post_address : null,
                city_id: cityId,
                province_id: provinceId,
                postal_code: record.post_zip !== 'N/A' ? record.post_zip : null,
                latitude: record.post_latitude !== 'N/A' ? parseFloat(record.post_latitude) : null,
                longitude: record.post_longitude !== 'N/A' ? parseFloat(record.post_longitude) : null,
                phone_number: record.phone !== 'N/A' ? record.phone : null,
                email: record.email !== 'N/A' ? record.email : null,
                website: record.website !== 'N/A' ? record.website : null,
                description: record.post_content !== 'N/A' ? record.post_content : null,
                amenities: record.post_tags ? record.post_tags.split(';').map(t => t.trim()) : [],
                business_hours: record.business_hours !== 'N/A' ? record.business_hours : null,
                post_images: ['/filler-image.jpg'],
                range_length_yards: record.range_length_yards !== 'N/A' ? parseFloat(record.range_length_yards) : null,
                number_of_lanes: record.number_of_lanes !== 'N/A' ? parseFloat(record.number_of_lanes) : null,
                facility_type: record.facility_type !== 'N/A' ? (record.facility_type.toLowerCase() === 'both' ? 'Both' : (record.facility_type.toLowerCase().includes('in') ? 'Indoor' : 'Outdoor')) : 'Both',
                has_pro_shop: record.has_pro_shop === 'Yes',
                has_3d_course: record.has_3d_course === 'Yes',
                has_field_course: record.has_field_course === 'Yes',
                membership_required: record.membership_required === 'Yes',
                membership_price_adult: record.membership_price_adult !== 'N/A' ? parseFloat(record.membership_price_adult.replace(/[^0-9.]/g, '')) : null,
                drop_in_price: record.drop_in_price !== 'N/A' ? parseFloat(record.drop_in_price.replace(/[^0-9.]/g, '')) : null,
                equipment_rental_available: record.equipment_rental_available === 'Yes',
                lessons_available: record.lessons_available === 'Yes',
                lesson_price_range: record.lesson_price_range !== 'N/A' ? record.lesson_price_range : null,
                bow_types_allowed: record.bow_types_allowed !== 'N/A' ? record.bow_types_allowed : null,
                parking_available: record.parking_available === 'Yes',
                is_featured: false,
            };

            const { error: insertErr } = await supabase.from('ranges').insert(rangeData);
            if (insertErr) throw insertErr;

            console.log(`Inserted: ${rangeName}`);
            successCount++;

        } catch (err) {
            console.error(`Error inserting ${rangeName}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\nDeployment Complete!`);
    console.log(`Successfully added: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

main();
