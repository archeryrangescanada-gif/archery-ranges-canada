require('dotenv').config({ path: '.env.local' });
const s = require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log("Searching for Archers Arena...");
    const { data: searchData, error: searchError } = await s
        .from('ranges')
        .select('id, name')
        .ilike('name', '%archers arena%');

    if (searchError) {
        console.error("Search error:", searchError);
        return;
    }

    if (searchData && searchData.length > 0) {
        console.log("Found matches:", searchData);

        for (const range of searchData) {
            console.log(`Deleting ${range.name}...`);
            const { error: deleteError } = await s
                .from('ranges')
                .delete()
                .eq('id', range.id);

            if (deleteError) {
                console.error(`Failed to delete ${range.name}:`, deleteError);
            } else {
                console.log(`✅ Successfully deleted ${range.name}`);
            }
        }
    } else {
        console.log("⚠️ Archers Arena not found in the database. It may have already been deleted.");
    }
}

main().catch(console.error);
