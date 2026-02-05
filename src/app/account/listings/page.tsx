'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { ListingManager } from '@/components/dashboard/ListingManager';
import Link from 'next/link';

export default function ListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        async function getListings() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'business_owner' && profile?.role !== 'admin') {
                // Redirect to account settings with a message (toast not implemented yet so just redirect)
                // Ideally: toast.error("You don't have any claimed listings");
                router.push('/account/settings');
                return;
            }

            const { data } = await supabase
                .from('ranges')
                .select('*')
                .eq('owner_id', user.id);

            setListings(data || []);
            setLoading(false);
        }

        getListings();
    }, [supabase, router]);

    if (loading) return <div className="p-8 text-center bg-stone-50 min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-900">My Listings</h1>
                    <Link
                        href="/add-range"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Claim or Add Range
                    </Link>
                </div>

                <ListingManager listings={listings} />
            </div>
        </div>
    );
}
