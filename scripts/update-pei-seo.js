require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const descriptions = {
    'pei-archery-association': "The P.E.I. Archery Association is Prince Edward Island's official provincial governing body for archery, headquartered in Covehead. Led by President Duncan Crawford, Head Coach of the National Paralympic Archery Team, the association organizes provincial championships, Atlantic championships, and national-level archery events across PEI. Their innovative Game On program introduces girls aged 14–18 to competitive archery. Whether you shoot recurve, compound, or longbow, PEI Archery serves as your gateway to organized archery on the Island. Contact the association for coaching programs, tournament schedules, and membership opportunities to elevate your archery skills in Prince Edward Island.",

    'cass-creek-archery-club': "Cass' Creek Archery Club in Covehead is Prince Edward Island's premier indoor archery training centre, owned and operated by nationally certified coach Duncan Crawford. Rebuilt after a 2017 fire, this elite facility features an 8-target indoor range with plans to expand to 16 lanes, accommodating up to 20-yard shooting distances. The only certified archery facility of its kind in Canada, Cass' Creek hosted the 2018 PEI Provincial Championships and 2022 Canadian Outdoor Championships. Their expert-led 6-week beginner courses maintain a maximum 8-to-1 student-instructor ratio. Equipment is provided, and sport tax receipts are issued for all programs.",

    'elemental-acres-horse-archery': "Elemental Acres Horse Archery in Farmington, PEI, offers a truly unique mounted and ground archery experience on Prince Edward Island. CFMA-certified instructors Emma and Marina lead sessions combining traditional archery with expert horsemanship. Ground archery starts at $50 per hour for groups, while mounted archery experiences begin at $75 per hour with a two-hour minimum. The Iron Horse Archers club meets on the first and third Saturdays from May onward at $60 per session. Group packages accommodate up to nine participants. All equipment and horses are provided, making this an unforgettable outdoor archery adventure in PEI."
};

async function updateDescriptions() {
    console.log('🏹 PEI Ranges SEO Description Update');
    console.log('──────────────────────────────────────');
    let updated = 0;
    let failed = 0;

    for (const [slug, description] of Object.entries(descriptions)) {
        console.log(`Updating ${slug}...`);

        const { data, error } = await supabase
            .from('ranges')
            .update({
                description: description,
                updated_at: new Date().toISOString()
            })
            .eq('slug', slug)
            .select('id, name');

        if (error) {
            console.error(`❌ Failed to update ${slug}: ${error.message}`);
            failed++;
        } else if (data && data.length > 0) {
            console.log(`✅ ${data[0].name}`);
            updated++;
        } else {
            console.log(`⚠️ No matching range for slug: ${slug}`);
            failed++;
        }
    }

    console.log('──────────────────────────────────────');
    console.log(`📊 Results: ${updated} updated, ${failed} failed`);
}

updateDescriptions().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
