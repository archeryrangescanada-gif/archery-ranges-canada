
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking for table: range_submissions...');

    const { data, error } = await supabase
        .from('range_submissions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error querying table:', error);
        if (error.code === '42P01') {
            console.log('CONFIRMED: Table "range_submissions" does NOT exist.');
        }
    } else {
        console.log('Table exists. Row count:', data.length);
    }
}

checkTable();
