/**
 * Compare Ontario CSV names against Supabase to find missing ranges.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => obj[h.trim()] = (values[idx] || '').trim());
        rows.push(obj);
    }
    return { headers, rows };
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

async function main() {
    // Read the most complete Ontario CSV
    const csvPath = path.join(__dirname, '..', 'Ontario_Archery_Ranges_Enriched_Complete.csv');

    if (!fs.existsSync(csvPath)) {
        console.error('CSV not found:', csvPath);
        // Try alternate
        const alt = path.join(__dirname, '..', 'Ontario_Archery_Ranges_Complete_Audited.csv');
        if (fs.existsSync(alt)) {
            console.log('Using alternate:', alt);
        }
        return;
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const { headers, rows } = parseCSV(csvText);

    console.log(`📄 CSV headers: ${headers.slice(0, 5).join(', ')}...`);
    console.log(`📄 CSV rows: ${rows.length}`);

    // Get Ontario ranges from DB
    const { data: province } = await supabase.from('provinces').select('id').ilike('name', 'Ontario').single();
    const { data: dbRanges } = await supabase.from('ranges').select('name').eq('province_id', province.id);

    const dbNames = new Set(dbRanges.map(r => r.name.toLowerCase().trim()));
    console.log(`🗃️  DB ranges: ${dbNames.size}`);

    // Find the name column in CSV
    const nameCol = headers.find(h => h.toLowerCase().includes('post_title') || h.toLowerCase().includes('name') || h.toLowerCase() === 'a');
    console.log(`📋 Name column: "${nameCol}"`);

    // Find missing
    const missing = [];
    for (const row of rows) {
        const csvName = (row[nameCol] || row[headers[0]] || '').trim();
        if (!csvName) continue;

        if (!dbNames.has(csvName.toLowerCase().trim())) {
            missing.push({ name: csvName, row });
        }
    }

    console.log(`\n❌ Missing from DB (${missing.length}):`);
    missing.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name}`);
        // Print key fields
        const city = m.row.post_city || m.row.city || '';
        const type = m.row.facility_type || '';
        console.log(`     City: ${city}, Type: ${type}`);
    });

    // Also check: in DB but not in CSV (shouldn't happen after audit)
    const csvNames = new Set(rows.map(r => (r[nameCol] || r[headers[0]] || '').toLowerCase().trim()));
    const extra = dbRanges.filter(r => !csvNames.has(r.name.toLowerCase().trim()));
    if (extra.length > 0) {
        console.log(`\n⚠️ In DB but not in CSV (${extra.length}):`);
        extra.forEach(r => console.log(`  - ${r.name}`));
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
