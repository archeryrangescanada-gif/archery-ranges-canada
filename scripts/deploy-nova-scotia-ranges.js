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

// SEO descriptions for all Nova Scotia ranges
const seoDescriptions = {
    'Osprey Archery Club': "Osprey Archery Club in Shad Bay is Nova Scotia's premier year-round archery facility, offering 6 indoor lanes at 18 metres plus outdoor target, 3D, and 12-target field courses winding through forest trails. A tree stand platform provides realistic bowhunting practice, and para-archery accommodations make the sport accessible to all. Open to ages 9 and up, Osprey offers lessons and equipment rental for beginners. Located on Prospect Road just 30 minutes from downtown Halifax, our club serves archers across HRM, Tantallon, and the South Shore. Join one of Atlantic Canada's most complete archery facilities.",

    'St. Mary\'s Archers of Truro': "St. Mary's Archers of Truro is a community archery club serving Truro, Brookfield, and the Colchester County area of Nova Scotia. Our club offers lessons for archers looking to develop their skills, and membership is open to all experience levels. We welcome recurve, compound, and longbow shooters to our friendly community. Located on Maple Street in Brookfield, just minutes from Truro, we are the primary archery destination for central Nova Scotia. Contact Tyler Conrod for membership information and shooting schedules. Join our growing archery community in the heart of the Maritimes.",

    'Northumberland Strait Shooters': "Northumberland Strait Shooters is an active archery club in New Glasgow, Nova Scotia, hosting indoor 3D archery events on East River Road. Our club offers both indoor and outdoor shooting opportunities for archers across Pictou County. We welcome all bow types including recurve, compound, and longbow. Membership is required, and our 3D shoots provide exciting competitive and recreational archery experiences. Serving New Glasgow, Stellarton, Westville, Trenton, and the broader Pictou County region, our club is the Northumberland Shore's destination for archery. Contact Matt MacDonald for event schedules, membership details, and upcoming 3D shoot dates.",

    'Glooscap Heritage Archers': "Glooscap Heritage Archers is Nova Scotia's longest continuously operating archery club, based in Newport Station in the heart of Hants County. Our newly renovated, heated indoor range features 5 lanes at 18 metres for year-round practice, plus outdoor range and 3D course facilities. Lessons are available for beginners, and we welcome all bow types. Membership is required to join our historic club. Serving Windsor, Brooklyn, Falmouth, and the broader Hants County community, Glooscap Heritage Archers carries decades of archery tradition. Contact Gary Oickle for membership details and experience one of Atlantic Canada's most storied archery clubs.",

    'Cape Breton Bowmen Association': "Cape Breton Bowmen Association is an archery club based in Edwardsville, serving Sydney and surrounding Cape Breton communities. Our club provides a local venue for archers to practice and compete in Cape Breton Regional Municipality. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Whether you are an experienced archer or new to the sport, Cape Breton Bowmen offers a community-based archery experience on the island. Serving Sydney, Glace Bay, North Sydney, New Waterford, and the broader CBRM area, we are Cape Breton's established archery community. Contact us for current membership and schedule information.",

    'Bras d\'Or Archers Association': "Bras d'Or Archers Association is an archery club located in the scenic town of Baddeck on Cape Breton's beautiful Bras d'Or Lakes. Our club serves archery enthusiasts across Victoria County and central Cape Breton. Membership is required, and we welcome recurve, compound, and longbow archers of all skill levels. Whether you are a local resident or visiting the Cabot Trail region, Bras d'Or Archers provides a welcoming community for target shooting in one of Nova Scotia's most picturesque settings. Contact Joe Harvie for membership details, shooting schedules, and information about joining our Cape Breton archery community.",

    'Antigonish Archery Association': "Antigonish Archery Association serves the archery community in Antigonish and the surrounding northeastern Nova Scotia region. Our club provides opportunities for archers of all skill levels to practice and develop their abilities. Membership is required, and we welcome recurve, compound, and longbow shooters. Serving Antigonish, Guysborough County, and the St. Francis Xavier University community, our association is the primary archery venue for this part of Nova Scotia. Whether you are a student, local resident, or visitor, join our welcoming club for quality archery. Contact Dion Sampson for current membership details and shooting schedule information.",

    'Greenwood Archery Club': "Greenwood Archery Club operates at 14 Wing Greenwood, part of the military base's Recreation Association in the Annapolis Valley. We offer outdoor practice and 3D range shooting during summer, transitioning to our indoor range for winter sessions. Our club hosts shoots throughout the year, keeping members engaged across all seasons. Membership is required, and we welcome all bow types. Serving Greenwood, Kingston, Middleton, and Annapolis Valley military families, our club provides a structured archery environment. Whether you are a military member or civilian, contact Jeff Cox for membership details and join the Valley's most active year-round archery club.",

    'Down by the Bay Archery': "Down by the Bay Archery is a traditional archery club located on Two Islands Road in Parrsboro, along the stunning Bay of Fundy coast. Our club specializes in traditional bows and hosts the Outdoor Field Provincials, drawing competitors from across Nova Scotia. We offer field course shooting in beautiful natural surroundings overlooking the bay. Membership is required, and traditional bow styles are featured including recurve and longbow. Serving Parrsboro, Great Village, Economy, and the Cumberland County coastline, our club delivers an authentic outdoor archery experience. Contact Dorothy Best for membership and event information in this unique Maritime setting.",

    'Annapolis Valley Shooting Sports Club': "Annapolis Valley Shooting Sports Club on White Rock Road in Kentville provides archery facilities as part of their comprehensive shooting sports complex. Our club serves archers across the Annapolis Valley with well-maintained range facilities. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located in the heart of the Valley, we serve Kentville, Wolfville, New Minas, Berwick, and surrounding communities. Whether you are a target archer or multi-discipline shooting sports enthusiast, AVSSC offers quality archery alongside other shooting disciplines. Contact Kevin Gaul for membership information and current shooting schedules.",

    'Annapolis East Archery Club': "Annapolis East Archery Club operates at Rotary Park on Lily Lake Road in Middleton, Nova Scotia. Our outdoor range hosts Archery Nova Scotia 720 Provincial competitions, making us a key venue in the province's competitive archery circuit. Membership is required, and we welcome recurve, compound, and longbow archers. Located in the Annapolis Valley between Kentville and Bridgetown, our club serves Middleton, Kingston, Greenwood, Lawrencetown, and surrounding communities. Whether you are a competitive archer training for provincials or a recreational shooter, Annapolis East provides quality outdoor archery. Contact Chris England for membership details and upcoming competition schedules.",

    'Hartz Point Archers': "Hartz Point Archers is an archery club located on Hartz Point Road in Shelburne, on Nova Scotia's scenic South Shore. Our club has provided a local archery venue for the Shelburne County community. Membership is required, and we welcome archers shooting recurve, compound, and longbow. Serving Shelburne, Barrington, Lockeport, and surrounding South Shore communities, Hartz Point Archers is the area's archery destination. Please note: the club's current operating status should be verified before visiting. Contact the club directly for the latest information on schedules, membership availability, and range access in the Shelburne area.",

    'Bowhunters Association of Nova Scotia': "Bowhunters Association of Nova Scotia (BANS) is the provincial organization representing bowhunters across Nova Scotia. Based in Lower Sackville, BANS advocates for bowhunting rights, promotes ethical hunting practices, and organizes 3D archery events throughout the province. Membership connects you with a network of dedicated bowhunters from Cape Breton to Yarmouth. Whether you are preparing for hunting season or competing in 3D shoots, BANS provides resources, community, and representation for Nova Scotia's bowhunting community. Join the province's leading bowhunting organization and support the future of archery hunting in the Maritimes. Visit bowhuntersns.com for membership details.",

    'Traditional Archery Association of Nova Scotia (TAANS)': "The Traditional Archery Association of Nova Scotia (TAANS) is the provincial body dedicated to promoting traditional archery, including 3D and field course disciplines. Based in Louisbourg, Cape Breton, TAANS organizes events and competitions for traditional bow enthusiasts across the province. Under the leadership of President Roy MacInnis, the association supports recurve, longbow, and primitive bow archers. Whether you shoot instinctive or with sights, TAANS connects you with Nova Scotia's vibrant traditional archery community. Serving archers province-wide from Halifax to Sydney, visit taans.ca for event calendars, membership, and traditional archery resources in the Maritimes.",

    'Breton Traditional Archery Club': "Breton Traditional Archery Club is a traditional archery club on Coxheath Road at Blacketts Lake in Cape Breton, Nova Scotia. Our club specializes in traditional bow styles and hosts 3D and field course events. Membership is required, and we welcome recurve, longbow, and primitive bow archers. Serving Sydney, Coxheath, North Sydney, and the greater Cape Breton Regional Municipality, our club provides a dedicated venue for traditional archery enthusiasts. Whether you are an experienced traditional shooter or curious about instinctive archery, contact Marlene Gavel to join Cape Breton's premier traditional archery community at btarchers.ca.",

    'The Barn Archers': "The Barn Archers in Marion Bridge, Cape Breton, offers a dedicated 100x24-foot indoor archery facility with 6 lanes. Our range specializes in traditional bows only — recurve, longbow, primitive, and Olympic recurve are welcome. 3D targets are available, and our PAC-certified coaching provides expert instruction for all levels. Members enjoy key fob access for flexible practice times. Our pro shop carries traditional archery equipment and accessories. Located on Joanne Langford Drive, we serve archers across Cape Breton from Sydney to Louisbourg. Contact John for membership details and experience Cape Breton's finest dedicated indoor traditional archery facility.",

    'John\'s Archery': "John's Archery is a traditional archery pro shop located on Joanne Langford Drive in Marion Bridge, Cape Breton. Connected with The Barn indoor range, we specialize in traditional archery equipment including bows, arrows, strings, fletching supplies, and accessories. Our knowledgeable staff provides expert advice on equipment selection and setup for recurve, longbow, and primitive bow archers. Open by appointment from 10 AM to 8 PM, we serve traditional archers across Cape Breton and Nova Scotia. Whether you need a custom bow setup, string replacement, or complete outfitting, John's Archery is Atlantic Canada's destination for traditional archery equipment.",

    'Highland Bow & Arrow': "Highland Bow & Arrow is a traditional outdoor archery range located on the world-famous Cabot Trail at Wreck Cove, Cape Breton. Our 8-target 3D course winds through beautiful coastal woodland with ocean views, offering a truly unique archery experience. Open June 1 through November 30, we offer beginner lessons and equipment rental for drop-in visitors at $20 to $30. No membership required — perfect for tourists and locals alike. Closed Tuesdays. Whether you are exploring the Cabot Trail or a local Cape Breton archer, Highland Bow & Arrow delivers unforgettable outdoor traditional archery on Nova Scotia's iconic coastline.",

    'Nova Tactical Archery Range': "Nova Tactical Archery Range on Windmill Road in Dartmouth is the Halifax area's only dedicated indoor archery facility. Our 18-metre competition shooting line features 8 well-lit lanes for consistent, professional-grade practice. Part of the Nova Tactical complex, our pro shop stocks archery equipment for all disciplines. Equipment rental and lessons are available, and no membership is required. We welcome recurve, compound, and longbow archers. Serving Halifax, Dartmouth, Bedford, and the entire HRM, Nova Tactical is the most accessible indoor archery range in Atlantic Canada's largest city. Contact us for current hours and walk-in availability.",

    'Lunenburg Rod & Gun Club (Archery Section)': "Lunenburg Rod & Gun Club's archery section offers both indoor 20-metre range and outdoor 3D and block target shooting on Fish Peddler Road in historic Lunenburg. Saturday sessions run from 12 to 3 PM with pre-registration required. Drop-in rates are just $5 for non-members and $3 for members, making this one of Nova Scotia's most affordable archery venues. All disciplines are welcome including traditional, compound, and crossbow. Serving Lunenburg, Bridgewater, Mahone Bay, and the South Shore, our range provides accessible weekend archery for the entire community. No membership required for drop-in shooting.",

    'Musquodoboit Valley Rifle & Revolver Club (Archery Range)': "Musquodoboit Valley Rifle & Revolver Club operates an outdoor archery range as part of their shooting sports facility in Middle Musquodoboit, Nova Scotia. Member access provides a dedicated venue for outdoor target practice in the scenic Musquodoboit Valley. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Middle Musquodoboit, Upper Musquodoboit, Sheet Harbour, and the eastern HRM rural communities, our range offers outdoor archery in beautiful Nova Scotia countryside. Whether you are a target archer or bowhunter preparing for the season, contact the club for membership details and range access information.",

    'Millbrook 3D Shooters Association': "Millbrook 3D Shooters Association offers indoor and outdoor 3D archery near Truro, Nova Scotia. Indoor sessions run Wednesday evenings from 6 to 7:45 PM and Tuesday/Sunday from 11 AM to 2 PM. Our outdoor 3D shoots take place at the Community Hall on Church Road and Irwin Lake Road Christmas Tree Farm. We partner with St. Mary's Archery for fall and winter programs. Membership is required, and all bow types are welcome. Serving Millbrook First Nation, Truro, Bible Hill, and Colchester County, our association delivers exciting 3D archery experiences year-round in central Nova Scotia.",

    'Seawinds Horse Archers': "Seawinds Horse Archers in Baxters Harbour offers a unique year-round horseback archery training facility in Nova Scotia's Annapolis Valley. Our programs include beginner camps, clinics, and instruction in mounted archery — a rare specialty in Atlantic Canada. Coach Lance Bishop serves as an International Competition Judge, bringing world-class expertise to every session. Equipment and lessons are available for newcomers to this ancient art. Located on Old Baxter's Mill Road overlooking the Bay of Fundy, we serve the entire Maritime region. Whether you ride or shoot, Seawinds Horse Archers delivers an extraordinary combination of equestrianism and traditional archery.",

    'Queens Archers Association': "Queens Archers Association, founded in 1981, operates year-round archery facilities at White Point in Queens County, Nova Scotia. Our outdoor range features multiple courses including 3D shooting, and we host the annual Glen Mansfield Memorial 3D Shoot alongside other competitions throughout the year. Membership drives are held each January. We welcome all bow types including recurve, compound, and longbow. Serving Liverpool, Queens County, Shelburne, and the South Shore, our association is one of Nova Scotia's longest-running archery clubs. Whether you are a competitive 3D archer or recreational shooter, join our welcoming community on the beautiful South Shore.",

    'Xlimits Archery Supply': "Xlimits Archery Supply in Upper Tantallon is a full-service archery pro shop serving the Halifax Regional Municipality since 2017. We specialize in custom bowstrings, bow sales, professional setup, and archery lessons. Our team brings competition archery expertise and authorized dealership for major bow brands. Whether you need a new bow, custom string work, or professional instruction, Xlimits delivers expert service for recurve, compound, and traditional archers. Located on Aralia Lane near the Hammonds Plains corridor, we serve archers across HRM, the South Shore, and all of Nova Scotia. Contact us for appointments and lesson availability."
};

