/**
 * Fix PEI city linkages — create missing cities and link ranges to them.
 * Also ensure cities have province_id set.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RANGE_CITY_MAP = [
    { rangeName: 'P.E.I. Archery Association', cityName: 'Covehead' },
    { rangeName: "Cass' Creek Archery Club", cityName: 'Covehead' },
    { rangeName: 'Elemental Acres Horse Archery', cityName: 'Farmington' },
];

function generateSlug(name) {
    return name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function main() {
    console.log('🔧 Fixing PEI city linkages');
    console.log('─'.repeat(45));

    // Get PEI province
    const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .ilike('name', 'Prince Edward Island')
        .single();

    if (!province) { console.error('Province not found'); process.exit(1); }
    const provinceId = province.id;
    console.log(`📌 PEI province ID: ${provinceId}`);

    // Pre-fetch existing cities
    const { data: existingCities } = await supabase
        .from('cities')
        .select('id, name, province_id, slug');

    const cityMap = new Map();
    existingCities?.forEach(c => cityMap.set(c.name.toLowerCase(), c));

    // Process each range
    for (const { rangeName, cityName } of RANGE_CITY_MAP) {
        console.log(`\n🏹 ${rangeName} → ${cityName}`);

        // Find or create city
        const key = cityName.toLowerCase();
        let city = cityMap.get(key);

        if (city) {
            console.log(`  📍 City exists: ${city.name} (ID: ${city.id})`);

            // Ensure province_id is set
            if (city.province_id !== provinceId) {
                const { error } = await supabase
                    .from('cities')
                    .update({ province_id: provinceId })
                    .eq('id', city.id);

                if (!error) {
                    console.log(`  ✅ Set province_id on city`);
                } else {
                    console.log(`  ❌ Failed to update city province: ${error.message}`);
                }
            }
        } else {
            // Create city with province_id and slug
            const { data: newCity, error } = await supabase
                .from('cities')
                .insert({
                    name: cityName,
                    slug: generateSlug(cityName),
                    province_id: provinceId,
                })
                .select('id, name, slug')
                .single();

            if (error) {
                console.log(`  ❌ Failed to create city: ${error.message}`);
                continue;
            }

            city = newCity;
            cityMap.set(key, city);
            console.log(`  🏙️ Created city: ${city.name} (ID: ${city.id}, slug: ${city.slug})`);
        }

        // Link range to city
        const { data: range, error: rangeErr } = await supabase
            .from('ranges')
            .update({ city_id: city.id })
            .eq('name', rangeName)
            .eq('province_id', provinceId)
            .select('id, name');

        if (rangeErr) {
            console.log(`  ❌ Failed to link range: ${rangeErr.message}`);
        } else if (range && range.length > 0) {
            console.log(`  ✅ Linked: ${range[0].name} → ${city.name}`);
        } else {
            console.log(`  ⚠️ Range not found`);
        }
    }

    // Verify
    console.log('\n' + '─'.repeat(45));
    console.log('📊 Verification:');

    const { data: peiCities } = await supabase
        .from('cities')
        .select('id, name, slug, province_id')
        .eq('province_id', provinceId);

    console.log(`  Cities with PEI province_id: ${peiCities?.length}`);
    peiCities?.forEach(c => console.log(`    - ${c.name} (slug: ${c.slug})`));

    const { data: peiRanges } = await supabase
        .from('ranges')
        .select('name, city_id')
        .eq('province_id', provinceId);

    console.log(`  Ranges with city_id set: ${peiRanges?.filter(r => r.city_id).length}/${peiRanges?.length}`);
    peiRanges?.forEach(r => console.log(`    - ${r.name} → city_id: ${r.city_id ? '✅' : '❌ null'}`));
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
