'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, MapPin, ImageIcon, Building2, TreePine, Compass } from 'lucide-react';

interface FavoriteRange {
    id: string;
    name: string;
    slug: string;
    facility_type: string | null;
    post_images: string[] | null;
    post_content: string | null;
    description: string | null;
    cities: {
        name: string;
        slug: string;
        provinces: {
            name: string;
            slug: string;
        };
    } | null;
}

interface Favorite {
    id: string;
    listing_id: string;
    ranges: FavoriteRange;
}

interface SuggestedRange {
    id: string;
    name: string;
    slug: string;
    facility_type: string | null;
    post_images: string[] | null;
    post_content: string | null;
    description: string | null;
    subscription_tier: string;
    cities: {
        name: string;
        slug: string;
        provinces: {
            name: string;
            slug: string;
        };
    } | null;
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [suggestions, setSuggestions] = useState<SuggestedRange[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

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
                    facility_type,
                    post_images,
                    post_content,
                    description,
                    cities:city_id (
                        name,
                        slug,
                        provinces:province_id (
                            name,
                            slug
                        )
                    )
                )
            `)
            .eq('user_id', user.id);

        const favs = (data || []) as unknown as Favorite[];
        setFavorites(favs);

        // If no favorites, fetch suggestions
        if (favs.length === 0) {
            await getSuggestions();
        }

        setLoading(false);
    }

    async function getSuggestions() {
        const { data } = await supabase
            .from('ranges')
            .select(`
                id,
                name,
                slug,
                facility_type,
                post_images,
                post_content,
                description,
                subscription_tier,
                cities:city_id (
                    name,
                    slug,
                    provinces:province_id (
                        name,
                        slug
                    )
                )
            `)
            .in('subscription_tier', ['premium', 'pro', 'basic'])
            .order('subscription_tier', { ascending: false })
            .limit(6);

        setSuggestions((data || []) as unknown as SuggestedRange[]);
    }

    useEffect(() => {
        getFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemove = async (e: React.MouseEvent, favId: string) => {
        e.preventDefault();
        e.stopPropagation();

        setFavorites(favorites.filter(f => f.id !== favId));

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favId);

        if (error) {
            console.error("Error deleting fav", error);
            getFavorites();
        }
    };

    function getShortDescription(range: { post_content?: string | null; description?: string | null }) {
        const text = range.post_content || range.description;
        if (!text) return null;
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
    }

    function getRangeUrl(range: FavoriteRange | SuggestedRange) {
        const provinceSlug = range.cities?.provinces?.slug;
        const citySlug = range.cities?.slug;
        if (provinceSlug && citySlug) {
            return `/${provinceSlug}/${citySlug}/${range.slug}`;
        }
        return `/${range.slug}`;
    }

    function RangeCard({ range, onRemove }: { range: FavoriteRange | SuggestedRange; onRemove?: (e: React.MouseEvent) => void }) {
        const hasImage = range.post_images && range.post_images.length > 0;
        const imageUrl = hasImage ? range.post_images![0] : null;
        const desc = getShortDescription(range);

        return (
            <Link
                href={getRangeUrl(range)}
                className="group block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all duration-300 relative"
            >
                <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={range.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm">No photo</span>
                        </div>
                    )}

                    {range.facility_type && (
                        <div className="absolute bottom-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                                {range.facility_type === 'indoor' ? <Building2 className="w-3.5 h-3.5" /> : <TreePine className="w-3.5 h-3.5" />}
                                {range.facility_type === 'both' ? 'Indoor/Outdoor' : range.facility_type.charAt(0).toUpperCase() + range.facility_type.slice(1)}
                            </span>
                        </div>
                    )}
                </div>

                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm text-rose-500 hover:bg-white hover:text-rose-600 transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove from favorites"
                    >
                        <Heart className="w-4 h-4 fill-current" />
                    </button>
                )}

                <div className="p-5">
                    <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{range.name}</h3>
                    <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{range.cities?.name || 'Unknown City'}, {range.cities?.provinces?.name || 'Unknown Province'}</span>
                    </div>
                    {desc && <p className="text-sm text-stone-600 line-clamp-2">{desc}</p>}
                </div>
            </Link>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-stone-50 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-stone-900 mb-8">My Favorites</h1>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse">
                                    <div className="h-48 bg-stone-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-stone-200 rounded w-3/4" />
                                        <div className="h-4 bg-stone-100 rounded w-1/2" />
                                        <div className="h-4 bg-stone-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : favorites.length === 0 ? (
                        <div>
                            <div className="text-center py-16 bg-white rounded-xl border border-stone-100 mb-12">
                                <Heart className="w-14 h-14 text-stone-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-stone-900 mb-2">No favorites yet</h3>
                                <p className="text-stone-500 mb-6 max-w-md mx-auto">
                                    Save your favorite archery ranges to quickly find them later. Tap the heart icon on any range to add it here.
                                </p>
                                <Link href="/" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                                    <Compass className="w-5 h-5" />
                                    Explore Ranges
                                </Link>
                            </div>

                            {suggestions.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Ranges You Might Like</h2>
                                    <p className="text-stone-500 mb-6">Check out some of the top archery ranges across Canada.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {suggestions.map(range => (
                                            <RangeCard key={range.id} range={range} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((fav) => (
                                <RangeCard
                                    key={fav.id}
                                    range={fav.ranges}
                                    onRemove={(e) => handleRemove(e, fav.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
