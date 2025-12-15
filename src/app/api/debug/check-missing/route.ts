
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();

    const namesToCheck = [
        'Archery Canada Centre of Excellence - Cambridge 2022',
        'Cambridge Archery Club',
        'The Archery Place',
        'Delhi Archery Club',
        'Onaping Falls Archery Club',
        'St. Catharines Bowmen Archery Club',
        'Erie Trackers',
        'Wilderness Bowhunters and Archers Association'
    ];

    // 1. Check if these exist in ranges
    // Since names might vary slightly, we'll try ILIKE
    const results = [];
    for (const name of namesToCheck) {
        // split to first few words for fuzzy match
        const shortName = name.split(' - ')[0].substring(0, 15);
        const { data, error } = await supabase
            .from('ranges')
            .select('id, name, slug, parking_available')
            .ilike('name', `%${shortName}%`);

        results.push({ searched: name, found: data, error: error?.message });
    }

    // 2. Check column type of 'parking_available' via a test insert/select?
    // We can't easily check information_schema via client.
    // But if the above select 'parking_available' works and returns string, we know it's good.

    return NextResponse.json({
        missingstats: results
    });
}
