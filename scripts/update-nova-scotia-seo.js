require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const descriptions = {
    'osprey-archery-club': "Osprey Archery Club in Shad Bay is Nova Scotia's premier year-round archery facility, offering 6 indoor lanes at 18 metres plus outdoor target, 3D, and a 12-target field course winding through forest trails. A tree stand platform provides realistic bowhunting practice, and full para-archery accommodations make the sport accessible to everyone. Open to ages 9 and up, Osprey offers lessons and equipment rental for beginners. Located on Prospect Road just 30 minutes from downtown Halifax, our club serves archers across HRM, Tantallon, and the South Shore. Join one of Atlantic Canada's most complete archery facilities today.",

    'st-marys-archers-of-truro': "St. Mary's Archers of Truro is a welcoming community archery club serving Truro, Brookfield, and the greater Colchester County area of Nova Scotia. Our club offers lessons for archers looking to develop their skills, with membership open to shooters of all experience levels. We welcome recurve, compound, and longbow enthusiasts to our friendly and supportive community. Located on Maple Street in Brookfield, just minutes from downtown Truro, we are the primary archery destination for central Nova Scotia residents. Contact Tyler Conrod for membership information, current shooting schedules, and details about joining our growing Maritime archery community.",

    'northumberland-strait-shooters': "Northumberland Strait Shooters is an active archery club in New Glasgow, Nova Scotia, hosting exciting indoor 3D archery events on East River Road. Our club offers both indoor and outdoor shooting opportunities for archers across the entire Pictou County region. We welcome all bow types including recurve, compound, and longbow to our well-organized events. Membership is required, and our 3D shoots provide thrilling competitive and recreational archery experiences throughout the season. Serving New Glasgow, Stellarton, Westville, Trenton, and the broader Pictou County area, our club is the Northumberland Shore's top destination for archery in Nova Scotia.",

    'glooscap-heritage-archers': "Glooscap Heritage Archers is Nova Scotia's longest continuously operating archery club, proudly based in Newport Station in the heart of Hants County. Our newly renovated, heated indoor range features 5 well-maintained lanes at 18 metres for comfortable year-round practice, plus outdoor range and 3D course facilities for warm-weather shooting. Lessons are available for beginners of all ages, and we welcome all bow types including recurve, compound, and longbow. Membership is required to join our historic and welcoming club. Serving Windsor, Brooklyn, Falmouth, and the broader Hants County community, experience one of Atlantic Canada's most storied archery clubs.",

    'cape-breton-bowmen-association': "Cape Breton Bowmen Association is an established archery club based in Edwardsville, serving Sydney and the surrounding Cape Breton Island communities. Our club provides a dedicated local venue for archers to practice, compete, and connect with fellow enthusiasts in the Cape Breton Regional Municipality. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Whether you are an experienced competitive archer or brand new to the sport, Cape Breton Bowmen offers a supportive community-based archery experience. Serving Sydney, Glace Bay, North Sydney, New Waterford, and the broader CBRM area, contact us for membership and schedule details.",

    'bras-dor-archers-association': "Bras d'Or Archers Association is an archery club located in the scenic town of Baddeck on Cape Breton's stunning Bras d'Or Lakes. Our club serves archery enthusiasts across Victoria County and the central Cape Breton region with regular shooting programs. Membership is required, and we welcome recurve, compound, and longbow archers of all skill levels to our welcoming community. Whether you are a local resident or visiting the world-famous Cabot Trail region, Bras d'Or Archers provides a friendly atmosphere for target shooting in one of Nova Scotia's most picturesque settings. Contact Joe Harvie for membership details and schedules.",

    'antigonish-archery-association': "Antigonish Archery Association serves the growing archery community in Antigonish and the surrounding northeastern Nova Scotia region with quality programming and facilities. Our club provides opportunities for archers of all skill levels to practice, improve, and develop their abilities in a supportive environment. Membership is required, and we welcome recurve, compound, and longbow shooters year-round. Serving Antigonish, Guysborough County, and the vibrant St. Francis Xavier University community, our association is the primary archery venue for this part of the province. Whether you are a student, local resident, or visitor, contact Dion Sampson for current membership details and shooting schedules.",

    'greenwood-archery-club': "Greenwood Archery Club operates at 14 Wing Greenwood, part of the military base's Recreation Association in the scenic Annapolis Valley of Nova Scotia. We offer outdoor practice and 3D range shooting during summer months, transitioning to our comfortable indoor range for winter shooting sessions. Our club hosts organized shoots throughout the year, keeping members actively engaged across all seasons. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Serving Greenwood, Kingston, Middleton, and Annapolis Valley military families and civilians alike, contact Jeff Cox for membership details and join the Valley's most active archery club.",

    'down-by-the-bay-archery': "Down by the Bay Archery is a traditional archery club located on Two Islands Road in Parrsboro, along Nova Scotia's stunning Bay of Fundy coastline. Our club specializes in traditional bows and proudly hosts the Outdoor Field Provincials, drawing skilled competitors from across the entire province. We offer field course shooting in beautiful natural surroundings with spectacular views overlooking the bay. Membership is required, and traditional bow styles are featured prominently including recurve and longbow. Serving Parrsboro, Great Village, Economy, and the Cumberland County coastline, contact Dorothy Best for membership and event information in this unique Maritime setting.",

    'annapolis-valley-shooting-sports-club': "Annapolis Valley Shooting Sports Club on White Rock Road in Kentville provides quality archery facilities as part of their comprehensive multi-discipline shooting sports complex. Our club serves archers across the entire Annapolis Valley with well-maintained range facilities suitable for all skill levels. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located in the heart of the Valley, we serve Kentville, Wolfville, New Minas, Berwick, and the surrounding communities. Whether you are a dedicated target archer or a multi-discipline shooting sports enthusiast, contact Kevin Gaul for membership information and current shooting schedules.",

    'annapolis-east-archery-club': "Annapolis East Archery Club operates at Rotary Park on Lily Lake Road in Middleton, Nova Scotia, providing quality outdoor archery facilities. Our range hosts Archery Nova Scotia 720 Provincial competitions, establishing us as a key venue in the province's competitive archery circuit. Membership is required, and we welcome recurve, compound, and longbow archers of all experience levels. Located in the Annapolis Valley between Kentville and Bridgetown, our club serves Middleton, Kingston, Greenwood, Lawrencetown, and surrounding communities throughout the region. Whether you are training for provincial competitions or enjoying recreational archery, contact Chris England for membership details and upcoming event schedules.",

    'hartz-point-archers': "Hartz Point Archers is an archery club located on Hartz Point Road in Shelburne, along Nova Scotia's scenic South Shore coastline. Our club has provided a dedicated local archery venue for the Shelburne County community for years. Membership is required, and we welcome archers shooting recurve, compound, and longbow at our facilities. Serving Shelburne, Barrington, Lockeport, and the surrounding South Shore communities, Hartz Point Archers is the area's established archery destination. Please note that the club's current operating status should be verified before visiting by contacting them directly for the latest information on schedules, membership availability, and range access.",

    'bowhunters-association-of-nova-scotia': "Bowhunters Association of Nova Scotia (BANS) is the provincial organization proudly representing bowhunters across all of Nova Scotia. Based in Lower Sackville, BANS advocates for bowhunting rights, promotes ethical and responsible hunting practices, and organizes 3D archery events throughout the province. Membership connects you with a dedicated network of bowhunters from Cape Breton to Yarmouth and everywhere in between. Whether you are preparing for hunting season or competing in exciting 3D shoots, BANS provides essential resources, community connections, and strong representation for Nova Scotia's bowhunting community. Join and support the future of archery hunting in the Maritimes at bowhuntersns.com.",

    'traditional-archery-association-of-nova-scotia-taans': "The Traditional Archery Association of Nova Scotia (TAANS) is the provincial body dedicated to promoting traditional archery, including 3D and field course disciplines across the province. Based in Louisbourg, Cape Breton, TAANS organizes events and competitions for traditional bow enthusiasts from Halifax to Sydney and beyond. Under the leadership of President Roy MacInnis, the association actively supports recurve, longbow, and primitive bow archers in developing their skills. Whether you shoot instinctive or with sights, TAANS connects you with Nova Scotia's vibrant and growing traditional archery community. Visit taans.ca for event calendars, membership details, and traditional archery resources throughout the Maritimes.",

    'breton-traditional-archery-club': "Breton Traditional Archery Club is a dedicated traditional archery club on Coxheath Road at Blacketts Lake in Cape Breton, Nova Scotia. Our club specializes in traditional bow styles and hosts engaging 3D and field course events throughout the shooting season. Membership is required, and we welcome recurve, longbow, and primitive bow archers to our growing community. Serving Sydney, Coxheath, North Sydney, and the greater Cape Breton Regional Municipality, our club provides a focused venue for traditional archery enthusiasts of all skill levels. Whether you are an experienced traditional shooter or curious about instinctive archery, contact Marlene Gavel to join at btarchers.ca.",

    'the-barn-archers': "The Barn Archers in Marion Bridge, Cape Breton, offers a dedicated 100-by-24-foot indoor archery facility with 6 well-maintained lanes. Our range specializes in traditional bows only — recurve, longbow, primitive, and Olympic recurve styles are all welcome. 3D targets are available for dynamic practice, and our PAC-certified coaching provides expert instruction for archers of all levels. Members enjoy convenient key fob access for flexible practice times throughout the week. Our on-site pro shop carries traditional archery equipment and accessories. Located on Joanne Langford Drive, we serve archers across Cape Breton. Contact John for membership details and coaching availability.",

    'johns-archery': "John's Archery is a specialized traditional archery pro shop located on Joanne Langford Drive in Marion Bridge, Cape Breton, Nova Scotia. Connected with The Barn indoor range next door, we specialize in traditional archery equipment including bows, arrows, custom strings, fletching supplies, and accessories for every skill level. Our knowledgeable staff provides expert advice on equipment selection, bow setup, and tuning for recurve, longbow, and primitive bow archers. Open by appointment from 10 AM to 8 PM, we serve traditional archers across Cape Breton and all of Nova Scotia. Visit johnsarchery.ca for our full product selection.",

    'highland-bow--arrow': "Highland Bow & Arrow is a traditional outdoor archery range located on the world-famous Cabot Trail at Wreck Cove in Cape Breton, Nova Scotia. Our scenic 8-target 3D course winds through beautiful coastal woodland with stunning ocean views, offering a truly unique and memorable archery experience. Open June 1 through November 30, we offer beginner lessons and equipment rental for drop-in visitors at $20 to $30. No membership is required, making us perfect for tourists and locals alike. Closed Tuesdays. Whether you are exploring the Cabot Trail or a local Cape Breton archer, experience unforgettable outdoor traditional archery.",

    'nova-tactical-archery-range': "Nova Tactical Archery Range on Windmill Road in Dartmouth is the Halifax area's only dedicated indoor archery facility, conveniently located for the entire HRM. Our 18-metre competition shooting line features 8 well-lit lanes for consistent, professional-grade target practice. Part of the Nova Tactical complex, our pro shop stocks archery equipment for all disciplines and skill levels. Equipment rental and lessons are available for beginners, and no membership is required to shoot. We welcome recurve, compound, and longbow archers of all experience levels. Serving Halifax, Dartmouth, Bedford, and the entire HRM, we are Atlantic Canada's most accessible urban indoor archery range.",

    'lunenburg-rod--gun-club-archery-section': "Lunenburg Rod & Gun Club's archery section offers both a 20-metre indoor range and outdoor 3D and block target shooting on Fish Peddler Road in the historic town of Lunenburg, Nova Scotia. Saturday sessions run from 12 to 3 PM with pre-registration required for all participants. Drop-in rates are just $5 for non-members and $3 for members, making this one of Nova Scotia's most affordable and accessible archery venues. All disciplines are welcome including traditional, compound, and crossbow shooting. Serving Lunenburg, Bridgewater, Mahone Bay, and the entire South Shore, our range provides great weekend archery for the whole community.",

    'musquodoboit-valley-rifle--revolver-club-archery-range': "Musquodoboit Valley Rifle & Revolver Club operates an outdoor archery range as part of their comprehensive shooting sports facility in Middle Musquodoboit, Nova Scotia. Member access provides a dedicated and well-maintained venue for outdoor target practice in the scenic and peaceful Musquodoboit Valley. Membership is required for range access, and we welcome all bow types including recurve, compound, and longbow. Serving Middle Musquodoboit, Upper Musquodoboit, Sheet Harbour, and the eastern HRM rural communities, our range offers quality outdoor archery in beautiful Nova Scotia countryside. Whether you are a target archer or bowhunter, contact the club for membership details and access information.",

    'millbrook-3d-shooters-association': "Millbrook 3D Shooters Association offers exciting indoor and outdoor 3D archery near Truro in central Nova Scotia. Indoor sessions run Wednesday evenings from 6 to 7:45 PM and Tuesday and Sunday from 11 AM to 2 PM, providing flexible scheduling options. Our outdoor 3D shoots take place at the Community Hall on Church Road and the Irwin Lake Road Christmas Tree Farm. We partner with St. Mary's Archery for expanded fall and winter programs. Membership is required, and all bow types are welcome. Serving Millbrook First Nation, Truro, Bible Hill, and Colchester County with year-round 3D archery experiences.",

    'seawinds-horse-archers': "Seawinds Horse Archers in Baxters Harbour offers a truly unique year-round horseback archery training facility in Nova Scotia's stunning Annapolis Valley. Our programs include beginner camps, clinics, and professional instruction in mounted archery — an extremely rare specialty in all of Atlantic Canada. Coach Lance Bishop serves as an International Competition Judge, bringing world-class expertise and certification to every training session. Equipment and lessons are available for newcomers to this ancient and thrilling art. Located on Old Baxter's Mill Road overlooking the Bay of Fundy, we serve the entire Maritime region. Experience the extraordinary combination of equestrianism and traditional archery.",

    'queens-archers-association': "Queens Archers Association, founded in 1981, operates year-round archery facilities at White Point in Queens County on Nova Scotia's beautiful South Shore. Our outdoor range features multiple courses including challenging 3D shooting setups, and we host the popular annual Glen Mansfield Memorial 3D Shoot alongside other exciting competitions throughout the year. Membership drives are held each January for new and returning members. We welcome all bow types including recurve, compound, and longbow. Serving Liverpool, Queens County, Shelburne, and the entire South Shore region, join one of Nova Scotia's longest-running and most welcoming archery clubs for year-round shooting.",

    'xlimits-archery-supply': "Xlimits Archery Supply in Upper Tantallon is a full-service archery pro shop proudly serving the Halifax Regional Municipality since 2017. We specialize in custom bowstrings, bow sales, professional setup and tuning, and comprehensive archery lessons for all skill levels. Our experienced team brings competition archery expertise and authorized dealership for major bow brands to every customer interaction. Whether you need a new bow, custom string work, or professional one-on-one instruction, Xlimits delivers expert service for recurve, compound, and traditional archers. Located on Aralia Lane near the Hammonds Plains corridor, we serve archers across HRM and all of Nova Scotia."
};

async function updateDescriptions() {
    console.log('Nova Scotia Ranges SEO Description Update');
    console.log('──────────────────────────────────────────');
    let updated = 0;
    let failed = 0;
    let notFound = 0;

    for (const [slug, description] of Object.entries(descriptions)) {
        const { data, error } = await supabase
            .from('ranges')
            .update({
                description: description,
                updated_at: new Date().toISOString()
            })
            .eq('slug', slug)
            .select('id');

        if (error) {
            console.error(`FAILED ${slug}: ${error.message}`);
            failed++;
        } else if (!data || data.length === 0) {
            console.log(`NOT FOUND: ${slug}`);
            notFound++;
        } else {
            console.log(`OK: ${slug}`);
            updated++;
        }
    }

    console.log('──────────────────────────────────────────');
    console.log(`Results: ${updated} updated, ${failed} failed, ${notFound} not found`);
}

updateDescriptions().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
