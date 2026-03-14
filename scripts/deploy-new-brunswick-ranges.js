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
    '10 Point Archery Club': "10 Point Archery Club is an outdoor archery club located on Robertson Point Road in Jemseg, New Brunswick, along the scenic Saint John River valley. Our facility features a 3D archery course providing realistic target shooting in natural woodland terrain. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Jemseg, Cambridge Narrows, Gagetown, and the broader Queens County area, 10 Point Archery Club is a top destination for 3D archery enthusiasts in central New Brunswick. Contact Jack Mason for membership details, shooting schedules, and information about our upcoming 3D shoot events.",

    'Arcadie Chaleur 3D Club': "Arcadie Chaleur 3D Club is an outdoor 3D archery club located on Adelard Street in Nigadoo, on New Brunswick's beautiful Acadian Peninsula. Our club features a dedicated 3D course offering challenging and varied target shooting in northern New Brunswick's scenic coastal landscape. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Nigadoo, Bathurst, Petit-Rocher, Beresford, and the broader Chaleur Bay region, our club is the Acadian coast's premier 3D archery destination. Contact Rene Duclos for membership details, upcoming shoot schedules, and information about joining our welcoming francophone archery community in the Maritimes.",

    'Archers Route 17': "Archers Route 17 is an outdoor archery club located on Route 180 in St. Quintin, in the Restigouche County region of northwestern New Brunswick. Our club features a 3D course providing engaging target shooting in the forested landscape of the upper Saint John River valley. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving St. Quintin, Kedgwick, Saint-Quentin, and the surrounding Madawaska County communities, Archers Route 17 offers outdoor archery in one of New Brunswick's most beautiful wilderness regions. Contact Yves Michaud for membership details and current shooting schedules.",

    'Archery Center Atlantic': "Archery Center Atlantic on Dorcas Street in Fredericton is the only all-in-one archery facility in Atlantic Canada, proudly serving Maritime archers for over 30 years. Our 16-lane indoor range provides professional-grade shooting year-round, complemented by a fully stocked pro shop and expert repair facility. Equipment rental and lessons are available for beginners, and no membership is required. Open Monday through Friday 2 to 7 PM and Saturday 10 AM to 3 PM, we welcome recurve, compound, and longbow archers. Whether you are a competitive shooter or picking up a bow for the first time, visit Fredericton's premier indoor archery destination.",

    'Bathurst Archery Club': "Bathurst Archery Club operates an outdoor 3D archery course on Rio Grande Road near Bathurst, New Brunswick. Our club provides an exciting 3D shooting experience in the natural terrain of the Chaleur Bay region. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Bathurst, Beresford, Petit-Rocher, and the broader Gloucester County area, our club is northern New Brunswick's established archery community. Whether you are a seasoned 3D competitor or a recreational archer looking for outdoor target practice, contact Gerald Foran for membership details, shooting schedules, and information about our 3D course and upcoming events.",

    'Edmunston Archery Club': "Edmunston Archery Club on De La Capitale Boulevard serves the archery community of northwestern New Brunswick with both indoor and outdoor facilities. Our club features a 3D course for outdoor practice and indoor shooting for year-round training regardless of weather. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located in Edmunston near the Quebec and Maine borders, our club serves archers from across Madawaska County including Grand Falls, Saint-Basile, and the upper Saint John River valley. Contact Dominic Martin for membership details and join the largest archery community in northwestern New Brunswick.",

    'Gagetown Archery Club': "Gagetown Archery Club is an outdoor archery facility on Erica Circle in Oromocto, serving the Gagetown and CFB Gagetown military community of New Brunswick. Our club features a 3D archery course providing dynamic target shooting in outdoor terrain. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Oromocto, Gagetown, Burton, Lincoln, and military families stationed at CFB Gagetown, our club provides a welcoming community for both civilian and military archers. Contact Allen Osborne for membership details, current shooting schedules, and information about 3D archery events in the central New Brunswick region.",

    'Glades Traditional Archery Club': "Glades Traditional Archery Club on Sanatorium Road in The Glades specializes in traditional archery with a focus on longbow and recurve shooting. Our outdoor facility features both 3D and field course shooting in the scenic Petitcodiac River valley of New Brunswick. Membership is required, and we welcome traditional bow enthusiasts including longbow, recurve, and primitive bow archers. Serving The Glades, Petitcodiac, Sussex, and the surrounding Kings and Albert County communities, our club is the premier destination for traditional archery in southeastern New Brunswick. Contact Trudy Dryden for membership details and connect with our dedicated traditional archery community.",

    'Memramcook Archery Club': "Memramcook Archery Club is an outdoor archery facility on Chemin Mountain in Memramcook, New Brunswick, serving archers in the historic Memramcook Valley. Our club features a 3D course for outdoor target practice in natural terrain. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located in the heart of Acadian New Brunswick between Moncton and Sackville, our club serves archers from Memramcook, Dieppe, Moncton, and the broader Westmorland County area. Whether you are an experienced 3D shooter or new to archery, contact Val Breau for membership details, schedules, and upcoming events in the Memramcook region.",

    'Miramichi Archery Club': "Miramichi Archery Club on Ironmen Road offers outdoor 3D archery in the heart of New Brunswick's legendary Miramichi River region. Our facility features a well-maintained 3D course for engaging target shooting. For archery equipment, Scott Allison operates a nearby pro shop at Allisons Garage Doors and Ultramar in Trout Brook. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Miramichi, Newcastle, Chatham, Douglastown, and the broader Northumberland County area, our club is the Miramichi region's go-to archery destination. Contact Tracey Baisley for membership details, schedules, and upcoming 3D shoot events.",

    'Moncton Archery Club': "Moncton Archery Club on Route 134 in Lakeville is the primary archery destination for the Greater Moncton area of New Brunswick. Our outdoor facility features a 3D archery course providing exciting target shooting in natural terrain east of the city. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Moncton, Dieppe, Riverview, Petitcodiac, and the surrounding Westmorland and Albert County communities, our club offers quality 3D archery for shooters of all experience levels. Contact Wesley Ruff for membership details, current shooting schedules, and information about competitive and recreational 3D archery events.",

    'Mountaineers Archery Club': "Mountaineers Archery Club on Guthrie Road in Midland is a dedicated traditional archery club embracing the stick-and-string philosophy with no compounds with sights permitted. Our outdoor 3D and field course shooting takes place every Monday evening from 7 to 9 PM. Membership is required, and we welcome longbow, recurve, and primitive bow archers who share our passion for instinctive traditional shooting. Serving Midland, Sussex, Havelock, Petitcodiac, and the surrounding Kings County area, Mountaineers is New Brunswick's premier traditional archery community. Join our welcoming club for authentic outdoor archery that celebrates the heritage and simplicity of the traditional bow.",

    'Restigouche Archery Club': "Restigouche Archery Club is an outdoor archery facility on Notre Dame Street in Atholville, serving the Restigouche County region of northern New Brunswick. Our club features a 3D course for outdoor target practice along the scenic Restigouche River, which forms the border between New Brunswick and Quebec. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Atholville, Campbellton, Dalhousie, Charlo, and the broader Restigouche County area, our club is the northernmost archery destination in the province. Contact Mitch Isaac for membership details, shooting schedules, and information about archery events in the region.",

    'River Valley Archery Club': "River Valley Archery Club operates from Lakefield Elementary School in Quispamsis, offering indoor shooting Wednesday evenings from 7 to 9 PM during winter months. Summer sessions include Wednesday evenings and Saturday mornings at our outdoor 3D range featuring a full complement of targets from squirrel to buffalo. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located in the Kennebecasis Valley just minutes from Saint John, our club serves Quispamsis, Rothesay, Hampton, and the broader Kings County area. Join the Saint John region's most versatile archery club with both indoor and outdoor year-round facilities.",

    'Split Arrow Archery Club': "Split Arrow Archery Club on Route 515 in Bouctouche Cove offers outdoor 3D archery along New Brunswick's scenic eastern coastline. Our club features a 3D course providing challenging and varied target shooting in the natural landscape of Kent County. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Bouctouche, Richibucto, Rexton, and the broader Kent County area, Split Arrow is the eastern New Brunswick coast's premier 3D archery destination. Whether you are a competitive 3D shooter or recreational archer, contact Marcel Allain for membership details, shooting schedules, and information about upcoming events.",

    'Sussex Golden Arrows': "Sussex Golden Arrows is an outdoor archery club on Markhamville Road in the Sussex area of New Brunswick's Kings County. Our club features a 3D course providing engaging target shooting in the rolling hills and farmland of the Sussex region. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Sussex, Norton, Apohaqui, Hampton, and the broader Kings County community, Sussex Golden Arrows is a welcoming destination for archers of all experience levels. Contact Kent Warman for membership details, current shooting schedules, and information about 3D archery events in the Sussex Corner area of New Brunswick.",

    'Tir \u00C0 L\'Arc Saint-Louis': "Tir A L'Arc Saint-Louis is a francophone archery club on Bellvue Street in Saint Louis, serving the French-speaking archery community of southeastern New Brunswick. Our outdoor facility features a 3D course for target practice in the Kent County region. Listed on the official Archery NB club directory, our club is recognized as part of the provincial archery community. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Saint Louis, Richibucto, Bouctouche, and the surrounding Acadian communities, our club provides archery programming in French. Contact Noel Hebert for membership details and current shooting schedules.",

    'Twin Rivers Archery': "Twin Rivers Archery on Tinker Road in Carleton County is an outdoor archery club serving the upper Saint John River valley of western New Brunswick. Our club features a 3D course for engaging outdoor target shooting surrounded by beautiful New Brunswick countryside. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Woodstock, Hartland, Florenceville-Bristol, and the broader Carleton County area, Twin Rivers Archery provides quality outdoor archery in one of the province's most scenic agricultural regions. Contact Kevin Booker for membership details, current shooting schedules, and information about upcoming 3D archery events.",

    'Washademoak Lake Archery Club': "Washademoak Lake Archery Club on Lower Cambridge Road in Cambridge Narrows offers outdoor archery on the shores of beautiful Washademoak Lake in Queens County, New Brunswick. Our club features a 3D course providing scenic target shooting along the lake. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Cambridge Narrows, Jemseg, Cody's, and the surrounding Queens County communities along the Saint John River system, our club offers a peaceful outdoor archery experience. Contact Anthony Steeves for membership details, current shooting schedules, and information about 3D archery events on Washademoak Lake.",

    'Woodstock Archery Club': "Woodstock Archery Club on Charles Street is a family-oriented archery club offering both indoor and outdoor facilities in Woodstock, New Brunswick. Open Monday through Friday 11 AM to 5 PM, our club encourages all members to participate in club operations with many volunteer opportunities available. Our 3D course provides exciting outdoor target shooting, and we welcome archers of all ages and skill levels. Membership is required, and all bow types are accepted including recurve, compound, and longbow. Serving Woodstock, Hartland, Houlton, and the upper Saint John River valley, contact Adam Sullivan to join Carleton County's most active family archery community.",

    'Woodland Traditional Archers': "Woodland Traditional Archers, established in 1997 in Quispamsis, is a traditional archery club with over 65 members. Indoor shooting runs Fridays 8:30 to 9:30 PM from January through May at Kennebecasis Valley High School on Hampton Road. Summer outdoor shooting takes place at Elmhurst Outdoors on Ganong Road in Erbs Cove, featuring 3D and field courses. Annual membership is just 60 dollars with 2-dollar drop-in fees. Equipment rental and youth programs are available. We welcome recurve, longbow, and traditional bow archers. Serving Quispamsis, Rothesay, Saint John, and the Kennebecasis Valley, join our established traditional archery community.",

    'Moncton Gun Club': "Moncton Gun Club on Elsie Road in Lower Coverdale is one of Atlantic Canada's oldest and most established private shooting sports clubs, featuring archery alongside multiple clay shooting fields. Located just 10 minutes from downtown Moncton, our well-maintained outdoor grounds provide a quality archery experience in a multi-discipline environment. Annual membership is 195 dollars, and we welcome all bow types including recurve, compound, and longbow. Serving Moncton, Riverview, Dieppe, and the surrounding Westmorland and Albert County communities, our club combines rich sporting heritage with modern facilities. Contact us for membership details and experience archery at this historic New Brunswick institution.",

    'Sackville Rod & Gun Club (Archery Range)': "Sackville Rod & Gun Club's archery range on Landing Road was created in 2021-2022 as a dedicated outdoor facility for members. Open year-round during daylight hours seven days a week, our Walker Road range provides flexible and convenient access for archers with active memberships. We welcome all bow types including recurve, compound, and longbow. Located in Sackville near the Nova Scotia border, our range serves archers from Sackville, Dorchester, Port Elgin, Amherst, and the broader Tantramar region. Whether you are a target archer or bowhunter, join Sackville Rod and Gun Club for quality outdoor archery in southeastern New Brunswick.",

    'Full Draw Archery NB': "Full Draw Archery NB is an active archery club based in the Shediac area of southeastern New Brunswick. With confirmed activity through 2024-2025 and an engaged Facebook community, our club provides regular archery programming for local enthusiasts. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Shediac, Shediac Bridge, Cap-Pele, and the broader Westmorland County coastline along the Northumberland Strait, Full Draw Archery NB offers community-based archery near some of New Brunswick's most beautiful beaches. Follow our Facebook page for event updates and contact us for membership details and current shooting schedules."
};

