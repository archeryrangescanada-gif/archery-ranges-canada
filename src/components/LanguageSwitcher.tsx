'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage()

    return (
        <button
            onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
            className="text-xs font-semibold px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors tracking-wide"
            aria-label={locale === 'en' ? 'Passer au français' : 'Switch to English'}
            title={locale === 'en' ? 'Français' : 'English'}
        >
            {locale === 'en' ? 'FR' : 'EN'}
        </button>
    )
}
