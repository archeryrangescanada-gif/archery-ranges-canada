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

const validProvinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
    'Saskatchewan', 'Yukon'
];

async function auditGarbage() {
    const { data: provinces, error } = await supabase.from('provinces').select('*');
    if (error) return console.error(error);

    const garbage = provinces.filter(p => !validProvinces.includes(p.name));

    console.log(`Found ${garbage.length} garbage provinces.`);

    for (const g of garbage) {
        const { count: cityCount } = await supabase.from('cities').select('*', { count: 'exact', head: true }).eq('province_id', g.id);
        const { count: rangeCount } = await supabase.from('ranges').select('*', { count: 'exact', head: true }).eq('province_id', g.id);

        if (cityCount > 0 || rangeCount > 0) {
            console.log(`Garbage "${g.name}" (ID: ${g.id}) has: ${cityCount} cities, ${rangeCount} ranges.`);
        }
    }
}

auditGarbage();
