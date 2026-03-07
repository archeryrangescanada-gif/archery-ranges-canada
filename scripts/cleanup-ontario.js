require('dotenv').config({ path: '.env.local' });
const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await s.from('ranges').delete().ilike('name', 'Archers Arena').select('id, name');
    if (data && data.length > 0) {
        console.log('🗑️ Deleted:', data[0].name);
    } else {
        console.log('⚠️ Not found or error:', error?.message || 'no match');
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
