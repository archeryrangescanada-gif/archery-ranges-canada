require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // Get BC province ID
    const { data: prov } = await supabase.from('provinces').select('id').ilike('name', 'British Columbia').single();
    if (!prov) return console.error("No BC province");

    // Get all BC ranges
    const { data: ranges, error } = await supabase.from('ranges').select('id, name, owner_id').eq('province_id', prov.id);
    if (error) return console.error(error);

    const claimed = ranges.filter(r => r.owner_id !== null);
    console.log(`Found ${claimed.length} claimed ranges out of ${ranges.length} total BC ranges.`);
    console.log(claimed.map(c => `- ${c.name} (owner_id: ${c.owner_id})`).join('\n'));
}

run();
