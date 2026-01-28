const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- PLANS ---');
    const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

    if (plansError) console.error(plansError);
    else console.table(plans.map(p => ({
        name: p.name,
        price: p.price,
        is_public: p.is_public,
        id: p.id
    })));

    console.log('\n--- SUBSCRIPTIONS ---');
    const { data: subs, error: subsError } = await supabase
        .from('subscriptions')
        .select('id, status, plan_id');

    if (subsError) console.error(subsError);
    else {
        console.log(`Total Subscriptions: ${subs.length}`);
        console.table(subs);
    }
}

checkData();
