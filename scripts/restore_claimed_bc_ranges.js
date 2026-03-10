require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We need to restore specific claimed ranges from the older CSV
const TARGET_RANGES = ["Pacific Archery Academy", "Victoria Bowmen"];

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++;
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
    let headerLine = lines[0];
    if (headerLine.charCodeAt(0) === 0xFEFF) headerLine = headerLine.slice(1);
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

async function main() {
    console.log('🔄 Restoring Claimed BC Ranges');
    console.log('──────────────────────────────────────────');

    const csvPath = path.join(__dirname, '..', 'BC_Archery_Ranges_Complete - BC Archery Ranges (2).csv');
    if (!fs.existsSync(csvPath)) {
        return console.error('❌ Old CSV not found');
    }

    const csvText = fs.readFileSync(csvPath, 'utf8');
    const oldRanges = parseCSV(csvText);

    const { data: provinceData } = await supabase.from('provinces').select('id').ilike('name', 'British Columbia').single();
    if (!provinceData) return console.error('❌ Province not found');
    const provinceId = provinceData.id;

    for (const rangeName of TARGET_RANGES) {
        // Find in old CSV
        const row = oldRanges.find(r => r.name?.trim().toLowerCase() === rangeName.toLowerCase() || r['Name']?.trim().toLowerCase() === rangeName.toLowerCase() || r['Range Name']?.trim().toLowerCase() === rangeName.toLowerCase() || r['post_title']?.trim().toLowerCase() === rangeName.toLowerCase());

        if (!row) {
            console.error(`❌ Could not find ${rangeName} in old CSV`);
            continue;
        }

        // Parse amenities
        const tagString = row.post_tags || '';
        const amenitiesArray = tagString ? tagString.split(';').map(t => t.trim()).filter(Boolean) : [];

        // Build range data based on the old schema mapping
        const rangeData = {
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
        };

        // Preserve post_images if it exists in the old CSV
        if (row.post_images) {
            rangeData.post_images = [row.post_images];
        }

        const { error: updateErr } = await supabase
            .from('ranges')
            .update(rangeData)
            .eq('province_id', provinceId)
            .ilike('name', rangeName);

        if (updateErr) {
            console.error(`  ❌ Failed to restore ${rangeName}: ${updateErr.message}`);
        } else {
            console.log(`  ✅ Restored ${rangeName} from backup`);
        }
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
});
