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

async function inspectGarbage() {
    const { data: provinces } = await supabase.from('provinces').select('*');
    const garbage = provinces.filter(p => !validProvinces.includes(p.name));

    for (const g of garbage) {
        const { data: cities } = await supabase.from('cities').select('*').eq('province_id', g.id);
        if (cities && cities.length > 0) {
            console.log(`Garbage Province: "${g.name}"`);
            for (const c of cities) {
                const { count: rangeCount } = await supabase.from('ranges').select('*', { count: 'exact', head: true }).eq('city_id', c.id);
                console.log(`  City: "${c.name}" | Slug: "${c.slug}" | Ranges: ${rangeCount}`);
                if (rangeCount > 0) {
                    const { data: ranges } = await supabase.from('ranges').select('name').eq('city_id', c.id);
                    ranges.forEach(r => console.log(`    Range: ${r.name}`));
                }
            }
        }
    }
}

inspectGarbage();
