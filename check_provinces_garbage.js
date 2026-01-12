const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProvinces() {
    const { data, error } = await supabase.from('provinces').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log('--- Provinces in Database ---');
    data.forEach(p => {
        console.log(`ID: ${p.id} | Name: "${p.name}" | Slug: "${p.slug}"`);
    });
}

checkProvinces();
