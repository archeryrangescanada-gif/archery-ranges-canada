'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';
import { ListingManager } from '@/components/dashboard/ListingManager';
import { Heart, Star, Eye, MousePointerClick, Settings, Plus } from 'lucide-react';

interface Profile {
    id: string;
    full_name: string | null;
    role: string;
}

interface DashboardStats {
    totalViews: number;
    totalFavorites: number;
    totalReviews: number;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<any[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalViews: 0,
        totalFavorites: 0,
        totalReviews: 0,
    });

    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        async function getUserData() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            setUser(user);

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            if (profileData?.role === 'business_owner') {
                fetchBusinessData(user.id);
            } else {
                fetchUserData(user.id);
            }

            setLoading(false);
        }

        getUserData();
    }, [supabase, router]);

    async function fetchBusinessData(userId: string) {
        // Fetch listings owned by user
        const { data: userListings } = await supabase
            .from('ranges')
            .select('*')
            .eq('owner_id', userId);

        if (userListings) {
            setListings(userListings);

            // Calculate stats (mocked for now until we have real analytics aggregation)
            const views = userListings.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
            setStats({
                totalViews: views,
                totalFavorites: 0, // Placeholder
                totalReviews: 0, // Placeholder
            });
        }
    }

    async function fetchUserData(userId: string) {
        // Fetch recent favorites or reviews could go here
        // For now we'll just show buttons
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 pt-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const isBusiness = profile?.role === 'business_owner' || profile?.role === 'admin';

    return (
        <div className="min-h-screen bg-stone-50 pb-12">
            {/* Header Section */}
            <div className="bg-white border-b border-stone-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">
                                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
                            </h1>
                            <p className="text-stone-500 mt-1">
                                {isBusiness ? 'Manage your listings and analytics' : 'Find your next archery adventure'}
                            </p>
                        </div>

                        {isBusiness ? (
                            <Link
                                href="/add-range"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Listing
                            </Link>
                        ) : (
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Find a Range
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Business Dashboard */}
                {isBusiness && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Total Views"
                                value={stats.totalViews}
                                icon={Eye}
                                color="blue"
                            />
                            <StatCard
                                label="Listing Clicks"
                                value={0} // To be implemented
                                icon={MousePointerClick}
                                color="purple"
                            />
                            <StatCard
                                label="Favorites"
                                value={stats.totalFavorites}
                                icon={Heart}
                                color="rose"
                            />
                            <StatCard
                                label="Reviews"
                                value={stats.totalReviews}
                                icon={Star}
                                color="amber"
                            />
                        </div>

                        {/* Listings Management */}
                        <ListingManager listings={listings} />
                    </div>
                )}

                {/* Regular User Dashboard */}
                {!isBusiness && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                                <h2 className="text-lg font-bold text-stone-900 mb-4">From Your Favorites</h2>
                                <div className="text-center py-12 bg-stone-50 rounded-lg">
                                    <Heart className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                                    <p className="text-stone-500 mb-4">You haven't favorited any ranges yet.</p>
                                    <Link href="/" className="text-emerald-600 font-medium hover:underline">
                                        Explore Ranges
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                                <h2 className="text-lg font-bold text-stone-900 mb-4">Quick Links</h2>
                                <nav className="space-y-2">
                                    <Link href="/profile/favorites" className="flex items-center p-3 rounded-lg hover:bg-stone-50 text-stone-600 hover:text-emerald-600 transition-colors">
                                        <Heart className="w-5 h-5 mr-3" />
                                        My Favorites
                                    </Link>
                                    <Link href="/profile/reviews" className="flex items-center p-3 rounded-lg hover:bg-stone-50 text-stone-600 hover:text-emerald-600 transition-colors">
                                        <Star className="w-5 h-5 mr-3" />
                                        My Reviews
                                    </Link>
                                    <Link href="/settings" className="flex items-center p-3 rounded-lg hover:bg-stone-50 text-stone-600 hover:text-emerald-600 transition-colors">
                                        <Settings className="w-5 h-5 mr-3" />
                                        Account Settings
                                    </Link>
                                </nav>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl shadow-sm p-6 text-white">
                                <h3 className="font-bold text-lg mb-2">Own an Archery Range?</h3>
                                <p className="text-emerald-100 text-sm mb-4">
                                    Claim your listing to manage your range's information, view analytics, and reach more archers.
                                </p>
                                <Link
                                    href="/pricing"
                                    className="block w-full text-center bg-white text-emerald-900 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                                >
                                    List Your Business
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
