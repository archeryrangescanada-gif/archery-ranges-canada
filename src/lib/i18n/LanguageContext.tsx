'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

type Locale = 'en' | 'fr'

const translations: Record<Locale, Record<string, any>> = {
    en: {
        nav: {
            home: 'Home',
            about: 'About',
            blog: 'Blog',
            pricing: 'Pricing',
            signIn: 'Sign In',
            signUp: 'Sign Up',
        },
        province: {
            citiesWithRanges: 'Cities with Archery Ranges',
            totalRanges: 'Total Ranges',
            cities: 'Cities',
            comingSoon: 'Coming Soon',
            comingSoonDesc: "We're adding archery ranges in {name}. Check back soon!",
            browseAll: 'Browse All Provinces',
            aboutArchery: 'About Archery in {name}',
            viewRanges: 'View ranges',
            range: 'range',
            ranges: 'ranges',
            findRanges: 'Find archery ranges, lessons & pro shops',
            popularActivities: 'Popular archery activities in {name} include {activities}.',
            topCities: 'Top cities for archery in {name} include {cities}.',
            facilitySummary: "{name} offers {count} archery {facilityWord} across {cityCount} {cityWord}. Whether you're looking for indoor target practice, outdoor 3D courses, or professional coaching, you'll find options to match your skill level and interests.",
        },
        breadcrumb: { home: 'Home' },
        footer: { allRightsReserved: 'All rights reserved.' },
    },
    fr: {
        nav: {
            home: 'Accueil',
            about: 'À propos',
            blog: 'Blogue',
            pricing: 'Tarifs',
            signIn: 'Connexion',
            signUp: "S'inscrire",
        },
        province: {
            citiesWithRanges: "Villes avec des clubs de tir à l'arc",
            totalRanges: 'Total des clubs',
            cities: 'Villes',
            comingSoon: 'Bientôt disponible',
            comingSoonDesc: "Nous ajoutons des clubs de tir à l'arc pour {name}. Revenez bientôt !",
            browseAll: 'Parcourir toutes les provinces',
            aboutArchery: 'À propos du tir à l\'arc pour {name}',
            viewRanges: 'Voir les clubs',
            range: 'club',
            ranges: 'clubs',
            findRanges: "Trouvez des clubs de tir à l'arc, des cours et des boutiques",
            popularActivities: "Les activités populaires de tir à l'arc pour {name} comprennent {activities}.",
            topCities: "Les principales villes pour le tir à l'arc pour {name} comprennent {cities}.",
            facilitySummary: "{name} offre {count} {facilityWord} de tir à l'arc dans {cityCount} {cityWord}. Que vous cherchiez du tir sur cible intérieur, des parcours 3D extérieurs ou de l'entraînement professionnel, vous trouverez des options adaptées à votre niveau et à vos intérêts.",
        },
        breadcrumb: { home: 'Accueil' },
        footer: { allRightsReserved: 'Tous droits réservés.' },
    },
}

interface LanguageContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getNestedValue(obj: Record<string, any>, path: string): string {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj)
    return typeof value === 'string' ? value : path
}

function interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template
    return Object.entries(params).reduce(
        (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
        template
    )
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number = 365) {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en')

    useEffect(() => {
        const saved = getCookie('locale') as Locale | null
        if (saved && (saved === 'en' || saved === 'fr')) {
            setLocaleState(saved)
        }
    }, [])

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale)
        setCookie('locale', newLocale)
    }, [])

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        const template = getNestedValue(translations[locale], key)
        return interpolate(template, params)
    }, [locale])

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
