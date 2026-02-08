'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { LogOut, Settings, Heart, Star, MapPin, BarChart3, ClipboardList } from 'lucide-react';

interface UserProfileMenuProps {
    user: User;
}

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const supabase = createClientComponentClient();

    // Fetch profile data
    useEffect(() => {
        async function getProfile() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
            }
        }

        getProfile();
    }, [user.id, supabase]);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    // Get display name or fallback
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || 'User';

    // Get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate consistent background color based on user ID
    const getBackgroundColor = (id: string) => {
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
            'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
            'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
            'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
            'bg-rose-500'
        ];
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const bgColor = getBackgroundColor(user.id);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/20 hover:border-white/50 transition-colors"
                    />
                ) : (
                    <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-bold border-2 border-white/20 hover:border-white/50 transition-colors`}>
                        {getInitials(displayName)}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 border border-stone-100">
                    <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-800 truncate">{displayName}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            href="/account/favorites"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            <Heart className="w-4 h-4 mr-3 text-stone-500" />
                            Favorites
                        </Link>
                        <Link
                            href="/account/reviews"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            <Star className="w-4 h-4 mr-3 text-stone-500" />
                            Reviews
                        </Link>
                        <Link
                            href="/dashboard/onboarding"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            <ClipboardList className="w-4 h-4 mr-3 text-stone-500" />
                            Claim a Listing
                        </Link>

                        {profile?.role === 'business_owner' && (
                            <>
                                <div className="border-t border-stone-100 my-1" />
                                <Link
                                    href="/account/listings"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    <MapPin className="w-4 h-4 mr-3 text-stone-500" />
                                    My Listing
                                </Link>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    <BarChart3 className="w-4 h-4 mr-3 text-stone-500" />
                                    Analytics
                                </Link>
                            </>
                        )}

                        <div className="border-t border-stone-100 my-1" />
                        <Link
                            href="/account/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            <Settings className="w-4 h-4 mr-3 text-stone-500" />
                            Settings
                        </Link>
                    </div>

                    <div className="border-t border-stone-100 py-1">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
