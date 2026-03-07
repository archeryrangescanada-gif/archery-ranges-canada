require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // Check all PEI ranges
    const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .ilike('name', 'Prince Edward Island')
        .single();

    if (!province) {
        console.log('No PEI province found');
        process.exit(1);
    }

    const { data: ranges } = await supabase
        .from('ranges')
        .select('id, name')
        .eq('province_id', province.id);

    console.log('Current PEI ranges:', JSON.stringify(ranges, null, 2));
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
