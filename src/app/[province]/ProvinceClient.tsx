'use client'

import Link from 'next/link'
import { Home, ChevronRight, MapPin, Target, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ClaimListingBanner } from '@/components/listing/ClaimListingBanner'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface City {
    id: string
    name: string
    slug: string
    province_id: string
}

interface Province {
    id: string
    name: string
    slug: string
}

interface ProvinceClientProps {
    province: Province
    provinceSlug: string
    citiesWithRanges: City[]
    citiesLength: number
    rangeCounts: Record<string, number>
    totalRanges: number
    sortedLetters: string[]
    cityGroups: Record<string, City[]>
    info: {
        description: string
        popularCities: string[]
        topActivities: string[]
    }
}

export default function ProvinceClient({
    province,
    provinceSlug,
    citiesWithRanges,
    citiesLength,
    rangeCounts,
    totalRanges,
    sortedLetters,
    cityGroups,
    info
}: ProvinceClientProps) {
    const { t, locale } = useLanguage()

    // Basic sentence translation for the hardcoded SEO content if French
    const description = locale === 'fr' && provinceSlug === 'prince-edward-island'
        ? "L'Île-du-Prince-Édouard est peut-être la plus petite province du Canada, mais sa communauté de tir à l'arc est passionnée et accueillante. Les clubs de l'Î.-P.-É. offrent une atmosphère chaleureuse pour les archers de tous niveaux, avec des possibilités de tir intérieur et extérieur sur l'île."
        : info.description;

    const facilityWord = totalRanges === 1
        ? t('province.range')
        : t('province.ranges');

    let cityWord = citiesWithRanges.length === 1 ? 'city' : 'cities';
    if (locale === 'fr') cityWord = citiesWithRanges.length === 1 ? 'ville' : 'villes';

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
            {/* Header */}
            <Header />

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200">
                <div className="container mx-auto px-4">
                    <ol className="flex items-center gap-1 py-4 text-sm">
                        <li className="flex items-center">
                            <Link href="/" className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-600 transition-colors">
                                <Home className="w-4 h-4" />
                                {t('breadcrumb.home')}
                            </Link>
                        </li>
                        <li className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-stone-400 mx-2" />
                            <span className="text-stone-800 font-medium">{province.name}</span>
                        </li>
                    </ol>
                </div>
            </nav>

            {/* Claim CTA Banner */}
            <div className="container mx-auto px-4 py-4">
                <ClaimListingBanner />
            </div>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-emerald-300" />
                        <span className="text-emerald-200">Canada</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {locale === 'fr' ? `Clubs de tir à l'arc : ${province.name}` : `Archery Ranges in ${province.name}`}
                    </h1>

                    <p className="text-xl text-emerald-100 max-w-3xl mb-6">
                        {description}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                            <p className="text-3xl font-bold">{totalRanges}</p>
                            <p className="text-sm text-emerald-200">{t('province.totalRanges')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                            <p className="text-3xl font-bold">{citiesWithRanges.length}</p>
                            <p className="text-sm text-emerald-200">{t('province.cities')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-12">
                {/* Cities with Ranges */}
                {citiesWithRanges.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-stone-800 mb-6">
                            {t('province.citiesWithRanges')}
                        </h2>

                        {sortedLetters.length > 0 ? (
                            <div className="space-y-12">
                                {sortedLetters.map(letter => (
                                    <div key={letter} className="relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="bg-stone-800 text-white w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm">
                                                {letter}
                                            </div>
                                            <div className="h-px flex-1 bg-stone-200"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {cityGroups[letter].map((city: City) => (
                                                <Link
                                                    key={city.id}
                                                    href={`/${provinceSlug}/${city.slug}`}
                                                    className="group flex justify-between items-center p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <span className="font-semibold text-stone-700 group-hover:text-emerald-700 truncate pr-2">
                                                        {city.name}
                                                    </span>
                                                    <span className="shrink-0 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                                                        {rangeCounts[city.id]}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {citiesWithRanges.map((city: City) => (
                                    <Link
                                        key={city.id}
                                        href={`/${provinceSlug}/${city.slug}`}
                                        className="group block p-6 bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                                                {city.name}
                                            </h3>
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                                                {rangeCounts[city.id]} {rangeCounts[city.id] === 1 ? t('province.range') : t('province.ranges')}
                                            </span>
                                        </div>
                                        <p className="text-stone-500 text-sm mb-3">
                                            {t('province.findRanges')}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
                                            {t('province.viewRanges')} <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                )}



                {/* No Cities */}
                {citiesLength === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-stone-200">
                        <Target className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">{t('province.comingSoon')}</h2>
                        <p className="text-stone-600 mb-6">
                            {t('province.comingSoonDesc', { name: province.name })}
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
                            {t('province.browseAll')}
                        </Link>
                    </div>
                )}

                {/* SEO Content */}
                {totalRanges > 0 && (
                    <section className="bg-white rounded-xl border border-stone-200 p-8">
                        <h2 className="text-xl font-bold text-stone-800 mb-4">
                            {t('province.aboutArchery', { name: province.name })}
                        </h2>
                        <div className="space-y-3">
                            <p className="text-stone-700 leading-relaxed">{description}</p>
                            <p className="text-stone-700 leading-relaxed">
                                {t('province.facilitySummary', {
                                    name: province.name,
                                    count: totalRanges,
                                    facilityWord: facilityWord,
                                    cityCount: citiesWithRanges.length,
                                    cityWord: cityWord
                                })}
                            </p>

                            {info.topActivities.length > 0 && (
                                <p className="text-stone-700 leading-relaxed">
                                    {t('province.popularActivities', { name: province.name, activities: info.topActivities.join(', ') })}
                                </p>
                            )}

                            {info.popularCities.length > 0 && (
                                <p className="text-stone-700 leading-relaxed">
                                    {t('province.topCities', { name: province.name, cities: info.popularCities.join(', ') })}
                                </p>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
