/**
 * Add 100-word SEO descriptions for newly added Ontario clubs.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DESCRIPTIONS = [
    {
        name: "Gobble 'n Grunt Archery & Outfitting",
        description: "Gobble 'n Grunt Archery & Outfitting is a specialty archery retail shop located in Almonte, Ontario. Serving the Lanark County and Ottawa Valley regions, this outfitter provides a curated selection of archery equipment, bowhunting gear, and outdoor accessories. Whether you're a seasoned bowhunter preparing for whitetail season or a beginner looking for your first compound bow setup, the knowledgeable staff offer personalized fitting and expert advice. Gobble 'n Grunt is a trusted local destination for hunters and target archers seeking quality brands, custom arrow building, and reliable service in eastern Ontario.",
    },
    {
        name: 'Archers Arena',
        description: "Archers Arena is a premier indoor archery facility located in North York, Ontario, serving the Greater Toronto Area. Specializing in recreational archery experiences, Archers Arena offers walk-in target shooting, archery tag games, and group event packages perfect for birthday parties, corporate team building, and social gatherings. The facility provides all equipment and instruction for beginners, making it an ideal introduction to the sport. With a fun, welcoming atmosphere and flexible booking options, Archers Arena has become one of Toronto's most popular destinations for entertainment archery and group activities.",
    },
    {
        name: 'Canada Archery Online',
        description: "Canada Archery Online is a premier indoor archery pro shop and range in Toronto, Ontario. Located at 105 Vanderhoof Avenue, the facility features a 4-lane indoor shooting range alongside a full-service pro shop carrying top archery brands. Lane rental is $9.99 per lane per hour. As an official sponsor of Archery Canada and the Canadian National Team, Canada Archery Online is a trusted destination for competitive and recreational archers. Lessons are available for all skill levels. Visit their Toronto showroom to browse equipment, test bows, and experience professional-grade archery facilities.",
    },
];

async function main() {
    console.log('📝 Adding SEO descriptions for new Ontario clubs');
    console.log('─'.repeat(50));

    let updated = 0;
    for (const { name, description } of DESCRIPTIONS) {
        const { data, error } = await supabase
            .from('ranges')
            .update({ description })
            .ilike('name', name)
            .select('id, name');

        if (error) {
            console.log(`  ❌ ${name}: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`  ✅ ${data[0].name} (${description.split(' ').length} words)`);
            updated++;
        } else {
            console.log(`  ⚠️ Not found: ${name}`);
        }
    }

    console.log('─'.repeat(50));
    console.log(`📊 Updated ${updated} of ${DESCRIPTIONS.length}`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
