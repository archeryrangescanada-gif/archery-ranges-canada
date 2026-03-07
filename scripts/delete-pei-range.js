require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // Get PEI province
    const { data: province } = await supabase
        .from('provinces')
        .select('id, name')
        .ilike('name', 'Prince Edward Island')
        .single();

    console.log('Province:', province);

    // Get PEI ranges with their city info
    const { data: ranges } = await supabase
        .from('ranges')
        .select('id, name, city_id, province_id')
        .eq('province_id', province.id);

    console.log('\nRanges:', JSON.stringify(ranges, null, 2));

    // Get the cities for these ranges
    const cityIds = [...new Set(ranges.map(r => r.city_id).filter(Boolean))];
    console.log('\nCity IDs from ranges:', cityIds);

    if (cityIds.length > 0) {
        const { data: cities } = await supabase
            .from('cities')
            .select('id, name, province_id, slug')
            .in('id', cityIds);

        console.log('\nCities:', JSON.stringify(cities, null, 2));
    }

    // Also check: what cities have province_id = PEI?
    const { data: peiCities } = await supabase
        .from('cities')
        .select('id, name, province_id, slug')
        .eq('province_id', province.id);

    console.log('\nCities with PEI province_id:', JSON.stringify(peiCities, null, 2));
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
