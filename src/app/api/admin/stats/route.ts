import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/safe-client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use safe client
        const adminSupabase = getSupabaseClient();

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

        // Fetch all created_at dates for aggregation (lightweight enough for <1000 records)
        // If dataset grows large, replace with a SQL RPC function for grouping
        const { data: rangeDates } = await adminSupabase.from('ranges').select('created_at');
        const { data: claimDates } = await adminSupabase.from('claims').select('created_at');

        // Generate Chart Data (Last 6 Months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const chartData = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            const monthIdx = d.getMonth();
            const year = d.getFullYear();

            const listingsCount = rangeDates?.filter(r => {
                const rd = new Date(r.created_at);
                return rd.getMonth() === monthIdx && rd.getFullYear() === year;
            }).length || 0;

            const claimsCount = claimDates?.filter(c => {
                const cd = new Date(c.created_at);
                return cd.getMonth() === monthIdx && cd.getFullYear() === year;
            }).length || 0;

            chartData.push({
                month: monthName,
                listings: listingsCount,
                claims: claimsCount,
                ads: 0 // Placeholder until ads table exists
            });
        }

        return NextResponse.json({
            stats: {
                totalUsers: totalUsers || 0,
                totalListings: totalListings || 0,
                totalClaims: totalClaims || 0,
                pendingClaims: pendingClaims || 0,
                activeAds: finalActiveAds,
                totalAds: finalActiveAds
            },
            recentUsers: recentUsers || [],
            recentListings: recentListings || [],
            chartData // Include the real chart data
        });

    } catch (error: any) {
        console.error('Stats Server error:', error);
        if (error.message === 'Failed to create Supabase client') {
             return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
