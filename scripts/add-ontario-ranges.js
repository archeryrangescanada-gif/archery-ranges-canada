/**
 * Import 5 missing Ontario ranges from the CSV into Supabase.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => obj[h.trim()] = (values[idx] || '').trim());
        rows.push(obj);
    }
    return { headers, rows };
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

function generateSlug(name) {
    return name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function parseFloat2(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}

const MISSING_NAMES = [
    "Gobble 'n Grunt Archery & Outfitting",
    "Port Colborne District Conservation Club",
    "Archers Arena",
    "Durham Archers",
    "Woods North Archery",
];

async function main() {
    console.log('🏹 Importing 5 missing Ontario ranges');
    console.log('═'.repeat(50));

    // Read CSV
    const csvPath = path.join(__dirname, '..', 'Ontario_Archery_Ranges_Enriched_Complete.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const { headers, rows } = parseCSV(csvText);

    console.log(`📄 CSV: ${rows.length} rows, headers: ${headers.slice(0, 5).join(', ')}...`);
    console.log(`📋 All headers: ${headers.join(' | ')}`);

    // Get Ontario province
    const { data: province } = await supabase.from('provinces').select('id').ilike('name', 'Ontario').single();
    const provinceId = province.id;

    // Filter CSV to just missing ranges  
    const missingRows = rows.filter(r => {
        const name = (r.post_title || r[headers[0]] || '').trim();
        return MISSING_NAMES.some(mn => mn.toLowerCase() === name.toLowerCase());
    });

    console.log(`\n🔍 Found ${missingRows.length} matching CSV rows\n`);

    let importedCount = 0;

    for (const row of missingRows) {
        const name = (row.post_title || row[headers[0]] || '').trim();
        const cityName = (row.post_city || '').trim();

        console.log(`── ${name} (${cityName}) ──`);

        // Find or create city
        let cityId = null;
        if (cityName) {
            const { data: existingCity } = await supabase
                .from('cities')
                .select('id')
                .ilike('name', cityName)
                .single();

            if (existingCity) {
                cityId = existingCity.id;
            } else {
                const { data: newCity } = await supabase
                    .from('cities')
                    .insert({ name: cityName, slug: generateSlug(cityName), province_id: provinceId })
                    .select('id')
                    .single();
                if (newCity) {
                    cityId = newCity.id;
                    console.log(`  🏙️ Created city: ${cityName}`);
                }
            }
        }

        // Check if already exists
        const { data: existing } = await supabase
            .from('ranges')
            .select('id')
            .eq('province_id', provinceId)
            .ilike('name', name)
            .single();

        if (existing) {
            console.log(`  ⚠️ Already exists, skipping`);
            continue;
        }

        // Parse row data
        const rangeData = {
            name: name,
            slug: generateSlug(name),
            address: row.post_address || null,
            postal_code: row.post_postal_code || row.postal_code || null,
            latitude: parseFloat2(row.latitude || row.lat),
            longitude: parseFloat2(row.longitude || row.lon || row.lng),
            phone_number: row.phone_number || row.phone || null,
            email: row.email || null,
            website: row.website || null,
            description: row.description || row.seo_description || null,
            business_hours: row.business_hours || null,
            facility_type: row.facility_type || null,
            has_pro_shop: (row.has_pro_shop || '').toLowerCase() === 'true' || (row.has_pro_shop || '').toLowerCase() === 'yes',
            has_3d_course: (row.has_3d_course || '').toLowerCase() === 'true' || (row.has_3d_course || '').toLowerCase() === 'yes',
            has_field_course: (row.has_field_course || '').toLowerCase() === 'true' || (row.has_field_course || '').toLowerCase() === 'yes',
            membership_required: (row.membership_required || '').toLowerCase() === 'true' || (row.membership_required || '').toLowerCase() === 'yes',
            lessons_available: (row.lessons_available || '').toLowerCase() === 'true' || (row.lessons_available || '').toLowerCase() === 'yes',
            equipment_rental_available: (row.equipment_rental_available || '').toLowerCase() === 'true' || (row.equipment_rental_available || '').toLowerCase() === 'yes',
            parking_available: (row.parking_available || '').toLowerCase() === 'true' || (row.parking_available || '').toLowerCase() === 'yes',
            bow_types_allowed: row.bow_types_allowed || null,
            number_of_lanes: parseInt(row.number_of_lanes) || null,
            province_id: provinceId,
            city_id: cityId,
            post_images: ['/filler-image.jpg'],
        };

        const { error } = await supabase.from('ranges').insert(rangeData);

        if (error) {
            console.log(`  ❌ Error: ${error.message}`);
        } else {
            console.log(`  ✅ Imported: ${name}`);
            importedCount++;
        }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`📊 Imported ${importedCount} of ${MISSING_NAMES.length} missing ranges`);

    // Final count
    const { count } = await supabase.from('ranges').select('*', { count: 'exact', head: true }).eq('province_id', provinceId);
    console.log(`📊 Ontario total now: ${count}`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
