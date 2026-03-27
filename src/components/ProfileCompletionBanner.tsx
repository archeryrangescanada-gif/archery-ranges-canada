'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { X, UserCircle } from 'lucide-react';

export default function ProfileCompletionBanner() {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Don't show if already dismissed this session
        if (dismissed) return;

        const supabase = createClient();

        async function checkProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();

            // Profile is "complete" if they have at least first and last name
            const isComplete = !!(profile?.first_name?.trim() && profile?.last_name?.trim());
            setShow(!isComplete);
        }

        checkProfile();
    }, [dismissed]);

    if (!show || dismissed) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 relative overflow-hidden">
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-2xl" />

                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 mt-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 mb-1">Complete your profile!</p>
                        <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                            Add your name and archery details so the community knows who you are. Takes less than a minute!
                        </p>
                        <Link
                            href="/account/settings"
                            onClick={() => setDismissed(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                        >
                            Set Up Profile →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
