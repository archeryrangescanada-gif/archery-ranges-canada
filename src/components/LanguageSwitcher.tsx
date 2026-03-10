'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { ChangeEvent } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(e: ChangeEvent<HTMLSelectElement>) {
        const nextLocale = e.target.value;
        router.replace(pathname, { locale: nextLocale });
    }

    return (
        <div className="flex items-center ml-4">
            <select
                defaultValue={locale}
                onChange={onSelectChange}
                className="bg-transparent text-white border border-white/40 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent cursor-pointer hover:bg-white/10 transition-colors"
                aria-label="Select language"
            >
                <option value="en" className="text-gray-900">EN - English</option>
                <option value="fr" className="text-gray-900">FR - Français</option>
            </select>
        </div>
    );
}
