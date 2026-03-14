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
    'whitehorse-archery-club': "Whitehorse Archery Club on Range Road is the Yukon's most comprehensive archery facility, offering an outdoor 3D course with multiple loops including Short Loop, Hunter's Loop, and Bridge Trail through boreal forest. Equipment loans are available for newcomers, and both competitive and recreational programs run throughout the season. Membership is open to all skill levels, and we welcome recurve, compound, and longbow archers. As the territory's largest and most established archery club, we serve Whitehorse, Porter Creek, Riverdale, and surrounding Yukon communities. Visit whitehorsearchery.com for schedules and join the North's premier archery destination.",

    'yukon-aboriginal-sport-circle---archery-program': "Yukon Aboriginal Sport Circle's Archery Program at 202D Strickland Street in Whitehorse delivers world-class indoor coaching with Olympic and Team Canada level athletes. Coach Sheila Madahbee represented Canada at the 2009 World 3D Championship, and Ilgin Kizilgunesler brings Turkish Olympic team experience to every session. Tuesday sessions run from 3:30 to 5:10 PM with preference given to Indigenous youth participants. Equipment and lessons are provided free of charge. Serving Whitehorse and all Yukon First Nations communities, this program offers a rare opportunity to train under internationally credentialed coaches in Canada's North.",

    'carcross-archery-club': "Carcross Archery Club serves the scenic village of Carcross and surrounding Southern Lakes region of the Yukon Territory. Our community-based club provides archery opportunities in one of the most stunning natural settings in northern Canada, nestled between Bennett Lake and Nares Lake on the historic Klondike Trail. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Carcross, Tagish, and the Southern Lakes area, our club connects local archers with the sport in a welcoming environment. Contact Geoff Ryshant at jamesbeaver@gmail.com for membership details and current shooting schedules.",

    'carmacks-archery-club': "Carmacks Archery Club serves the village of Carmacks and the central Yukon region along the legendary Klondike Highway. Our community club provides local archery access in this small northern community situated at the confluence of the Nordenskiold and Yukon Rivers. Membership is required, and we welcome all bow types including recurve, compound, and longbow. As the only archery club between Whitehorse and Dawson City, we serve Carmacks, Little Salmon Carmacks First Nation, and surrounding central Yukon communities. Contact John at carmacksarchery@gmail.com for membership information, seasonal shooting schedules, and details about joining our northern archery community.",

    'dawson-city-archery-club': "Dawson City Archery Club is one of the northernmost archery clubs in all of Canada, located in the historic Klondike Gold Rush town of Dawson City, Yukon. Our club provides archery opportunities at latitude 64 degrees north, where midnight sun summer shooting and northern wilderness surroundings create a truly unique experience. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Dawson City, the Klondike region, and Tr'ondek Hwech'in First Nation community, contact Emma TomTom for membership details and seasonal schedules. Join our Facebook group for the latest updates and events.",

    'bgc-yukon---archery-program': "BGC Yukon's free archery program at 306A Alexander Street in Whitehorse makes the sport accessible to all youth in the territory. Wednesday sessions run seasonally with all equipment provided at no cost, removing every barrier to participation. Part of the Boys and Girls Club of Yukon's comprehensive youth programming, this program introduces young archers to proper technique and safety fundamentals. No membership is required, and all bow types are welcome during supervised sessions. Serving Whitehorse families across all neighbourhoods, BGC Yukon is the territory's most accessible entry point for youth interested in discovering archery. Visit bgcyukon.com for seasonal schedules.",

    'haines-junction-archery': "Haines Junction Archery is a community archery group based in Haines Junction, gateway to Kluane National Park and Reserve in the southwestern Yukon. Our group provides archery access in this spectacular mountain community surrounded by the St. Elias Range and one of the largest non-polar icefields on Earth. Membership details are available through Shannon Maloney, and we welcome all bow types including recurve, compound, and longbow. Serving Haines Junction, Champagne and Aishihik First Nations, and the Kluane region, our group brings archery to one of the most breathtaking wilderness settings anywhere in Canada. Contact smaloney@cafn.ca to join.",

    'teslin-recreation---archery-program': "Teslin Recreation's archery program offers community-based archery sessions every Thursday in the village of Teslin on the Alaska Highway in southern Yukon. All equipment is provided for participants, making this program an accessible introduction to archery in this lakeside community on the shores of Teslin Lake. No membership is required, and the program welcomes archers of all ages and skill levels. Serving Teslin, the Teslin Tlingit Council community, and travellers along the Alaska Highway corridor, this recreation program brings archery to one of the Yukon's most scenic communities. Contact teslinrec@teslin.ca or call 867-390-2530 for schedules."
};

async function main() {
    const csvText = fs.readFileSync('yukon_archery_ranges_enriched.csv', 'utf-8');
    const records = parseCSV(csvText);
    console.log(`Found ${records.length} ranges in CSV`);

    // Get or create Yukon province
    let { data: province } = await supabase.from('provinces').select('id').eq('slug', 'yukon').single();
    if (!province) {
        const { data: newProv } = await supabase.from('provinces').insert({
            name: 'Yukon',
            slug: 'yukon',
            abbreviation: 'YT'
        }).select('id').single();
        province = newProv;
        console.log('Created province: Yukon');
    } else {
        console.log('Province exists: Yukon (id=' + province.id + ')');
    }

    let deployed = 0, skipped = 0;

    for (const record of records) {
        const rangeName = record.post_title.trim();
        if (!rangeName) continue;

        const slug = slugify(rangeName);
        const cityName = record.post_city.trim() || 'Whitehorse';

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