async function main() {
    console.log("Starting New Brunswick archery ranges deployment...");

    const csvContent = fs.readFileSync('new_brunswick_archery_ranges_enriched.csv', 'utf-8');
    const records = parseCSV(csvContent);

    const provinceSlug = 'new-brunswick';
    const { data: existingProvince } = await supabase
        .from('provinces').select('id').eq('slug', provinceSlug).single();

    let provinceId;
    if (existingProvince) {
        provinceId = existingProvince.id;
    } else {
        const { data: np, error: pe } = await supabase
            .from('provinces').insert({ name: 'New Brunswick', slug: provinceSlug }).select('id').single();
        if (pe) throw pe;
        provinceId = np.id;
    }

    const citiesMap = new Map();
    let successCount = 0, errorCount = 0, skipCount = 0;

    for (const record of records) {
        const rangeName = record.post_title;
        if (!rangeName) continue;

        try {
            const { data: existing } = await supabase
                .from('ranges').select('id').ilike('name', rangeName).single();
            if (existing) { console.log(`SKIP: ${rangeName}`); skipCount++; continue; }

            const cityName = record.post_city || 'Unknown';
            let cityId = citiesMap.get(cityName);
            if (!cityId) {
                const citySlug = slugify(cityName);
                const { data: ec } = await supabase
                    .from('cities').select('id').eq('province_id', provinceId).eq('slug', citySlug).single();
                if (ec) { cityId = ec.id; }
                else {
                    const { data: nc, error: ce } = await supabase
                        .from('cities').insert({ name: cityName, slug: citySlug, province_id: provinceId }).select('id').single();
                    if (ce) throw ce;
                    cityId = nc.id;
                }
                citiesMap.set(cityName, cityId);
            }

            const description = seoDescriptions[rangeName] ||
                (record.post_content !== 'N/A' ? record.post_content : null);

            const rangeData = {
                name: rangeName,
                slug: slugify(rangeName),
                address: record.post_address || null,
                city_id: cityId,
                province_id: provinceId,
                postal_code: record.post_zip || null,
                latitude: record.post_latitude ? parseFloat(record.post_latitude) : null,
                longitude: record.post_longitude ? parseFloat(record.post_longitude) : null,
                phone_number: record.phone || null,
                email: record.email || null,
                website: record.website || null,
                description: description,
                amenities: record.post_tags ? record.post_tags.split(';').map(t => t.trim()) : [],
                business_hours: record.business_hours || null,
                post_images: ['/filler-image.jpg'],
                range_length_yards: record.range_length_yards ? parseFloat(record.range_length_yards) : null,
                number_of_lanes: record.number_of_lanes ? parseFloat(record.number_of_lanes) : null,
                facility_type: record.facility_type ? (
                    record.facility_type.toLowerCase() === 'both' ? 'Both' :
                    record.facility_type.toLowerCase().includes('in') ? 'Indoor' :
                    record.facility_type.toLowerCase().includes('out') ? 'Outdoor' : 'Both'
                ) : 'Both',
                has_pro_shop: record.has_pro_shop === 'Yes',
                has_3d_course: record.has_3d_course === 'Yes',
                has_field_course: record.has_field_course === 'Yes',
                membership_required: record.membership_required === 'Yes',
                membership_price_adult: record.membership_price_adult ? parseFloat(record.membership_price_adult.replace(/[^0-9.]/g, '')) : null,
                drop_in_price: record.drop_in_price ? parseFloat(record.drop_in_price.replace(/[^0-9.]/g, '')) : null,
                equipment_rental_available: record.equipment_rental_available === 'Yes',
                lessons_available: record.lessons_available === 'Yes',
                lesson_price_range: record.lesson_price_range || null,
                bow_types_allowed: record.bow_types_allowed || null,
                parking_available: record.parking_available === 'Yes',
                is_featured: false,
            };

            const { error: insertErr } = await supabase.from('ranges').insert(rangeData);
            if (insertErr) throw insertErr;
            console.log(`OK: ${rangeName}`);
            successCount++;
        } catch (err) {
            console.error(`ERROR: ${rangeName}: ${err.message}`);
            errorCount++;
        }
    }

    console.log(`\nDeployment Complete! Added: ${successCount} | Skipped: ${skipCount} | Errors: ${errorCount}`);
}

main();
