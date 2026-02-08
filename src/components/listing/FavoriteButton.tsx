'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    listingId: string;
    initialIsFavorited?: boolean;
}

export function FavoriteButton({ listingId, initialIsFavorited = false }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // If we don't have initial state, we might want to check it on mount? 
    // For now assume passed or we check.
    // Actually, let's checking on mount if not passed clearly to be safe, 
    // but optimistic UI relies on knowing it. 
    // Let's assume the parent fetches it or we fetch it here if user is logged in.

    useEffect(() => {
        async function checkStatus() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('listing_id', listingId)
                .single();

            if (data) setIsFavorited(true);
        }
        checkStatus();
    }, [listingId, supabase, initialIsFavorited]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click if in a card
        e.stopPropagation();

        if (loading) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // Show tooltip or redirect? Requirement says "Sign in to save favorites" tooltip/modal
            // For MVP, alert and redirect
            if (confirm("Sign in to save favorites. Go to login?")) {
                router.push(`/auth/login?redirect=${window.location.pathname}`);
            }
            return;
        }

        setLoading(true);
        const previousState = isFavorited;
        setIsFavorited(!isFavorited); // Optimistic

        try {
            if (previousState) {
                // Remove
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('listing_id', listingId);
                if (error) throw error;
            } else {
                // Add
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, listing_id: listingId });
                if (error) throw error;
            }

            router.refresh(); // Refresh to update server components if needed
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setIsFavorited(previousState); // Revert
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${isFavorited
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                    : 'bg-white/90 text-stone-400 hover:text-rose-500 hover:bg-white'
                } shadow-sm backdrop-blur-sm group`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={`w-5 h-5 transition-transform ${isFavorited ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
        </button>
    );
}
