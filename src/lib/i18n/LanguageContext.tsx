'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import en from './translations/en.json'
import fr from './translations/fr.json'

type Locale = 'en' | 'fr'

const translations: Record<Locale, Record<string, any>> = { en, fr }

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
