
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

async function inspectRange() {
    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('*')
        .ilike('name', '%Cambridge Archery Club%');

    if (error) {
        console.error('Error fetching range:', error);
        return;
    }

    if (ranges.length === 0) {
        console.log('No range found with that name.');
        return;
    }

    console.log('Found ranges:', JSON.stringify(ranges, null, 2));
}

inspectRange();
