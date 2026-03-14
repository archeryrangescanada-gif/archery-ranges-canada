require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += char;
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
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
        rows.push(row);
    }
    return rows;
}

const seoDescriptions = {
    'archery-nt-aboriginal-sports-circle-nwt': "Archery NT, operated through the Aboriginal Sports Circle of the NWT, is the territorial sport organization coordinating archery programs across all 33 communities in the Northwest Territories. Based at the Cooper Building on 49 Street in Yellowknife, Archery NT offers camps, competitions, and coaching development to grow the sport throughout Canada's North. President Christopher MacDonald leads initiatives connecting Indigenous and northern youth with archery. Whether you are in Yellowknife, Hay River, Inuvik, or any NWT community, Archery NT is your connection to organized archery programming, territorial championships, and coaching resources across the Northwest Territories.",

    'yellowknife-shooting-club---archery-section': "Yellowknife Shooting Club's Archery Section at 522 Range Lake Road offers both indoor and outdoor archery facilities in the NWT capital. The outdoor range is located in the sand pits west of the airport south of Highway 3, while indoor shooting provides year-round practice through the long northern winter. Tuesday night silhouette archery sessions offer a fun competitive format for members. Membership is required, and all bow types including recurve, compound, and longbow are welcome. Serving Yellowknife, Dettah, Ndilo, and the North Slave region, contact Cheuk Pang for membership details and seasonal shooting schedules.",

    'yk-archery': "YK Archery at 111 Moyle Drive is Yellowknife's dedicated archery pro shop and indoor shooting facility, serving archers across the entire Northwest Territories. We offer archery supplies, equipment sales, and custom bow builds tailored to northern conditions and hunting needs. Our indoor range provides comfortable year-round shooting when outdoor temperatures drop well below freezing. Equipment rental and lessons are available for beginners of all ages. Partnering with Archery NT and Yellowknife Shooting Club, YK Archery is the NWT's one-stop destination for gear, instruction, and indoor practice. Visit ykarchery.com for product selection and booking.",

    'fort-smith-archery-club': "Fort Smith Archery Club is a community archery club in Fort Smith, the gateway town to Wood Buffalo National Park in the southern Northwest Territories. Our club proudly hosted the 2024 NWT Archery Championship, establishing Fort Smith as a key venue on the territorial competitive archery circuit. Coach and President Cynthia White leads our growing membership with lessons and development programs. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Fort Smith, Fort Resolution, and the South Slave region near the Alberta border, contact cyn.white03@hotmail.ca for membership details and schedules.",

    'hay-river-archery-club': "Hay River Archery Club operates through the Hay River Shooting Club, providing archery facilities in the South Slave region of the Northwest Territories. Our club hosted Arctic Winter Games archery trials in January 2020 and the 2024 NWT Archery Championship, making Hay River a proven venue for territorial competition. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located on the southern shore of Great Slave Lake, we serve Hay River, Enterprise, Kakisa, and surrounding South Slave communities. Contact pjyriley35@gmail.com for membership information, shooting schedules, and upcoming competitive archery events.",

    'inuvik-youth-centre---archery-program': "Inuvik Youth Centre's archery program brings the sport to one of Canada's northernmost communities at latitude 68 degrees in the Beaufort Delta region of the Northwest Territories. Thursday evening sessions run from 7 to 9 PM as part of the Beaufort Boys, Delta Girls, and broader community programming. All equipment is provided and no membership is required, making this the most accessible archery program in the western Arctic. Serving Inuvik, Tuktoyaktuk, Aklavik, and surrounding Beaufort Delta communities, this program introduces northern youth to archery. Contact the Youth Centre at 867-777-8636 or visit inuvikyouthcentre.ca for schedules."
};

async function main() {
    const csvText = fs.readFileSync('nwt_archery_ranges_enriched.csv', 'utf-8');
    const records = parseCSV(csvText);
    console.log(`Found ${records.length} ranges in CSV`);

    // Get or create NWT province
    let { data: province } = await supabase.from('provinces').select('id').eq('slug', 'northwest-territories').single();
    if (!province) {
        const { data: newProv } = await supabase.from('provinces').insert({
            name: 'Northwest Territories',
            slug: 'northwest-territories',
            abbreviation: 'NT'
        }).select('id').single();
        province = newProv;
        console.log('Created province: Northwest Territories');
    } else {
        console.log('Province exists: Northwest Territories (id=' + province.id + ')');
    }

    let deployed = 0, skipped = 0;

    for (const record of records) {
        const rangeName = record.post_title.trim();
        if (!rangeName) continue;

        const slug = slugify(rangeName);
        const cityName = record.post_city.trim() || 'Yellowknife';

        // Check if range already exists
        const { data: existing } = await supabase.from('ranges').select('id').eq('slug', slug).single();
        if (existing) {
            console.log('SKIP (exists): ' + rangeName);
            skipped++;
            continue;
        }

        // Get or create city
        let { data: city } = await supabase.from('cities').select('id').eq('name', cityName).eq('province_id', province.id).single();
        if (!city) {
            const { data: newCity } = await supabase.from('cities').insert({
                name: cityName,
                slug: slugify(cityName),
                province_id: province.id
            }).select('id').single();
            city = newCity;
            console.log('  Created city: ' + cityName);
        }

        const description = seoDescriptions[slug] || record.post_content || '';
        const amenities = record.post_tags ? record.post_tags.split(';').map(t => t.trim()).filter(Boolean) : [];

        const rangeData = {
            name: rangeName,
            slug: slug,
            address: record.post_address || null,
            city_id: city.id,
            province_id: province.id,
            postal_code: record.post_zip || null,
            latitude: parseFloat(record.post_latitude) || null,
            longitude: parseFloat(record.post_longitude) || null,
            phone_number: record.phone || null,
            email: record.email || null,
            website: record.website || null,
            description: description,
            amenities: amenities,
            business_hours: record.business_hours || null,
            post_images: ['/filler-image.jpg'],
            facility_type: record.facility_type || null,
            has_pro_shop: record.has_pro_shop === 'Yes',
            has_3d_course: record.has_3d_course === 'Yes',
            has_field_course: record.has_field_course === 'Yes',
            membership_required: record.membership_required === 'Yes',
            membership_price_adult: record.membership_price_adult || null,
            drop_in_price: record.drop_in_price || null,
            equipment_rental_available: record.equipment_rental_available === 'Yes',
            lessons_available: record.lessons_available === 'Yes',
            lesson_price_range: record.lesson_price_range || null,
            bow_types_allowed: record.bow_types_allowed || null,
            parking_available: record.parking_available === 'Yes',
            is_featured: false,
        };

        const { error } = await supabase.from('ranges').insert(rangeData);
        if (error) {
            console.log('ERROR: ' + rangeName + ': ' + error.message);
        } else {
            console.log('OK: ' + rangeName + ' (' + slug + ')');
            deployed++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Deployed: ' + deployed + ' | Skipped: ' + skipped + ' | Total in CSV: ' + records.length);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
