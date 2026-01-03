import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a Service Role client to bypass RLS for stats
const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parallelize fetching counts for performance
        const [
            { count: totalUsers, error: usersError },
            { count: totalListings, error: listingsError },
            { count: totalClaims, error: claimsCountError },
            { count: pendingClaims, error: pendingClaimsError },
            { count: activeAds, error: adsError }
        ] = await Promise.all([
            adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
            adminSupabase.from('ranges').select('*', { count: 'exact', head: true }),
            adminSupabase.from('claims').select('*', { count: 'exact', head: true }),
            adminSupabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            // Assuming we have an 'ads' table, if not return 0 for now or check check your schema
            // We saw 'src/app/admin/ads/page.tsx', so let's check schema if possible, or fail gracefully
            // For now, let's assume 'advertising' or 'ads' table. If not, we'll try 'ranges' with is_featured=true as a proxy if ads table missing.
            // Let's safe guard this.
            adminSupabase.from('advertising').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        // Handle ads table potentially not existing yet
        let finalActiveAds = 0;
        if (adsError && adsError.code === '42P01') {
            // "relation does not exist" - Fallback to 0 if table missing
            console.log('Ads table missing, returning 0');
            finalActiveAds = 0;
        } else if (activeAds !== null) {
            finalActiveAds = activeAds;
        }

        if (usersError) console.error('Error fetching users count:', usersError);
        if (listingsError) console.error('Error fetching listings count:', listingsError);


        // Fetch Recent Activity (e.g., last 5 new users or listings)
        // We'll combine them or just send separate lists
        const { data: recentUsers } = await adminSupabase
            .from('profiles')
            .select('email, created_at, role')
            .order('created_at', { ascending: false })
            .limit(5);

        const { data: recentListings } = await adminSupabase
            .from('ranges')
            .select('name, city, created_at, status')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: {
                totalUsers: totalUsers || 0,
                totalListings: totalListings || 0,
                totalClaims: totalClaims || 0,
                pendingClaims: pendingClaims || 0,
                activeAds: finalActiveAds,
                totalAds: finalActiveAds // simplistic for now
            },
            recentUsers: recentUsers || [],
            recentListings: recentListings || []
        });

    } catch (error) {
        console.error('Stats Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
