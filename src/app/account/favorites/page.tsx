'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Heart, MapPin, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    async function getFavorites() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('favorites')
            .select(`
        id,
        listing_id,
        ranges:listing_id (
          id,
          name,
          slug,
          city,
          province,
          facility_type,
          images
        )
      `)
            .eq('user_id', user.id);

        setFavorites(data || []);
        setLoading(false);
    }

    useEffect(() => {
        getFavorites();
    }, [supabase]);

    const handleRemove = async (e: React.MouseEvent, favId: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        setFavorites(favorites.filter(f => f.id !== favId));

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favId);

        if (error) {
            console.error("Error deleting fav", error);
            alert("Error removing favorite");
            getFavorites(); // Revert
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-stone-900 mb-8">My Favorites</h1>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-stone-100">
                        <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-stone-900">No favorites yet</h3>
                        <p className="text-stone-500 mb-6">Start exploring ranges and save them here.</p>
                        <Link href="/" className="text-emerald-600 font-semibold hover:underline">
                            Find a Range
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((fav) => {
                            const range = fav.ranges;
                            return (
                                <Link
                                    key={fav.id}
                                    href={`/${range.slug}`} // Assuming route is /slug or /[range]
                                    className="group block bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow relative"
                                >
                                    <div className="h-48 bg-stone-200 relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => handleRemove(e, fav.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm text-rose-500 hover:bg-white hover:text-rose-600 transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remove from favorites"
                                    >
                                        <Heart className="w-4 h-4 fill-current" />
                                    </button>

                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-stone-900 mb-1">{range.name}</h3>
                                        <p className="text-stone-500 text-sm mb-2">{range.city}, {range.province}</p>
                                        <span className="inline-block px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                                            {range.facility_type}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
