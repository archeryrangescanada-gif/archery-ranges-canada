
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBatch() {
    const updates = [
        {
            id: '5b85925a-4c8c-4352-9428-92783ae4039c',
            name: 'Archery Canada Centre of Excellence - Cambridge 2022',
            phone_number: '(613) 260-2113',
            email: 'zmeil@archerycanada.ca',
            website: 'https://archerycanada.ca/',
            post_content: `Located at Moyer's Landing in Cambridge, the Archery Canada Centre of Excellence is the national training hub for Olympic Recurve archery in Canada. This elite facility features a world-class 70-meter outdoor target range, designed specifically to prepare national team athletes for international competition, including the World Championships and Olympic Games.

While primarily a high-performance training center, its presence in Cambridge underscores the region's importance to the sport. The center provides a centralized professional environment for Canada's top archers and coaches. For serious competitors and those following the sport's highest levels, this facility represents the pinnacle of target archery infrastructure in the country, bringing Olympic-level standards to the local community.`
        },
        {
            id: '595371b6-9949-43a2-ba8d-c8b707361bc7',
            name: 'Ottawa Archers',
            email: 'ottawaarchers@gmail.com',
            post_tags: ['archery', 'outdoor archery', '3D archery', 'Richmond', 'Ottawa'],
            post_content: `Ottawa Archers in the Richmond area offers one of the most comprehensive outdoor shooting experiences in the Ottawa region. Open 365 days a year from dawn to dusk, this self-serve facility is a dream for dedicated archers looking for maximum flexibility. The range includes a varied 15-lane 3D course, target butts up to 50 meters, and a specialized FITA field with distances extending to a significant 70 meters.

The club is notable for its inclusive equipment rules, allowing crossbows on practice butts and the 3D course. Located with convenient access via the Twin Elms Rugby Club, it provides a quiet, natural setting for archers of all ages. Whether you're training for professional competition at 70m or just looking for a weekend walk through the 3D lanes, Ottawa Archers provides the space and facilities to master your craft.`
        },
        {
            id: '9f65c91a-aadd-4a48-a50a-6cdb51385fff',
            name: 'Petawawa Archery Club',
            email: 'info@cfmws.ca',
            post_tags: ['archery', 'indoor archery', 'outdoor archery', 'Petawawa', 'CFMWS'],
            post_content: `The Petawawa Archery Club, a part of Canadian Forces Morale and Welfare Services (CFMWS), is a top-tier facility serving the military community and the general public. This club offers amazing variety with a 30-yard indoor range for winter use and three specialized outdoor ranges, including a 14-target 3D course, a dedicated FITA target range, and a practice range for distances up to 60 yards.

The club is particularly well-regarded for its education programs, offering structured 8-week beginner courses twice a year and providing affordable equipment rentals. With year-round availability and regularly hosted 3D tournaments, it's a perfect destination for both competitive target archers and bowhunters in the Petawawa and Pembroke areas. Its commitment to safety and skill development makes it the premier archery resource in the Renfrew County region.`
        },
        {
            id: 'af004ad4-75cf-463c-a225-6ccfb2464e6c',
            name: 'Lambton Bowhunters Association Inc.',
            phone_number: '519-336-9486',
            post_tags: ['archery', 'bowhunting', 'Sarnia', 'Sarnia-Lambton'],
            post_content: `Founded in 1979, the Lambton Bowhunters Association in Sarnia is a dedicated 40-acre oasis for archers of all styles. This club is uniquely tailored for bowhunters, featuring a specialized tower for broadhead pit stand shooting practice along with traditional target lanes up to 40 yards. Whether you shoot traditional, compound, or crossbow, the inclusive environment and challenging wooded terrain provide the perfect setting to sharpen your skills.

The association places a heavy emphasis on community and education, offering year-round instruction through their outdoor range and an indoor winter partnership at River City Vineyard. With low membership fees designed to support families and monthly meetings featuring expert speakers, it is a highly accessible and social club. For anyone in the Sarnia-Lambton area seeking a dedicated, bowhunter-focused club with a strong instructional foundation, this association remains a top local choice.`
        },
        {
            id: '4de57178-8de6-464b-bad5-9f2dc34edddb',
            name: 'Sydenham Sportsmen\'s Association',
            email: 'john@sydenhamsportsmen.com',
            post_tags: ['archery', 'conservation', 'outdoor archery', 'Georgian Bluffs', 'Grey-Bruce'],
            post_content: `The Sydenham Sportsmen's Association in Georgian Bluffs is a pillar of both conservation and shooting sports, serving the region since 1947. This multi-discipline club offers an impressive array of activities, including a dedicated outdoor archery range. What makes this club truly special is its deep commitment to the environment—operating two fish hatcheries and managing extensive wildlife habitat projects alongside its shooting programs.

As a members-only facility, Sydenham focuses on safety and high-quality recreational opportunities. From target archery to sporting clays and high-power rifle ranges, it provides a comprehensive experience on its well-maintained property. If you are a sportsman who values both marksmanship and active environmental stewardship, this association offers a unique and fulfilling community to join in the Grey-Bruce area.`
        }
    ];

    for (const item of updates) {
        const { id, name, ...data } = item;
        const { error } = await supabase
            .from('ranges')
            .update(data)
            .eq('id', id);

        if (error) {
            console.error(`Error updating ${name}:`, error);
        } else {
            console.log(`Successfully updated ${name}`);
        }
    }
}

fixBatch();