async function main() {
    console.log("Starting Nova Scotia archery ranges deployment...");

    const csvContent = fs.readFileSync('nova_scotia_archery_ranges_enriched.csv', 'utf-8');
    const records = parseCSV(csvContent);

    const provinceName = 'Nova Scotia';
    const provinceSlug = 'nova-scotia';

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
    let skipCount = 0;

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
                console.log(`SKIP: ${rangeName} - already exists.`);
                skipCount++;
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

            // Use SEO description if available, otherwise fall back to CSV
            const description = seoDescriptions[rangeName] ||
                (record.post_content !== 'N/A' ? record.post_content : null);

            // Build range data
            const rangeData = {
                name: rangeName,
                slug: slugify(rangeName),
                address: record.post_address !== 'N/A' && record.post_address ? record.post_address : null,
                city_id: cityId,
                province_id: provinceId,
                postal_code: record.post_zip !== 'N/A' && record.post_zip ? record.post_zip : null,
                latitude: record.post_latitude !== 'N/A' && record.post_latitude ? parseFloat(record.post_latitude) : null,
                longitude: record.post_longitude !== 'N/A' && record.post_longitude ? parseFloat(record.post_longitude) : null,
                phone_number: record.phone !== 'N/A' && record.phone ? record.phone : null,
                email: record.email !== 'N/A' && record.email ? record.email : null,
                website: record.website !== 'N/A' && record.website ? record.website : null,
                description: description,
                amenities: record.post_tags ? record.post_tags.split(';').map(t => t.trim()) : [],
                business_hours: record.business_hours !== 'N/A' && record.business_hours ? record.business_hours : null,
                post_images: ['/filler-image.jpg'],
                range_length_yards: record.range_length_yards !== 'N/A' && record.range_length_yards ? parseFloat(record.range_length_yards) : null,
                number_of_lanes: record.number_of_lanes !== 'N/A' && record.number_of_lanes ? parseFloat(record.number_of_lanes) : null,
                facility_type: record.facility_type !== 'N/A' && record.facility_type ? (
                    record.facility_type.toLowerCase() === 'both' ? 'Both' :
                    record.facility_type.toLowerCase().includes('in') ? 'Indoor' :
                    record.facility_type.toLowerCase().includes('out') ? 'Outdoor' :
                    'Both'
                ) : 'Both',
                has_pro_shop: record.has_pro_shop === 'Yes',
                has_3d_course: record.has_3d_course === 'Yes',
                has_field_course: record.has_field_course === 'Yes',
                membership_required: record.membership_required === 'Yes',
                membership_price_adult: record.membership_price_adult !== 'N/A' && record.membership_price_adult ? parseFloat(record.membership_price_adult.replace(/[^0-9.]/g, '')) : null,
                drop_in_price: record.drop_in_price !== 'N/A' && record.drop_in_price ? parseFloat(record.drop_in_price.replace(/[^0-9.]/g, '')) : null,
                equipment_rental_available: record.equipment_rental_available === 'Yes',
                lessons_available: record.lessons_available === 'Yes',
                lesson_price_range: record.lesson_price_range !== 'N/A' && record.lesson_price_range ? record.lesson_price_range : null,
                bow_types_allowed: record.bow_types_allowed !== 'N/A' && record.bow_types_allowed ? record.bow_types_allowed : null,
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

    console.log(`\nDeployment Complete!`);
    console.log(`Added: ${successCount} | Skipped: ${skipCount} | Errors: ${errorCount}`);
}

main();
